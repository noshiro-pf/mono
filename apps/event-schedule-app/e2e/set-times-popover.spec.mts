import { expect, test, type Locator } from '@playwright/test';

// The create page's "時刻一括変更" popover. Its button opens it itself, inside
// the popover's target, which once took the same click for a second one and
// closed it at once. Nothing is written, so this needs no emulator.

test(
  'the set-times popover opens, and closes as asked',
  { tag: '@regression' },
  async ({ page }) => {
    await page.goto('/');

    const button = page.getByTestId('set-times-button').getByRole('button');

    await button.click();

    // Still open once the click is over; the content alone would still be drawn
    // as it fades out.
    await expect.soft(button).toHaveAttribute('aria-expanded', 'true');

    const popover = page.getByTestId('set-times-popover');

    await expect.soft(popover.getByText('以下の曜日に適用')).toBeVisible();

    await popover.getByRole('button', { name: 'キャンセル' }).click();

    await expect.soft(button).toHaveAttribute('aria-expanded', 'false');

    await expect.soft(popover).toBeHidden();
  },
);

test(
  'the set-times popover starts again from the list’s times when it is opened again after a cancel',
  { tag: '@regression' },
  async ({ page }) => {
    await page.goto('/');

    const list = page.getByTestId('datetime-list');

    // A date whose time is not the default one, which the popover would also
    // show if it started from nothing.
    await list.getByTestId('add-button').click();

    await hoursIn(list).fill('10');

    await hoursIn(list).blur();

    await expect.soft(hoursIn(list)).toHaveValue('10');

    const button = page.getByTestId('set-times-button').getByRole('button');

    const popover = page.getByTestId('set-times-popover');

    await button.click();

    await expect.soft(hoursIn(popover)).toHaveValue('10');

    // The time picker's own step, which it hands to the popover at once.
    await hoursIn(popover).press('ArrowUp');

    await expect.soft(hoursIn(popover)).toHaveValue('11');

    await popover.getByRole('button', { name: 'キャンセル' }).click();

    await expect.soft(popover).toBeHidden();

    await button.click();

    await expect.soft(hoursIn(popover)).toHaveValue('10');
  },
);

/** The first hours field of a time picker in `where`. */
const hoursIn = (where: Locator): Locator =>
  where.getByRole('spinbutton', { name: 'hours (24hr clock)' }).first();
