import { expect, test } from '@playwright/test';

test('housing loan summary', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  const firstPayment = page.getByTestId('loan-first-payment');

  await expect.soft(firstPayment).toHaveText(/^[1-9][\d,]* 円$/u);

  await page.getByTestId('loan-principal').fill('0');

  await expect.soft(firstPayment).toHaveText('0 円');

  await expect.soft(page.getByTestId('loan-total-payment')).toHaveText('0 円');
});
