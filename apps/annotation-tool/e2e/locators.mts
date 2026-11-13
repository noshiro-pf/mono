import type { Locator, Page } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

/** The buttons of the label list that select a label, one per label. */
export const labelButtons = (page: DeepReadonly<Page>): Locator =>
  page.getByTestId('label-list').getByTestId('label-button');

/** The button of a label in the label list, by the label's name. */
export const labelButton = (
  page: DeepReadonly<Page>,
  labelName: string,
): Locator =>
  page
    .getByTestId('label-list')
    .getByRole('button', { name: labelName, exact: true });

/** The selected label's button, which is the one pressed. */
export const selectedLabelButton = (page: DeepReadonly<Page>): Locator =>
  labelButtons(page).and(page.getByRole('button', { pressed: true }));

/**
 * The eye beside a label's button, which shows or hides its boxes: pressed
 * while they are shown.
 */
export const visibilityToggle = (
  page: DeepReadonly<Page>,
  labelName: string,
): Locator =>
  page
    .getByTestId('label-list')
    .getByRole('button', { name: `Show ${labelName}`, exact: true });
