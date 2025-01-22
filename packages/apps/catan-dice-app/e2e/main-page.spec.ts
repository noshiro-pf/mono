import { expect, test } from '@playwright/test';

test('visit main page', async ({ page }) => {
  await page.goto('/');

  const rollButton = page.getByTestId('roll-dice-button');
  const undoButton = page.getByTestId('undo-button');
  const redoButton = page.getByTestId('redo-button');
  const redoCount = page.getByTestId('roll-count');

  await expect.soft(rollButton).toBeVisible();
  await expect.soft(undoButton).toBeVisible();
  await expect.soft(redoButton).toBeVisible();
  await expect.soft(redoCount).toBeVisible();
});

test('initial state', async ({ page }) => {
  await page.goto('/');

  const rollButton = page.getByTestId('roll-dice-button');
  const undoButton = page.getByTestId('undo-button');
  const redoButton = page.getByTestId('redo-button');
  const redoCount = page.getByTestId('roll-count');

  await expect.soft(rollButton).toBeEnabled();
  await expect.soft(undoButton).toBeDisabled();
  await expect.soft(redoButton).toBeDisabled();
  await expect.soft(redoCount).toHaveText('N = 0');
});

test('after roll twice', async ({ page }) => {
  await page.goto('/');

  const rollButton = page.getByTestId('roll-dice-button');
  const undoButton = page.getByTestId('undo-button');
  const redoButton = page.getByTestId('redo-button');
  const redoCount = page.getByTestId('roll-count');

  await rollButton.click();
  await rollButton.click();

  await expect.soft(rollButton).toBeEnabled();
  await expect.soft(undoButton).toBeEnabled();
  await expect.soft(redoButton).toBeDisabled();
  await expect.soft(redoCount).toHaveText('N = 2');
});

test('after click undo once', async ({ page }) => {
  await page.goto('/');

  const rollButton = page.getByTestId('roll-dice-button');
  const undoButton = page.getByTestId('undo-button');
  const redoButton = page.getByTestId('redo-button');
  const redoCount = page.getByTestId('roll-count');

  await rollButton.click();
  await rollButton.click();
  await undoButton.click();

  await expect.soft(rollButton).toBeEnabled();
  await expect.soft(undoButton).toBeEnabled();
  await expect.soft(redoButton).toBeEnabled();
  await expect.soft(redoCount).toHaveText('N = 1');
});

test('roll after undo', async ({ page }) => {
  await page.goto('/');

  const rollButton = page.getByTestId('roll-dice-button');
  const undoButton = page.getByTestId('undo-button');
  const redoButton = page.getByTestId('redo-button');
  const redoCount = page.getByTestId('roll-count');

  await rollButton.click();
  await rollButton.click();
  await undoButton.click();
  await rollButton.click();

  await expect.soft(rollButton).toBeEnabled();
  await expect.soft(undoButton).toBeEnabled();
  await expect.soft(redoButton).toBeDisabled();
  await expect.soft(redoCount).toHaveText('N = 2');
});
