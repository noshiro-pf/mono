/**
 * 制度で決まっている率や額。スプレッドシートでセルに直接書かれていた定数を
 * ここにまとめている。制度が改定されたらここを直す。
 */

/** 雇用保険料率（労働者負担、一般の事業）。 */
export const employmentInsuranceRate = 0.0055;

/** 厚生年金保険の標準報酬月額の上限（円）。 */
export const welfarePensionMaxStandardRemuneration = 650_000;

/** 所得税の基礎控除額（円）。 */
export const incomeTaxBasicDeduction = 480_000;

/** 住民税の基礎控除額（円）。 */
export const residentTaxBasicDeduction = 430_000;

/** 住民税の所得割の税率。 */
export const residentTaxRate = 0.1;

/** 住民税の均等割（円）。 */
export const residentTaxPerCapita = 5000;

/**
 * 所得税の速算表。課税所得が `upTo` 以下の段の `rate` を掛けて `deduction` を
 * 引く。最後の段は上限なし。
 */
export const incomeTaxBrackets: readonly Readonly<{
  upTo: number;
  rate: number;
  deduction: number;
}>[] = [
  { upTo: 1_949_000, rate: 0.05, deduction: 0 },
  { upTo: 3_299_000, rate: 0.1, deduction: 97_500 },
  { upTo: 6_949_000, rate: 0.2, deduction: 427_500 },
  { upTo: 8_999_000, rate: 0.23, deduction: 636_000 },
  { upTo: 17_999_000, rate: 0.33, deduction: 1_536_000 },
  { upTo: 39_999_000, rate: 0.4, deduction: 2_796_000 },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.45, deduction: 4_796_000 },
] as const;

/** 上場株式等の譲渡益にかかる税率（所得税・復興特別所得税・住民税）。 */
export const capitalGainsTaxRate = 0.203_15;

/** NISA の生涯投資枠（円）。 */
export const nisaLifetimeLimit = 18_000_000;

/** 老齢基礎年金の満額（円 / 年）。 */
export const basicPensionFullAmount = 816_000;

/** 老齢基礎年金の満額に必要な加入月数。 */
export const basicPensionFullMonths = 480;

/** 老齢厚生年金（報酬比例部分）の乗率。 */
export const welfarePensionCoefficient = 0.005_481;

/** 老齢厚生年金の計算に入れる年収の上限（円）。標準報酬月額の上限に近い値。 */
export const welfarePensionAnnualIncomeCap = 7_800_000;

/** 老齢厚生年金の加入年数を数え始める年齢。 */
export const welfarePensionCountFromAge = 22;

/** 年金の繰上げ受給で 1 か月あたり減る割合。 */
export const pensionEarlyReductionPerMonth = 0.004;

/** 年金の繰下げ受給で 1 か月あたり増える割合。 */
export const pensionDeferralIncreasePerMonth = 0.007;

/** 年金の受給を始められる年齢の範囲。 */
export const pensionStartAgeMin = 60;

export const pensionStartAgeMax = 75;

/** 年金の損益分岐を調べる年齢の上限。 */
export const pensionBreakEvenMaxAge = 100;

/** 年金の社会保険料（概算）の、受給額に対する割合。 */
export const pensionSocialInsuranceRate = 0.1;

/** 住宅ローン控除の控除率。 */
export const housingLoanDeductionRate = 0.007;

/**
 * 住宅の種別ごとの住宅ローン控除の借入限度額（円）。
 * `id` は保存する入力値に使うので変えない。
 */
export const housingTypes = [
  { id: 'long-life', label: '長期優良住宅・低炭素住宅', limit: 45_000_000 },
  { id: 'zeh', label: 'ZEH 水準省エネ住宅', limit: 35_000_000 },
  { id: 'energy-efficient', label: '省エネ基準適合住宅', limit: 30_000_000 },
  { id: 'other', label: 'その他の住宅', limit: 0 },
] as const;

/** 子育て世帯・若者夫婦世帯の借入限度額の上乗せ（円）。 */
export const housingLoanDeductionChildRearingBonus = 5_000_000;

/** 新築 / 中古ごとの住宅ローン控除の控除期間（年）。 */
export const housingConditions = [
  { id: 'new', label: '新築', deductionYears: 13 },
  { id: 'used', label: '中古', deductionYears: 10 },
] as const;

/** 退職所得控除: 勤続 20 年までは 1 年あたり 40 万円、超えた分は 70 万円。 */
export const retirementIncomeDeduction = {
  perYearUpTo20: 400_000,
  perYearOver20: 700_000,
  minimum: 800_000,
} as const;

/** 確定拠出年金に拠出できる年齢の上限（この年齢になった月から拠出しない）。 */
export const definedContributionMaxAge = 60;
