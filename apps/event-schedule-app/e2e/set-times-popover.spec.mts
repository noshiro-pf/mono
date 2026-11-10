import { expect, test } from '@playwright/test';

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
