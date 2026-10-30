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

    // The label is what shows the choice: filled with the primary colour.
    // Its class name is a CSS Module's, scoped and so not stable to name.
    const label = (displayName: string): Locator =>
      jikaze.getByText(displayName);

    const selectedFill = 'rgb(0, 123, 255)';

    await expect.soft(option('東')).toBeChecked();

    await expect.soft(label('東')).toHaveCSS('background-color', selectedFill);

    await jikaze.getByText('南').click();

    await expect.soft(option('南')).toBeChecked();

    await expect.soft(option('東')).not.toBeChecked();

    await expect.soft(label('南')).toHaveCSS('background-color', selectedFill);

    await expect
      .soft(label('東'))
      .not.toHaveCSS('background-color', selectedFill);

    await option('南').press('ArrowRight');

    await expect.soft(option('西')).toBeChecked();

    await expect.soft(option('南')).not.toBeChecked();

    await expect.soft(label('西')).toHaveCSS('background-color', selectedFill);

    await expect
      .soft(label('南'))
      .not.toHaveCSS('background-color', selectedFill);

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
