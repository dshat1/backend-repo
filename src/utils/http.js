export const parseQueryFilter = (queryParam) => {
  if (!queryParam) return {};
  const [key, ...rest] = String(queryParam).split(':');
  const raw = rest.join(':').trim();
  if (!key || !raw) return {};
  let value = raw;
  if (raw === 'true' || raw === 'false') value = raw === 'true';
  else if (!Number.isNaN(Number(raw))) value = Number(raw);
  return { [key]: value };
};

export const buildPageLink = (req, page) => {
  if (!page) return null;
  const url = new URL(`${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`);
  Object.entries(req.query).forEach(([k, v]) => {
    if (k !== 'page') url.searchParams.set(k, String(v));
  });
  url.searchParams.set('page', String(page));
  return url.toString();
};
