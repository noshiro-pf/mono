import van, { type State } from 'vanjs-core';
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

const { table, tbody, td, tr } = van.tags;

/**
 * The inputs are states, and every figure is a `van.derive` of its own,
 * reading the figures it is computed from. Each cell is bound to a function
 * that formats a figure.
 *
 * VanJS recomputes derived states in rounds, in a microtask: each round
 * reruns the derivations that read a state the last round changed, and it
 * stops after 100 rounds. A change that has to travel further down the chain
 * than that leaves stale figures, which the harness reports instead of a
 * time.
 */
export const vanjsLoan: ScenarioFramework<LoanApp> = {
  name: 'VanJS',
  mount: (container) => {
    const principal = van.state(initialInputs.principal);

    const mut_annualRate = van.state(initialInputs.annualRate);

    const prepayments = initialInputs.prepayments.map((amount) =>
      van.state(amount),
    );

    const monthlyRate = van.derive(() => monthlyRateOf(mut_annualRate.val));

    const payment = van.derive(() => paymentOf(principal.val, monthlyRate.val));

    const mut_interests: State<number>[] = [];

    const mut_repaid: State<number>[] = [];

    const mut_balances: State<number>[] = [];

    for (const [month, prepayment] of prepayments.entries()) {
      const opening = mut_balances[month - 1] ?? principal;

      const interest = van.derive(() =>
        interestOf(opening.val, monthlyRate.val),
      );

      const repaid = van.derive(() =>
        repaidOf(opening.val, interest.val, payment.val, prepayment.val),
      );

      mut_interests.push(interest);

      mut_repaid.push(repaid);

      mut_balances.push(van.derive(() => balanceOf(opening.val, repaid.val)));
    }

    const yearRows = Array.from({ length: years }, (_, year) => {
      const ofYear = (
        figures: readonly State<number>[],
      ): readonly State<number>[] =>
        monthsOfYear(year).flatMap((month) => figures[month] ?? []);

      const interests = ofYear(mut_interests);

      const repaid = ofYear(mut_repaid);

      return {
        interest: van.derive(() => sumOf(interests.map((s) => s.val))),
        repaid: van.derive(() => sumOf(repaid.map((s) => s.val))),
        balance: mut_balances[year * 12 + 11] ?? principal,
      } as const;
    });

    const totalInterest = van.derive(() =>
      sumOf(yearRows.map((row) => row.interest.val)),
    );

    const repaymentMonths = van.derive(() =>
      repaymentMonthsOf(mut_balances.map((s) => s.val)),
    );

    van.add(
      container,
      table(
        tbody(
          tr(
            td(() => yen(payment.val)),
            td(() => yen(totalInterest.val)),
            td(() => repaymentMonths.val.toString()),
          ),
          ...yearRows.map((row, year) =>
            tr(
              td((year + 1).toString()),
              td(() => yen(row.interest.val)),
              td(() => yen(row.repaid.val)),
              td(() => yen(row.balance.val)),
            ),
          ),
        ),
      ),
    );

    return {
      setAnnualRate: (percent) => {
        mut_annualRate.val = percent;
      },
      setPrepayment: (month, amount) => {
        const mut_prepayment = prepayments[month];

        if (mut_prepayment !== undefined) {
          mut_prepayment.val = amount;
        }
      },
      dispose: () => {
        container.replaceChildren();
      },
    } satisfies LoanApp;
  },
} as const;
