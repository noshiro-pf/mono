import {
  housingConditions,
  housingLoanDeductionChildRearingBonus,
  housingLoanDeductionRate,
  housingTypes,
} from '../../data/index.mjs';
import type { SimulationInput } from '../input/index.mjs';
import { monthOf, type MonthIndex } from '../year-month/index.mjs';
import type { MonthlyPaymentResult } from './types.mjs';

/**
 * 住宅ローン控除を毎年 1 月に受け取るものとして求める（`住宅ローン` シートの
 * J 列）。控除額は 前年末の残高（借入限度額まで）× 控除率で、控除期間の回数
 * まで。
 * @param schedule `calculateHousingLoan` の結果
 * @param start 返済開始月
 */
export const calculateHousingLoanDeduction = (
  schedule: readonly MonthlyPaymentResult[],
  start: MonthIndex,
  conditions: HousingLoanDeductionConditions,
): readonly HousingLoanDeduction[] => {
  const mut_result: HousingLoanDeduction[] = [];

  for (const [i, payment] of schedule.entries()) {
    if (mut_result.length >= conditions.years) {
      break;
    }

    const month = start + i + 1;

    if (monthOf(month) === 1) {
      mut_result.push({
        month,
        amount:
          Math.min(conditions.limit, payment.remainingBalance) *
          housingLoanDeductionRate,
      });
    }
  }

  return mut_result;
};

/** 住宅の種別などから借入限度額と控除期間を求める。 */
export const housingLoanDeductionConditions = (
  loan: SimulationInput['housingLoan'],
): HousingLoanDeductionConditions => {
  const baseLimit =
    housingTypes.find((h) => h.id === loan.houseType)?.limit ?? 0;

  return {
    limit:
      baseLimit === 0
        ? 0
        : baseLimit +
          (loan.childRearing ? housingLoanDeductionChildRearingBonus : 0),
    years:
      housingConditions.find((c) => c.id === loan.houseCondition)
        ?.deductionYears ?? 0,
  };
};

/** 5 年ごとの金利の上昇率を、毎月足していく上昇幅にする（スプレッドシートの式）。 */
export const monthlyRateIncreaseFrom5Years = (
  rateIncreasePer5Years: number,
): number => (1 + rateIncreasePer5Years) ** (1 / 60) - 1;

export type HousingLoanDeductionConditions = Readonly<{
  /** 借入限度額（円） */
  limit: number;
  /** 控除期間（年） */
  years: number;
}>;

export type HousingLoanDeduction = Readonly<{
  month: MonthIndex;
  /** 控除額（円） */
  amount: number;
}>;
