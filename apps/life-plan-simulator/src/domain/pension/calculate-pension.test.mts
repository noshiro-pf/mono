import { resolveSalaryHistory } from '../salary/index.mjs';
import { parseYearMonthOr } from '../year-month/index.mjs';
import { annualNetPensionFor, calculatePension } from './calculate-pension.mjs';

describe(calculatePension, () => {
  const birth = parseYearMonthOr('1990-04', 0);

  const pension = calculatePension({
    birth,
    salaryHistory: resolveSalaryHistory(
      [
        {
          id: 1,
          start: '2012-04',
          annualBase: 5_000_000,
          companyDcMonthly: 0,
          idecoMonthly: 0,
          annualBonus: 0,
        },
      ],
      0,
    ),
    retirementAge: 60,
    basicPensionMonths: 480,
    yieldRetired: 0,
  });

  test('22 歳から退職年齢までの平均年収で報酬比例部分を求めること', () => {
    assert.strictEqual(pension.enrolledYears, 39);

    assert.strictEqual(pension.averageAnnualIncome, 5_000_000);

    assert.closeTo(pension.welfarePension, 5_000_000 * 0.005_481 * 39, 1e-6);

    assert.strictEqual(pension.basicPension, 816_000);
  });

  test('65 歳受給の手取りを求めること', () => {
    const row = pension.byStartAge.find((r) => r.startAge === 65);

    assert.isDefined(row);

    const gross = 5_000_000 * 0.005_481 * 39 + 816_000;

    assert.closeTo(row.gross, gross, 1e-6);

    assert.strictEqual(row.deduction, 1_100_000);

    const income = gross - 1_100_000 - gross * 0.1;

    assert.closeTo(row.incomeTax, (income - 480_000) * 0.05, 1e-6);

    assert.closeTo(row.residentTax, (income - 430_000) * 0.1 + 5000, 1e-6);

    assert.closeTo(annualNetPensionFor(pension, 65), row.net, 1e-9);
  });

  test('繰上げは 1 か月 0.4% 減、繰下げは 0.7% 増であること', () => {
    const at60 = pension.byStartAge.find((r) => r.startAge === 60);

    const at75 = pension.byStartAge.find((r) => r.startAge === 75);

    assert.closeTo(at60?.gross ?? 0, pension.annualAt65 * 0.76, 1e-6);

    assert.closeTo(at75?.gross ?? 0, pension.annualAt65 * 1.84, 1e-6);
  });

  test('早く受け取るほど若い年齢まで得であること', () => {
    const lastAges = pension.byStartAge.map((r) => r.lastAgeBest);

    assert.strictEqual(lastAges.at(-1), 100);

    const defined = lastAges.filter((a) => a !== undefined);

    assert.deepStrictEqual(
      defined,
      defined.toSorted((a, b) => a - b),
    );
  });
});
