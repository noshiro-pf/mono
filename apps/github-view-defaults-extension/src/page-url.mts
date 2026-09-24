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
 *   going to `/branches/all` instead, unless the address says the overview is
 *   what was asked for.
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
 * The parameter that says the branch overview is what was asked for.
 *
 * The overview tab points at the very URL the branches rule redirects, so the
 * rule needs a way to be told "this one, deliberately" — and the address is the
 * only place that answer survives what the user does next. It was
 * `document.referrer` at first, which is true of how the page was reached and
 * is not part of the page: a reload of the overview kept the referrer of the
 * click before it, so the rule read the reload as that click and left the
 * address alone, while a bookmark of the same address went to the list. The
 * address cannot disagree with itself that way, and it is the same opt-out the
 * diff rule has — what is already written is not overruled.
 *
 * It is not one of GitHub's own parameters, which GitHub ignores, and it says
 * in the address bar what it means.
 */
export const overviewParam = ['overview', '1'] as const satisfies readonly [
  string,
  string,
];

/**
 * How this page should have been opened, or `undefined` when it is already
 * right — it is not a page these rules speak for, or the address says what it
 * wants.
 *
 * **Nothing the address already states is overruled**, which is the whole of
 * the opt-out in both rules: a diff keeps a `w` or `show-viewed-files` its
 * address already carries, because that is GitHub's own "Show whitespace
 * changes" and "Toggle viewed files" controls writing to it, and the branch
 * overview keeps the overview when its address carries `overviewParam`. A rule
 * that forced its answer back would leave no way to look at what it hides.
 *
 * **It reads the address and nothing else**, so it answers the same for a link
 * followed, an address typed, a bookmark opened and a page reloaded. That is
 * the point: what is being asked is a property of the address, and an answer
 * drawn from how the address was reached is one the next reload can change.
 *
 * `pageOrigin` is passed in rather than read from `location`, because the
 * caller asks this about other pages' links too: an anchor inside a comment
 * body can point at a path that matches while belonging to some other host.
 */
export const preferredUrlOfPage = (
  href: string,
  pageOrigin: string,
): string | undefined => preferredUrl(href, pageOrigin, undefined);

/**
 * What a link on the page at `pageHref` should point at, or `undefined` when it
 * already points there.
 *
 * The page holding the link is what separates the two `/branches` links a
 * branches page carries: the one in its own tab bar is the "Overview" tab and
 * is given `overviewParam`, and the same href anywhere else — the repository's
 * navigation, a comment — is somebody asking for the branches and is sent to
 * the full list. Only the branches rule reads it.
 *
 * This is a question about a link, not about a page: it is asked of an anchor
 * that has not been clicked, and `pageHref` is where that anchor sits.
 */
export const preferredUrlOfLink = (
  href: string,
  pageOrigin: string,
  pageHref: string,
): string | undefined => preferredUrl(href, pageOrigin, parseUrl(pageHref));

/**
 * Whether a link on the page at `pageHref` needs nothing — either because the
 * extension has already given it what it wanted, or because it arrived carrying
 * it.
 *
 * This is what the click handler asks. See `content.mts` for why a click on
 * such a link is left to the browser.
 */
export const isSettledLink = (
  href: string,
  pageOrigin: string,
  pageHref: string,
): boolean =>
  preferredUrlOfLink(href, pageOrigin, pageHref) === undefined &&
  managedPagePathOf(href, pageOrigin) !== undefined;

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
 * The one place a rule is asked anything; the two exported questions differ
 * only in what they know about where the address was read.
 */
const preferredUrl = (
  href: string,
  pageOrigin: string,
  readFrom: PageUrl | undefined,
): string | undefined => {
  const page = managedPageOf(href, pageOrigin);

  return page?.rule.preferredUrl(page.url, readFrom);
};

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
   * What the address should be, or `undefined` when it is already right.
   *
   * `readFrom` is the page an anchor carrying this address sits on, and
   * `undefined` when the question is about a page rather than a link, and also
   * for a `pageHref` the URL parser rejects.
   */
  preferredUrl: (
    url: PageUrl,
    readFrom: PageUrl | undefined,
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

    preferredUrl: (url, readFrom) => {
      if (!branchesOverviewPath.test(url.pathname)) {
        // Already one of the named lists. Whichever it is, it was asked for.
        return undefined;
      }

      const [overviewKey] = overviewParam;

      const params = new URLSearchParams(url.search);

      if (params.has(overviewKey)) {
        // The address says the overview is what was wanted, and an address is
        // not overruled. This is what a reload and a bookmark of the overview
        // read, as well as the click that wrote it.
        return undefined;
      }

      // `/{owner}/{repo}/branches`, with the trailing slash the overview may
      // carry taken off, so that it is both the prefix every tab of this page
      // shares and the path the tab is appended to.
      const branches = url.pathname.replace(/\/$/u, '');

      // An anchor to the overview, sitting on that very page: the "Overview"
      // tab, which is the one link this rule must not send to the list.
      // Marking it is what carries the request into the next document, where
      // the address is all that is left of it.
      //
      // Anywhere else — the repository's own navigation, a comment, or the page
      // itself rather than a link on one — the branches are what was asked for.
      //
      // The query is carried over because the branches page puts its search
      // there: `?query=release` on the overview means the same thing on the
      // list, and dropping it would throw away what was typed.
      return isTabOfSameBranchesPage(readFrom, url.origin, branches)
        ? `${url.origin}${branches}${searchWith(url.search, overviewParam)}${url.hash}`
        : `${url.origin}${branches}/${allBranchesSegment}${url.search}${url.hash}`;
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
 * Whether `readFrom` is a tab of the same repository's branches page — where
 * `branches` is that page's `/{owner}/{repo}/branches` path.
 *
 * Written with an early return rather than as one expression, because
 * `readFrom !== undefined && readFrom.origin === …` is the shape the lint rules
 * ask to be an optional chain, and an optional chain does not narrow the rest
 * of the condition.
 */
const isTabOfSameBranchesPage = (
  readFrom: PageUrl | undefined,
  pageOrigin: string,
  branches: string,
): boolean => {
  if (readFrom === undefined) {
    return false;
  }

  return (
    readFrom.origin === pageOrigin &&
    (readFrom.pathname === branches ||
      readFrom.pathname.startsWith(`${branches}/`))
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

/**
 * A query string with one more parameter on it.
 *
 * Appended to the query as it stands for the same reason the diff rule appends
 * its own: re-serializing through `URLSearchParams` would rewrite escapes
 * GitHub wrote, turning a `%20` into a `+`.
 */
const searchWith = (
  search: string,
  [key, value]: readonly [string, string],
): string => {
  const params = new URLSearchParams([[key, value]]);

  const added = params.toString();

  return search === '' ? `?${added}` : `${search}&${added}`;
};

/** Which of the defaults a query string does not already speak for. */
const missingDefaultsIn = (
  search: string,
): readonly (readonly [string, string])[] => {
  const params = new URLSearchParams(search);

  return diffViewDefaults.filter(([key]) => !params.has(key));
};
