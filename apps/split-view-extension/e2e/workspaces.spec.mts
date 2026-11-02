import { expect } from '@playwright/test';
import { test } from './fixtures.mjs';
import { addSplitView, openSplitView, panes, preset } from './helpers.mjs';

test(
  'the picker lists the split view shown here',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    const picker = page.getByRole('combobox', {
      name: 'The split view shown here',
    });

    await expect
      .soft(picker.getByRole('option'))
      .toHaveText(['1: split-view-1']);

    await expect.soft(picker).toHaveValue('e2e');

    await expect.soft(page).toHaveTitle('1: split-view-1');
  },
);

test(
  'a split view is renamed from its menu',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    const edit = page.getByRole('button', { name: 'Edit', exact: true });

    await expect.soft(edit).toHaveAttribute('aria-expanded', 'false');

    await edit.click();

    await expect.soft(edit).toHaveAttribute('aria-expanded', 'true');

    const menu = page.getByTestId('workspace-popover');

    await menu
      .getByRole('textbox', { name: 'Name of this split view' })
      .fill('Research');

    await menu.getByRole('button', { name: 'Rename', exact: true }).click();

    await expect
      .soft(page.getByRole('combobox').getByRole('option'))
      .toHaveText(['1: Research']);

    await expect.soft(page).toHaveTitle('1: Research');
  },
);

test(
  'adding a split view opens it in a tab of its own and lists it in both',
  { tag: '@smoke' },
  async ({ page, context, extensionId }) => {
    await openSplitView(page, extensionId);

    const added = await addSplitView(page, context);

    await expect
      .soft(added.getByRole('combobox').getByRole('option'))
      .toHaveText(['1: split-view-1', '2: split-view-2']);

    // The split view it was opened for, which is not this one.
    const addedUrl = new URL(added.url());

    const addedId = addedUrl.searchParams.get('ws') ?? '';

    expect.soft(addedId).not.toBe('e2e');

    await expect.soft(added.getByRole('combobox')).toHaveValue(addedId);

    // The tab that was already open hears of it too.
    await expect
      .soft(page.getByRole('combobox').getByRole('option'))
      .toHaveText(['1: split-view-1', '2: split-view-2']);

    await expect.soft(page.getByRole('combobox')).toHaveValue('e2e');
  },
);

test(
  'the picker and Alt+N switch the tab between split views',
  { tag: '@smoke' },
  async ({ page, context, extensionId }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    await addSplitView(page, context);

    const picker = page.getByRole('combobox');

    await picker.selectOption({ label: '2: split-view-2' });

    // The other split view, with its own four panes.
    await expect.soft(panes(page)).toHaveCount(4);

    await expect.soft(page).toHaveTitle('2: split-view-2');

    await page.keyboard.press('Alt+Digit1');

    await expect.soft(picker).toHaveValue('e2e');

    await expect.soft(panes(page)).toHaveCount(1);

    await expect.soft(page).toHaveTitle('1: split-view-1');
  },
);

test(
  'a split view moves along the list, and is deleted after a confirmation',
  { tag: '@smoke' },
  async ({ page, context, extensionId }) => {
    await openSplitView(page, extensionId);

    await addSplitView(page, context);

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    const menu = page.getByTestId('workspace-popover');

    await menu.getByRole('button', { name: 'Later ▶' }).click();

    await expect
      .soft(page.getByRole('combobox').getByRole('option'))
      .toHaveText(['1: split-view-2', '2: split-view-1']);

    await menu.getByRole('button', { name: '◀ Earlier' }).click();

    await expect
      .soft(page.getByRole('combobox').getByRole('option'))
      .toHaveText(['1: split-view-1', '2: split-view-2']);

    await menu.getByRole('button', { name: 'Delete', exact: true }).click();

    // Asked once more, by the same button.
    await expect
      .soft(page.getByRole('combobox').getByRole('option'))
      .toHaveCount(2);

    await menu.getByRole('button', { name: 'Really delete' }).click();

    await expect
      .soft(page.getByRole('combobox').getByRole('option'))
      .toHaveText(['1: split-view-2']);
  },
);

test(
  'the list is exported to JSON and imported back',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    const menu = page.getByTestId('workspace-popover');

    await menu
      .getByRole('textbox', { name: 'Name of this split view' })
      .fill('Exported');

    await menu.getByRole('button', { name: 'Rename', exact: true }).click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      menu.getByRole('button', { name: 'Export', exact: true }).click(),
    ]);

    const exportedPath = await download.path();

    await menu
      .getByRole('textbox', { name: 'Name of this split view' })
      .fill('Renamed later');

    await menu.getByRole('button', { name: 'Rename', exact: true }).click();

    await expect
      .soft(page.getByRole('combobox').getByRole('option'))
      .toHaveText(['1: Renamed later']);

    // An id already on the list is replaced by the one in the file.
    await menu.getByText('Import').setInputFiles(exportedPath);

    await expect
      .soft(page.getByRole('combobox').getByRole('option'))
      .toHaveText(['1: Exported']);
  },
);
