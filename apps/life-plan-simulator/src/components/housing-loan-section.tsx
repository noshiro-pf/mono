import { createState } from 'synstate';
import { constant, derive, mapBindable, type JSX } from 'synstate-dom';
import {
  calculateHousingLoan,
  summarizeHousingLoan,
} from '../domain/index.mjs';
import { formatYen, parseNumberInput } from '../utils/index.mjs';

/**
 * 住宅ローンの入力と返済額の要約。
 *
 * 収支シミュレーター全体のうち、`experimental/life-plan-simulator` から
 * 移した計算ロジックが既にある部分だけを先に画面にしたもの。
 */
export const HousingLoanSection = (): JSX.Element => {
  const [principalManYen$, setPrincipalManYen] = createState('3000');

  const [loanTermYears$, setLoanTermYears] = createState('35');

  const [initialRatePercent$, setInitialRatePercent] = createState('0.5');

  const [maxRatePercent$, setMaxRatePercent] = createState('2');

  const [annualRateIncreasePercent$, setAnnualRateIncreasePercent] =
    createState('0.05');

  const summary = derive(
    [
      principalManYen$,
      loanTermYears$,
      initialRatePercent$,
      maxRatePercent$,
      annualRateIncreasePercent$,
    ],
    (principal, years, initialRate, maxRate, annualIncrease) =>
      summarizeHousingLoan(
        calculateHousingLoan({
          principalAmount: parseNumberInput(principal) * 10_000,
          loanTermYears: Math.trunc(parseNumberInput(years)),
          initialAnnualRate: parseNumberInput(initialRate) / 100,
          rateIncreaseEvery5Years: 0,
          monthlyRateIncrease: parseNumberInput(annualIncrease) / 100 / 12,
          maxAnnualRate: parseNumberInput(maxRate) / 100,
        }),
      ),
  );

  return (
    <section>
      <h2>{constant('住宅ローン')}</h2>
      <div class={constant('form')}>
        <label>
          {constant('借入額（万円）')}
          <input
            type={constant('number')}
            data-e2e={constant('loan-principal')}
            value={principalManYen$}
            onInput={(e) => {
              setPrincipalManYen(e.currentTarget.value);
            }}
          />
        </label>
        <label>
          {constant('返済年数（年）')}
          <input
            type={constant('number')}
            data-e2e={constant('loan-term')}
            value={loanTermYears$}
            onInput={(e) => {
              setLoanTermYears(e.currentTarget.value);
            }}
          />
        </label>
        <label>
          {constant('初期金利（年利 %）')}
          <input
            type={constant('number')}
            value={initialRatePercent$}
            onInput={(e) => {
              setInitialRatePercent(e.currentTarget.value);
            }}
          />
        </label>
        <label>
          {constant('金利上昇幅（年あたり %）')}
          <input
            type={constant('number')}
            value={annualRateIncreasePercent$}
            onInput={(e) => {
              setAnnualRateIncreasePercent(e.currentTarget.value);
            }}
          />
        </label>
        <label>
          {constant('上限金利（年利 %）')}
          <input
            type={constant('number')}
            value={maxRatePercent$}
            onInput={(e) => {
              setMaxRatePercent(e.currentTarget.value);
            }}
          />
        </label>
      </div>
      <dl>
        <dt>{constant('初回の返済額')}</dt>
        <dd data-e2e={constant('loan-first-payment')}>
          {mapBindable(summary, (s) => formatYen(s.firstPayment))}
        </dd>
        <dt>{constant('最大の返済額')}</dt>
        <dd>{mapBindable(summary, (s) => formatYen(s.maxPayment))}</dd>
        <dt>{constant('総返済額')}</dt>
        <dd data-e2e={constant('loan-total-payment')}>
          {mapBindable(summary, (s) => formatYen(s.totalPayment))}
        </dd>
      </dl>
    </section>
  );
};
