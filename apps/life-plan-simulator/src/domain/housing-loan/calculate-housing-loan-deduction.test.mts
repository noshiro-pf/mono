import { parseYearMonthOr } from '../year-month/index.mjs';
import {
  calculateHousingLoanDeduction,
  housingLoanDeductionConditions,
  monthlyRateIncreaseFrom5Years,
} from './calculate-housing-loan-deduction.mjs';

const ym = (s: string): number => parseYearMonthOr(s, 0);

describe(calculateHousingLoanDeduction, () => {
  const schedule = Array.from({ length: 36 }, (_, i) => ({
    month: i + 1,
    appliedAnnualRate: 0.01,
    paymentAmount: 100_000,
    remainingBalance: 40_000_000 - i * 1_000_000,
  }));

  test('毎年 1 月に前年末の残高 × 0.7% を控除期間の回数まで受け取ること', () => {
    const deductions = calculateHousingLoanDeduction(schedule, ym('2027-05'), {
      limit: 35_000_000,
      years: 2,
    });

    assert.deepStrictEqual(deductions, [
      // 2027-12（8 回目）の返済後の残高 33,000,000 円
      { month: ym('2028-01'), amount: 33_000_000 * 0.007 },
      { month: ym('2029-01'), amount: 21_000_000 * 0.007 },
    ]);
  });

  test('借入限度額で頭打ちになること', () => {
    const [first] = calculateHousingLoanDeduction(schedule, ym('2027-05'), {
      limit: 30_000_000,
      years: 13,
    });

    assert.deepStrictEqual(first, {
      month: ym('2028-01'),
      amount: 30_000_000 * 0.007,
    });
  });
});

describe(housingLoanDeductionConditions, () => {
  test('住宅の種別と子育て世帯かで借入限度額が決まること', () => {
    assert.deepStrictEqual(
      housingLoanDeductionConditions({
        principal: 0,
        termYears: 35,
        start: '2030-01',
        initialRate: 0,
        rateIncreasePer5Years: 0,
        maxRate: 0,
        houseType: 'zeh',
        houseCondition: 'used',
        childRearing: true,
      }),
      { limit: 40_000_000, years: 10 },
    );
  });
});

describe(monthlyRateIncreaseFrom5Years, () => {
  test('60 か月で 5 年分の上昇率になること', () => {
    assert.closeTo((1 + monthlyRateIncreaseFrom5Years(0.1)) ** 60, 1.1, 1e-12);
  });

  test('上昇率 0 なら 0 であること', () => {
    assert.strictEqual(monthlyRateIncreaseFrom5Years(0), 0);
  });

  // `1 + rate` を経由すると、1e-16 前後の上昇率は丸めで 0 や大きくずれた値になる。
  test.each([1e-17, 1.7e-16, 4e-16])(
    'ごく小さい上昇率 %s でも 60 で割った値になること',
    (rate) => {
      assert.closeTo(
        monthlyRateIncreaseFrom5Years(rate) * 60,
        rate,
        rate * 1e-9,
      );
    },
  );
});
