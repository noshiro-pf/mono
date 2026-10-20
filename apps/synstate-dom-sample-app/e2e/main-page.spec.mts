import { expect, test } from '@playwright/test';

test('counter', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  const count = page.getByTestId('count');

  const decrement = page.getByTestId('decrement');

  await expect.soft(count).toHaveText('Count: 0');

  await expect.soft(decrement).toBeDisabled();

  await page.getByTestId('increment').click();

  await page.getByTestId('increment').click();

  await expect.soft(count).toHaveText('Count: 2');

  await expect.soft(decrement).toBeEnabled();
});

test('todo list', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  const items = page.getByTestId('todo-items').getByRole('listitem');

  const remaining = page.getByTestId('todo-remaining');

  await expect.soft(items).toHaveCount(2);

  await expect.soft(remaining).toHaveText('1 item left');

  await page.getByTestId('todo-input').fill('Write a test');

  await page.getByTestId('todo-add').click();

  await expect.soft(items).toHaveCount(3);

  await expect.soft(items.nth(2)).toContainText('3. Write a test');

  await expect.soft(remaining).toHaveText('2 items left');

  await page.getByRole('button', { name: 'Done', exact: true }).click();

  await expect.soft(items).toHaveCount(1);
});

test('stopwatch stops when hidden', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  const stopwatch = page.getByTestId('stopwatch');

  await expect.soft(stopwatch).not.toHaveText('0.0 s');

  await page.getByTestId('stopwatch-toggle').click();

  await expect.soft(stopwatch).toHaveCount(0);

  await page.getByTestId('stopwatch-toggle').click();

  await expect.soft(stopwatch).toBeVisible();
});

test('dialog', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  const dialog = page.getByTestId('dialog');

  await expect.soft(dialog).toHaveCount(0);

  await page.getByTestId('dialog-open').click();

  await expect.soft(dialog).toBeVisible();

  await page.getByTestId('dialog-close').click();

  await expect.soft(dialog).toHaveCount(0);
});
