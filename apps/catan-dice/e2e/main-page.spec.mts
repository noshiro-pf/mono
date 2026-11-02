import { expect, type Page, test } from '@playwright/test';
import { Arr, Num, Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

test('visit main page', { tag: '@smoke' }, async ({ page }) => {
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

test('initial state', { tag: '@smoke' }, async ({ page }) => {
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

test('after roll twice', { tag: '@smoke' }, async ({ page }) => {
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

test('after click undo once', { tag: '@smoke' }, async ({ page }) => {
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

test('roll after undo', { tag: '@smoke' }, async ({ page }) => {
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

test(
  'the dice, their sum and the histogram agree',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const rollButton = page.getByTestId('roll-dice-button');

    const undoButton = page.getByTestId('undo-button');

    await expect.soft(page.getByTestId('dice-1')).toHaveText('0');

    await expect.soft(page.getByTestId('dice-sum')).toHaveText('0');

    await rollButton.click();

    await rollButton.click();

    await rollButton.click();

    await rollButton.click();

    await rollButton.click();

    await expectConsistent(page, 5);

    await undoButton.click();

    await expectConsistent(page, 4);

    await expect.soft(page.getByTestId('redo-button')).toBeEnabled();
  },
);

/** The whole number an element shows; any other text fails the test. */
const readNumber = async (
  page: DeepReadonly<Page>,
  e2eId: string,
): Promise<number> => {
  const text = await page.getByTestId(e2eId).innerText();

  expect.soft(text, e2eId).toMatch(/^\d+$/u);

  return Result.unwrapOkOr(Num.safeParseFloat(text), 0);
};

/** The count a histogram bar shows; an empty bar shows nothing, which is 0. */
const readCount = async (
  page: DeepReadonly<Page>,
  sum: number,
): Promise<number> => {
  const e2eId = `histogram-count-${sum}`;

  const text = await page.getByTestId(e2eId).innerText();

  expect.soft(text, e2eId).toMatch(/^\d*$/u);

  return Result.unwrapOkOr(Num.safeParseFloat(text), 0);
};

/**
 * The dice are random, so this checks what must hold whatever they show: each
 * die is 1 to 6, the sum is theirs, the histogram counts `rolls` in all, and
 * the bar of the current sum is not empty.
 */
const expectConsistent = async (
  page: DeepReadonly<Page>,
  rolls: number,
): Promise<void> => {
  await expect.soft(page.getByTestId('roll-count')).toHaveText(`N = ${rolls}`);

  const dice1 = await readNumber(page, 'dice-1');

  const dice2 = await readNumber(page, 'dice-2');

  expect.soft(dice1).toBeGreaterThanOrEqual(1);

  expect.soft(dice1).toBeLessThanOrEqual(6);

  expect.soft(dice2).toBeGreaterThanOrEqual(1);

  expect.soft(dice2).toBeLessThanOrEqual(6);

  expect.soft(await readNumber(page, 'dice-sum')).toBe(dice1 + dice2);

  const counts = await Promise.all(
    Arr.range(2, 13).map(async (sum) => readCount(page, sum)),
  );

  expect.soft(Arr.sum(counts)).toBe(rolls);

  // `counts` starts at the sum 2.
  expect.soft(counts[dice1 + dice2 - 2] ?? 0).toBeGreaterThanOrEqual(1);
};
