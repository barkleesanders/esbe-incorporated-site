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
