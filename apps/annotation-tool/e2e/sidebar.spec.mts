import { expect, type Locator, test } from '@playwright/test';
import { labelButton, labelButtons, selectedLabelButton } from './locators.mjs';

const labelNames = [
  'Ant',
  'Bat',
  'Cat',
  'Dog',
  'Eagle',
  'Falcon',
  'Giraffe',
  'Horse',
] as const;

test(
  'every label has a button, and the first is selected',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await expect.soft(labelButtons(page)).toHaveText(labelNames);

    await expect.soft(selectedLabelButton(page)).toHaveText(['Ant']);
  },
);

test(
  'clicking a label selects it alone',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await labelButton(page, 'Cat').click();

    await expect.soft(selectedLabelButton(page)).toHaveText(['Cat']);

    await labelButton(page, 'Horse').click();

    await expect.soft(selectedLabelButton(page)).toHaveText(['Horse']);
  },
);

test(
  'the eye shows or hides a label without selecting it',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const eye = visibilityIcon(labelButton(page, 'Dog'));

    await expect.soft(eye).toHaveAttribute('data-icon', 'eye-open');

    await labelButton(page, 'Dog').getByTestId('visibility-toggle').click();

    await expect.soft(eye).toHaveAttribute('data-icon', 'eye-off');

    // Only Dog's eye changed, and Ant is still the selected label.
    await expect
      .soft(visibilityIcon(labelButton(page, 'Ant')))
      .toHaveAttribute('data-icon', 'eye-open');

    await expect.soft(selectedLabelButton(page)).toHaveText(['Ant']);

    await labelButton(page, 'Dog').getByTestId('visibility-toggle').click();

    await expect.soft(eye).toHaveAttribute('data-icon', 'eye-open');
  },
);

test(
  'the label list collapses and expands',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const toggle = page.getByRole('button', { name: 'Labels', exact: true });

    await expect.soft(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();

    await expect.soft(toggle).toHaveAttribute('aria-expanded', 'false');

    // By its test id: a role lookup misses the buttons as soon as the list is
    // `aria-hidden`, drawn or not.
    await expect.soft(page.getByTestId('label-list')).toBeHidden();

    await toggle.click();

    await expect.soft(toggle).toHaveAttribute('aria-expanded', 'true');

    await expect.soft(labelButton(page, 'Ant')).toBeVisible();
  },
);

/** The eye icon of a label button, which assistive technology does not see. */
const visibilityIcon = (button: Locator): Locator =>
  button
    .getByTestId('visibility-toggle')
    .getByRole('img', { includeHidden: true });
