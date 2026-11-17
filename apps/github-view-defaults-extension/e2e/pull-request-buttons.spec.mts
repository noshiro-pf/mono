import {
  expect,
  type BrowserContext,
  type Frame,
  type FrameLocator,
  type Locator,
  type Page,
} from '@playwright/test';
import { splitViewExtensionId } from 'split-view-link';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { githubMessageTag, type GitHubMessage } from '../src/index.mjs';
import { test } from './fixtures.mjs';

/**
 * The buttons `src/pull-request-buttons.mts` floats over a pull request on
 * github.com, against pages answered from here: nothing reaches GitHub.
 *
 * The merge-queued button is checked against stand-ins for both of the label
 * pickers GitHub has drawn, modelled on the real ones as read off a pull
 * request page:
 *
 * - `classic`, the server-rendered sidebar: a `<details>` whose `<summary>`
 *   opens it, holding a `Filter labels` input and, loaded a moment after it
 *   opens, `role="menuitemcheckbox"` items with `aria-checked` and a checkbox
 *   carrying `data-label-name`; closing it submits, and the whole sidebar
 *   section is drawn again a moment later.
 * - `react`: a `Manage labels` button under the sidebar's "Labels" heading
 *   opens a dialog holding a `Filter labels` input and `role="option"` items
 *   named by `aria-labelledby`, with `aria-selected`; the list is drawn again
 *   on every change, so an option clicked is a different element afterwards;
 *   Escape closes it, and what was selected is saved and listed in the sidebar
 *   a moment later.
 *
 * The tabs below the pull request have no sidebar, as on GitHub, and the
 * conversation link is followed in place by a router, as GitHub's is.
 */

/** Read here, before the loop that goes over it, rather than with the rest. */
const markups = ['classic', 'react'] as const;

type Markup = (typeof markups)[number];

for (const markup of markups) {
  test.describe(`the merge-queued button, ${markup} sidebar`, () => {
    test(
      'adds the label through the picker, and only that label',
      { tag: '@smoke' },
      async ({ context, page }) => {
        await serveGitHub(context, { markup });

        await page.goto(`${githubOrigin}${labelled}`);

        await queueButton(page).click();

        await expect
          .soft(queueButton(page))
          .toHaveText('✓ merge-queued', outcome);

        // `merge-queued-later` is in the picker too, its name starting with
        // this one's: only the label named exactly is selected.
        await expect
          .soft(page.getByTestId('labels-list').getByRole('link'))
          .toHaveText(['auto-rebase', 'merge-queued']);

        await expect
          .soft(queueButton(page))
          .toHaveText('＋ merge-queued', outcome);

        await queueButton(page).click();

        await expect
          .soft(queueButton(page))
          .toHaveText('✓ already merge-queued', outcome);
      },
    );

    test(
      'on another tab, goes to the conversation first',
      { tag: '@smoke' },
      async ({ context, page }) => {
        await serveGitHub(context, { markup });

        await page.goto(`${githubOrigin}${labelled}/commits`);

        await queueButton(page).click();

        await expect
          .soft(queueButton(page))
          .toHaveText('✓ merge-queued', outcome);

        await expect.soft(page).toHaveURL(`${githubOrigin}${labelled}`);
      },
    );

    test(
      'uses a picker the user already opened, rather than closing it',
      { tag: '@smoke' },
      async ({ context, page }) => {
        await serveGitHub(context, { markup });

        await page.goto(`${githubOrigin}${labelled}`);

        await openPickerByHand(page, markup);

        await queueButton(page).click();

        await expect
          .soft(queueButton(page))
          .toHaveText('✓ merge-queued', outcome);
      },
    );

    test(
      'stops when the pull request is left while it waits',
      { tag: '@smoke' },
      async ({ context, page }) => {
        // A router slow enough that the page is left well before the
        // conversation's sidebar could be drawn, however slow the machine.
        await serveGitHub(context, {
          markup,
          routerDelayMs: slowRouterDelayMs,
        });

        await page.goto(`${githubOrigin}${labelled}/commits`);

        await queueButton(page).click();

        // Before the conversation's sidebar is drawn: nothing may be labelled,
        // rather than whichever pull request's picker turns up next.
        await page.evaluate(
          "history.pushState(null, '', '/noshiro-pf/mono/pull/8')",
        );

        await expect
          .soft(queueButton(page))
          .toHaveText('✕ left the pull request', outcome);
      },
    );

    test(
      'says so in a repository without the label, and closes the picker',
      { tag: '@smoke' },
      async ({ context, page }) => {
        await serveGitHub(context, { markup, labels: withoutLabel });

        await page.goto(`${githubOrigin}${labelled}`);

        await queueButton(page).click();

        await expect
          .soft(queueButton(page))
          .toHaveText('✕ no "merge-queued" label', outcome);

        await expect.soft(openPicker(page, markup)).toHaveCount(0);
      },
    );
  });
}

test.describe('without Split View', () => {
  test(
    'shows the merge-queued button on this repository only, and no Split view button',
    { tag: '@smoke' },
    async ({ context, page }) => {
      await serveGitHub(context);

      await page.goto(`${githubOrigin}${labelled}`);

      await expect.soft(queueButton(page)).toBeVisible();

      await expect
        .soft(page.getByTestId('pull-request-buttons'))
        .toHaveAttribute('data-split-view', 'absent');

      await expect.soft(splitViewButton(page)).toBeHidden();

      await page.goto(`${githubOrigin}/someone/else/pull/7`);

      await expect.soft(queueButton(page)).toBeHidden();

      await expect.soft(splitViewButton(page)).toBeHidden();
    },
  );
});

test.describe('with Split View', () => {
  test.use({ splitViewInstalled: true });

  test(
    'shows the Split view button on every pull request, and nowhere else',
    { tag: '@smoke' },
    async ({ context, page }) => {
      await serveGitHub(context);

      await page.goto(`${githubOrigin}${labelled}`);

      await expect.soft(splitViewButton(page)).toBeVisible();

      await expect.soft(queueButton(page)).toBeVisible();

      await page.goto(`${githubOrigin}/someone/else/pull/7`);

      await expect.soft(splitViewButton(page)).toBeVisible();

      await expect.soft(queueButton(page)).toBeHidden();

      await page.goto(`${githubOrigin}/noshiro-pf/mono/issues/2`);

      await expect.soft(splitViewButton(page)).toBeHidden();

      await expect.soft(queueButton(page)).toBeHidden();
    },
  );

  test(
    'opens the pull request in Split View in place of its tab',
    { tag: '@smoke' },
    async ({ context, page }) => {
      await serveGitHub(context);

      await page.goto(`${githubOrigin}${labelled}/commits`);

      const [splitView] = await Promise.all([
        context.waitForEvent('page'),
        splitViewButton(page).click(),
      ]);

      await expect.soft(splitView).toHaveURL(/\/split\.html\?/u);

      const opened = new URL(splitView.url());

      // `origin` is "null" for a scheme the URL standard does not know.
      expect
        .soft(`${opened.protocol}//${opened.host}${opened.pathname}`)
        .toBe(`chrome-extension://${splitViewExtensionId}/split.html`);

      expect
        .soft({
          ws: opened.searchParams.get('ws'),
          title: opened.searchParams.get('title'),
          url: opened.searchParams.getAll('url'),
        })
        .toStrictEqual({
          ws: 'github-pull-request',
          // Read off the conversation page, although the diff was on screen.
          title: '#7 Fix the thing',
          url: [
            `${githubOrigin}${labelled}/files?w=1&show-viewed-files=false`,
            `${githubOrigin}${labelled}`,
          ],
        });

      await expect.poll(() => page.isClosed()).toBe(true);
    },
  );

  test(
    "answers the context menu's look-up, and opens one split view",
    { tag: '@smoke' },
    async ({ context, page }) => {
      await serveGitHub(context);

      await page.goto(`${githubOrigin}${labelled}`);

      // The buttons are drawn once the content script has run.
      await expect.soft(splitViewButton(page)).toBeVisible();

      const worker = context
        .serviceWorkers()
        .find(
          (candidate) =>
            candidate.url().endsWith('/background.js') &&
            !candidate.url().includes(splitViewExtensionId),
        );

      expect.soft(worker).toBeDefined();

      const lookUp: GitHubMessage = {
        tag: githubMessageTag,
        kind: 'look-up',
        url: `${githubOrigin}/noshiro-pf/mono/pull/9`,
      } as const;

      // What the worker sends when the menu is used on a GitHub page. Unless
      // the content script answers `true`, the worker opens the pull request as
      // well, and two split views open.
      const [answer, splitView] = await Promise.all([
        // Without the `tabs` permission a tab's address is not readable, so the
        // one tab open is the pull request's.
        worker?.evaluate(async (message): Promise<unknown> => {
          const tabs = await chrome.tabs.query({ active: true });

          const tabId = tabs[0]?.id;

          if (tabId === undefined) {
            return 'no tab';
          }

          const response: unknown = await chrome.tabs.sendMessage(
            tabId,
            message,
            { frameId: 0 },
          );

          return response;
        }, lookUp),
        context.waitForEvent('page'),
      ]);

      expect.soft(answer).toBe(true);

      await expect.soft(splitView).toHaveURL(/\/split\.html\?/u);

      const opened = new URL(splitView.url());

      expect
        .soft(opened.searchParams.getAll('url'))
        .toContain(`${githubOrigin}/noshiro-pf/mono/pull/9`);
    },
  );

  test(
    'opens it behind and keeps the tab on a Ctrl+click',
    { tag: '@smoke' },
    async ({ context, page }) => {
      await serveGitHub(context);

      await page.goto(`${githubOrigin}${labelled}`);

      const [splitView] = await Promise.all([
        context.waitForEvent('page'),
        splitViewButton(page).click({ modifiers: ['Control'] }),
      ]);

      await expect.soft(splitView).toHaveURL(/\/split\.html\?/u);

      // The worker answers once it is done with the tab, closing it or not, and
      // the button is ready again only then.
      await expect.soft(splitViewButton(page)).toBeEnabled();

      expect.soft(page.isClosed()).toBe(false);
    },
  );

  test(
    "in a web page's frame, only the merge-queued button, and only on the conversation",
    { tag: '@smoke' },
    async ({ context, page }) => {
      await serveGitHub(context);

      await page.goto('/panes');

      const diff = frameOf(page, 'diff');

      const conversation = frameOf(page, 'conversation');

      await expect
        .soft(conversation.getByRole('button', { name: queueButtonName }))
        .toBeVisible();

      // A frame never asks whether Split View is installed: it is in one.
      await expect
        .soft(conversation.getByRole('button', { name: '⧉ Split view' }))
        .toBeHidden();

      await expect
        .soft(diff.getByRole('button', { name: queueButtonName }))
        .toBeHidden();

      await expect
        .soft(diff.getByRole('button', { name: '⧉ Split view' }))
        .toBeHidden();
    },
  );

  test(
    "in a web page's frame, adds the label in the conversation, as in a tab",
    { tag: '@smoke' },
    async ({ context, page }) => {
      await serveGitHub(context);

      await page.goto('/panes');

      const conversation = frameOf(page, 'conversation');

      const button = conversation.getByRole('button', {
        name: queueButtonName,
      });

      await button.click();

      await expect.soft(button).toHaveText('✓ merge-queued', outcome);

      await expect
        .soft(conversation.getByTestId('labels-list').getByRole('link'))
        .toHaveText(['auto-rebase', 'merge-queued']);
    },
  );

  // No script of this extension runs in a pane of Split View — Chrome lets no
  // extension reach a frame inside another's page — so there the button is
  // Split View's, drawn and worked for this extension through the pane bridge.
  for (const markup of markups) {
    test(
      `in a pane of Split View, adds the label in the conversation, ${markup} sidebar`,
      { tag: '@smoke' },
      async ({ context, page }) => {
        await serveGitHub(context, { markup });

        await openSplitView(page, [
          `${githubOrigin}${labelled}/files`,
          `${githubOrigin}${labelled}`,
        ]);

        const conversation = paneOf(page, `${githubOrigin}${labelled}`);

        const button = conversation.getByRole('button', {
          name: queueButtonName,
        });

        await button.click();

        await expect.soft(button).toHaveText('✓ merge-queued', outcome);

        await expect
          .soft(conversation.getByTestId('labels-list').getByRole('link'))
          .toHaveText(['auto-rebase', 'merge-queued']);

        await expect.soft(button).toHaveText('＋ merge-queued', outcome);

        await button.click();

        await expect.soft(button).toHaveText('✓ already merge-queued', outcome);
      },
    );
  }

  test(
    'in a pane of Split View, the button is on the conversation alone',
    { tag: '@smoke' },
    async ({ context, page }) => {
      await serveGitHub(context);

      await openSplitView(page, [
        `${githubOrigin}${labelled}/files`,
        `${githubOrigin}${labelled}`,
        `${githubOrigin}/someone/else/pull/7`,
      ]);

      await expect
        .soft(
          paneOf(page, `${githubOrigin}${labelled}`).getByRole('button', {
            name: queueButtonName,
          }),
        )
        .toBeVisible();

      // Asked about, and answered with nothing: the diff, and another
      // repository's conversation.
      await expect
        .soft(
          paneOf(page, `${githubOrigin}${labelled}/files`).getByRole('button'),
        )
        .toHaveCount(0);

      await expect
        .soft(
          paneOf(page, `${githubOrigin}/someone/else/pull/7`).getByRole(
            'button',
          ),
        )
        .toHaveCount(0);
    },
  );

  test(
    'in a pane of Split View, stops when the pane leaves the conversation',
    { tag: '@smoke' },
    async ({ context, page }) => {
      // A menu slow enough that the pane is left well before its items load.
      await serveGitHub(context, { menuDelayMs: slowRouterDelayMs });

      await openSplitView(page, [`${githubOrigin}${labelled}`]);

      const conversation = paneOf(page, `${githubOrigin}${labelled}`);

      const button = conversation.getByRole('button', {
        name: queueButtonName,
      });

      await button.click();

      // While the menu is still loading its items, the pane moves on.
      await conversation.evaluate(() => {
        history.pushState(null, '', '/noshiro-pf/mono/pull/8');
      });

      await expect.soft(button).toHaveText('✕ left the pull request', outcome);
    },
  );
});

const githubOrigin = 'https://github.com';

/** The pull request the pages stand in for. */
const labelled = '/noshiro-pf/mono/pull/7';

const withLabel = [
  'auto-rebase',
  'merge-queued',
  'merge-queued-later',
  'skip-ci',
] as const;

const withoutLabel = ['auto-rebase', 'merge-queued-later', 'skip-ci'] as const;

/**
 * Long enough for the button to work the picker and read the sidebar back;
 * the default would also do, but the failure then names this.
 */
const outcome = { timeout: 15_000 } as const;

/**
 * Every text the merge-queued button shows, which is its accessible name: it
 * says what happened on the button itself.
 */
const queueButtonName =
  /merge-queued|label picker|not saved|left the pull request|press again/u;

const queueButton = (page: DeepReadonly<Page>): Locator =>
  page.getByRole('button', { name: queueButtonName });

const splitViewButton = (page: DeepReadonly<Page>): Locator =>
  page.getByRole('button', { name: '⧉ Split view' });

/**
 * Opens `split.html` of Split View with these addresses side by side, and waits
 * for the last pane's page.
 */
const openSplitView = async (
  page: DeepReadonly<Page>,
  urls: readonly string[],
): Promise<void> => {
  const query = new URLSearchParams(
    Arr.toUnshifted(['ws', 'e2e'])(urls.map((url) => ['url', url] as const)),
  );

  await page.goto(
    `chrome-extension://${splitViewExtensionId}/split.html?${query.toString()}`,
  );

  await expect.poll(() => page.frames().length).toBeGreaterThan(urls.length);
};

/** The pane of `page` showing `url`. */
const paneOf = (page: DeepReadonly<Page>, url: string): Frame => {
  const frame = page.frame({ url });

  if (frame === null) {
    throw new Error(`No pane shows ${url}`);
  }

  return frame;
};

const frameOf = (
  page: DeepReadonly<Page>,
  pane: 'diff' | 'conversation',
): FrameLocator => page.getByTestId(pane).contentFrame();

/** Opens the picker as a person would, before the button is pressed. */
const openPickerByHand = async (
  page: DeepReadonly<Page>,
  markup: Markup,
): Promise<void> => {
  await (markup === 'classic'
    ? page.getByRole('button', { name: 'Labels', exact: true }).click()
    : page.getByRole('button', { name: 'Manage labels' }).click());
};

/**
 * The picker, while it is open: what a closed `<details>` holds is not
 * rendered, so its items are not found once it is closed.
 */
const openPicker = (page: DeepReadonly<Page>, markup: Markup): Locator =>
  markup === 'classic'
    ? page.getByRole('menuitemcheckbox')
    : page.getByRole('dialog');

/**
 * The router both stand-ins share: the conversation link is followed in place,
 * and the sidebar drawn a moment later, as GitHub's takes a moment to render
 * it. Only the conversation has one.
 */
const routerScript = (routerDelayMs: number): string =>
  [
    "document.addEventListener('click', (event) => {",
    "  if (!(event.target instanceof Element) || event.target.closest('#conversation-tab') === null) return;",
    '  event.preventDefault();',
    `  history.pushState(null, '', ${JSON.stringify(labelled)});`,
    `  setTimeout(drawSidebar, ${routerDelayMs.toString()});`,
    '}, true);',
    'drawSidebar();',
  ].join('\n');

const labelLinksScript = [
  'const labelLinks = () => [...on].map((name) => {',
  "  const a = document.createElement('a');",
  "  a.href = '/issues?q=label:' + name;",
  '  a.textContent = name;',
  '  return a;',
  '});',
].join('\n');

/** The server-rendered sidebar, and its `<details>` menu. */
const classicPickerScript = (
  labels: readonly string[],
  menuDelayMs: number,
): string =>
  [
    `const all = ${JSON.stringify(labels)};`,
    "const on = new Set(['auto-rebase']);",
    labelLinksScript,
    'const drawSidebar = () => {',
    "  const sidebar = document.getElementById('sidebar');",
    `  if (location.pathname !== ${JSON.stringify(labelled)}) { sidebar.replaceChildren(); return; }`,
    '  sidebar.innerHTML = \'<div class="discussion-sidebar-item"><details id="labels-select-menu"><summary role="button">Labels</summary><div><input aria-label="Filter labels"><div role="menu"></div><a href="/labels">Edit labels</a></div></details><div data-e2e="labels-list"></div></div><div class="discussion-sidebar-item"><h4>Reviewers</h4></div>\';',
    '  sidebar.querySelector(\'[data-e2e="labels-list"]\').replaceChildren(...labelLinks());',
    "  const details = sidebar.querySelector('details');",
    '  const menu = details.querySelector(\'[role="menu"]\');',
    '  const pending = new Set(on);',
    "  details.addEventListener('toggle', () => {",
    '    if (details.open) {',
    '      setTimeout(() => {',
    '        if (!details.open) return;',
    '        menu.replaceChildren(...all.map((name) => {',
    "          const item = document.createElement('label');",
    "          item.setAttribute('role', 'menuitemcheckbox');",
    "          item.setAttribute('aria-checked', String(pending.has(name)));",
    "          const checkbox = document.createElement('input');",
    "          checkbox.type = 'checkbox';",
    '          checkbox.hidden = true;',
    '          checkbox.dataset.labelName = name;',
    "          const text = document.createElement('span');",
    "          text.textContent = name + ' what ' + name + ' means';",
    '          item.append(checkbox, text);',
    "          item.addEventListener('click', (event) => {",
    '            event.preventDefault();',
    '            if (pending.has(name)) pending.delete(name); else pending.add(name);',
    "            item.setAttribute('aria-checked', String(pending.has(name)));",
    '          });',
    '          return item;',
    '        }));',
    `      }, ${menuDelayMs.toString()});`,
    '      return;',
    '    }',
    '    menu.replaceChildren();',
    '    if (pending.size === on.size && [...pending].every((name) => on.has(name))) return;',
    '    on.clear();',
    '    for (const name of pending) on.add(name);',
    '    setTimeout(drawSidebar, 300);',
    '  });',
    '};',
  ].join('\n');

/** The React sidebar, and its dialog. */
const reactPickerScript = (labels: readonly string[]): string =>
  [
    `const all = ${JSON.stringify(labels)};`,
    "const on = new Set(['auto-rebase']);",
    labelLinksScript,
    'const drawSidebar = () => {',
    "  const sidebar = document.getElementById('sidebar');",
    `  if (location.pathname !== ${JSON.stringify(labelled)}) { sidebar.replaceChildren(); return; }`,
    '  sidebar.innerHTML = \'<section><h4><button type="button" aria-label="Manage labels">Labels</button></h4><div id="labels-list" data-e2e="labels-list"></div></section><section><h4>Reviewers</h4></section>\';',
    '  drawLabels();',
    "  sidebar.querySelector('button').addEventListener('click', openPicker);",
    '};',
    'const drawLabels = () => {',
    "  document.getElementById('labels-list').replaceChildren(...labelLinks());",
    '};',
    'const openPicker = () => {',
    '  const pending = new Set(on);',
    "  const dialog = document.createElement('div');",
    "  dialog.setAttribute('role', 'dialog');",
    "  const input = document.createElement('input');",
    "  input.setAttribute('aria-label', 'Filter labels');",
    "  const list = document.createElement('div');",
    '  const draw = () => list.replaceChildren(...all.filter((name) => name.includes(input.value)).map((name) => {',
    "    const option = document.createElement('div');",
    "    option.setAttribute('role', 'option');",
    "    option.setAttribute('aria-labelledby', 'label-' + name);",
    "    option.setAttribute('aria-selected', String(pending.has(name)));",
    "    const label = document.createElement('span');",
    "    label.id = 'label-' + name;",
    '    label.textContent = name;',
    "    const description = document.createElement('span');",
    "    description.textContent = 'what ' + name + ' means';",
    '    option.append(label, description);',
    "    option.addEventListener('click', () => {",
    '      if (pending.has(name)) pending.delete(name); else pending.add(name);',
    '      draw();',
    '    });',
    '    return option;',
    '  }));',
    "  input.addEventListener('input', draw);",
    "  input.addEventListener('keydown', (event) => {",
    "    if (event.key !== 'Escape') return;",
    '    dialog.remove();',
    '    on.clear();',
    '    for (const name of pending) on.add(name);',
    '    setTimeout(drawLabels, 300);',
    '  });',
    '  draw();',
    '  dialog.append(input, list);',
    '  document.body.append(dialog);',
    '  input.focus();',
    '};',
  ].join('\n');

const pullRequestPage = ({
  markup,
  labels,
  routerDelayMs,
  menuDelayMs,
}: Readonly<{
  markup: Markup;
  labels: readonly string[];
  routerDelayMs: number;
  menuDelayMs: number;
}>): string =>
  [
    '<!doctype html>',
    '<meta charset="utf-8">',
    '<title>Fix the thing by someone · Pull Request #7 · noshiro-pf/mono · GitHub</title>',
    `<a id="conversation-tab" href="${labelled}">Conversation</a>`,
    '<div id="sidebar"></div>',
    `<script>${markup === 'classic' ? classicPickerScript(labels, menuDelayMs) : reactPickerScript(labels)}\n${routerScript(routerDelayMs)}</script>`,
  ].join('\n');

/** How long the stand-in router takes to draw the conversation. */
const defaultRouterDelayMs = 500;

/**
 * How long the server-rendered menu takes to load its items once opened, as
 * GitHub's loads them when the menu opens.
 */
const defaultMenuDelayMs = 300;

/** Longer than the button ever waits for the picker, so it never appears. */
const slowRouterDelayMs = 30_000;

/** Answers every github.com request with a pull request page and its picker. */
const serveGitHub = async (
  context: DeepReadonly<BrowserContext>,
  {
    markup = 'classic',
    labels = withLabel,
    routerDelayMs = defaultRouterDelayMs,
    menuDelayMs = defaultMenuDelayMs,
  }: Readonly<{
    markup?: Markup;
    labels?: readonly string[];
    routerDelayMs?: number;
    menuDelayMs?: number;
  }> = {},
): Promise<void> => {
  await context.route(`${githubOrigin}/**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: pullRequestPage({ markup, labels, routerDelayMs, menuDelayMs }),
    });
  });
};
