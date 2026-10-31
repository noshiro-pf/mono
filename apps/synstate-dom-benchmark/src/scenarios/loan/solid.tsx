/** @jsxImportSource solid-js */
import { createMemo, createRoot, createSignal, type Accessor } from 'solid-js';
import type { ScenarioFramework } from '../scenario.mjs';
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
 * The inputs are signals, and every figure is a `createMemo` of its own,
 * reading the figures it is computed from. The cells read the figures in JSX
 * expressions, which Solid compiles into render effects.
 */
export const solidLoan: ScenarioFramework<LoanApp> = {
  name: 'Solid',
  mount: (container) =>
    createRoot((dispose) => {
      const [principal] = createSignal(initialInputs.principal);

      const [annualRate, setAnnualRate] = createSignal(
        initialInputs.annualRate,
      );

      const prepayments = initialInputs.prepayments.map((amount) =>
        createSignal(amount),
      );

      const monthlyRate = createMemo(() => monthlyRateOf(annualRate()));

      const payment = createMemo(() => paymentOf(principal(), monthlyRate()));

      const mut_interests: Accessor<number>[] = [];

      const mut_repaid: Accessor<number>[] = [];

      const mut_balances: Accessor<number>[] = [];

      for (const [month, [prepayment]] of prepayments.entries()) {
        const opening = mut_balances[month - 1] ?? principal;

        const interest = createMemo(() => interestOf(opening(), monthlyRate()));

        const repaid = createMemo(() =>
          repaidOf(opening(), interest(), payment(), prepayment()),
        );

        mut_interests.push(interest);

        mut_repaid.push(repaid);

        mut_balances.push(createMemo(() => balanceOf(opening(), repaid())));
      }

      const yearRows = Array.from({ length: years }, (_, year) => {
        const ofYear = (
          figures: readonly Accessor<number>[],
        ): readonly Accessor<number>[] =>
          monthsOfYear(year).flatMap((month) => figures[month] ?? []);

        const interests = ofYear(mut_interests);

        const repaid = ofYear(mut_repaid);

        return {
          interest: createMemo(() => sumOf(interests.map((f) => f()))),
          repaid: createMemo(() => sumOf(repaid.map((f) => f()))),
          balance: mut_balances[year * 12 + 11] ?? principal,
        } as const;
      });

      const totalInterest = createMemo(() =>
        sumOf(yearRows.map((row) => row.interest())),
      );

      const repaymentMonths = createMemo(() =>
        repaymentMonthsOf(mut_balances.map((f) => f())),
      );

      const element = (
        <table>
          <tbody>
            <tr>
              <td>{yen(payment())}</td>
              <td>{yen(totalInterest())}</td>
              <td>{repaymentMonths().toString()}</td>
            </tr>
            {yearRows.map((row, year) => (
              <tr>
                <td>{(year + 1).toString()}</td>
                <td>{yen(row.interest())}</td>
                <td>{yen(row.repaid())}</td>
                <td>{yen(row.balance())}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );

      // A `<table>` expression is a `HTMLTableElement` at run time; Solid types
      // every JSX expression as its broader `JSX.Element`.
      if (element instanceof Node) {
        container.append(element);
      }

      return {
        setAnnualRate: (percent) => {
          setAnnualRate(percent);
        },
        setPrepayment: (month, amount) => {
          prepayments[month]?.[1](amount);
        },
        dispose: () => {
          dispose();

          container.replaceChildren();
        },
      } satisfies LoanApp;
    }),
} as const;
