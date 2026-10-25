import {
  employmentInsuranceRate,
  kyoukaiKenpoInsurancePremiumTable,
  welfarePensionMaxStandardRemuneration,
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

/** 雇用保険料（労働者負担）。 */
export const employmentInsurancePremium = (wage: number): number =>
  Math.max(0, wage) * employmentInsuranceRate;

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
