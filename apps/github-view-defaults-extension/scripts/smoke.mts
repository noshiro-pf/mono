import { chromium } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { distPath } from './store-package.mjs';

/**
 * Loads the built extension into a real Chromium and checks the things nothing
 * else can check: that the redirect happens, that the links are rewritten, that
 * a click on one goes where the link says, that a reload answers what the
 * address says rather than what the click before it said, that the tab title
 * carries the number of the pull request or issue — and that none of it
 * happens twice.
 *
 * **It never touches github.com.** Every request to that origin is fulfilled
 * from a fixture here, which is what makes this deterministic, and is also what
 * lets the last check exist at all. The fixture reproduces the thing the real
 * site does that broke the first version of this extension: it takes the
 * parameters in and then strips `show-viewed-files` back off its own address
 * bar, while going on mutating the DOM. An extension that reads that as "the
 * defaults are gone" redirects forever; the check is that the page is loaded
 * twice — asked for, and redirected once — and then no more, and that a reload
 * of the address the site left is redirected once, in the tab and in a frame.
 *
 * It needs a headed browser, because Chromium loads no extensions in the
 * headless shell. On a machine with no display:
 *
 * ```sh
 * xvfb-run -a pnpm run smoke
 * ```
 *
 * Everything lives in one function because Playwright's `Page` and
 * `BrowserContext` cannot be passed as parameters here — the lint rules require
 * a deeply readonly parameter type, and those two are neither.
 */
const main = async (): Promise<void> => {
  assertBuildIsPresent();

  const userDataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'github-view-defaults-smoke-'),
  );

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${distPath}`,
      `--load-extension=${distPath}`,
    ],
  });

  const mut_failures: string[] = [];

  const check = (name: string, actual: string, expected: string): void => {
    if (actual === expected) {
      console.log(`  ok    ${name}`);
    } else {
      console.log(`  FAIL  ${name}`);

      console.log(`          expected  ${expected}`);

      console.log(`          actual    ${actual}`);

      mut_failures.push(name);
    }
  };

  try {
    const page = await context.newPage();

    /**
     * Every document the browser actually loaded, in order.
     *
     * Counted here rather than from `framenavigated`, which also fires for the
     * `history.replaceState` the fixture does — and it is loads, not address
     * changes, that a redirect loop is made of.
     */
    const mut_documentLoads: string[] = [];

    await context.route(`${origin}/**`, async (route) => {
      const request = route.request();

      if (request.resourceType() === 'document') {
        mut_documentLoads.push(request.url());
      }

      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: fixtureFor(request.url()),
      });
    });

    /**
     * The address once it has stopped moving and `isDone` accepts it, or the
     * last one seen.
     *
     * Recursive rather than a loop, which is what lets each wait be awaited:
     * the extension's redirect is a second document load, so there is no one
     * event to wait for that means "it has finished deciding".
     *
     * `isDone` is what makes the `/stripped/` check below deterministic. That
     * fixture rewrites its own address on a 200ms interval and the ticks here
     * are 100ms, so an address that has merely stopped moving is as likely to
     * be one the interval has not reached yet: the check passed or failed
     * about evenly without this. Returning the last address rather than
     * throwing keeps a genuine failure a reported difference rather than a
     * stack trace.
     */
    const settledUrl = async (
      previous: string,
      ticksLeft: number,
      isDone: (url: string) => boolean,
      readUrl: () => string,
    ): Promise<string> => {
      if (ticksLeft <= 0) {
        return readUrl();
      }

      await page.waitForTimeout(settleStepMs);

      const current = readUrl();

      return current === previous && isDone(current)
        ? current
        : settledUrl(current, ticksLeft - 1, isDone, readUrl);
    };

    const pageUrl = (): string => page.url();

    const settle = async (): Promise<string> =>
      settledUrl('', settleTicks, anyUrl, pageUrl);

    /** `settle`, for an address that is only final once the page rewrote it. */
    const settleUntil = async (
      isDone: (url: string) => boolean,
    ): Promise<string> => settledUrl('', settleTicks, isDone, pageUrl);

    /** `settleUntil`, for the address of the frame `frameHostFixture` holds. */
    const settleFrameUntil = async (
      isDone: (url: string) => boolean,
    ): Promise<string> =>
      settledUrl(
        '',
        settleTicks,
        isDone,
        () => page.frame({ name: frameName })?.url() ?? '(no frame)',
      );

    /** `goto` is interrupted when the extension redirects, which is the point. */
    const visit = async (url: string): Promise<string> => {
      mut_documentLoads.length = 0;

      await page
        .goto(url, { waitUntil: 'domcontentloaded' })
        .catch(() => undefined);

      return settle();
    };

    /** What the extension left in the attribute, not what the DOM resolves it to. */
    const hrefOf = async (id: string): Promise<string> =>
      (await page.locator(id).getAttribute('href')) ?? '(no href)';

    console.log('the redirect');

    check(
      'a bare diff URL gains both defaults',
      await visit(`${origin}/noshiro-pf/mono/pull/1/files`),
      `${origin}/noshiro-pf/mono/pull/1/files?w=1&show-viewed-files=false`,
    );

    check(
      'a diff URL that already says w=0 keeps it',
      await visit(`${origin}/noshiro-pf/mono/pull/1/files?w=0`),
      `${origin}/noshiro-pf/mono/pull/1/files?w=0&show-viewed-files=false`,
    );

    check(
      'a page that is not a diff is left alone',
      await visit(`${origin}/noshiro-pf/mono/pull/1/commits`),
      `${origin}/noshiro-pf/mono/pull/1/commits`,
    );

    console.log('the links');

    await visit(`${origin}/noshiro-pf/mono/pull/1`);

    check(
      'the diff link is rewritten',
      await hrefOf('#files-tab'),
      `${origin}/noshiro-pf/mono/pull/1/files?w=1&show-viewed-files=false`,
    );

    check(
      'a link to another page is untouched',
      await hrefOf('#commits-tab'),
      '/noshiro-pf/mono/pull/1/commits',
    );

    check(
      'a link to another origin is untouched',
      await hrefOf('#offsite'),
      'https://example.com/noshiro-pf/mono/pull/1/files',
    );

    mut_documentLoads.length = 0;

    await page.locator('#files-tab').click();

    check(
      'clicking it navigates with the defaults on',
      await settle(),
      `${origin}/noshiro-pf/mono/pull/1/files?w=1&show-viewed-files=false`,
    );

    console.log('the branches page');

    check(
      'the branch overview becomes the full list',
      await visit(`${origin}/noshiro-pf/mono/branches`),
      `${origin}/noshiro-pf/mono/branches/all`,
    );

    check(
      'a list that names its tab is left alone',
      await visit(`${origin}/noshiro-pf/mono/branches/yours`),
      `${origin}/noshiro-pf/mono/branches/yours`,
    );

    await visit(`${origin}/noshiro-pf/mono/pull/1`);

    check(
      'the branches link is rewritten',
      await hrefOf('#branches-tab'),
      `${origin}/noshiro-pf/mono/branches/all`,
    );

    await visit(`${origin}/noshiro-pf/mono/branches/all`);

    check(
      'the same link in the branches tab bar is marked instead',
      await hrefOf('#branches-tab'),
      `${origin}/noshiro-pf/mono/branches?overview=1`,
    );

    // The opt-out. The "Overview" tab points at the very URL the redirect acts
    // on, so the tab carries a mark that says the overview is what was asked
    // for — and landing on it is the redirect reading that mark.
    await page.locator('#branches-tab').click();

    check(
      'and clicking it reaches the overview, without being sent back',
      await settle(),
      `${origin}/noshiro-pf/mono/branches?overview=1`,
    );

    // What the mark buys over reading the referrer, and the thing neither a
    // unit test nor the referrer could give: the address says what was wanted,
    // so it goes on saying it. A referrer does not survive being bookmarked,
    // and the one a reload carries is the click before it — measured: with the
    // referrer, a reload of the overview stayed and a bookmark of it did not.
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);

    check(
      'reloading the overview keeps the overview',
      await settle(),
      `${origin}/noshiro-pf/mono/branches?overview=1`,
    );

    check(
      'and the bare overview is the full list, however it was reached',
      await visit(`${origin}/noshiro-pf/mono/branches`),
      `${origin}/noshiro-pf/mono/branches/all`,
    );

    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);

    check(
      'which a reload does not undo either',
      await settle(),
      `${origin}/noshiro-pf/mono/branches/all`,
    );

    console.log('the tab title');

    /** The title once the observer has had a turn to act on it. */
    const settledTitle = async (): Promise<string> => {
      await page.waitForTimeout(settleStepMs);

      return page.title();
    };

    await visit(`${origin}/noshiro-pf/mono/pull/1`);

    check(
      'a pull request is numbered',
      await settledTitle(),
      '#1 pull request fixture',
    );

    await visit(`${origin}/noshiro-pf/mono/issues/2`);

    check(
      'an issue is numbered',
      await settledTitle(),
      '#2 pull request fixture',
    );

    await visit(`${origin}/noshiro-pf/mono/pull/1/files`);

    check(
      'a diff reached through the redirect is numbered',
      await settledTitle(),
      '#1 pull request fixture',
    );

    await visit(`${origin}/noshiro-pf/mono/branches/yours`);

    check(
      'a page that is neither is left alone',
      await settledTitle(),
      'pull request fixture',
    );

    // What GitHub does on a client-side navigation: the address moves without
    // a document load, and the page sets a new title. Once with the title
    // arriving after the address, which is the order that would stack a second
    // number in front of the first if the old one were taken for the page's.
    await visit(`${origin}/noshiro-pf/mono/pull/1`);

    await page.evaluate(() => {
      history.pushState(null, '', '/noshiro-pf/mono/pull/3');

      document.body.append(document.createElement('span'));
    });

    await settledTitle();

    // As a string, like the fixture's own script: this runs in the page, and
    // what it does there is the site's behavior, not this file's.
    await page.evaluate("document.title = 'the third one'");

    check(
      'a client-side navigation is renumbered, not numbered twice',
      await settledTitle(),
      '#3 the third one',
    );

    await page.evaluate(
      "history.pushState(null, '', '/noshiro-pf/mono/pulls'); document.title = 'the list'",
    );

    check(
      'and a navigation away is not numbered',
      await settledTitle(),
      'the list',
    );

    console.log('the address bar the site rewrites');

    // `/stripped/` is the fixture that behaves like GitHub: it deletes
    // `show-viewed-files` from its own address and keeps mutating the DOM.
    await visit(`${origin}/stripped/mono/pull/1/files`);

    // Long enough for a dozen of the fixture's rewrites. A loop shows up here
    // as a count of page loads that keeps climbing: the address the extension
    // asked for, taken off again, asked for again.
    await page.waitForTimeout(loopWatchMs);

    // The page was loaded with the defaults once, so the parameter the site
    // took off stays off, and nothing is loaded again to put it back.
    check(
      'the site takes a default off, and the page is not loaded again',
      `${String(mut_documentLoads.length)} page loads, at ${page.url()}`,
      `2 page loads, at ${origin}/stripped/mono/pull/1/files?w=1`,
    );

    // The reload is a new document at the address the site left, so it is
    // redirected once, as any other arrival would be — and then the site takes
    // the parameter off again, and that is all.
    mut_documentLoads.length = 0;

    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);

    await page.waitForTimeout(loopWatchMs);

    check(
      'and a reload of that address is redirected once',
      `${String(mut_documentLoads.length)} page loads, at ${page.url()}`,
      `2 page loads, at ${origin}/stripped/mono/pull/1/files?w=1`,
    );

    console.log('the refresh the site does in place');

    // `/refreshing/` is the fixture that behaves like GitHub's "Refresh"
    // button, shown on a diff once the pull request has been pushed to: a link
    // to the page's own bare path, handled by a router that refreshes it in
    // place. A link to the page it is on is left to the site, so the refresh
    // is no load at all and leaves the bare path the router wrote.
    await visit(
      `${origin}/refreshing/mono/pull/1/files?w=1&show-viewed-files=false`,
    );

    await page.locator('#refresh').click();

    const refreshedUrl = await settleUntil((url) => !url.includes('?'));

    check(
      'the refresh is left to the site, in place',
      `${String(mut_documentLoads.length)} page load, at ${refreshedUrl}`,
      `1 page load, at ${origin}/refreshing/mono/pull/1/files`,
    );

    // Reloading that page is what brings the defaults back: a new document at
    // the bare path, redirected once.
    mut_documentLoads.length = 0;

    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);

    check(
      'and a reload after it brings the defaults back',
      `${String(mut_documentLoads.length)} page loads, at ${await settleUntil((url) => url.includes('show-viewed-files'))}`,
      `2 page loads, at ${origin}/refreshing/mono/pull/1/files?w=1&show-viewed-files=false`,
    );

    // A split-view pane is a frame, which a content script is not injected
    // into unless it asks. The frame opens the bare diff, so this is the
    // redirect, inside it.
    await visit(`${origin}/frame-host`);

    check(
      'and the redirect happens inside a frame',
      await settleFrameUntil((url) => url.includes('show-viewed-files')),
      `${origin}/noshiro-pf/mono/pull/1/files?w=1&show-viewed-files=false`,
    );
  } finally {
    await context.close();

    fs.rmSync(userDataDir, { recursive: true, force: true });
  }

  if (Arr.isNonEmpty(mut_failures)) {
    throw new Error(`${String(mut_failures.length)} check(s) failed.`);
  }

  console.log('\nall checks passed');
};

/** The only origin the extension is declared for. */
const origin = 'https://github.com';

/** The `name` of the frame `/frame-host` holds. */
const frameName = 'pane';

/** The `isDone` of a wait that only asks the address to stop moving. */
const anyUrl = (): boolean => true;

const settleStepMs = 100;

const settleTicks = 40;

const loopWatchMs = 2500;

/**
 * What every github.com request is answered with.
 *
 * Enough of a pull request page to click through: the tab links the extension
 * rewrites, two it must leave alone, the branches links whose treatment depends
 * on the page they are read from, and — under `/stripped/` and
 * `/refreshing/` — the address-bar rewriting and the in-place navigation the
 * real site does. `/frame-host` is a page
 * holding a diff in a frame, as a split view does.
 */
const fixtureFor = (url: string): string => {
  const { pathname } = new URL(url);

  if (pathname === '/frame-host') {
    return [
      '<!doctype html>',
      '<meta charset="utf-8">',
      '<title>frame host fixture</title>',
      `<iframe name="${frameName}" src="/noshiro-pf/mono/pull/1/files"></iframe>`,
    ].join('\n');
  }

  return [
    '<!doctype html>',
    '<meta charset="utf-8">',
    '<title>pull request fixture</title>',
    '<h1>pull request fixture</h1>',
    '<a id="files-tab" href="/noshiro-pf/mono/pull/1/files">Files changed</a>',
    '<a id="commits-tab" href="/noshiro-pf/mono/pull/1/commits">Commits</a>',
    '<a id="offsite" href="https://example.com/noshiro-pf/mono/pull/1/files">elsewhere</a>',
    // Both spellings of the branches link, which is the same anchor in two
    // roles: the repository's own navigation on a page that is not the branches
    // page, and the "Overview" tab on one that is. The two are rewritten
    // differently, which is what the checks below read.
    '<a id="branches-tab" href="/noshiro-pf/mono/branches">Branches</a>',
    '<a id="branches-all-tab" href="/noshiro-pf/mono/branches/all">All branches</a>',
    '<div id="feed"></div>',
    pathname.startsWith('/stripped/')
      ? `<script>${addressRewritingScript}</script>`
      : '',
    pathname.startsWith('/refreshing/')
      ? [
          `<a id="refresh" href="${pathname}">Refresh</a>`,
          `<script>${refreshInPlaceScript}</script>`,
        ].join('\n')
      : '',
  ].join('\n');
};

/**
 * The site's half of the bug this extension had.
 *
 * GitHub applies the parameters and then normalizes them off the URL with
 * `history.replaceState`, while its own rendering goes on changing the DOM.
 * The two together are what a content script sees as "the address changed":
 * the mutation is what wakes the observer, and the address is what it reads.
 *
 * Written as lines rather than one template literal so that the indentation
 * here is not part of the string.
 */
const addressRewritingScript = [
  'setInterval(() => {',
  '  const url = new URL(location.href);',
  "  if (url.searchParams.has('show-viewed-files')) {",
  "    url.searchParams.delete('show-viewed-files');",
  "    history.replaceState(null, '', url.toString());",
  '  }',
  "  document.getElementById('feed').append(document.createElement('span'));",
  '}, 200);',
].join('\n');

/**
 * What GitHub's "Refresh" button on a diff does: it is a link to the page's
 * own path, query and fragment dropped, and the router navigates there in
 * place. The router has the click before the anchor does, as a listener on the
 * document in the capture phase, so one on the anchor never hears of it.
 *
 * It navigates to the route it holds — the path — and not to the anchor's
 * `href`, which is the whole of why a rewritten attribute alone does nothing.
 */
const refreshInPlaceScript = [
  "document.addEventListener('click', (event) => {",
  "  if (!(event.target instanceof Element) || event.target.closest('#refresh') === null) return;",
  '  event.preventDefault();',
  "  history.pushState(null, '', location.pathname);",
  "  document.getElementById('feed').append(document.createElement('span'));",
  '}, true);',
].join('\n');

const assertBuildIsPresent = (): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(path.resolve(distPath, 'manifest.json'))) {
    throw new Error(`No build at ${distPath}. Run \`pnpm run build\` first.`);
  }
};

// A rejection here exits non-zero on its own, which is what `pnpm run smoke`
// needs; catching it only to re-report it would lose the stack.
await main();
