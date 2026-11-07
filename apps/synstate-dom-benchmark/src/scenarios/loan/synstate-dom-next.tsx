/** @jsxImportSource synstate-dom-next */
import { constant, render, type JSX } from 'synstate-dom-next';
import { derive, map, state, type InitializedObservable } from 'synstate-next';
import type { ScenarioFramework } from '../scenario.mjs';
import { deriveAllNext } from '../synstate-next-graph.mjs';
import {
  balanceOf,
  initialInputs,
  interestOf,
  monthlyRateOf,
  monthsOfYear,
  paymentOf,
  repaidOf,
  repaymentMonthsOf,
  sumOf,
  years,
  yen,
  type LoanApp,
} from './model.mjs';

/**
 * The inputs are states, and every figure is a node of its own, made with
 * `derive` from the figures it is computed from, which passes on only a value
 * that changed. The cells format the figures with `map`.
 */
export const synstateDomNextLoan: ScenarioFramework<LoanApp> = {
  name: 'synstate-dom-next',
  mount: (container) => {
    const principal = state(initialInputs.principal);

    const annualRate = state(initialInputs.annualRate);

    const prepayments = initialInputs.prepayments.map((amount) =>
      state(amount),
    );

    const monthlyRate = annualRate.pipe(map(monthlyRateOf));

    const payment = derive([principal, monthlyRate], paymentOf);

    const mut_interests: InitializedObservable<number>[] = [];

    const mut_repaid: InitializedObservable<number>[] = [];

    const mut_balances: InitializedObservable<number>[] = [];

    for (const [month, prepayment] of prepayments.entries()) {
      const opening = mut_balances[month - 1] ?? principal;

      const interest = derive([opening, monthlyRate], interestOf);

      const repaid = derive([opening, interest, payment, prepayment], repaidOf);

      mut_interests.push(interest);

      mut_repaid.push(repaid);

      mut_balances.push(derive([opening, repaid], balanceOf));
    }

    const yearRows = Array.from({ length: years }, (_, year) => {
      const ofYear = (
        figures: readonly InitializedObservable<number>[],
      ): readonly InitializedObservable<number>[] =>
        monthsOfYear(year).flatMap((month) => figures[month] ?? []);

      return {
        interest: deriveAllNext(ofYear(mut_interests), sumOf),
        repaid: deriveAllNext(ofYear(mut_repaid), sumOf),
        balance: mut_balances[year * 12 + 11] ?? principal,
      } as const;
    });

    const totalInterest = deriveAllNext(
      yearRows.map((row) => row.interest),
      sumOf,
    );

    const repaymentMonths = deriveAllNext(mut_balances, repaymentMonthsOf);

    const App = (): JSX.Element => (
      <table>
        <tbody>
          <tr>
            <td>{payment.pipe(map(yen))}</td>
            <td>{totalInterest.pipe(map(yen))}</td>
            <td>{repaymentMonths.pipe(map((n) => n.toString()))}</td>
          </tr>
          {yearRows.map((row, year) => (
            <tr>
              <td>{constant((year + 1).toString())}</td>
              <td>{row.interest.pipe(map(yen))}</td>
              <td>{row.repaid.pipe(map(yen))}</td>
              <td>{row.balance.pipe(map(yen))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    const unmount = render(App, container);

    return {
      setAnnualRate: (rate) => {
        annualRate.set(rate);
      },
      setPrepayment: (month, amount) => {
        prepayments[month]?.set(amount);
      },
      dispose: unmount,
    } satisfies LoanApp;
  },
} as const;
