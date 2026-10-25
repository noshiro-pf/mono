import {
  calculateInvestmentAccount,
  toMonthlyRate,
} from './calculate-investment-account.mjs';

describe(calculateInvestmentAccount, () => {
  test('取崩額を利益と元金に分け、課税後の受取額を求めること', () => {
    const [first, second] = calculateInvestmentAccount(
      {
        input: {
          initialValue: 1000,
          initialPrincipal: 500,
          initialUsedQuota: 500,
          regularContributions: [],
          oneOffContributions: [],
          regularWithdrawals: [{ id: 1, start: '2026-01', amount: 100 }],
          oneOffWithdrawals: [],
        },
        monthlyYieldAt: () => 0,
        extraContributionAt: () => 0,
        taxRate: 0.2,
      },
      [2026 * 12, 2026 * 12 + 1],
    );

    assert.deepStrictEqual(first, {
      month: 2026 * 12,
      contribution: 0,
      withdrawal: 100,
      value: 900,
      principal: 450,
      profitRatio: 0.5,
      profitInWithdrawal: 50,
      principalInWithdrawal: 50,
      received: 90,
      usedQuota: 450,
    });

    assert.strictEqual(second?.value, 800);
  });

  test('投資額を足してから利回りで増やすこと', () => {
    const rows = calculateInvestmentAccount(
      {
        input: {
          initialValue: 0,
          initialPrincipal: 0,
          initialUsedQuota: 0,
          regularContributions: [
            { id: 2, start: '2026-03', amount: 0 },
            { id: 1, start: '2026-01', amount: 100 },
          ],
          oneOffContributions: [
            { id: 1, name: '', month: '2026-02', amount: 1000 },
          ],
          regularWithdrawals: [],
          oneOffWithdrawals: [],
        },
        monthlyYieldAt: () => 0.01,
        extraContributionAt: (m) => (m === 2026 * 12 + 3 ? 5 : 0),
        taxRate: 0,
      },
      [2026 * 12, 2026 * 12 + 1, 2026 * 12 + 2, 2026 * 12 + 3],
    );

    assert.deepStrictEqual(
      rows.map((r) => r.contribution),
      [100, 1100, 0, 5],
    );

    assert.closeTo(rows[1]?.value ?? 0, (100 * 1.01 + 1100) * 1.01, 1e-9);

    assert.strictEqual(rows[3]?.principal, 1205);
  });
});

describe(toMonthlyRate, () => {
  test('12 か月で年率になること', () => {
    assert.closeTo((1 + toMonthlyRate(0.04)) ** 12, 1.04, 1e-12);
  });
});
