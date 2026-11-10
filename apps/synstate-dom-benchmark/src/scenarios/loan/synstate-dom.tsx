import {
  combine,
  createState,
  map,
  type InitializedObservable,
} from 'synstate';
import { constant, render, type JSX } from 'synstate-dom';
import type { ScenarioFramework } from '../scenario.mjs';
import { combineAll } from '../synstate-graph.mjs';
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
 * `combine` and `map` from the figures it is computed from. The cells bind the
 * figures formatted with `map`.
 */
export const synstateDomLoan: ScenarioFramework<LoanApp> = {
  name: 'synstate-dom',
  mount: (container) => {
    const [principal$] = createState(initialInputs.principal);

    const [annualRate$, setAnnualRate] = createState(initialInputs.annualRate);

    const prepayments = initialInputs.prepayments.map((amount) =>
      createState(amount),
    );

    const monthlyRate$ = annualRate$.pipe(map(monthlyRateOf));

    const payment$ = combine([principal$, monthlyRate$]).pipe(
      map(([principal, monthlyRate]) => paymentOf(principal, monthlyRate)),
    );

    const mut_interests: InitializedObservable<number>[] = [];

    const mut_repaid: InitializedObservable<number>[] = [];

    const mut_balances: InitializedObservable<number>[] = [];

    for (const [month, [prepayment$]] of prepayments.entries()) {
      const opening$ = mut_balances[month - 1] ?? principal$;

      const interest$ = combine([opening$, monthlyRate$]).pipe(
        map(([opening, monthlyRate]) => interestOf(opening, monthlyRate)),
      );

      const repaid$ = combine([
        opening$,
        interest$,
        payment$,
        prepayment$,
      ]).pipe(
        map(([opening, interest, payment, prepayment]) =>
          repaidOf(opening, interest, payment, prepayment),
        ),
      );

      mut_interests.push(interest$);

      mut_repaid.push(repaid$);

      mut_balances.push(
        combine([opening$, repaid$]).pipe(
          map(([opening, repaid]) => balanceOf(opening, repaid)),
        ),
      );
    }

    const yearRows = Array.from({ length: years }, (_, year) => {
      const ofYear = (
        figures: readonly InitializedObservable<number>[],
      ): readonly InitializedObservable<number>[] =>
        monthsOfYear(year).flatMap((month) => figures[month] ?? []);

      return {
        interest$: combineAll(ofYear(mut_interests), sumOf),
        repaid$: combineAll(ofYear(mut_repaid), sumOf),
        balance$: mut_balances[year * 12 + 11] ?? principal$,
      } as const;
    });

    const totalInterest$ = combineAll(
      yearRows.map((row) => row.interest$),
      sumOf,
    );

    const repaymentMonths$ = combineAll(mut_balances, repaymentMonthsOf);

    const App = (): JSX.Element => (
      <table>
        <tbody>
          <tr>
            <td>{payment$.pipe(map(yen))}</td>
            <td>{totalInterest$.pipe(map(yen))}</td>
            <td>{repaymentMonths$.pipe(map((n) => n.toString()))}</td>
          </tr>
          {yearRows.map((row, year) => (
            <tr>
              <td>{constant((year + 1).toString())}</td>
              <td>{row.interest$.pipe(map(yen))}</td>
              <td>{row.repaid$.pipe(map(yen))}</td>
              <td>{row.balance$.pipe(map(yen))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    const unmount = render(App, container);

    return {
      setAnnualRate,
      setPrepayment: (month, amount) => {
        prepayments[month]?.[1](amount);
      },
      dispose: unmount,
    } satisfies LoanApp;
  },
} as const;
