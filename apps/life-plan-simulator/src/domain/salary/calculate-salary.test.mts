import type { SalaryHistoryEntry } from '../input/index.mjs';
import {
  healthInsurancePremium,
  monthlyWithholdingTax,
  welfarePensionPremium,
} from '../tax/index.mjs';
import { parseYearMonthOr } from '../year-month/index.mjs';
import { calculateSalary, resolveSalaryHistory } from './calculate-salary.mjs';

const ym = (s: string): number => parseYearMonthOr(s, 0);

type SalaryMonthOf = ReturnType<typeof calculateSalary>[number] | undefined;

describe(calculateSalary, () => {
  const history = resolveSalaryHistory(
    [
      {
        id: 1,
        start: '2025-01',
        annualBase: 3_600_000,
        companyDcMonthly: 0,
        idecoMonthly: 0,
        annualBonus: 600_000,
      },
    ],
    0,
  );

  const [september, january] = calculateSalary(
    { history, retirementMonth: ym('2027-10') },
    [ym('2026-09'), ym('2027-01')],
  );

  test('月給から社会保険料と税金を引いた手取りを求めること', () => {
    assert.isDefined(september);

    assert.strictEqual(september.gross, 300_000);

    assert.strictEqual(september.healthInsurance, 14_970);

    assert.strictEqual(september.welfarePension, 27_450);

    assert.closeTo(september.employmentInsurance, 1650, 1e-9);

    // 300,000 - 14,970 - 27,450 - 1,650 = 255,930 円の行
    assert.strictEqual(september.incomeTax, 6750);

    // (300,000 × 0.7 - 1,500,000 / 12) × 10%
    assert.closeTo(september.residentTax, 8500, 1e-9);

    assert.closeTo(september.net, 240_680, 1e-9);

    assert.strictEqual(september.bonus, 0);
  });

  test('1 月に賞与が出て、前月の給与から算出率を引くこと', () => {
    assert.isDefined(january);

    assert.strictEqual(january.bonus, 600_000);

    // 600,000 × 9.98% / 2
    assert.closeTo(january.bonusHealthInsurance, 29_940, 1e-6);

    // 600,000 × 18.3% / 2
    assert.closeTo(january.bonusWelfarePension, 54_900, 1e-6);

    assert.closeTo(january.bonusEmploymentInsurance, 3300, 1e-9);

    assert.closeTo(
      january.bonusIncomeTax,
      (600_000 - 29_940 - 54_900 - 3300) * 0.040_84,
      1e-6,
    );
  });

  test('賞与の算出率は前月の iDeCo の掛金を引いた給与から引くこと', () => {
    // 306,000 - 14,970 - 27,450 - 1,683 = 261,897 円は 6.126% の行、
    // iDeCo の 23,000 円を引いた 238,897 円は 4.084% の行。
    const withoutIdeco = januaryWith(0);

    const withIdeco = januaryWith(23_000);

    assert.isDefined(withoutIdeco);

    assert.isDefined(withIdeco);

    const taxableBonus =
      600_000 -
      withIdeco.bonusHealthInsurance -
      withIdeco.bonusWelfarePension -
      withIdeco.bonusEmploymentInsurance;

    assert.closeTo(withoutIdeco.bonusIncomeTax, taxableBonus * 0.061_26, 1e-6);

    assert.closeTo(withIdeco.bonusIncomeTax, taxableBonus * 0.040_84, 1e-6);
  });

  test('前月の給与が無ければ、賞与の 1/12 を月額表に当てはめて 12 倍すること', () => {
    const [bonusMonth] = calculateSalary(
      {
        history: salaryFrom('2027-01', 3_600_000, 3_000_000),
        retirementMonth: ym('2030-12'),
      },
      [ym('2027-01')],
    );

    assert.isDefined(bonusMonth);

    const taxableBonus =
      3_000_000 -
      bonusMonth.bonusHealthInsurance -
      bonusMonth.bonusWelfarePension -
      bonusMonth.bonusEmploymentInsurance;

    // 算出率の表なら前月 0 円の 0% で 0 円になるところ。
    assert.isAbove(bonusMonth.bonusIncomeTax, 0);

    assert.strictEqual(
      bonusMonth.bonusIncomeTax,
      monthlyWithholdingTax(taxableBonus / 12) * 12,
    );
  });

  test('賞与が前月の給与の 10 倍を超えれば、1/12 を前月の給与に足して月額表で求めること', () => {
    const [december, bonusMonth] = calculateSalary(
      {
        history: salaryFrom('2025-01', 1_200_000, 2_000_000),
        retirementMonth: ym('2030-12'),
      },
      [ym('2026-12'), ym('2027-01')],
    );

    assert.isDefined(december);

    assert.isDefined(bonusMonth);

    const previous =
      december.grossAfterIdeco -
      december.healthInsurance -
      december.welfarePension -
      december.employmentInsurance;

    const taxableBonus =
      2_000_000 -
      bonusMonth.bonusHealthInsurance -
      bonusMonth.bonusWelfarePension -
      bonusMonth.bonusEmploymentInsurance;

    assert.isAbove(taxableBonus, previous * 10);

    assert.strictEqual(
      bonusMonth.bonusIncomeTax,
      (monthlyWithholdingTax(previous + taxableBonus / 12) -
        monthlyWithholdingTax(previous)) *
        12,
    );
  });

  test('標準報酬月額の上限より大きい賞与も標準賞与額で保険料を求めること', () => {
    const [bigBonusJanuary] = calculateSalary(
      {
        history: resolveSalaryHistory(
          [
            {
              id: 1,
              start: '2025-01',
              annualBase: 3_600_000,
              companyDcMonthly: 0,
              idecoMonthly: 0,
              annualBonus: 2_000_000,
            },
          ],
          0,
        ),
        retirementMonth: ym('2027-10'),
      },
      [ym('2027-01')],
    );

    assert.isDefined(bigBonusJanuary);

    // 2,000,000 × 9.98% / 2
    assert.closeTo(bigBonusJanuary.bonusHealthInsurance, 99_800, 1e-6);

    // 標準賞与額の上限 1,500,000 × 18.3% / 2
    assert.closeTo(bigBonusJanuary.bonusWelfarePension, 137_250, 1e-6);
  });

  test('退職する月までは保険料を引き、翌月から給与も保険料も 0 で、住民税は残ること', () => {
    const [lastMonth, nextMonth, august] = calculateSalary(
      { history, retirementMonth: ym('2027-10') },
      [ym('2027-10'), ym('2027-11'), ym('2028-08')],
    );

    assert.isDefined(lastMonth);

    assert.strictEqual(lastMonth.gross, 300_000);

    assert.strictEqual(lastMonth.healthInsurance, 14_970);

    assert.strictEqual(lastMonth.welfarePension, 27_450);

    for (const month of [nextMonth, august]) {
      assert.isDefined(month);

      assert.strictEqual(month.gross, 0);

      assert.strictEqual(month.healthInsurance, 0);

      assert.strictEqual(month.welfarePension, 0);

      assert.closeTo(month.residentTax, 8500, 1e-9);

      assert.closeTo(month.net, -8500, 1e-9);
    }
  });

  test('4 月に退職すれば、その年の 9 月の保険料は 0 であること', () => {
    // 4〜6 月の一部だけに給与が出た年でも、退職した後の 9 月は保険料を引かない。
    const [afterRegularDecision] = calculateSalary(
      { history, retirementMonth: ym('2027-04') },
      [ym('2027-09')],
    );

    assert.isDefined(afterRegularDecision);

    assert.strictEqual(afterRegularDecision.healthInsurance, 0);

    assert.strictEqual(afterRegularDecision.welfarePension, 0);
  });

  test('最初の定時決定の前は、最初に給与が出た月の月給で保険料を求めること', () => {
    const [firstMonth, august] = calculateSalary(
      { history, retirementMonth: ym('2027-10') },
      [ym('2025-01'), ym('2025-08')],
    );

    for (const month of [firstMonth, august]) {
      assert.isDefined(month);

      assert.strictEqual(month.healthInsurance, 14_970);

      assert.strictEqual(month.welfarePension, 27_450);

      assert.strictEqual(month.incomeTax, 6750);
    }
  });

  test('7 月に就職すれば、翌年の 8 月まで就職した月の月給の等級を使うこと', () => {
    const [firstSeptember, august] = calculateSalary(
      {
        history: salaryFrom('2025-07', 3_600_000, 0),
        retirementMonth: ym('2030-12'),
      },
      [ym('2025-09'), ym('2026-08')],
    );

    for (const month of [firstSeptember, august]) {
      assert.isDefined(month);

      assert.strictEqual(month.healthInsurance, 14_970);

      assert.strictEqual(month.welfarePension, 27_450);
    }
  });

  test('5 月に就職すれば、9 月からは 5・6 月の 2 か月の平均の等級を使うこと', () => {
    const [september2025] = calculateSalary(
      {
        history: resolveSalaryHistory(
          [
            salaryRow(1, '2025-05', 3_600_000),
            salaryRow(2, '2025-06', 4_320_000),
          ],
          0,
        ),
        retirementMonth: ym('2030-12'),
      },
      [ym('2025-09')],
    );

    assert.isDefined(september2025);

    // (300,000 + 360,000) / 2 = 330,000 円（3 か月で割れば 220,000 円）
    assert.strictEqual(
      september2025.healthInsurance,
      healthInsurancePremium(330_000),
    );

    assert.strictEqual(
      september2025.welfarePension,
      welfarePensionPremium(330_000),
    );
  });

  test('給与の無い期間は保険料を引かず、7 月に就職し直せばその月の月給の等級を使うこと', () => {
    const [gap, rejoined, august] = calculateSalary(
      {
        history: resolveSalaryHistory(
          [
            salaryRow(1, '2025-01', 3_600_000),
            salaryRow(2, '2026-01', 0),
            salaryRow(3, '2027-07', 6_000_000),
          ],
          0,
        ),
        retirementMonth: ym('2030-12'),
      },
      [ym('2026-03'), ym('2027-07'), ym('2028-08')],
    );

    assert.isDefined(gap);

    assert.strictEqual(gap.healthInsurance, 0);

    assert.strictEqual(gap.welfarePension, 0);

    for (const month of [rejoined, august]) {
      assert.isDefined(month);

      assert.strictEqual(
        month.healthInsurance,
        healthInsurancePremium(500_000),
      );

      assert.strictEqual(month.welfarePension, welfarePensionPremium(500_000));
    }
  });

  test('定時決定は、4〜6 月のうちいまの在職期間に入る月だけを平均すること', () => {
    const [september2025] = calculateSalary(
      {
        history: resolveSalaryHistory(
          [
            salaryRow(1, '2025-01', 3_600_000),
            salaryRow(2, '2025-05', 0),
            salaryRow(3, '2025-06', 7_200_000),
          ],
          0,
        ),
        retirementMonth: ym('2030-12'),
      },
      [ym('2025-09')],
    );

    assert.isDefined(september2025);

    // 6 月の 600,000 円だけ（前の在職期間の 4 月も入れれば 450,000 円）
    assert.strictEqual(
      september2025.healthInsurance,
      healthInsurancePremium(600_000),
    );

    assert.strictEqual(
      september2025.welfarePension,
      welfarePensionPremium(600_000),
    );
  });

  test('開始月が同じ行は、月給を引く行と同じ行から保険料を求めること', () => {
    const [firstMonth] = calculateSalary(
      {
        history: resolveSalaryHistory(
          [
            salaryRow(1, '2025-01', 3_600_000),
            salaryRow(2, '2025-01', 6_000_000),
          ],
          0,
        ),
        retirementMonth: ym('2030-12'),
      },
      [ym('2025-01')],
    );

    assert.isDefined(firstMonth);

    assert.strictEqual(firstMonth.gross, 500_000);

    assert.strictEqual(
      firstMonth.healthInsurance,
      healthInsurancePremium(500_000),
    );

    assert.strictEqual(
      firstMonth.welfarePension,
      welfarePensionPremium(500_000),
    );
  });
});

describe(resolveSalaryHistory, () => {
  test('月収（額面）は年収 / 12 - 企業型 DC の掛金であること', () => {
    const [entry] = resolveSalaryHistory(
      [
        {
          id: 1,
          start: '2026-01',
          annualBase: 6_000_000,
          companyDcMonthly: 20_000,
          idecoMonthly: 0,
          annualBonus: 1_000_000,
        },
      ],
      0,
    );

    assert.strictEqual(entry?.monthlyGross, 480_000);

    assert.strictEqual(entry?.annualIncome, 6_760_000);
  });
});

/** January 2027 of a salary of 306,000 yen a month with the given iDeCo contribution. */
const januaryWith = (idecoMonthly: number): SalaryMonthOf =>
  calculateSalary(
    {
      history: resolveSalaryHistory(
        [
          {
            id: 1,
            start: '2025-01',
            annualBase: 3_672_000,
            companyDcMonthly: 0,
            idecoMonthly,
            annualBonus: 600_000,
          },
        ],
        0,
      ),
      retirementMonth: ym('2030-12'),
    },
    [ym('2027-01')],
  )[0];

/** One row of a salary history, with no DC or iDeCo contribution. */
const salaryRow = (
  id: number,
  start: string,
  annualBase: number,
  annualBonus: number = 0,
): SalaryHistoryEntry =>
  ({
    id,
    start,
    annualBase,
    companyDcMonthly: 0,
    idecoMonthly: 0,
    annualBonus,
  }) as const;

/** A salary history of one entry, with no DC or iDeCo contribution. */
const salaryFrom = (
  start: string,
  annualBase: number,
  annualBonus: number,
): ReturnType<typeof resolveSalaryHistory> =>
  resolveSalaryHistory([salaryRow(1, start, annualBase, annualBonus)], 0);
