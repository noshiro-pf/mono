import { Arr } from 'ts-data-forge';
import {
  calculateHousingLoanDeduction,
  housingLoanDeductionConditions,
} from '../housing-loan/index.mjs';
import { defaultSimulationInput, SimulationInput } from '../input/index.mjs';
import { formatYearMonth } from '../year-month/index.mjs';
import { simulate, type SimulationResult } from './simulate.mjs';

const d = defaultSimulationInput;

describe(simulate, () => {
  const result = simulate(defaultSimulationInput);

  test('開始月から endAge 歳の最後の月まで計算すること', () => {
    assert.strictEqual(formatYearMonth(result.rows[0]?.month ?? 0), '2026-01');

    // 1990-04 生まれが 101 歳になる前の月
    assert.strictEqual(
      formatYearMonth(result.rows.at(-1)?.month ?? 0),
      '2091-03',
    );
  });

  test('現預金は初期値に現預金の増減を足していったものであること', () => {
    const changes = result.rows.map((r) => r.cashChange);

    assert.closeTo(
      result.rows.at(-1)?.cash ?? 0,
      defaultSimulationInput.assumptions.initialCash + Arr.sum(changes),
      1e-3,
    );

    for (const row of result.rows) {
      assert.closeTo(
        row.cashChange,
        row.totalIncome -
          row.totalExpense -
          row.nisaContribution +
          row.nisaWithdrawal -
          row.taxableContribution +
          row.taxableReceived,
        1e-6,
      );
    }
  });

  test('住宅ローンは返済開始月から払い、それまでは家賃を払うこと', () => {
    const before = result.rows.find(
      (r) => formatYearMonth(r.month) === '2029-12',
    );

    const after = result.rows.find(
      (r) => formatYearMonth(r.month) === '2030-01',
    );

    assert.isTrue((before?.rent ?? 0) > 0);

    assert.strictEqual(before?.housingLoan, 0);

    assert.strictEqual(after?.rent, 0);

    assert.isTrue((after?.housingLoan ?? 0) > 0);
  });

  test('年金は受給開始年齢になった月から入ること', () => {
    const before = result.rows.find(
      (r) => formatYearMonth(r.month) === '2055-03',
    );

    const after = result.rows.find(
      (r) => formatYearMonth(r.month) === '2055-04',
    );

    assert.strictEqual(before?.pension, 0);

    assert.isTrue((after?.pension ?? 0) > 0);
  });

  test('何年かおきの支出は初回から間隔ごとに出ること', () => {
    const months = result.rows
      .filter((r) => (r.periodicItems[0] ?? 0) > 0)
      .map((r) => formatYearMonth(r.month));

    assert.deepStrictEqual(Arr.take(months, 3), [
      '2027-01',
      '2032-01',
      '2037-01',
    ]);
  });

  describe('住宅ローン控除', () => {
    test('既定のプランでは所得税が控除額より多いので頭打ちにならないこと', () => {
      const expected = calculateHousingLoanDeduction(
        result.housingLoan.schedule,
        result.housingLoan.start,
        housingLoanDeductionConditions(d.housingLoan),
      );

      assert.strictEqual(result.housingLoan.deductions.length, 13);

      assert.deepStrictEqual(result.housingLoan.deductions, expected);
    });

    describe('退職の 3 年前に始めたローン', () => {
      const r = simulate({
        ...d,
        housingLoan: { ...d.housingLoan, start: '2052-01' },
      });

      test('給与の無い年の分は控除されないこと', () => {
        for (const yearMonth of ['2057-01', '2058-01', '2065-01']) {
          assert.strictEqual(deductionAt(r, yearMonth), 0);
        }
      });

      test('収支の控除額は住宅ローンの控除額と一致すること', () => {
        for (const x of r.housingLoan.deductions) {
          const row = r.rows.find((y) => y.month === x.month);

          assert.strictEqual(row?.housingLoanDeduction, x.amount);
        }
      });
    });

    test('所得税で引ききれない分は、前年の月給から求めた課税所得の 5% まで引くこと', () => {
      const input = withSalary(2_400_000);

      const r = simulate(input);

      // 月給 200,000 円の源泉徴収税額 3,700 円の 12 か月分。
      const incomeTax = 44_400;

      // 住民税の行のもとになる課税所得の概算
      // (200,000 × 0.7 - 125,000) × 12 = 180,000 円の 5%。
      const residentPart = 9000;

      assert.isTrue(
        incomeTax + residentPart < (uncappedAt(input, r, '2032-01') ?? 0),
      );

      assert.closeTo(
        deductionAt(r, '2032-01') ?? Number.NaN,
        incomeTax + residentPart,
        1e-6,
      );
    });

    test('住民税から引く分は 97,500 円で頭打ちになること', () => {
      const input: SimulationInput = {
        ...withSalary(5_400_000),
        housingLoan: {
          ...d.housingLoan,
          principal: 50_000_000,
          houseType: 'long-life',
          childRearing: true,
        },
      } as const;

      const r = simulate(input);

      // 月給 450,000 円の源泉徴収税額 15,280 円の 12 か月分。
      const incomeTax = 183_360;

      // 住民税の行のもとになる課税所得の概算は
      // (450,000 × 0.7 - 125,000) × 12 = 2,280,000 円で、その 5% は 114,000 円。
      assert.isTrue(
        incomeTax + 97_500 < (uncappedAt(input, r, '2032-01') ?? 0),
      );

      assert.closeTo(
        deductionAt(r, '2032-01') ?? Number.NaN,
        incomeTax + 97_500,
        1e-6,
      );
    });

    test('プランの開始前の年の分は、税額が分からないので頭打ちにしないこと', () => {
      const input: SimulationInput = {
        ...d,
        housingLoan: { ...d.housingLoan, start: '2024-01' },
      } as const;

      const r = simulate(input);

      const uncapped = uncappedAt(input, r, '2026-01');

      assert.isTrue((uncapped ?? 0) > 0);

      assert.strictEqual(deductionAt(r, '2026-01'), uncapped);
    });

    test('12 月以外で終わるプランの終わりの年と、その後の年の分は頭打ちにしないこと', () => {
      // 1990-04 生まれで 45 歳まで: 2036-03 で終わる。
      const input: SimulationInput = {
        ...withSalary(2_400_000),
        profile: { ...d.profile, endAge: 45 },
      } as const;

      const r = simulate(input);

      // 2035 年は 1 年分あるので頭打ちになる。
      assert.isTrue(
        (deductionAt(r, '2036-01') ?? Number.NaN) <
          (uncappedAt(input, r, '2036-01') ?? 0),
      );

      // 2036 年は 3 か月分だけ、2039 年は範囲の外。
      for (const yearMonth of ['2037-01', '2040-01']) {
        const uncapped = uncappedAt(input, r, yearMonth);

        assert.isTrue((uncapped ?? 0) > 0);

        assert.strictEqual(deductionAt(r, yearMonth), uncapped);
      }
    });

    test('1 月以外から始まるプランの開始の年の分は頭打ちにしないこと', () => {
      const input: SimulationInput = {
        ...withSalary(2_400_000),
        profile: { ...d.profile, start: '2030-04' },
      } as const;

      const r = simulate(input);

      const uncapped = uncappedAt(input, r, '2031-01');

      assert.isTrue((uncapped ?? 0) > 0);

      assert.strictEqual(deductionAt(r, '2031-01'), uncapped);

      assert.isTrue(
        (deductionAt(r, '2032-01') ?? 0) <
          (uncappedAt(input, r, '2032-01') ?? 0),
      );
    });
  });

  test('欠けた入力値は既定値で補って読み込めること', () => {
    const filled = SimulationInput.fill({ profile: { birth: '1980-01' } });

    assert.strictEqual(filled.profile.birth, '1980-01');

    assert.strictEqual(
      filled.profile.start,
      defaultSimulationInput.profile.start,
    );

    assert.deepStrictEqual(
      filled.salaryHistory,
      defaultSimulationInput.salaryHistory,
    );
  });
});

const deductionAt = (
  r: SimulationResult,
  yearMonth: string,
): number | undefined =>
  r.housingLoan.deductions.find((x) => formatYearMonth(x.month) === yearMonth)
    ?.amount;

/** 頭打ちにする前の控除額（年末残高 × 0.7%）。 */
const uncappedAt = (
  input: SimulationInput,
  r: SimulationResult,
  yearMonth: string,
): number | undefined =>
  calculateHousingLoanDeduction(
    r.housingLoan.schedule,
    r.housingLoan.start,
    housingLoanDeductionConditions(input.housingLoan),
  ).find((x) => formatYearMonth(x.month) === yearMonth)?.amount;

/** 2020-04 から賞与なしで `annualBase` の月給が続くプラン。 */
const withSalary = (annualBase: number): SimulationInput =>
  ({
    ...d,
    salaryHistory: [
      {
        id: 1,
        start: '2020-04',
        annualBase,
        companyDcMonthly: 0,
        idecoMonthly: 0,
        annualBonus: 0,
      },
    ],
  }) as const;
