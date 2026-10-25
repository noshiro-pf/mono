import {
  bonusWithholdingRate,
  monthlyWithholdingTax,
  progressiveIncomeTax,
} from './income-tax.mjs';
import { publicPensionDeduction } from './public-pension-deduction.mjs';
import {
  employmentInsurancePremium,
  healthInsurancePremium,
  welfarePensionPremium,
} from './social-insurance.mjs';

describe(monthlyWithholdingTax, () => {
  test('月額表の行の税額を返すこと', () => {
    assert.strictEqual(monthlyWithholdingTax(87_999), 0);

    assert.strictEqual(monthlyWithholdingTax(88_000), 130);

    assert.strictEqual(monthlyWithholdingTax(255_930), 6750);

    assert.strictEqual(monthlyWithholdingTax(739_999), 73_080);
  });

  test('740,000 円以上は表の下の式で求めること', () => {
    assert.strictEqual(monthlyWithholdingTax(740_000), 73_390);

    // 780,000 円の場合の税額に 780,000 円を超える金額の 23.483% を加算する
    assert.strictEqual(monthlyWithholdingTax(800_000), 86_256);
  });
});

describe(bonusWithholdingRate, () => {
  test('前月の給与の額から率を引くこと', () => {
    assert.strictEqual(bonusWithholdingRate(81_999), 0);

    assert.closeTo(bonusWithholdingRate(82_000), 0.020_42, 1e-12);

    assert.closeTo(bonusWithholdingRate(255_930), 0.040_84, 1e-12);

    assert.closeTo(bonusWithholdingRate(4_000_000), 0.459_45, 1e-12);
  });
});

describe(progressiveIncomeTax, () => {
  test('速算表で求めること', () => {
    assert.strictEqual(progressiveIncomeTax(-1), 0);

    assert.closeTo(progressiveIncomeTax(1_000_000), 50_000, 1e-6);

    assert.closeTo(progressiveIncomeTax(5_000_000), 572_500, 1e-6);

    assert.closeTo(progressiveIncomeTax(50_000_000), 17_704_000, 1e-6);
  });
});

describe(publicPensionDeduction, () => {
  test('65 歳未満と 65 歳以上で最低額が違うこと', () => {
    assert.strictEqual(publicPensionDeduction(500_000, false), 500_000);

    assert.strictEqual(publicPensionDeduction(1_000_000, false), 600_000);

    assert.strictEqual(publicPensionDeduction(1_000_000, true), 1_000_000);

    assert.strictEqual(publicPensionDeduction(2_000_000, true), 1_100_000);

    assert.strictEqual(publicPensionDeduction(4_000_000, true), 1_275_000);
  });
});

describe('social insurance', () => {
  test('報酬月額が当てはまる等級の折半額を返すこと', () => {
    assert.strictEqual(healthInsurancePremium(300_000), 14_970);

    assert.strictEqual(welfarePensionPremium(300_000), 27_450);
  });

  test('厚生年金は標準報酬月額の上限で頭打ちになること', () => {
    assert.strictEqual(welfarePensionPremium(1_000_000), 59_475);
  });

  test('0 以下の報酬は 0 を返すこと', () => {
    assert.strictEqual(healthInsurancePremium(0), 0);

    assert.strictEqual(welfarePensionPremium(0), 0);

    assert.strictEqual(employmentInsurancePremium(-1), 0);
  });

  test('雇用保険料は 0.55% であること', () => {
    assert.closeTo(employmentInsurancePremium(300_000), 1650, 1e-9);
  });
});
