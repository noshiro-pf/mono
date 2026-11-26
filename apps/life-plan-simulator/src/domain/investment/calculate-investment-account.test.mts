import { Arr, asUint32 } from 'ts-data-forge';
import {
  calculateInvestmentAccount,
  toMonthlyRate,
  type InvestmentAccountMonth,
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
      // 売った元金の枠が戻るのは翌年から。
      usedQuota: 500,
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

describe('生涯投資枠の利用額', () => {
  const months = Arr.range(asUint32(2026 * 12), asUint32(2027 * 12 + 2));

  const rows = calculateInvestmentAccount(
    {
      input: {
        initialValue: 17_000_000,
        initialPrincipal: 17_000_000,
        initialUsedQuota: 17_000_000,
        regularContributions: [],
        oneOffContributions: [
          { id: 1, name: '', month: '2026-07', amount: 3_000_000 },
        ],
        regularWithdrawals: [],
        oneOffWithdrawals: [
          { id: 1, name: '', month: '2026-06', amount: 5_000_000 },
          { id: 2, name: '', month: '2026-12', amount: 1_000_000 },
        ],
      },
      monthlyYieldAt: () => 0.005,
      extraContributionAt: () => 0,
      taxRate: 0,
    },
    months,
  );

  const at = (yearMonth: number): InvestmentAccountMonth | undefined =>
    rows.find((r) => r.month === yearMonth);

  const soldIn2026 =
    (at(2026 * 12 + 5)?.principalInWithdrawal ?? 0) +
    (at(2026 * 12 + 11)?.principalInWithdrawal ?? 0);

  test('売った年のうちは売った元金の分を戻さないこと', () => {
    assert.strictEqual(at(2026 * 12 + 5)?.usedQuota, 17_000_000);

    assert.strictEqual(at(2026 * 12 + 6)?.usedQuota, 20_000_000);

    assert.strictEqual(at(2026 * 12 + 11)?.usedQuota, 20_000_000);
  });

  test('その年に売った元金の分を翌年の 1 月に戻すこと', () => {
    assert.isAbove(soldIn2026, 0);

    assert.closeTo(
      at(2027 * 12)?.usedQuota ?? 0,
      20_000_000 - soldIn2026,
      1e-6,
    );

    assert.closeTo(
      at(2027 * 12 + 1)?.usedQuota ?? 0,
      20_000_000 - soldIn2026,
      1e-6,
    );
  });
});

describe(toMonthlyRate, () => {
  test('12 か月で年率になること', () => {
    assert.closeTo((1 + toMonthlyRate(0.04)) ** 12, 1.04, 1e-12);
  });

  // `1 + rate` を経由すると、1e-16 前後の利回りは丸めで 0 や 2 割以上ずれた値になる。
  test.each([1e-17, 1.7e-16, 4e-16])(
    'ごく小さい年率 %s でも 12 で割った値になること',
    (rate) => {
      assert.closeTo(toMonthlyRate(rate) * 12, rate, rate * 1e-9);
    },
  );

  test('年率 0 なら 0 であること', () => {
    assert.strictEqual(toMonthlyRate(0), 0);
  });
});
