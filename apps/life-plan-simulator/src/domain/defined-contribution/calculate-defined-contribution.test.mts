import { resolveSalaryHistory } from '../salary/index.mjs';
import { parseYearMonthOr } from '../year-month/index.mjs';
import {
  calculateDefinedContribution,
  lumpSumTax,
} from './calculate-defined-contribution.mjs';

const ym = (s: string): number => parseYearMonthOr(s, 0);

describe(lumpSumTax, () => {
  test('退職所得控除を引いた 1/2 に課税すること', () => {
    assert.deepStrictEqual(lumpSumTax(30_000_000, 30), {
      gross: 30_000_000,
      years: 30,
      deduction: 15_000_000,
      taxable: 7_500_000,
      tax: 7_500_000 * 0.23 - 636_000 + 750_000,
      afterTax: 30_000_000 - (7_500_000 * 0.23 - 636_000 + 750_000),
    });
  });

  test('控除額は 80 万円を下回らないこと', () => {
    assert.strictEqual(lumpSumTax(1_000_000, 1).deduction, 800_000);
  });
});

describe(calculateDefinedContribution, () => {
  const birth = ym('1966-01');

  const months = [ym('2025-12'), ym('2026-01'), ym('2026-02')] as const;

  const result = calculateDefinedContribution(
    {
      birth,
      salaryHistory: resolveSalaryHistory(
        [
          {
            id: 1,
            start: '2020-01',
            annualBase: 6_000_000,
            companyDcMonthly: 10_000,
            idecoMonthly: 5000,
            annualBonus: 0,
          },
        ],
        0,
      ),
      retirementAge: 65,
      lumpSumAge: 60,
      joinedAt: ym('2006-01'),
      initialValue: 1_000_000,
      monthlyYield: 0,
      installmentAge60To64: 600_000,
      installmentAge65To68: 1_100_000,
    },
    months,
  );

  test('60 歳になる月まで掛金を積み、その月に一括で受け取ること', () => {
    assert.deepStrictEqual(
      result.months.map((m) => m.contribution),
      [15_000, 0, 0],
    );

    assert.strictEqual(result.lumpSumMonth, ym('2026-01'));

    assert.strictEqual(result.lumpSum.gross, 1_015_000);

    assert.strictEqual(result.lumpSum.years, 20);

    // 控除 800 万円を下回るので税金はかからない
    assert.strictEqual(result.lumpSum.afterTax, 1_015_000);

    assert.deepStrictEqual(
      result.months.map((m) => m.value),
      [1_015_000, 0, 0],
    );

    assert.deepStrictEqual(
      result.months.map((m) => m.received),
      [0, 1_015_000, 0],
    );
  });
});
