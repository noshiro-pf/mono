import { expect, type Locator, type Page, test } from '@playwright/test';

test('visit main page', async ({ page }) => {
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

test('config 1', async ({ page }) => {
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

test('config 2', async ({ page }) => {
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
