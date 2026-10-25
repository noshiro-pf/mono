import { Arr } from 'ts-data-forge';
import { defaultSimulationInput, SimulationInput } from '../input/index.mjs';
import { formatYearMonth } from '../year-month/index.mjs';
import { simulate } from './simulate.mjs';

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
