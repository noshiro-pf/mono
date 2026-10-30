import { expect, test, type Locator } from '@playwright/test';

test('visit main page', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByTestId('root')).toBeVisible();
});

test(
  'a click or the arrow keys select an option in its group',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const jikaze = page.getByRole('radiogroup', { name: '自風' });

    const option = (displayName: string): Locator =>
      jikaze.getByRole('radio', { name: displayName });

    await expect.soft(option('東')).toBeChecked();

    await expect.soft(jikaze.getByText('東')).toHaveClass('selected');

    await jikaze.getByText('南').click();

    await expect.soft(option('南')).toBeChecked();

    await expect.soft(option('東')).not.toBeChecked();

    // What shows the choice is the label's class, which the store sets.
    await expect.soft(jikaze.getByText('南')).toHaveClass('selected');

    await expect.soft(jikaze.getByText('東')).not.toHaveClass('selected');

    await option('南').press('ArrowRight');

    await expect.soft(option('西')).toBeChecked();

    await expect.soft(option('南')).not.toBeChecked();

    await expect.soft(jikaze.getByText('西')).toHaveClass('selected');

    await expect.soft(jikaze.getByText('南')).not.toHaveClass('selected');

    // The other groups keep their own selection.
    await expect
      .soft(
        page
          .getByRole('radiogroup', { name: '場風' })
          .getByRole('radio', { name: '東' }),
      )
      .toBeChecked();
  },
);
