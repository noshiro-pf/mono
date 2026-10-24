import { summarizeHousingLoan } from './summarize-housing-loan.mjs';

describe(summarizeHousingLoan, () => {
  test('初回・最大・合計の返済額を返すこと', () => {
    const summary = summarizeHousingLoan([
      {
        month: 1,
        appliedAnnualRate: 0.01,
        paymentAmount: 100,
        remainingBalance: 200,
      },
      {
        month: 2,
        appliedAnnualRate: 0.02,
        paymentAmount: 120,
        remainingBalance: 100,
      },
      {
        month: 3,
        appliedAnnualRate: 0.02,
        paymentAmount: 110,
        remainingBalance: 0,
      },
    ]);

    assert.deepStrictEqual(summary, {
      firstPayment: 100,
      maxPayment: 120,
      totalPayment: 330,
    });
  });

  test('返済スケジュールが空なら 0 を返すこと', () => {
    assert.deepStrictEqual(summarizeHousingLoan([]), {
      firstPayment: 0,
      maxPayment: 0,
      totalPayment: 0,
    });
  });
});
