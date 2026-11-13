import { expect, type Locator, test } from '@playwright/test';
import {
  labelButton,
  labelButtons,
  selectedLabelButton,
  visibilityToggle,
} from './locators.mjs';

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

    const eye = visibilityIcon(visibilityToggle(page, 'Dog'));

    await expect.soft(eye).toHaveAttribute('data-icon', 'eye-open');

    await visibilityToggle(page, 'Dog').click();

    await expect.soft(eye).toHaveAttribute('data-icon', 'eye-off');

    // Only Dog's eye changed, and Ant is still the selected label.
    await expect
      .soft(visibilityIcon(visibilityToggle(page, 'Ant')))
      .toHaveAttribute('data-icon', 'eye-open');

    await expect.soft(selectedLabelButton(page)).toHaveText(['Ant']);

    await visibilityToggle(page, 'Dog').click();

    await expect.soft(eye).toHaveAttribute('data-icon', 'eye-open');
  },
);

test(
  'the eye is a button of its own, which the keyboard toggles and which says whether the label is shown (#3409)',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const toggle = visibilityToggle(page, 'Dog');

    await expect.soft(toggle).toHaveAttribute('aria-pressed', 'true');

    await toggle.focus();

    await page.keyboard.press('Enter');

    await expect.soft(toggle).toHaveAttribute('aria-pressed', 'false');

    await expect
      .soft(visibilityIcon(toggle))
      .toHaveAttribute('data-icon', 'eye-off');

    await page.keyboard.press('Space');

    await expect.soft(toggle).toHaveAttribute('aria-pressed', 'true');

    // Toggling it selects no label.
    await expect.soft(selectedLabelButton(page)).toHaveText(['Ant']);
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

/** The icon of a label's eye, which assistive technology does not see. */
const visibilityIcon = (toggle: Locator): Locator =>
  toggle.getByRole('img', { includeHidden: true });
