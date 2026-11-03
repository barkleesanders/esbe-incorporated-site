// Installed as a separate module; the original module and named exports stay intact.
export const TRACKER_PATH = '/__traks/t.js';
export const EVENT_PATH = '/__traks/event';
// Attribution alone, for sites that already load the vendor tracker themselves.
export const ATTRIBUTION_PATH = '/__traks/attribution.js';
export function allowEndpoint(policy, directive, endpoint) {
  if (!policy) return policy;
  const parts = policy
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean);
  const find = (name) => parts.findIndex((p) => p.split(/\s+/)[0] === name);
  let index = find(directive);
  const fallback = directive === 'script-src-elem' ? 'script-src' : 'default-src';
  const fallbackIndex = find(fallback);
  const source = index >= 0 ? parts[index] : fallbackIndex >= 0 ? parts[fallbackIndex] : null;
  if (!source) return policy;
  const values = source
    .split(/\s+/)
    .slice(1)
    .filter((p) => p !== "'none'");
  if (values.includes("'strict-dynamic'")) throw new Error('unsupported-strict-dynamic');
  if (!values.includes(endpoint)) values.push(endpoint);
  const value = `${directive} ${values.join(' ')}`;
  if (index < 0) {
    index = parts.length;
    parts.push(value);
  } else parts[index] = value;
  return parts.join('; ');
}
export function wrap(original, sites, tracker, attribution = '') {
  if (!original || typeof original.fetch !== 'function') return original;
  const script = (source) =>
    new Response(source, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  return {
    ...original,
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      const key = sites[url.hostname];
      if (!key) return original.fetch(request, env, ctx);
      if (url.pathname === TRACKER_PATH && request.method === 'GET') return script(tracker);
      if (url.pathname === ATTRIBUTION_PATH && request.method === 'GET' && attribution)
        return script(attribution);
      if (url.pathname === EVENT_PATH && request.method === 'POST') {
        if (request.headers.get('Origin') !== url.origin)
          return new Response(null, { status: 403 });
        if (Number(request.headers.get('Content-Length')) > 16384)
          return new Response(null, { status: 413 });
        let text;
        try {
          text = await boundedBody(request, 16384);
        } catch {
          return new Response(null, { status: 413 });
        }
        if (text.length > 16384) return new Response(null, { status: 413 });
        let event;
        try {
          event = JSON.parse(text);
        } catch {
          return new Response(null, { status: 400 });
        }
        if (!event || typeof event !== 'object' || event.s !== key || event.h !== url.hostname)
          return new Response(null, { status: 403 });
        // Public collector only: never forward session cookies or authorization headers.
        const headers = new Headers({ 'Content-Type': 'text/plain', Origin: url.origin });
        for (const name of ['User-Agent', 'CF-Connecting-IP', 'CF-IPCountry']) {
          const value = request.headers.get(name);
          if (value) headers.set(name, value);
        }
        const response = await fetch('https://analytics-collect.aivaclaims.com/api/event', {
          method: 'POST',
          headers,
          body: text,
          redirect: 'manual',
        });
        return new Response(null, {
          status: response.status,
          headers: { 'Cache-Control': 'no-store' },
        });
      }
      const response = await original.fetch(request, env, ctx);
      // Every successful HTML page view is tracked, including ones from a browser that
      // already holds a first-party cookie (a signed-in session): the tracker is cookieless
      // and the event proxy above never forwards Cookie or Authorization, so a cookie on
      // the page request adds nothing to what reaches the collector. Bearer-token requests
      // are API calls, not page views; the excluded paths stay excluded.
      if (
        request.method !== 'GET' ||
        response.status !== 200 ||
        !response.headers.get('Content-Type')?.includes('text/html') ||
        request.headers.has('Authorization') ||
        /^\/(api|auth|admin|portal|account|login)(\/|$)/.test(url.pathname)
      )
        return response;
      const headers = new Headers(response.headers);
      try {
        for (const name of ['Content-Security-Policy', 'Content-Security-Policy-Report-Only']) {
          let policy = headers.get(name);
          if (!policy) continue;
          policy = allowEndpoint(policy, 'script-src', url.origin + TRACKER_PATH);
          policy = allowEndpoint(policy, 'script-src-elem', url.origin + TRACKER_PATH);
          if (attribution) {
            policy = allowEndpoint(policy, 'script-src', url.origin + ATTRIBUTION_PATH);
            policy = allowEndpoint(policy, 'script-src-elem', url.origin + ATTRIBUTION_PATH);
          }
          policy = allowEndpoint(policy, 'connect-src', url.origin + EVENT_PATH);
          headers.set(name, policy);
        }
      } catch {
        return response;
      }
      headers.delete('Content-Length');
      headers.delete('ETag');
      let existing = false;
      let attributed = false;
      return new HTMLRewriter()
        .on('script[data-site]', {
          element() {
            existing = true;
          },
        })
        .on('script[data-traks-attribution]', {
          element() {
            attributed = true;
          },
        })
        .on('body', {
          element(element) {
            element.onEndTag((end) => {
              // The managed tracker already carries attribution; a site with its own
              // vendor tag gets only the attribution module, never a second tracker.
              if (!existing)
                end.before(
                  `<script defer src="${TRACKER_PATH}" data-site="${key}" data-traks-managed="1"></script>`,
                  { html: true },
                );
              else if (attribution && !attributed)
                end.before(
                  `<script defer src="${ATTRIBUTION_PATH}" data-traks-attribution="1"></script>`,
                  { html: true },
                );
            });
          },
        })
        .transform(
          new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          }),
        );
    },
  };
}

async function boundedBody(request, limit) {
  if (!request.body) return '';
  const reader = request.body.getReader();
  let text = '';
  let size = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) throw new Error('body-too-large');
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    await reader.cancel();
  }
}
