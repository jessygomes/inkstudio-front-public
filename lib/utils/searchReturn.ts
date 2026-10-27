const SEARCH_PATH = "/trouver-un-salon";

export function getSearchReturnHref(value?: string | string[]): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return SEARCH_PATH;
  if (candidate === SEARCH_PATH || candidate.startsWith(SEARCH_PATH + "?")) return candidate;
  return SEARCH_PATH;
}
