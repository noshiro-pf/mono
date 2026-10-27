import { expect, type Locator, type Page, test } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

test('visit main page', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByTestId('root')).toBeVisible();
});

const getElements = (
  page: DeepReadonly<Page>,
): Readonly<{
  numericInputDownPaymentManYen: Locator;
  numericInputPropertyPriceManYen: Locator;
  numericInputBorrowingPeriodYear: Locator;
  numericInputInterestRatePerYear: Locator;
  repaymentTypeRadioGroup: Locator;
  borrowingTotalYenTitle: Locator;
  borrowingTotalYenDescription: Locator;
  fixedPrincipalYenPerMonthTitle: Locator;
  fixedMonthlyPaymentsYenTitle: Locator;
  fixedMonthlyPaymentsYenDescription: Locator;
  fixedPrincipalYenPerMonthDescription: Locator;
  interestSumTitle: Locator;
  interestSumDescription: Locator;
  paymentsSumTitle: Locator;
  paymentsSumDescription: Locator;
}> => ({
  numericInputDownPaymentManYen: page.getByTestId(
    'numericInput-downPaymentManYen',
  ),
  numericInputPropertyPriceManYen: page.getByTestId(
    'numericInput-propertyPriceManYen',
  ),
  numericInputBorrowingPeriodYear: page.getByTestId(
    'numericInput-borrowingPeriodYear',
  ),
  numericInputInterestRatePerYear: page.getByTestId(
    'numericInput-interestRatePerYear',
  ),
  repaymentTypeRadioGroup: page.getByTestId('repaymentTypeRadioGroup'),

  borrowingTotalYenTitle: page.getByTestId('borrowingTotalYenTitle'),
  borrowingTotalYenDescription: page.getByTestId(
    'borrowingTotalYenDescription',
  ),
  fixedPrincipalYenPerMonthTitle: page.getByTestId(
    'fixedPrincipalYenPerMonthTitle',
  ),
  fixedMonthlyPaymentsYenDescription: page.getByTestId(
    'fixedMonthlyPaymentsYenDescription',
  ),
  fixedMonthlyPaymentsYenTitle: page.getByTestId(
    'fixedMonthlyPaymentsYenTitle',
  ),
  fixedPrincipalYenPerMonthDescription: page.getByTestId(
    'fixedPrincipalYenPerMonthDescription',
  ),
  interestSumTitle: page.getByTestId('interestSumTitle'),
  interestSumDescription: page.getByTestId('interestSumDescription'),
  paymentsSumTitle: page.getByTestId('paymentsSumTitle'),
  paymentsSumDescription: page.getByTestId('paymentsSumDescription'),
});

test('config 1', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByTestId('root')).toBeVisible();

  const {
    numericInputDownPaymentManYen,
    numericInputPropertyPriceManYen,
    numericInputBorrowingPeriodYear,
    numericInputInterestRatePerYear,
    repaymentTypeRadioGroup,
    borrowingTotalYenTitle,
    borrowingTotalYenDescription,
    fixedPrincipalYenPerMonthTitle,
    fixedPrincipalYenPerMonthDescription,
    interestSumTitle,
    interestSumDescription,
    paymentsSumTitle,
    paymentsSumDescription,
  } = getElements(page);

  await numericInputDownPaymentManYen.fill('200');

  await numericInputPropertyPriceManYen.fill('2780');

  await numericInputBorrowingPeriodYear.fill('35');

  await numericInputInterestRatePerYear.fill('0.5');

  await repaymentTypeRadioGroup
    .getByTestId('radio--principal-equal-payment')
    // eslint-disable-next-line playwright/no-force-option
    .check({ force: true });

  await expect
    .soft(borrowingTotalYenTitle)
    .toHaveText('借入金額（＝物件の金額－頭金）');

  await expect.soft(borrowingTotalYenDescription).toHaveText('2580万円');

  await expect
    .soft(fixedPrincipalYenPerMonthTitle)
    .toHaveText('月々の元金の支払い額');

  await expect.soft(fixedPrincipalYenPerMonthDescription).toHaveText('61429円');

  await expect.soft(interestSumTitle).toHaveText('利息合計額');

  await expect.soft(interestSumDescription).toHaveText('226.29万円');

  await expect
    .soft(paymentsSumTitle)
    .toHaveText('合計支払い額（＝頭金＋借入金額＋利息）');

  await expect.soft(paymentsSumDescription).toHaveText('3006.29万円');
});

test('config 2', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByTestId('root')).toBeVisible();

  const {
    numericInputDownPaymentManYen,
    numericInputPropertyPriceManYen,
    numericInputBorrowingPeriodYear,
    numericInputInterestRatePerYear,
    repaymentTypeRadioGroup,
    borrowingTotalYenTitle,
    borrowingTotalYenDescription,
    fixedMonthlyPaymentsYenTitle,
    fixedMonthlyPaymentsYenDescription,
    interestSumTitle,
    interestSumDescription,
    paymentsSumTitle,
    paymentsSumDescription,
  } = getElements(page);

  await numericInputDownPaymentManYen.fill('0');

  await numericInputPropertyPriceManYen.fill('2780');

  await numericInputBorrowingPeriodYear.fill('35');

  await numericInputInterestRatePerYear.fill('0.5');

  await repaymentTypeRadioGroup
    .getByTestId('radio--principal-and-interest-equal-repayment')
    // eslint-disable-next-line playwright/no-force-option
    .check({ force: true });

  await expect
    .soft(borrowingTotalYenTitle)
    .toHaveText('借入金額（＝物件の金額－頭金）');

  await expect.soft(borrowingTotalYenDescription).toHaveText('2780万円');

  await expect.soft(fixedMonthlyPaymentsYenTitle).toHaveText('月々の支払い額');

  await expect.soft(fixedMonthlyPaymentsYenDescription).toHaveText('72165円');

  await expect.soft(interestSumTitle).toHaveText('利息合計額');

  await expect.soft(interestSumDescription).toHaveText('250.92万円');

  await expect
    .soft(paymentsSumTitle)
    .toHaveText('合計支払い額（＝頭金＋借入金額＋利息）');

  await expect.soft(paymentsSumDescription).toHaveText('3030.92万円');
});

test(
  'the settings stay in the address below the base path, across a reload',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const {
      numericInputDownPaymentManYen,
      numericInputPropertyPriceManYen,
      borrowingTotalYenDescription,
    } = getElements(page);

    // Not the defaults (200 and 2780), so that the address has to change.
    await numericInputDownPaymentManYen.fill('100');

    await numericInputPropertyPriceManYen.fill('3000');

    // An input commits its value when it loses focus.
    await numericInputPropertyPriceManYen.blur();

    await expect.soft(borrowingTotalYenDescription).toHaveText('2900万円');

    // The query string is written to the app's own page on the Pages site,
    // not to the site's root.
    await expect.soft(page).toHaveURL(/\/mono\/housing-loan-calculator\/\?/u);

    await page.reload();

    await expect.soft(borrowingTotalYenDescription).toHaveText('2900万円');
  },
);
