import { numberedTitleOf } from './page-title.mjs';
import {
  isSettledLink,
  managedPagePathOf,
  preferredUrlOfLink,
  preferredUrlOfPage,
} from './page-url.mjs';

/**
 * The content script, injected into github.com at `document_start`.
 *
 * It does two things about addresses, and the second is what makes the first
 * almost never happen:
 *
 * - **It redirects the page it lands on**, when that page is one the rules
 *   speak for and it was not opened the way they want it. This is the fallback
 *   — a typed URL, a bookmark, a link from outside GitHub — and it costs a
 *   second load of the page.
 * - **It rewrites the links on the page** so they already say what the rules
 *   want. A "Files changed" tab clicked from the conversation view then
 *   navigates straight to the settled URL, and the redirect above has nothing
 *   to do.
 *
 * `document_start` is what makes the redirect cheap: the script runs before the
 * document is parsed, so the load it abandons is a response that had barely
 * begun to render.
 *
 * Apart from those, it puts a pull request's or an issue's number at the front
 * of the tab title. See `page-title.mts`.
 */

// Neither `window.location`, `globalThis.location` nor a bare `location`
// satisfies the lint rules together — `no-restricted-globals` wants one
// spelling and `unicorn/prefer-global-this` another. Destructuring once names
// it something that is none of the three; the same dance as `browserHistory`
// in `split-view-extension`'s frame agent.
const { location: browserLocation } = globalThis;

// `document.title = …` is a mutation the lint rules reject unless the object it
// is reached through is named as mutable — the same trick as `mut_page` in
// `split-view-extension`'s `tab-identity.mts`. Only the title goes through it.
const { document: mut_page } = globalThis;

/**
 * Elements already looked at, so that a rescan does not re-parse every `href`
 * on the page for every batch of mutations. A pull request page holds hundreds
 * of links and GitHub touches the DOM constantly; without this the scan is
 * quadratic in the life of the page.
 *
 * A `WeakSet` rather than an attribute or a class, because it has to mean "this
 * extension has seen this node" and nothing on the page should be able to see
 * that, undo it, or be confused by it.
 */
const evaluated = new WeakSet<Element>();

/** Anchors already carrying the click listener. One per node, for its life. */
const listening = new WeakSet<Element>();

/**
 * The pages this document has already acted on, by path.
 *
 * **This is what stops an endless redirect**, and it is not a nicety. GitHub
 * takes the parameters in and then rewrites its own address bar without them:
 * measured on a logged-out session, `?w=1&show-viewed-files=false` becomes
 * `?w=1` a moment after the page loads. Without this the observer below reads
 * that rewrite as "the defaults are gone", puts them back, and the page loads
 * again — forever.
 *
 * So a page is given the defaults once. If they come off afterwards, that is
 * GitHub having used them, not GitHub having lost them.
 */
const mut_settledPages = new Set<string>();

/**
 * The title this script last wrote, the title it was written over, and the
 * title the document reported straight after.
 *
 * `shown` is kept apart from `written` because the `document.title` getter
 * collapses whitespace, so what reads back is not always what was written; a
 * comparison against `written` alone would write again on every mutation, and
 * every write is a mutation.
 *
 * `base` is what lets a client-side navigation from one pull request to another
 * renumber the title rather than stack a second number in front of the first,
 * for the moment the address has changed and GitHub's new title has not
 * arrived.
 */
const mut_ownTitle: {
  last: Readonly<{ base: string; written: string; shown: string }> | undefined;
} = { last: undefined };

const main = (): void => {
  applyPreferredUrlToThisPage();

  patchNewAnchors();

  applyNumberToTitle();

  watchForChanges();
};

/**
 * The fallback, for a page reached without going through a link this extension
 * had already rewritten — a typed URL, a bookmark, a notification, a reload.
 *
 * It asks about the address alone, which is why those four and a click all get
 * the same answer. See `preferredUrlOfPage`.
 */
const applyPreferredUrlToThisPage = (): void => {
  const page = managedPagePathOf(browserLocation.href, browserLocation.origin);

  if (page === undefined) {
    return;
  }

  const next = preferredUrlOfPage(browserLocation.href, browserLocation.origin);

  if (next === undefined) {
    // It arrived the way the rules want it — because a rewritten link brought
    // us here, because the redirect below has just happened and this is the new
    // document, or because the rule decided to leave it be. Either way this
    // page is done, and what GitHub does to the address from here is its own
    // business.
    mut_settledPages.add(page);

    return;
  }

  if (mut_settledPages.has(page)) {
    return;
  }

  mut_settledPages.add(page);

  // `replace` rather than `assign`: the address as it arrived was never a page
  // the user looked at, so it does not belong in the history. Going back from
  // here should leave the pull request, not bounce through a redirect.
  browserLocation.replace(next);
};

/**
 * Puts the pull request's or issue's number at the front of the tab title,
 * whenever the title or the address has moved on from what was last written.
 *
 * GitHub rewrites the title on every client-side navigation, so this is asked
 * on every batch of mutations rather than once; asking costs a URL parse and a
 * few string comparisons.
 */
const applyNumberToTitle = (): void => {
  const current = document.title;

  // What this script wrote, if the title still reads as it did straight after.
  const ours =
    mut_ownTitle.last?.shown === current ? mut_ownTitle.last : undefined;

  const base = ours?.base ?? current;

  const next = numberedTitleOf(base, browserLocation.href);

  if (next === current || next === ours?.written) {
    return;
  }

  mut_page.title = next;

  mut_ownTitle.last = { base, written: next, shown: mut_page.title };
};

/** Every element the page has grown since the last look. */
const patchNewAnchors = (): void => {
  for (const element of document.querySelectorAll('a[href]')) {
    if (evaluated.has(element)) {
      continue;
    }

    evaluated.add(element);

    patchAnchor(element);
  }
};

/**
 * Gives one anchor the address the rules want, and the listener that keeps it.
 *
 * It takes an `Element` and asks what it is, rather than being handed an
 * `HTMLAnchorElement`, because neither caller has one: `a[href]` also matches
 * SVG anchors, whose `href` is an `SVGAnimatedString` rather than a string, and
 * a mutation record carries a `Node`.
 */
const patchAnchor = (element: Element): void => {
  if (!(element instanceof HTMLAnchorElement)) {
    return;
  }

  // The page the anchor is on is what the branches rule reads: the "Overview"
  // tab of a branches page is marked as the overview somebody asked for, and
  // the same href in the repository's own navigation is sent to the full list.
  const next = preferredUrlOfLink(
    element.href,
    browserLocation.origin,
    browserLocation.href,
  );

  if (next !== undefined) {
    // `setAttribute` rather than assigning `href`: the two are equivalent here,
    // and this one is not a mutation as far as the lint rules are concerned.
    element.setAttribute('href', next);
  }

  if (
    !isSettledLink(element.href, browserLocation.origin, browserLocation.href)
  ) {
    return;
  }

  if (listening.has(element)) {
    return;
  }

  listening.add(element);

  element.addEventListener('click', suppressClientSideNavigation);
};

/**
 * Lets the browser navigate to the rewritten `href`, by keeping the click from
 * reaching GitHub's own router.
 *
 * Without this the rewrite is undone at the moment it matters: GitHub handles
 * the click itself, and navigates to the route it holds for that link rather
 * than to the address in the attribute. Stopping the event here leaves the
 * anchor's default behavior, which is a plain navigation to the `href` as
 * written.
 *
 * It listens in the bubble phase, not the capture phase, because the click
 * target is a descendant of the anchor — GitHub's tab holds an icon and a
 * counter — and a capture-phase listener would stop the event before it ever
 * reached that descendant.
 *
 * The `href` is read again on every click rather than remembered, because
 * GitHub recycles anchor nodes: suppressing navigation for a link that is no
 * longer ours would turn one of its client-side navigations into a full reload.
 */
const suppressClientSideNavigation = (clickEvent: Event): void => {
  const anchor = clickEvent.currentTarget;

  if (
    anchor instanceof HTMLAnchorElement &&
    isSettledLink(anchor.href, browserLocation.origin, browserLocation.href)
  ) {
    clickEvent.stopPropagation();
  }
};

/**
 * What keeps up with a page that rewrites itself.
 *
 * GitHub navigates between its own pages without loading a document, so there
 * is no second injection of this script and no `load` event to hang anything
 * on. One observer answers both of the questions that arise from that: whether
 * the address has changed under us, and whether there are links about that
 * nobody has looked at yet.
 */
const watchForChanges = (): void => {
  let mut_lastHref = browserLocation.href;

  const observer = new MutationObserver((mutations) => {
    const currentHref = browserLocation.href;

    // A client-side navigation shows up here as "the DOM changed and the
    // address is not what it was". There is no event for it that a content
    // script can subscribe to, and polling would be a timer for the life of
    // every GitHub tab; the page is mutating anyway whenever this is true.
    //
    // Most of what this catches is not a navigation at all but GitHub tidying
    // its own address bar, which is why `mut_settledPages` guards the answer.
    if (currentHref !== mut_lastHref) {
      mut_lastHref = currentHref;

      applyPreferredUrlToThisPage();
    }

    // A re-render can reset an anchor's `href` in place, which the `evaluated`
    // gate would otherwise skip forever. Re-patching is idempotent, so the
    // mutation record this write produces settles on the next callback rather
    // than looping.
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.target instanceof Element
      ) {
        patchAnchor(mutation.target);
      }
    }

    // Anything that is not an attribute change is a node the scan has not seen.
    // Asked after the loop above rather than inside it, because `some` stops at
    // the first match and the attribute records may come after it.
    if (mutations.some((mutation) => mutation.type !== 'attributes')) {
      patchNewAnchors();
    }

    // Not behind either check above: a new title can arrive in a batch of its
    // own, after the address it belongs to, and it arrives as a `childList`
    // mutation of `<title>` like any other.
    applyNumberToTitle();
  });

  observer.observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['href'],
  });
};

main();
