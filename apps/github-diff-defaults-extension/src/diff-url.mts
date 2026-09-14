import { Arr } from 'ts-data-forge';

/**
 * What the extension decides, with no DOM in sight.
 *
 * Everything here is strings in and strings out, so that the part worth being
 * sure about can be tested in Node. `content.mts` is the other half: it finds
 * the URLs, applies what these functions answer, and holds no rules of its own.
 */

/**
 * The query parameters a pull request diff is opened with.
 *
 * `w=1` hides whitespace-only changes. `show-viewed-files=false` collapses the
 * files already marked as viewed, so a review that has been half done reopens
 * where it was left rather than at the top.
 */
export const diffViewDefaults = [
  ['w', '1'],
  ['show-viewed-files', 'false'],
] as const satisfies readonly (readonly [string, string])[];

/**
 * The same URL carrying every default it is missing, or `undefined` when there
 * is nothing to do — it is not a pull request diff on this origin, or it
 * already says what it wants.
 *
 * **A parameter that is already there is never rewritten.** That is the whole
 * of the opt-out: GitHub's own "Show whitespace changes" and "Toggle viewed
 * files" controls navigate to the same page with `w=0` or
 * `show-viewed-files=true` on it, and a rule that forced the defaults back
 * would leave the user no way to look at what they hide. The price is that a
 * URL someone shared with `w=0` on it keeps it, which is the right answer for
 * a shared link anyway.
 *
 * `pageOrigin` is passed in rather than read from `location`, because the
 * caller asks this about other pages' links too: an anchor inside a comment
 * body can point at a path that matches while belonging to some other host.
 */
export const diffUrlWithDefaults = (
  href: string,
  pageOrigin: string,
): string | undefined => {
  const url = pullRequestDiffUrlOf(href, pageOrigin);

  if (url === undefined) {
    return undefined;
  }

  const missing = missingDefaultsIn(url.search);

  if (!Arr.isNonEmpty(missing)) {
    return undefined;
  }

  // Appended to the query as it stands rather than re-serialized from
  // `searchParams`, so that whatever else is on the URL survives exactly as it
  // was written — `URLSearchParams` would re-encode it, turning a `%20` into a
  // `+` and a `%7E` into a `~`.
  const added = new URLSearchParams(
    missing.map(([key, value]) => [key, value]),
  );

  const search =
    url.search === ''
      ? (`?${added.toString()}` as const)
      : (`${url.search}&${added.toString()}` as const);

  return `${url.origin}${url.pathname}${search}${url.hash}`;
};

/**
 * Whether `href` is a pull request diff on this origin that needs nothing —
 * either because the extension has already put the defaults on it, or because
 * it arrived carrying them.
 *
 * This is what the click handler asks. See `content.mts` for why a click on
 * such a link is left to the browser.
 */
export const isSettledDiffUrl = (href: string, pageOrigin: string): boolean => {
  const url = pullRequestDiffUrlOf(href, pageOrigin);

  return url !== undefined && !Arr.isNonEmpty(missingDefaultsIn(url.search));
};

/**
 * Which diff page `href` is, or `undefined` when it is not one on this origin.
 *
 * The path alone, because that is what identifies the page across the rewrites
 * GitHub makes to its own address bar: it takes the parameters in, applies
 * them, and then normalizes them off the URL. The caller remembers this so that
 * it does not read that normalization as "the defaults are missing again" —
 * see `content.mts`, where putting them back would be an endless redirect.
 */
export const diffPagePathOf = (
  href: string,
  pageOrigin: string,
): string | undefined => pullRequestDiffUrlOf(href, pageOrigin)?.pathname;

/**
 * The pull request diff pages, and only those.
 *
 * `/changes` is the other spelling GitHub has served the same tab under, and
 * anything below either of them — `/files/{base}..{head}` for a diff between
 * two of the pull request's commits — is the same page with the same settings.
 *
 * A commit or a compare page would take `w=1` just as well, but not
 * `show-viewed-files`, which is a property of a pull request review. Keeping
 * one pattern for one set of parameters is what keeps this a table lookup
 * rather than a matrix.
 */
const pullRequestDiffPath =
  /^\/[^/]+\/[^/]+\/pull\/\d+\/(?:files|changes)(?:\/|$)/u;

/**
 * `href` parsed, if it is a pull request diff on this origin. `undefined`
 * rather than a throw for an `href` the URL parser rejects: an attribute can
 * hold anything, and a scan that gave up on the first odd one would leave every
 * later anchor on the page unpatched.
 */
const pullRequestDiffUrlOf = (
  href: string,
  pageOrigin: string,
): URL | undefined => {
  const url = parseUrl(href);

  if (url === undefined) {
    return undefined;
  }

  return url.origin === pageOrigin && pullRequestDiffPath.test(url.pathname)
    ? url
    : undefined;
};

const parseUrl = (href: string): URL | undefined => {
  try {
    return new URL(href);
  } catch {
    return undefined;
  }
};

/** Which of the defaults a query string does not already speak for. */
const missingDefaultsIn = (
  search: string,
): readonly (readonly [string, string])[] => {
  const params = new URLSearchParams(search);

  return diffViewDefaults.filter(([key]) => !params.has(key));
};
