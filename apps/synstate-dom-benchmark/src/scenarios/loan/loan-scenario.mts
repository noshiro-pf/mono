import type { Scenario } from '../scenario.mjs';
import { computeLoan, initialInputs, type LoanApp } from './model.mjs';
import { preactSignalsLoan } from './preact-signals.js';
import { preactLoan } from './preact.js';
import { reactLoan } from './react.js';
import { solidLoan } from './solid.js';
import { synstateDomLoan, synstateDomLoanChangedOnly } from './synstate-dom.js';
import { vanjsLoan } from './vanjs.mjs';

const changedRate = 1.6;

/** A prepayment of `amount` in `month` (from 0), from the initial inputs. */
const prepaymentCase = (
  name: string,
  month: number,
  amount: number,
): Scenario<LoanApp>['cases'][number] =>
  ({
    name,
    apply: (app) => {
      app.setPrepayment(month, amount);
    },
    revert: (app) => {
      app.setPrepayment(month, 0);
    },
    expected: computeLoan({
      ...initialInputs,
      prepayments: initialInputs.prepayments.with(month, amount),
    }),
  }) as const;

/**
 * A 30-year loan shown by year. Changing the rate changes every month;
 * a prepayment changes the months from it onwards, which is half the chain
 * for one in month 181 and its last twelve links for one in month 349.
 */
export const loanScenario: Scenario<LoanApp> = {
  buildName: 'loan: build the table',
  initial: computeLoan(initialInputs),
  cases: [
    {
      name: 'loan: change the interest rate',
      apply: (app) => {
        app.setAnnualRate(changedRate);
      },
      revert: (app) => {
        app.setAnnualRate(initialInputs.annualRate);
      },
      expected: computeLoan({ ...initialInputs, annualRate: changedRate }),
    },
    prepaymentCase('loan: prepay in month 181', 180, 3_000_000),
    prepaymentCase('loan: prepay in month 349', 348, 1_000_000),
  ],
  frameworks: [
    synstateDomLoan,
    synstateDomLoanChangedOnly,
    solidLoan,
    preactSignalsLoan,
    preactLoan,
    reactLoan,
    vanjsLoan,
  ],
} as const;
