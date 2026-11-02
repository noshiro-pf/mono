import { expect } from '@playwright/test';
import { test } from './fixtures.mjs';
import { openSplitView } from './helpers.mjs';

test(
  'the help explains the split view, and folds away again',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    const help = page.getByRole('button', { name: '?', exact: true });

    await expect.soft(help).toHaveAttribute('aria-expanded', 'false');

    await expect.soft(page.getByTestId('help')).toBeHidden();

    await help.click();

    await expect.soft(help).toHaveAttribute('aria-expanded', 'true');

    await expect
      .soft(page.getByTestId('help').getByRole('listitem').first())
      .toContainText('Split a pane with');

    await help.click();

    await expect.soft(page.getByTestId('help')).toBeHidden();
  },
);
