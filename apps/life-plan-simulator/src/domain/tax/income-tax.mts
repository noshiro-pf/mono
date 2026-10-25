import {
  bonusWithholdingRateTable,
  incomeTaxBrackets,
  withholdingTaxMonthlyAbove740k,
  withholdingTaxMonthlyTable,
  withholdingTaxMonthlyTableUpperBound,
} from '../../data/index.mjs';

/**
 * 給与の源泉徴収税額（月額表の甲欄、扶養親族等 0 人）。
 * @param amount その月の社会保険料等控除後の給与等の金額（円）
 */
export const monthlyWithholdingTax = (amount: number): number => {
  if (amount >= withholdingTaxMonthlyTableUpperBound) {
    let mut_above = 0;

    for (const { from, base, rate } of withholdingTaxMonthlyAbove740k) {
      if (amount < from) {
        break;
      }

      mut_above = base + (amount - from) * rate;
    }

    return Math.floor(mut_above);
  }

  let mut_tax = 0;

  for (const [from, tax] of withholdingTaxMonthlyTable) {
    if (amount < from) {
      break;
    }

    mut_tax = tax;
  }

  return mut_tax;
};

/**
 * 賞与の源泉徴収税額の算出率（0〜1、甲欄、扶養親族等 0 人）。
 * @param previousMonthAmount 前月の社会保険料等控除後の給与等の金額（円）
 */
export const bonusWithholdingRate = (previousMonthAmount: number): number => {
  const thousandYen = previousMonthAmount / 1000;

  let mut_ratePercent = 0;

  for (const [from, ratePercent] of bonusWithholdingRateTable) {
    if (thousandYen < from) {
      break;
    }

    mut_ratePercent = ratePercent;
  }

  return mut_ratePercent / 100;
};

/** 課税所得（円）に対する所得税額（速算表、復興特別所得税は含めない）。 */
export const progressiveIncomeTax = (taxableIncome: number): number => {
  if (taxableIncome <= 0) {
    return 0;
  }

  const bracket =
    incomeTaxBrackets.find((b) => taxableIncome <= b.upTo) ??
    incomeTaxBrackets.at(-1);

  return bracket === undefined
    ? 0
    : Math.max(0, taxableIncome * bracket.rate - bracket.deduction);
};
