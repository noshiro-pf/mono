import { Arr } from 'ts-data-forge';

/**
 * What the extension decides, with no DOM in sight.
 *
 * Everything here is strings in and strings out, so that the part worth being
 * sure about can be tested in Node. `content.mts` is the other half: it finds
 * the URLs, applies what these functions answer, and holds no rules of its own.
 *
 * There are two rules, and they are the whole of the extension's behavior:
 *
 * - **a pull request diff** is opened with whitespace-only changes hidden and
 *   the files already marked as viewed collapsed, by putting GitHub's own query
 *   parameters on the address;
 * - **a repository's branch overview** is opened as the full branch list, by
 *   going to `/branches/all` instead.
 *
 * They are one table rather than two exported functions because the caller has
 * no way to tell which page it is looking at — and should not have to.
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
 * The tab of the branches page the extension opens instead of the overview.
 *
 * The overview is a summary — the default branch, yours, and a count of the
 * active and the stale ones — and the list of every branch is one click further
 * on, every time.
 */
export const allBranchesSegment = 'all';

/**
 * The same URL as the extension would rather have it, or `undefined` when there
 * is nothing to do — it is not a page these rules speak for, or it already says
 * what it wants.
 *
 * **Nothing the address already states is overruled.** That is the whole of the
 * opt-out, and it takes a different shape in each rule: for a diff, a parameter
 * that is already there is left as it is, because GitHub's own "Show whitespace
 * changes" and "Toggle viewed files" controls navigate to the same page with
 * `w=0` or `show-viewed-files=true` on it; for the branches page, the overview
 * is left alone when it was reached from another tab of the same repository's
 * branches page, because that is somebody clicking the "Overview" tab of the
 * very page this rule redirects to. A rule that forced its answer back in
 * either case would leave no way to look at what it hides.
 *
 * `pageOrigin` is passed in rather than read from `location`, because the
 * caller asks this about other pages' links too: an anchor inside a comment
 * body can point at a path that matches while belonging to some other host.
 *
 * `cameFrom` is where the visit would be coming from — the referrer for the
 * page the script landed on, the address the observer last saw for a
 * client-side navigation, and the current page for a link that has not been
 * clicked yet. It is `''` when there is none, which is what `document.referrer`
 * says on a typed URL or a bookmark.
 */
export const preferredUrlOf = (
  href: string,
  pageOrigin: string,
  cameFrom: string,
): string | undefined => {
  const page = managedPageOf(href, pageOrigin);

  if (page === undefined) {
    return undefined;
  }

  return page.rule.preferredUrl(page.url, parseUrl(cameFrom));
};

/**
 * Whether `href` is a page these rules speak for that needs nothing — either
 * because the extension has already given it what it wanted, or because it
 * arrived carrying it.
 *
 * This is what the click handler asks. See `content.mts` for why a click on
 * such a link is left to the browser.
 */
export const isSettledUrl = (
  href: string,
  pageOrigin: string,
  cameFrom: string,
): boolean => {
  const page = managedPageOf(href, pageOrigin);

  return (
    page !== undefined &&
    page.rule.preferredUrl(page.url, parseUrl(cameFrom)) === undefined
  );
};

/**
 * Which page `href` is, or `undefined` when it is not one these rules speak
 * for.
 *
 * The path alone, because that is what identifies the page across the rewrites
 * GitHub makes to its own address bar: it takes the parameters in, applies
 * them, and then normalizes them off the URL. The caller remembers this so that
 * it does not read that normalization as "the defaults are missing again" —
 * see `content.mts`, where putting them back would be an endless redirect.
 */
export const managedPagePathOf = (
  href: string,
  pageOrigin: string,
): string | undefined => managedPageOf(href, pageOrigin)?.url.pathname;

/**
 * The parts of an address a rule is allowed to look at.
 *
 * A `URL` would carry the same four and is not passed around here: the lint
 * rules ask a parameter type to be deeply readonly, and `URL` is a mutable
 * object with a parser attached.
 */
type PageUrl = Readonly<{
  origin: string;
  pathname: string;
  search: string;
  hash: string;
}>;

/** A page the extension has an opinion about, and what the opinion is. */
type PageRule = Readonly<{
  /** Which paths it speaks for. Matched against the pathname alone. */
  path: RegExp;

  /**
   * The address this page should have been opened with, or `undefined` when it
   * is already right. `cameFrom` is `undefined` when there is no referrer, or
   * when it is not an address the URL parser accepts.
   */
  preferredUrl: (
    url: PageUrl,
    cameFrom: PageUrl | undefined,
  ) => string | undefined;
}>;

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
 * Every tab of a repository's branches page: the overview at `/branches`, and
 * the named lists — `all`, `yours`, `active`, `stale` — below it.
 *
 * The whole family matters even though only the overview is redirected. A link
 * that is already at one of the named lists is a link this extension is happy
 * with, and saying so is what tells the click handler to let the browser follow
 * it rather than GitHub's own router.
 */
const branchesPath = /^\/[^/]+\/[^/]+\/branches(?:\/|$)/u;

/** The overview, which is the one tab that gets redirected. */
const branchesOverviewPath = /^\/[^/]+\/[^/]+\/branches\/?$/u;

/**
 * The rules, in the order they are asked. A path matches at most one of them —
 * a pull request diff is not a branches page — so the order is presentation
 * rather than precedence.
 */
const pageRules: readonly PageRule[] = [
  {
    path: pullRequestDiffPath,

    preferredUrl: (url) => {
      const missing = missingDefaultsIn(url.search);

      if (!Arr.isNonEmpty(missing)) {
        return undefined;
      }

      // Appended to the query as it stands rather than re-serialized from
      // `searchParams`, so that whatever else is on the URL survives exactly as
      // it was written — `URLSearchParams` would re-encode it, turning a `%20`
      // into a `+` and a `%7E` into a `~`.
      const added = new URLSearchParams(
        missing.map(([key, value]) => [key, value]),
      );

      const search =
        url.search === ''
          ? (`?${added.toString()}` as const)
          : (`${url.search}&${added.toString()}` as const);

      return `${url.origin}${url.pathname}${search}${url.hash}`;
    },
  },

  {
    path: branchesPath,

    preferredUrl: (url, cameFrom) => {
      if (!branchesOverviewPath.test(url.pathname)) {
        // Already one of the named lists. Whichever it is, it was asked for.
        return undefined;
      }

      // `/{owner}/{repo}/branches`, with the trailing slash the overview may
      // carry taken off, so that it is both the prefix every tab of this page
      // shares and the path the tab is appended to.
      const branches = url.pathname.replace(/\/$/u, '');

      if (isTabOfSameBranchesPage(cameFrom, url.origin, branches)) {
        // The overview reached from another tab of *this repository's* branches
        // page is the "Overview" tab being clicked, which is the one thing this
        // rule must not undo. Coming from anywhere else — the repository's own
        // navigation, another repository, a bookmark, a typed URL — is somebody
        // asking for the branches, and the full list is what that means.
        return undefined;
      }

      // The query is carried over because the branches page puts its search
      // there: `?query=release` on the overview means the same thing on the
      // list, and dropping it would throw away what was typed.
      return `${url.origin}${branches}/${allBranchesSegment}${url.search}${url.hash}`;
    },
  },
] as const;

/**
 * Which rule `href` falls under, with the address parsed, or `undefined` when
 * it is not a page on this origin that any rule speaks for.
 */
const managedPageOf = (
  href: string,
  pageOrigin: string,
): Readonly<{ rule: PageRule; url: PageUrl }> | undefined => {
  const url = parseUrl(href);

  if (url === undefined) {
    return undefined;
  }

  if (url.origin !== pageOrigin) {
    return undefined;
  }

  const rule = pageRules.find(({ path }) => path.test(url.pathname));

  return rule === undefined ? undefined : { rule, url };
};

/**
 * Whether the address a visit came from is another tab of the same
 * repository's branches page — where `branches` is that page's
 * `/{owner}/{repo}/branches` path.
 *
 * Written with an early return rather than as one expression, because
 * `cameFrom !== undefined && cameFrom.origin === …` is the shape the lint rules
 * ask to be an optional chain, and an optional chain does not narrow the rest
 * of the condition.
 */
const isTabOfSameBranchesPage = (
  cameFrom: PageUrl | undefined,
  pageOrigin: string,
  branches: string,
): boolean => {
  if (cameFrom === undefined) {
    return false;
  }

  return (
    cameFrom.origin === pageOrigin &&
    (cameFrom.pathname === branches ||
      cameFrom.pathname.startsWith(`${branches}/`))
  );
};

/**
 * `href` parsed into the parts a rule reads, or `undefined` for one the URL
 * parser rejects: an attribute can hold anything, and a scan that gave up on
 * the first odd one would leave every later anchor on the page unpatched.
 */
const parseUrl = (href: string): PageUrl | undefined => {
  try {
    // Named rather than destructured: `origin` on its own shadows the browser
    // global of that name, which the lint rules will not have.
    const url = new URL(href);

    return {
      origin: url.origin,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
    };
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
