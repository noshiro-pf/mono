import { calculateHousingLoan } from './calculate-housing-loan.mjs';

describe(calculateHousingLoan, () => {
  test('スプレッドシートのデータと一致すること', () => {
    const params = {
      principalAmount: 75_000_000,
      loanTermYears: 40,
      initialAnnualRate: 0.007,
      rateIncreaseEvery5Years: 0.005,
      monthlyRateIncrease: 0.00008333333333,
      maxAnnualRate: 0.03,
    };

    const result = calculateHousingLoan(params);

    expect(result).toHaveLength(480);

    // 1ヶ月目の検証
    expect(result[0]?.month).toBe(1);

    expect(result[0]?.appliedAnnualRate).toBeCloseTo(0.007, 10);

    expect(result[0]?.paymentAmount).toBeCloseTo(179189.774, 2);

    expect(result[0]?.remainingBalance).toBeCloseTo(74864560.23, 2);

    // 2ヶ月目の検証
    expect(result[1]?.month).toBe(2);

    expect(result[1]?.appliedAnnualRate).toBeCloseTo(0.007083333333333334, 10);

    expect(result[1]?.paymentAmount).toBeCloseTo(179474.5435, 2);

    expect(result[1]?.remainingBalance).toBeCloseTo(74729276.57, 2);

    // 3ヶ月目の検証
    expect(result[2]?.month).toBe(3);

    expect(result[2]?.appliedAnnualRate).toBeCloseTo(0.007166666666666667, 10);

    expect(result[2]?.paymentAmount).toBeCloseTo(179759.0339, 2);

    expect(result[2]?.remainingBalance).toBeCloseTo(74594147.52, 2);

    // 最終月（480ヶ月目）の検証 - 残高がほぼ0になること
    const lastMonth = result[479];

    expect(lastMonth?.month).toBe(480);

    expect(lastMonth?.remainingBalance).toBeCloseTo(0, 0);
  });

  test('金利が最大値を超えないこと', () => {
    const params = {
      principalAmount: 10_000_000,
      loanTermYears: 10,
      initialAnnualRate: 0.025,
      rateIncreaseEvery5Years: 0.01,
      monthlyRateIncrease: 0.001,
      maxAnnualRate: 0.03,
    };

    const result = calculateHousingLoan(params);

    for (const payment of result) {
      expect(payment.appliedAnnualRate).toBeLessThanOrEqual(0.03);
    }
  });

  test('金利0の場合は均等割になること', () => {
    const params = {
      principalAmount: 1_200_000,
      loanTermYears: 10,
      initialAnnualRate: 0,
      rateIncreaseEvery5Years: 0,
      monthlyRateIncrease: 0,
      maxAnnualRate: 0,
    };

    const result = calculateHousingLoan(params);

    expect(result).toHaveLength(120);

    expect(result[0]?.paymentAmount).toBeCloseTo(10000, 2);

    expect(result[0]?.remainingBalance).toBeCloseTo(1190000, 2);
  });

  test('返済が進むにつれて残高が減少すること', () => {
    const params = {
      principalAmount: 30_000_000,
      loanTermYears: 35,
      initialAnnualRate: 0.01,
      rateIncreaseEvery5Years: 0,
      monthlyRateIncrease: 0,
      maxAnnualRate: 0.01,
    };

    const result = calculateHousingLoan(params);

    for (let mut_i = 1; mut_i < result.length; mut_i++) {
      expect(result[mut_i]?.remainingBalance).toBeLessThan(
        result[mut_i - 1]?.remainingBalance ?? 0,
      );
    }
  });
});
