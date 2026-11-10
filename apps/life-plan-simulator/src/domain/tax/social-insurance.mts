import {
  employmentInsuranceRate,
  healthInsuranceMaxStandardBonusPerYear,
  healthInsuranceRate,
  kyoukaiKenpoInsurancePremiumTable,
  welfarePensionMaxStandardBonus,
  welfarePensionMaxStandardRemuneration,
  welfarePensionRate,
  type KyoukaiKenpoInsurancePremiumTableEntry,
} from '../../data/index.mjs';

/**
 * 報酬（月額、円）が当てはまる等級の健康保険料の折半額（介護保険第 2 号
 * 被保険者に該当しない場合）。0 以下なら 0。
 */
export const healthInsurancePremium = (remuneration: number): number =>
  remuneration <= 0
    ? 0
    : (findGrade(remuneration)?.healthInsuranceNoLongTermCare.half ?? 0);

/**
 * 報酬（月額、円）が当てはまる等級の厚生年金保険料の折半額。0 以下なら 0。
 * 厚生年金の等級が無い低い報酬は厚生年金の最低等級として、上限を超える報酬は
 * 上限の等級として扱う（保険料額表には上限より上の等級にも額が載っている）。
 */
export const welfarePensionPremium = (remuneration: number): number =>
  remuneration <= 0
    ? 0
    : (findGrade(Math.min(remuneration, welfarePensionMaxStandardRemuneration))
        ?.welfarePension.half ?? lowestWelfarePension);

/**
 * 賞与（円）にかかる健康保険料の折半額。標準賞与額（1,000 円未満切り捨て）に
 * 料率を掛ける（標準報酬月額の等級は使わない）。標準賞与額は年度の累計で
 * 上限があり、賞与は年 1 回なので 1 回の賞与をその上限で頭打ちにする。
 */
export const bonusHealthInsurancePremium = (bonus: number): number =>
  bonusPremiumHalf(
    bonus,
    healthInsuranceMaxStandardBonusPerYear,
    healthInsuranceRate,
  );

/**
 * 賞与（円）にかかる厚生年金保険料の折半額。標準賞与額（1,000 円未満切り
 * 捨て、1 回 150 万円が上限）に料率を掛ける。
 */
export const bonusWelfarePensionPremium = (bonus: number): number =>
  bonusPremiumHalf(bonus, welfarePensionMaxStandardBonus, welfarePensionRate);

/**
 * 厚生年金保険の標準賞与額（円）: 賞与の 1,000 円未満を切り捨て、1 回 150 万円を
 * 上限にした額。保険料と老齢厚生年金の報酬比例部分は、どちらもこれを使う。
 */
export const welfarePensionStandardBonus = (bonus: number): number =>
  standardBonus(bonus, welfarePensionMaxStandardBonus);

/** 雇用保険料（労働者負担）。 */
export const employmentInsurancePremium = (wage: number): number =>
  Math.max(0, wage) * employmentInsuranceRate;

/** 賞与の 1,000 円未満を切り捨て、`cap` を上限にした標準賞与額。0 以下なら 0。 */
const standardBonus = (bonus: number, cap: number): number =>
  Math.min(Math.max(0, Math.floor(bonus / 1000) * 1000), cap);

/**
 * 標準賞与額（賞与の 1,000 円未満を切り捨てた額、`cap` が上限）に `rate` を
 * 掛けた保険料の折半額。0 以下の賞与なら 0。
 */
const bonusPremiumHalf = (bonus: number, cap: number, rate: number): number =>
  (standardBonus(bonus, cap) * rate) / 2;

const findGrade = (
  remuneration: number,
): KyoukaiKenpoInsurancePremiumTableEntry | undefined => {
  let mut_found: KyoukaiKenpoInsurancePremiumTableEntry | undefined = undefined;

  for (const entry of kyoukaiKenpoInsurancePremiumTable) {
    if ((entry.remunerationRangeFrom ?? 0) > remuneration) {
      break;
    }

    mut_found = entry;
  }

  return mut_found;
};

const lowestWelfarePension: number =
  kyoukaiKenpoInsurancePremiumTable.find((e) => e.welfarePension.half !== null)
    ?.welfarePension.half ?? 0;
