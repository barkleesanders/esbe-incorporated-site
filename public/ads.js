// Carries ad-click and campaign parameters onto links marked data-carry-params,
// so a visit that starts from an ad can be attributed after the click-through.
const carried = [
  'gclid',
  'gbraid',
  'wbraid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
];
const params = new URLSearchParams(window.location.search);

for (const link of document.querySelectorAll('a[data-carry-params]')) {
  const url = new URL(link.href);
  for (const key of carried) {
    const value = params.get(key);
    if (value) url.searchParams.set(key, value);
  }
  link.href = url.toString();
}

// GA4 conversion events for Google Ads (GA4 property 559498667, measurement
// ID G-YLVSKGE4LT, imported into Ads account 681-385-8588 as conversion
// actions 7855556310 and 7855556313). The gtag.js snippet itself lives in
// each page's <head> in index.js and only ever sent page_view; these two
// custom events were defined in GA4/Ads but never fired anywhere, which
// starved the Maximize Conversions bidder. Event names are exact and
// case-sensitive: GA4/Ads match on this string. One delegated listener
// covers every page because /ads.js loads on /, /donate and /community.
//   aiva_signup_click — a click on any AIVA sign-up CTA
//     (aivaclaims.com/sign-up: the header CTA and the AIVA program card).
//   donate_click — a click on a donation CTA: an outbound Every.org
//     donate link, or a same-site link to /donate (nav, footer, cards).
document.addEventListener('click', (event) => {
  if (typeof window.gtag !== 'function') return;
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!link) return;
  let url;
  try {
    url = new URL(link.href);
  } catch {
    return;
  }
  const params = { link_url: url.href, page_path: window.location.pathname };
  let gaEvent = null;
  let sendTo = null;
  if (url.hostname === 'aivaclaims.com' && url.pathname.startsWith('/sign-up')) {
    gaEvent = 'aiva_signup_click';
    sendTo = 'AW-18515418870/gV58CKnooq8dEPa96_xE';
  } else if (
    url.hostname === 'every.org' ||
    url.hostname === 'www.every.org' ||
    (url.hostname === window.location.hostname && url.pathname === '/donate')
  ) {
    gaEvent = 'donate_click';
    sendTo = 'AW-18515418870/bKn5CKzooq8dEPa96_xE';
  }
  if (!gaEvent) return;
  window.gtag('event', gaEvent, params);
  // gtag dispatches asynchronously: on a click that navigates right away,
  // the page can unload before the conversion is sent (verified live
  // 2026-10-30 — beacon transport alone did not survive it). For a plain
  // left click, hold the navigation until the conversion callback fires
  // (Google's gtag_report_conversion pattern) with a 1s fallback timer
  // so a click is never swallowed.
  const plainClick =
    event.button === 0 && !event.metaKey && !event.ctrlKey &&
    !event.shiftKey && !event.altKey && link.target !== '_blank';
  if (!plainClick) {
    window.gtag('event', 'conversion', { send_to: sendTo, transport_type: 'beacon' });
    return;
  }
  event.preventDefault();
  let navigated = false;
  const navigate = () => {
    if (navigated) return;
    navigated = true;
    window.location.href = url.href;
  };
  setTimeout(navigate, 1000);
  window.gtag('event', 'conversion', {
    send_to: sendTo,
    transport_type: 'beacon',
    event_callback: navigate,
    event_timeout: 1000,
  });
});
