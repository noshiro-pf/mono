import { expect, type Locator, type Page, test } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

test('visit main page', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByTestId('filter-input')).toBeVisible();
});

test('filter 4,5', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('filter-input').clear();

  await page.getByTestId('filter-input').fill('4,5');

  const tableBody = page.getByTestId('table-body');

  const tr = tableBody.getByRole('row');

  const row0Cells = tr.nth(0).getByRole('cell');

  await expect.soft(row0Cells.nth(0)).toHaveText('4');

  await expect.soft(row0Cells.nth(1)).toHaveText('5');

  await expect.soft(row0Cells.nth(2)).toHaveText('7');

  await expect.soft(row0Cells.nth(4)).toHaveText('357');

  await expect.soft(row0Cells.nth(5)).toHaveText('742');

  await expect.soft(row0Cells.nth(6)).toHaveText('197');

  await expect.soft(row0Cells.nth(7)).toHaveText('7');

  const row1Cells = tr.nth(1).getByRole('cell');

  await expect.soft(row1Cells.nth(0)).toHaveText('4');

  await expect.soft(row1Cells.nth(1)).toHaveText('5');

  await expect.soft(row1Cells.nth(2)).toHaveText('8');

  await expect.soft(row1Cells.nth(4)).toHaveText('314');

  await expect.soft(row1Cells.nth(5)).toHaveText('782');

  await expect.soft(row1Cells.nth(6)).toHaveText('200');

  await expect.soft(row1Cells.nth(7)).toHaveText('7');
});

test('filter 12,2,3', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('filter-input').clear();

  await page.getByTestId('filter-input').fill('12,2,3');

  const tableBody = page.getByTestId('table-body');

  const tr = tableBody.getByRole('row');

  const row0Cells = tr.nth(0).getByRole('cell');

  await expect.soft(row0Cells.nth(0)).toHaveText('2');

  await expect.soft(row0Cells.nth(1)).toHaveText('3');

  await expect.soft(row0Cells.nth(2)).toHaveText('12');

  await expect.soft(row0Cells.nth(4)).toHaveText('30');

  await expect.soft(row0Cells.nth(5)).toHaveText('538');

  await expect.soft(row0Cells.nth(6)).toHaveText('728');

  await expect.soft(row0Cells.nth(7)).toHaveText('0');
});

test('filter 4,7,10', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('filter-input').clear();

  await page.getByTestId('filter-input').fill('4,7,10');

  const row0Cells = page
    .getByTestId('table-body')
    .getByRole('row')
    .nth(0)
    .getByRole('cell');

  await expect.soft(row0Cells.nth(0)).toHaveText('4');

  await expect.soft(row0Cells.nth(1)).toHaveText('7');

  await expect.soft(row0Cells.nth(2)).toHaveText('10');

  await expect.soft(row0Cells.nth(4)).toHaveText('304');

  await expect.soft(row0Cells.nth(5)).toHaveText('832');

  await expect.soft(row0Cells.nth(6)).toHaveText('160');

  // (832 + 2 * 304) / 160 is exactly 9, where the gain of one more roll is 0.
  await expect.soft(row0Cells.nth(7)).toHaveText('8');
});

test(
  'the table lists every choice of three columns',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    // 11 columns, 3 chosen: 11 * 10 * 9 / 6.
    await expect
      .soft(page.getByTestId('table-body').getByRole('row'))
      .toHaveCount(165);
  },
);

test(
  'the rows sort by probability first, and by the columns on request',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const firstRowCells = page
      .getByTestId('table-body')
      .getByRole('row')
      .nth(0)
      .getByRole('cell');

    // 6, 7 and 8 are the likeliest columns to hit.
    await expect.soft(firstRowCells.nth(0)).toHaveText('6');

    await expect.soft(firstRowCells.nth(1)).toHaveText('7');

    await expect.soft(firstRowCells.nth(2)).toHaveText('8');

    await page
      .getByRole('button', { name: '選択した列の数字で並べ替え' })
      .click();

    await expect.soft(firstRowCells.nth(0)).toHaveText('2');

    await expect.soft(firstRowCells.nth(1)).toHaveText('3');

    await expect.soft(firstRowCells.nth(2)).toHaveText('4');

    await page.getByRole('button', { name: '確率で並べ替え' }).click();

    await expect.soft(firstRowCells.nth(0)).toHaveText('6');

    await expect.soft(firstRowCells.nth(1)).toHaveText('7');

    await expect.soft(firstRowCells.nth(2)).toHaveText('8');
  },
);

test(
  'the second tab gives the chance of hitting a column still open',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await page.getByRole('tab', { name: '残存列確率' }).click();

    await expect.soft(page.getByTestId('filter-input')).toBeHidden();

    const probability = page.getByTestId('hit-probability');

    // Every column open: any roll hits one.
    await expect.soft(probability).toHaveText('確率： 1');

    const columnsToClose = [
      '2',
      '3',
      '4',
      '5',
      '6',
      '8',
      '9',
      '10',
      '11',
      '12',
    ];

    // Close every column but 7.
    for (const label of columnsToClose) {
      // eslint-disable-next-line no-await-in-loop -- one click after another
      await column(page, label).click();
    }

    await expect
      .soft(page.getByRole('button', { pressed: true }))
      .toHaveText(columnsToClose);

    // 4 dice, some pair summing to 7: 834 rolls of 1296.
    await expect.soft(probability).toHaveText(`確率： ${834 / 1296}`);

    // Closing 7 as well leaves no column open: no roll hits.
    await column(page, '7').click();

    await expect
      .soft(column(page, '7'))
      .toHaveAttribute('aria-pressed', 'true');

    await expect.soft(probability).toHaveText('確率： 0');

    // Reopening 7 brings its chance back.
    await column(page, '7').click();

    await expect
      .soft(column(page, '7'))
      .toHaveAttribute('aria-pressed', 'false');

    await expect.soft(probability).toHaveText(`確率： ${834 / 1296}`);
  },
);

test(
  'switching tabs keeps the filter and the closed columns',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('filter-input').fill('2,12');

    await page.getByRole('tab', { name: '残存列確率' }).click();

    for (const label of ['6', '7', '8']) {
      // eslint-disable-next-line no-await-in-loop -- one click after another
      await column(page, label).click();
    }

    await page.getByRole('tab', { name: '確率表' }).click();

    await expect.soft(page.getByTestId('filter-input')).toHaveValue('2,12');

    // 2 and 12 with one of the other 9 columns.
    await expect
      .soft(page.getByTestId('table-body').getByRole('row'))
      .toHaveCount(9);

    await page.getByRole('tab', { name: '残存列確率' }).click();

    await expect
      .soft(page.getByRole('button', { pressed: true }))
      .toHaveText(['6', '7', '8']);

    // 6, 7 and 8 still closed: 1272 rolls of 1296 hit another column.
    await expect
      .soft(page.getByTestId('hit-probability'))
      .toHaveText(`確率： ${1272 / 1296}`);
  },
);

/** The toggle of a column on the remaining-column tab, by its number. */
const column = (page: DeepReadonly<Page>, label: string): Locator =>
  page.getByRole('button', { name: label, exact: true });
