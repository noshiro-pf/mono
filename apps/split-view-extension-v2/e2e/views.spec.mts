import { expect } from '@playwright/test';
import { test } from './fixtures.mjs';
import {
  addSplitView,
  addressBar,
  dividers,
  dragDividerTo,
  frameOf,
  go,
  openSplitView,
  paneBoxes,
  paneButton,
  panes,
  picker,
  preset,
  zoomButton,
} from './helpers.mjs';

test(
  'the picker lists the split view shown here',
  { tag: '@views' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await expect
      .soft(picker(page).getByRole('option'))
      .toHaveText(['1: split-view-1']);

    await expect.soft(picker(page)).toHaveValue('e2e');

    await expect.soft(page).toHaveTitle('1: split-view-1');
  },
);

test(
  'a split view is renamed in its editor',
  { tag: '@views' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    const edit = page.getByRole('button', { name: 'Edit', exact: true });

    await expect.soft(edit).toHaveAttribute('aria-expanded', 'false');

    await edit.click();

    await expect.soft(edit).toHaveAttribute('aria-expanded', 'true');

    const editor = page.getByRole('dialog', { name: 'Edit this split view' });

    await editor
      .getByRole('textbox', { name: 'Name of this split view' })
      .fill('Research');

    await editor.getByRole('button', { name: 'Rename', exact: true }).click();

    await expect
      .soft(picker(page).getByRole('option'))
      .toHaveText(['1: Research']);

    await expect.soft(page).toHaveTitle('1: Research');

    await page.keyboard.press('Escape');

    await expect.soft(editor).toBeHidden();
  },
);

test(
  'a split view added opens in a tab of its own and is listed in both',
  { tag: '@views' },
  async ({ page, context, extensionId }) => {
    await openSplitView(page, extensionId);

    const added = await addSplitView(page, context);

    const addedUrl = new URL(added.url());

    const addedId = addedUrl.searchParams.get('ws') ?? '';

    expect.soft(addedId).not.toBe('e2e');

    await expect
      .soft(picker(added).getByRole('option'))
      .toHaveText(['1: split-view-1', '2: split-view-2']);

    await expect.soft(picker(added)).toHaveValue(addedId);

    // The tab already open hears of it too (spec W9).
    await expect
      .soft(picker(page).getByRole('option'))
      .toHaveText(['1: split-view-1', '2: split-view-2']);

    await expect.soft(picker(page)).toHaveValue('e2e');
  },
);

test(
  'the picker, Alt+N and Back switch the tab between split views',
  { tag: '@views' },
  async ({ page, context, extensionId }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    await addSplitView(page, context);

    await picker(page).selectOption({ label: '2: split-view-2' });

    await expect.soft(panes(page)).toHaveCount(4);

    await expect.soft(page).toHaveTitle('2: split-view-2');

    await page.keyboard.press('Alt+Digit1');

    await expect.soft(picker(page)).toHaveValue('e2e');

    await expect.soft(panes(page)).toHaveCount(1);

    await page.goBack();

    await expect.soft(page).toHaveTitle('2: split-view-2');
  },
);

test(
  'switching by Alt+N works from inside a pane too',
  { tag: '@views' },
  async ({ page, context, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    await go(panes(page), pageUrl('/'));

    await addSplitView(page, context);

    await frameOf(panes(page))
      .getByRole('link', { name: 'to the second page' })
      .press('Alt+Digit2');

    await expect.soft(page).toHaveTitle('2: split-view-2');
  },
);

test(
  'a split view moves along the list, and is deleted after a confirmation',
  { tag: '@views' },
  async ({ page, context, extensionId }) => {
    await openSplitView(page, extensionId);

    await addSplitView(page, context);

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    const editor = page.getByRole('dialog', { name: 'Edit this split view' });

    await editor.getByRole('button', { name: 'Later ▶' }).click();

    await expect
      .soft(picker(page).getByRole('option'))
      .toHaveText(['1: split-view-2', '2: split-view-1']);

    await expect.soft(picker(page)).toHaveValue('e2e');

    await editor.getByRole('button', { name: '◀ Earlier' }).click();

    await editor.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect.soft(picker(page).getByRole('option')).toHaveCount(2);

    await editor.getByRole('button', { name: 'Really delete' }).click();

    await expect
      .soft(picker(page).getByRole('option'))
      .toHaveText(['1: split-view-2']);

    await expect.soft(page).toHaveTitle('1: split-view-2');

    // Nothing saved the deleted one back.
    await page.reload();

    await expect
      .soft(picker(page).getByRole('option'))
      .toHaveText(['1: split-view-2']);
  },
);

test(
  'the list is exported to JSON and imported back',
  { tag: '@views' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    const editor = page.getByRole('dialog', { name: 'Edit this split view' });

    const nameBox = editor.getByRole('textbox', {
      name: 'Name of this split view',
    });

    const rename = editor.getByRole('button', { name: 'Rename', exact: true });

    await nameBox.fill('Exported');

    await rename.click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      editor.getByRole('button', { name: 'Export', exact: true }).click(),
    ]);

    expect.soft(download.suggestedFilename()).toBe('split-views.json');

    const exportedPath = await download.path();

    await nameBox.fill('Renamed later');

    await rename.click();

    await expect
      .soft(picker(page).getByRole('option'))
      .toHaveText(['1: Renamed later']);

    await editor.getByTestId('view-import').setInputFiles(exportedPath);

    await expect
      .soft(picker(page).getByRole('option'))
      .toHaveText(['1: Exported']);

    await expect
      .soft(page.getByTestId('view-notice'))
      .toHaveText('Imported 1 (0 new, 1 replaced)');
  },
);

test(
  'a reload comes back to the same layout, ratios, addresses and zoom',
  { tag: '@views' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, 'L1+R2').click();

    await go(panes(page).nth(0), pageUrl('second'));

    await go(panes(page).nth(2), pageUrl('refuses-framing'));

    await paneButton(panes(page).nth(2), 'Zoom in').click();

    // The second divider in document order is the one between the columns.
    await dragDividerTo(page, dividers(page).nth(1), 440);

    // Saved a moment after the last change, the URL with it.
    // cspell:ignore pcpp
    await expect.poll(() => page.url()).toContain('layout=r34.3pcpp');

    const boxes = await paneBoxes(page);

    await page.reload();

    await panes(page).first().waitFor();

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual(boxes);

    await expect
      .soft(addressBar(panes(page).nth(0)))
      .toHaveValue(pageUrl('second'));

    await expect.soft(addressBar(panes(page).nth(1))).toHaveValue('');

    await expect
      .soft(frameOf(panes(page).nth(2)).getByRole('heading'))
      .toHaveText('framed anyway');

    await expect.soft(zoomButton(panes(page).nth(2))).toHaveText('110%');
  },
);

test(
  "the tab's address describes the view and opens it as described",
  { tag: '@views' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, '2 cols').click();

    await go(panes(page).nth(1), pageUrl('second'));

    await expect
      .soft(page)
      .toHaveURL(/[?&]layout=rpp&url=&url=http:\/\/localhost:\d+\/second$/u);

    // Three rows, the first at 20%, an address in the last; no `ws`, so a new
    // split view of its own.
    await page.goto(
      `chrome-extension://${extensionId}/split.html?layout=c20pcpp&url=&url=&url=${pageUrl('/')}&name=Described`,
    );

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual([
        [0, 0, 1280, 136],
        [0, 142, 1280, 269],
        [0, 417, 1280, 269],
      ]);

    await expect
      .soft(frameOf(panes(page).nth(2)).getByRole('heading'))
      .toHaveText('home');

    await expect
      .soft(picker(page).getByRole('option'))
      .toHaveText(['1: split-view-1', '2: Described']);
  },
);

test(
  'a tab is recorded and given its framing rule only while it shows a split view (#2891)',
  { tag: '@views' },
  async ({ page, extensionId, worker, pageUrl }) => {
    await openSplitView(page, extensionId);

    const recorded = async (): Promise<readonly string[]> =>
      worker.evaluate(async () => {
        const stored = await chrome.storage.session.get(null);

        return Object.values(stored).map((value) => JSON.stringify(value));
      });

    await expect
      .poll(recorded)
      .toStrictEqual([expect.stringContaining('"workspaceId":"e2e"')]);

    const tabRules = async (): Promise<number> =>
      worker.evaluate(async () => {
        const rules = await chrome.declarativeNetRequest.getSessionRules();

        return rules.length;
      });

    await expect.poll(tabRules).toBe(1);

    // Navigated away, the tab loses its framing rule, which would otherwise
    // reach the frames of the page it went to; its record stays, and stops
    // counting, since the browser no longer has the page in that tab.
    await page.goto(pageUrl('/'));

    await expect.poll(tabRules).toBe(0);

    await expect
      .poll(async () =>
        worker.evaluate(async () => {
          const contexts = await chrome.runtime.getContexts({
            contextTypes: [chrome.runtime.ContextType.TAB],
          });

          return contexts.filter(
            (context) => context.documentUrl?.includes('/split.html') === true,
          ).length;
        }),
      )
      .toBe(0);

    // Back, the page puts the rule back.
    await page.goBack();

    await expect.poll(tabRules).toBe(1);
  },
);

test(
  'the help explains the split view and folds away',
  { tag: '@views' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    const help = page.getByRole('button', { name: 'Help', exact: true });

    await expect.soft(page.getByTestId('help')).toBeHidden();

    await help.click();

    await expect.soft(help).toHaveAttribute('aria-expanded', 'true');

    await expect
      .soft(page.getByTestId('help').getByRole('listitem').first())
      .toContainText('Split a pane');

    await help.click();

    await expect.soft(page.getByTestId('help')).toBeHidden();
  },
);
