import type { Locator, Page } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

/** The buttons of the label list, one per label. */
export const labelButtons = (page: DeepReadonly<Page>): Locator =>
  page.getByTestId('label-list').getByRole('button');

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
  page.getByTestId('label-list').getByRole('button', { pressed: true });
