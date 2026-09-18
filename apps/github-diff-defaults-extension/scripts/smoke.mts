import { chromium } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { distPath } from './store-package.mjs';

/**
 * Loads the built extension into a real Chromium and checks the things nothing
 * else can check: that the redirect happens, that the links are rewritten, that
 * a click on one goes where the link says, that the referrer the branches rule
 * reads is the one the browser actually sends — and that none of it happens
 * twice.
 *
 * **It never touches github.com.** Every request to that origin is fulfilled
 * from a fixture here, which is what makes this deterministic, and is also what
 * lets the last check exist at all. The fixture reproduces the thing the real
 * site does that broke the first version of this extension: it takes the
 * parameters in and then strips `show-viewed-files` back off its own address
 * bar, while going on mutating the DOM. An extension that reads that as "the
 * defaults are gone" redirects forever; the check is that the page is loaded
 * twice — asked for, and redirected once — and then no more.
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
    path.join(os.tmpdir(), 'github-diff-defaults-smoke-'),
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
     * The address once it has stopped moving, or the last one seen.
     *
     * Recursive rather than a loop, which is what lets each wait be awaited:
     * the extension's redirect is a second document load, so there is no one
     * event to wait for that means "it has finished deciding".
     */
    const settledUrl = async (
      previous: string,
      ticksLeft: number,
    ): Promise<string> => {
      if (ticksLeft <= 0) {
        return page.url();
      }

      await page.waitForTimeout(settleStepMs);

      const current = page.url();

      return current === previous
        ? current
        : settledUrl(current, ticksLeft - 1);
    };

    const settle = async (): Promise<string> => settledUrl('', settleTicks);

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
      'the same link on the branches page is not',
      await hrefOf('#branches-tab'),
      '/noshiro-pf/mono/branches',
    );

    // The opt-out, and the one thing a unit test cannot show: the "Overview"
    // tab points at the very URL the redirect acts on, so the redirect has to
    // read the referrer to leave it alone. Landing back on `/branches` and
    // staying there is what says it did.
    await page.locator('#branches-tab').click();

    check(
      'and clicking it reaches the overview, without being sent back',
      await settle(),
      `${origin}/noshiro-pf/mono/branches`,
    );

    console.log('the address bar the site rewrites');

    // `/stripped/` is the fixture that behaves like GitHub: it deletes
    // `show-viewed-files` from its own address and keeps mutating the DOM.
    check(
      'the site gets its address back',
      await visit(`${origin}/stripped/mono/pull/1/files`),
      `${origin}/stripped/mono/pull/1/files?w=1`,
    );

    // Long enough for a dozen of the fixture's rewrites. A loop shows up here
    // as a count of page loads that keeps climbing: the address the extension
    // asked for, taken off again, asked for again.
    await page.waitForTimeout(loopWatchMs);

    check(
      'and the defaults are not forced back',
      `${String(mut_documentLoads.length)} page loads, at ${page.url()}`,
      `2 page loads, at ${origin}/stripped/mono/pull/1/files?w=1`,
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

const settleStepMs = 100;

const settleTicks = 40;

const loopWatchMs = 2500;

/**
 * What every github.com request is answered with.
 *
 * Enough of a pull request page to click through: the tab links the extension
 * rewrites, two it must leave alone, the branches links whose treatment depends
 * on the page they are read from, and — under `/stripped/` — the address-bar
 * rewriting the real site does.
 */
const fixtureFor = (url: string): string => {
  const { pathname } = new URL(url);

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
    // page, and the "Overview" tab on one that is.
    '<a id="branches-tab" href="/noshiro-pf/mono/branches">Branches</a>',
    '<a id="branches-all-tab" href="/noshiro-pf/mono/branches/all">All branches</a>',
    '<div id="feed"></div>',
    pathname.startsWith('/stripped/')
      ? `<script>${addressRewritingScript}</script>`
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

const assertBuildIsPresent = (): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(path.resolve(distPath, 'manifest.json'))) {
    throw new Error(`No build at ${distPath}. Run \`pnpm run build\` first.`);
  }
};

// A rejection here exits non-zero on its own, which is what `pnpm run smoke`
// needs; catching it only to re-report it would lose the stack.
await main();
