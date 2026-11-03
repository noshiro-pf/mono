import { calcAll } from '../../functions/index.mjs';
import {
  BorrowingTotal,
  PercentFloat,
  Year,
  type RepaymentType,
} from '../../types/index.mjs';
import { paymentTableRows } from './payment-table-rows.mjs';

describe(paymentTableRows, () => {
  test.each([
    'principal-equal-payment',
    'principal-and-interest-equal-repayment',
  ] as const satisfies readonly RepaymentType[])(
    'lists one row per payment of a 12-month loan, numbered 1 to 12 (%s)',
    (repaymentType) => {
      const rows = paymentTableRows(
        repaymentType,
        calcAll({
          repaymentType,
          borrowingTotalManYen: BorrowingTotal.cast(1000),
          borrowingPeriodYear: Year.cast(1),
          interestRatePercentPerYear: PercentFloat.cast(1),
        }),
      );

      assert.deepStrictEqual(
        rows.map((row) => row[0]),
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      );
    },
  );

  test('shows the whole payment for principal equal payment', () => {
    const rows = paymentTableRows(
      'principal-equal-payment',
      calcAll({
        repaymentType: 'principal-equal-payment',
        borrowingTotalManYen: BorrowingTotal.cast(1000),
        borrowingPeriodYear: Year.cast(1),
        interestRatePercentPerYear: PercentFloat.cast(1),
      }),
    );

    assert.deepStrictEqual(rows[0], [
      '1',
      '￥10,000,000',
      '￥8,333',
      '￥841,667',
    ]);

    assert.deepStrictEqual(rows[11], ['12', '￥833,333', '￥694', '￥834,028']);
  });

  test('shows the principal of the payment for principal and interest equal repayment', () => {
    const rows = paymentTableRows(
      'principal-and-interest-equal-repayment',
      calcAll({
        repaymentType: 'principal-and-interest-equal-repayment',
        borrowingTotalManYen: BorrowingTotal.cast(1000),
        borrowingPeriodYear: Year.cast(1),
        interestRatePercentPerYear: PercentFloat.cast(1),
      }),
    );

    // The whole payment is ￥837,854 a month.
    assert.deepStrictEqual(rows[0], [
      '1',
      '￥10,000,000',
      '￥8,333',
      '￥829,521',
    ]);

    // The last payment's principal is the balance left before it.
    assert.deepStrictEqual(rows[11], ['12', '￥837,156', '￥698', '￥837,156']);
  });
});
