import { monthlyWithholdingTax } from '../tax/index.mjs';
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

  const [september, january, november] = calculateSalary(
    { history, retirementMonth: ym('2027-10') },
    [ym('2026-09'), ym('2027-01'), ym('2027-11')],
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

  test('退職した翌月から給与は 0 で、保険料と住民税は残ること', () => {
    assert.isDefined(november);

    assert.strictEqual(november.gross, 0);

    assert.strictEqual(november.healthInsurance, 14_970);

    assert.closeTo(november.residentTax, 8500, 1e-9);

    assert.isTrue(november.net < 0);
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

/** A salary history of one entry, with no DC or iDeCo contribution. */
const salaryFrom = (
  start: string,
  annualBase: number,
  annualBonus: number,
): ReturnType<typeof resolveSalaryHistory> =>
  resolveSalaryHistory(
    [
      {
        id: 1,
        start,
        annualBase,
        companyDcMonthly: 0,
        idecoMonthly: 0,
        annualBonus,
      },
    ],
    0,
  );
