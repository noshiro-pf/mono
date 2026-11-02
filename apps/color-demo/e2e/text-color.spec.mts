import { expect, type Locator, type Page, test } from '@playwright/test';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

test(
  'the text-color tab shows the contrast table',
  { tag: '@smoke' },
  async ({ page }) => {
    await openTextColorTab(page);

    await expect
      .soft(page.getByRole('tab', { name: 'text-color' }))
      .toHaveAttribute('aria-selected', 'true');

    await expect.soft(table(page)).toBeVisible();

    await expect.soft(page.getByRole('slider', { name: '彩度' })).toBeHidden();
  },
);

test(
  'the header names the saturation and lightness of each column pair',
  { tag: '@smoke' },
  async ({ page }) => {
    await openTextColorTab(page);

    const headerRows = table(page)
      .getByRole('rowgroup')
      .first()
      .getByRole('row');

    await expect.soft(headerRows).toHaveCount(3);

    await expect
      .soft(headerRows.nth(0).getByRole('columnheader'))
      .toHaveText(['Saturation（彩度）', '80', '80', '80', '80', '100', '100']);

    await expect
      .soft(headerRows.nth(1).getByRole('columnheader'))
      .toHaveText(['Lightness（輝度）', '40', '40', '60', '60', '80', '80']);

    await expect
      .soft(headerRows.nth(2).getByRole('columnheader'))
      .toHaveText(['Hue（色相）']);
  },
);

test(
  'a row for each hue, with the contrast against white and black',
  { tag: '@smoke' },
  async ({ page }) => {
    await openTextColorTab(page);

    const rows = bodyRows(page);

    await expect.soft(rows).toHaveCount(360);

    await expect
      .soft(rows.nth(0).getByRole('cell'))
      .toHaveText(['0', '6.67', '3.15', '3.8', '5.52', '2.05', '10.27']);

    await expect
      .soft(rows.nth(200).getByRole('cell'))
      .toHaveText(['200', '4.32', '4.86', '2.33', '9', '1.49', '14.14']);

    const colors = await rows
      .nth(0)
      .getByRole('cell')
      .evaluateAll((cells) =>
        cells.map((cell) => {
          const style = getComputedStyle(cell);

          return [style.backgroundColor, style.color];
        }),
      );

    // After the hue cell, each pair is hue 0 at one saturation and lightness,
    // with white text and then with black text.
    expect
      .soft(colors)
      .toStrictEqual([
        expect.anything(),
        ['rgb(184, 20, 20)', 'rgb(255, 255, 255)'],
        ['rgb(184, 20, 20)', 'rgb(0, 0, 0)'],
        ['rgb(235, 71, 71)', 'rgb(255, 255, 255)'],
        ['rgb(235, 71, 71)', 'rgb(0, 0, 0)'],
        ['rgb(255, 153, 153)', 'rgb(255, 255, 255)'],
        ['rgb(255, 153, 153)', 'rgb(0, 0, 0)'],
      ]);
  },
);

test(
  'the text colour with the higher contrast starts checked',
  { tag: '@smoke' },
  async ({ page }) => {
    await openTextColorTab(page);

    const rows = bodyRows(page);

    await expect.soft(rows).toHaveCount(360);

    expect
      .soft(await checkedStates(rows.nth(0)))
      .toStrictEqual([true, false, false, true, false, true]);

    expect
      .soft(await checkedStates(rows.nth(200)))
      .toStrictEqual([false, true, false, true, false, true]);

    // Read as `checkedStates` reads a row, for every row at once.
    const allChecked = await rows.evaluateAll((rowElements) =>
      rowElements.map((row) =>
        Array.from(
          row.querySelectorAll(':scope input[type="checkbox"]'),
          (input) => input instanceof HTMLInputElement && input.checked,
        ),
      ),
    );

    // The rows that lack six checkboxes or have a pair with both or neither
    // checked.
    const rowsNotOneCheckedPerPair = allChecked.flatMap((checked, rowIndex) =>
      Arr.isFixedLengthArray(6, checked) &&
      [0, 2, 4].every((index) => checked[index] !== checked[index + 1])
        ? []
        : [rowIndex],
    );

    expect.soft(rowsNotOneCheckedPerPair).toStrictEqual([]);
  },
);

test(
  'a checkbox toggles and keeps its state across a tab switch',
  { tag: '@smoke' },
  async ({ page }) => {
    await openTextColorTab(page);

    const firstRow = bodyRows(page).nth(0);

    await firstRow.getByRole('checkbox').nth(1).check();

    await firstRow.getByRole('checkbox').nth(0).uncheck();

    expect
      .soft(await checkedStates(firstRow))
      .toStrictEqual([false, true, false, true, false, true]);

    await page.getByRole('tab', { name: 'luminance' }).click();

    await expect.soft(table(page)).toBeHidden();

    await page.getByRole('tab', { name: 'text-color' }).click();

    await expect.soft(table(page)).toBeVisible();

    expect
      .soft(await checkedStates(firstRow))
      .toStrictEqual([false, true, false, true, false, true]);
  },
);

const openTextColorTab = async (page: DeepReadonly<Page>): Promise<void> => {
  await page.goto('/');

  await page.getByRole('tab', { name: 'text-color' }).click();
};

const table = (page: DeepReadonly<Page>): Locator =>
  page.getByTestId('contrast-table');

const bodyRows = (page: DeepReadonly<Page>): Locator =>
  table(page).getByRole('rowgroup').nth(1).getByRole('row');

/**
 * Whether each checkbox of a row is checked, in order. By CSS rather than by
 * role, so that every input counts whatever its accessibility state, as in the
 * scan of every row.
 */
const checkedStates = async (row: Locator): Promise<readonly boolean[]> =>
  row.evaluate((rowElement) =>
    Array.from(
      rowElement.querySelectorAll(':scope input[type="checkbox"]'),
      (input) => input instanceof HTMLInputElement && input.checked,
    ),
  );
