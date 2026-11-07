import { createState, derive, map, type InitializedObservable } from 'synstate';
import { constant, inlineMap, render, type JSX } from 'synstate-dom';
import type { ScenarioFramework } from '../scenario.mjs';
import { deriveAll } from '../synstate-graph.mjs';
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
 * synstate-dom-next's form (see `./synstate-dom-next.tsx`) with synstate and
 * synstate-dom, for the `next` set: every figure is one `derive`, which passes
 * on only a value that changed, so that the comparison is of the libraries
 * rather than of `combine` + `map` against `derive`. The cells format the
 * figures with `inlineMap`, which adds no node.
 */
export const synstateDomDeriveLoan: ScenarioFramework<LoanApp> = {
  name: 'synstate-dom (derive)',
  mount: (container) => {
    const [principal] = createState(initialInputs.principal);

    const [annualRate, setAnnualRate] = createState(initialInputs.annualRate);

    const prepayments = initialInputs.prepayments.map((amount) =>
      createState(amount),
    );

    const monthlyRate = annualRate.pipe(map(monthlyRateOf));

    const payment = derive([principal, monthlyRate], paymentOf);

    const mut_interests: InitializedObservable<number>[] = [];

    const mut_repaid: InitializedObservable<number>[] = [];

    const mut_balances: InitializedObservable<number>[] = [];

    for (const [month, [prepayment]] of prepayments.entries()) {
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
        interest: deriveAll(ofYear(mut_interests), sumOf),
        repaid: deriveAll(ofYear(mut_repaid), sumOf),
        balance: mut_balances[year * 12 + 11] ?? principal,
      } as const;
    });

    const totalInterest = deriveAll(
      yearRows.map((row) => row.interest),
      sumOf,
    );

    const repaymentMonths = deriveAll(mut_balances, repaymentMonthsOf);

    const App = (): JSX.Element => (
      <table>
        <tbody>
          <tr>
            <td>{inlineMap(payment, yen)}</td>
            <td>{inlineMap(totalInterest, yen)}</td>
            <td>{inlineMap(repaymentMonths, (n) => n.toString())}</td>
          </tr>
          {yearRows.map((row, year) => (
            <tr>
              <td>{constant((year + 1).toString())}</td>
              <td>{inlineMap(row.interest, yen)}</td>
              <td>{inlineMap(row.repaid, yen)}</td>
              <td>{inlineMap(row.balance, yen)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    const unmount = render(App, container);

    return {
      setAnnualRate: (rate) => {
        setAnnualRate(rate);
      },
      setPrepayment: (month, amount) => {
        prepayments[month]?.[1](amount);
      },
      dispose: unmount,
    } satisfies LoanApp;
  },
} as const;
