/** @jsxImportSource preact */
import { computed, signal, type ReadonlySignal } from '@preact/signals';
import { render } from 'preact';
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
 * The inputs are signals, and every figure is a `computed` of its own, reading
 * the figures it is computed from. Each cell is a `computed` that formats a
 * figure, passed to the DOM as a signal so that it binds without
 * re-rendering a component.
 */
export const preactSignalsLoan: ScenarioFramework<LoanApp> = {
  name: 'Preact + Signals',
  mount: (container) => {
    const principal = signal(initialInputs.principal);

    const mut_annualRate = signal(initialInputs.annualRate);

    const prepayments = initialInputs.prepayments.map((amount) =>
      signal(amount),
    );

    const monthlyRate = computed(() => monthlyRateOf(mut_annualRate.value));

    const payment = computed(() =>
      paymentOf(principal.value, monthlyRate.value),
    );

    const mut_interests: ReadonlySignal<number>[] = [];

    const mut_repaid: ReadonlySignal<number>[] = [];

    const mut_balances: ReadonlySignal<number>[] = [];

    for (const [month, prepayment] of prepayments.entries()) {
      const opening = mut_balances[month - 1] ?? principal;

      const interest = computed(() =>
        interestOf(opening.value, monthlyRate.value),
      );

      const repaid = computed(() =>
        repaidOf(
          opening.value,
          interest.value,
          payment.value,
          prepayment.value,
        ),
      );

      mut_interests.push(interest);

      mut_repaid.push(repaid);

      mut_balances.push(computed(() => balanceOf(opening.value, repaid.value)));
    }

    const yearRows = Array.from({ length: years }, (_, year) => {
      const ofYear = (
        figures: readonly ReadonlySignal<number>[],
      ): readonly ReadonlySignal<number>[] =>
        monthsOfYear(year).flatMap((month) => figures[month] ?? []);

      const interests = ofYear(mut_interests);

      const repaid = ofYear(mut_repaid);

      return {
        interest: computed(() => sumOf(interests.map((s) => s.value))),
        repaid: computed(() => sumOf(repaid.map((s) => s.value))),
        balance: mut_balances[year * 12 + 11] ?? principal,
      } as const;
    });

    const totalInterest = computed(() =>
      sumOf(yearRows.map((row) => row.interest.value)),
    );

    const repaymentMonths = computed(() =>
      repaymentMonthsOf(mut_balances.map((s) => s.value)),
    );

    const formatted = (
      figure: ReadonlySignal<number>,
      format: (value: number) => string,
    ): ReadonlySignal<string> => computed(() => format(figure.value));

    render(
      <table>
        <tbody>
          <tr>
            <td>{formatted(payment, yen)}</td>
            <td>{formatted(totalInterest, yen)}</td>
            <td>{formatted(repaymentMonths, (n) => n.toString())}</td>
          </tr>
          {yearRows.map((row, year) => (
            <tr key={year}>
              <td>{(year + 1).toString()}</td>
              <td>{formatted(row.interest, yen)}</td>
              <td>{formatted(row.repaid, yen)}</td>
              <td>{formatted(row.balance, yen)}</td>
            </tr>
          ))}
        </tbody>
      </table>,
      container,
    );

    return {
      setAnnualRate: (percent) => {
        mut_annualRate.value = percent;
      },
      setPrepayment: (month, amount) => {
        const mut_prepayment = prepayments[month];

        if (mut_prepayment !== undefined) {
          mut_prepayment.value = amount;
        }
      },
      dispose: () => {
        render(null, container);
      },
    } satisfies LoanApp;
  },
} as const;
