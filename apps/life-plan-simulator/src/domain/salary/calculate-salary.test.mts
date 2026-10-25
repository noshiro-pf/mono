import { parseYearMonthOr } from '../year-month/index.mjs';
import { calculateSalary, resolveSalaryHistory } from './calculate-salary.mjs';

const ym = (s: string): number => parseYearMonthOr(s, 0);

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

    assert.strictEqual(january.bonusHealthInsurance, 29_441);

    assert.strictEqual(january.bonusWelfarePension, 53_985);

    assert.closeTo(january.bonusEmploymentInsurance, 3300, 1e-9);

    assert.closeTo(
      january.bonusIncomeTax,
      (600_000 - 29_441 - 53_985 - 3300) * 0.040_84,
      1e-6,
    );
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
