import {
  expect,
  type BrowserContext,
  type Locator,
  type Page,
} from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';
import { test } from './fixtures.mjs';

/**
 * The buttons `src/github-button.mts` floats over a pull request on github.com,
 * against pages answered from here: nothing reaches GitHub.
 *
 * The merge-queued button is checked against a stand-in for GitHub's label
 * picker, modelled on the real one as read off a pull request page: a
 * `Manage labels` button under the sidebar's "Labels" heading opens a dialog
 * holding a `Filter labels` input and `role="option"` items named by
 * `aria-labelledby`, with `aria-selected`; the list is drawn again on every
 * change, so an option clicked is a different element afterwards; Escape closes
 * it, and what was selected is saved and listed in the sidebar a moment later.
 * The tabs below the pull request have no sidebar, as on GitHub, and the
 * conversation link is followed in place by a router, as GitHub's is.
 */

test.describe('the merge-queued button', () => {
  test(
    'adds the label through the picker, and only that label',
    { tag: '@smoke' },
    async ({ context, page }) => {
      await serveGitHub(context, withLabel);

      await page.goto(`${githubOrigin}${labelled}`);

      await queueButton(page).click();

      await expect
        .soft(queueButton(page))
        .toHaveText('✓ merge-queued', outcome);

      // `merge-queued-later` is in the picker too, its name starting with this
      // one's: only the label named exactly is selected.
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
      await serveGitHub(context, withLabel);

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
      await serveGitHub(context, withLabel);

      await page.goto(`${githubOrigin}${labelled}`);

      await page.getByRole('button', { name: 'Manage labels' }).click();

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
      await serveGitHub(context, withLabel, slowRouterDelayMs);

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
      await serveGitHub(context, withoutLabel);

      await page.goto(`${githubOrigin}${labelled}`);

      await queueButton(page).click();

      await expect
        .soft(queueButton(page))
        .toHaveText('✕ no "merge-queued" label', outcome);

      await expect.soft(page.getByRole('dialog')).toHaveCount(0);
    },
  );

  test(
    'is shown beside "Split view" on this repository only',
    { tag: '@smoke' },
    async ({ context, page }) => {
      await serveGitHub(context, withLabel);

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

/** The page's own script: a router, a sidebar and the label picker. */
const labelPickerScript = (
  labels: readonly string[],
  routerDelayMs: number,
): string =>
  [
    `const all = ${JSON.stringify(labels)};`,
    "const on = new Set(['auto-rebase']);",
    'const drawSidebar = () => {',
    "  const sidebar = document.getElementById('sidebar');",
    `  if (location.pathname !== ${JSON.stringify(labelled)}) { sidebar.replaceChildren(); return; }`,
    '  sidebar.innerHTML = \'<section><h4><button type="button" aria-label="Manage labels">Labels</button></h4><div id="labels-list" data-e2e="labels-list"></div></section><section><h4>Reviewers</h4></section>\';',
    '  drawLabels();',
    "  sidebar.querySelector('button').addEventListener('click', openPicker);",
    '};',
    'const drawLabels = () => {',
    "  document.getElementById('labels-list').replaceChildren(...[...on].map((name) => {",
    "    const a = document.createElement('a');",
    "    a.href = '/issues?q=label:' + name;",
    '    a.textContent = name;',
    '    return a;',
    '  }));',
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
    "document.addEventListener('click', (event) => {",
    "  if (!(event.target instanceof Element) || event.target.closest('#conversation-tab') === null) return;",
    '  event.preventDefault();',
    `  history.pushState(null, '', ${JSON.stringify(labelled)});`,
    `  setTimeout(drawSidebar, ${routerDelayMs.toString()});`,
    '}, true);',
    'drawSidebar();',
  ].join('\n');

const pullRequestPage = (
  labels: readonly string[],
  routerDelayMs: number,
): string =>
  [
    '<!doctype html>',
    '<meta charset="utf-8">',
    '<title>Fix the thing by someone · Pull Request #7 · noshiro-pf/mono · GitHub</title>',
    `<a id="conversation-tab" href="${labelled}">Conversation</a>`,
    '<div id="sidebar"></div>',
    `<script>${labelPickerScript(labels, routerDelayMs)}</script>`,
  ].join('\n');

/**
 * How long the stand-in router takes to draw the conversation after its link is
 * followed, as GitHub's takes a moment to render it.
 */
const defaultRouterDelayMs = 500;

/** Longer than the button ever waits for the picker, so it never appears. */
const slowRouterDelayMs = 30_000;

/** Answers every github.com request with a pull request page and its picker. */
const serveGitHub = async (
  context: DeepReadonly<BrowserContext>,
  labels: readonly string[],
  routerDelayMs: number = defaultRouterDelayMs,
): Promise<void> => {
  await context.route(`${githubOrigin}/**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: pullRequestPage(labels, routerDelayMs),
    });
  });
};
