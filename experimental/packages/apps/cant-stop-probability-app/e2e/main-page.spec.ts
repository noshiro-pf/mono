import { expect, test } from '@playwright/test';

test('visit main page', async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByTestId('filter-input')).toBeVisible();
});

test('filter 4,5', async ({ page }) => {
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

test('filter 12,2,3', async ({ page }) => {
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
