import {
  healthInsuranceRate,
  kyoukaiKenpoInsurancePremiumTable,
  welfarePensionRate,
} from '../../data/index.mjs';
import {
  bonusWithholdingRate,
  monthlyWithholdingTax,
  progressiveIncomeTax,
} from './income-tax.mjs';
import { publicPensionDeduction } from './public-pension-deduction.mjs';
import {
  bonusHealthInsurancePremium,
  bonusWelfarePensionPremium,
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

describe('bonus social insurance', () => {
  test('標準賞与額（1,000 円未満切り捨て）に保険料率の半分を掛けること', () => {
    // 600,000 × 9.98% / 2, 600,000 × 18.3% / 2
    assert.closeTo(bonusHealthInsurancePremium(600_999), 29_940, 1e-6);

    assert.closeTo(bonusWelfarePensionPremium(600_999), 54_900, 1e-6);
  });

  test('標準報酬月額の上限より大きい賞与も等級に丸めないこと', () => {
    assert.closeTo(bonusHealthInsurancePremium(1_500_000), 74_850, 1e-6);

    assert.closeTo(bonusWelfarePensionPremium(1_500_000), 137_250, 1e-6);
  });

  test('厚生年金は 1 回 150 万円、健康保険は年 573 万円で頭打ちになること', () => {
    assert.closeTo(bonusWelfarePensionPremium(2_000_000), 137_250, 1e-6);

    assert.closeTo(bonusHealthInsurancePremium(2_000_000), 99_800, 1e-6);

    // 5,730,000 × 9.98% / 2
    assert.closeTo(bonusHealthInsurancePremium(6_000_000), 285_927, 1e-6);
  });

  test('0 以下の賞与は 0 を返すこと', () => {
    assert.strictEqual(bonusHealthInsurancePremium(0), 0);

    assert.strictEqual(bonusWelfarePensionPremium(-1), 0);
  });

  test('保険料率の半分が保険料額表の折半額と食い違わないこと', () => {
    for (const entry of kyoukaiKenpoInsurancePremiumTable) {
      // 月額の保険料は折半額 `half` を引くので、賞与の `rate / 2` と同じ
      // 丸め方であることも確かめる。
      assert.closeTo(
        entry.healthInsuranceNoLongTermCare.half,
        (entry.standardMonthlyRemuneration * healthInsuranceRate) / 2,
        1e-6,
      );

      if (entry.welfarePension.half !== null) {
        assert.closeTo(
          entry.welfarePension.half,
          (entry.standardMonthlyRemuneration * welfarePensionRate) / 2,
          1e-6,
        );
      }
    }
  });
});
