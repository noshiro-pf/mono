/**
 * `href` with its fragment replaced by `hash` (with or without `#`): what a
 * fragment navigation to `hash` leads to.
 */
export const withHash = (href: string, hash: string): URL => {
  const mut_url = new URL(href);

  mut_url.hash = hash;

  return mut_url;
};
