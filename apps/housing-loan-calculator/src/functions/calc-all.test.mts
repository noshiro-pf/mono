import {
  BorrowingTotal,
  maxBorrowingTotalManYen,
  maxPercent,
  maxYear,
  minBorrowingTotalManYen,
  minPercent,
  minYear,
  PercentFloat,
  Year,
  type RepaymentType,
} from '../types/index.mjs';
import { calcAll } from './calc-all.mjs';

describe(calcAll, () => {
  const repaymentTypes = [
    'principal-equal-payment',
    'principal-and-interest-equal-repayment',
  ] as const satisfies readonly RepaymentType[];

  // Every corner of the inputs' ranges, and a rate too small to change
  // `1 + rate` in a double.
  const cases = repaymentTypes.flatMap((repaymentType) =>
    [maxBorrowingTotalManYen, minBorrowingTotalManYen].flatMap((total) =>
      [maxYear, minYear].flatMap((year) =>
        [maxPercent, minPercent, 1e-15].map(
          (rate) => [repaymentType, total, year, rate] as const,
        ),
      ),
    ),
  );

  test.each(cases)(
    'keeps every figure finite (%s, %d 万円, %d years, %s percent)',
    (repaymentType, total, year, rate) => {
      const values = calcAll({
        repaymentType,
        borrowingTotalManYen: BorrowingTotal.cast(total),
        borrowingPeriodYear: Year.cast(year),
        interestRatePercentPerYear: PercentFloat.cast(rate),
      });

      const figures = [
        ...values.borrowingBalanceYen,
        ...values.interestYen,
        ...values.monthlyPaymentTotalYen,
        ...values.monthlyPrincipalPaymentYen,
        values.fixedMonthlyPaymentsYen,
        values.fixedPrincipalYenPerMonth,
        values.interestSumManYen,
      ] as const;

      assert.deepStrictEqual(
        figures.filter((figure) => !Number.isFinite(figure)),
        [],
      );
    },
  );

  test('repays a loan at 0 percent in equal parts, with no interest', () => {
    const values = calcAll({
      repaymentType: 'principal-and-interest-equal-repayment',
      borrowingTotalManYen: BorrowingTotal.cast(120),
      borrowingPeriodYear: Year.cast(1),
      interestRatePercentPerYear: PercentFloat.cast(minPercent),
    });

    expect(values.fixedMonthlyPaymentsYen).toBe(100_000);

    expect(values.borrowingBalanceYen[0]).toBe(1_200_000);

    expect(values.borrowingBalanceYen[6]).toBe(600_000);

    expect(values.borrowingBalanceYen[12]).toBe(0);

    expect(values.interestSumManYen).toBe(0);
  });
});
