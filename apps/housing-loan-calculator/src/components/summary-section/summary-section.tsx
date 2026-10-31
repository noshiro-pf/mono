import { constant, derive, If, mapBindable, type JSX } from 'synstate-dom';
import { dict } from '../../constants/index.mjs';
import { loanStore } from '../../store/index.mjs';
import { DataItem } from './data-item.js';

export const SummarySection = (): JSX.Element => (
  <dl>
    <If
      cond={mapBindable(
        loanStore.inputs,
        (s) => s.repaymentType === 'principal-equal-payment',
      )}
      else={
        <DataItem
          data-e2e-description={'fixedMonthlyPaymentsYenDescription'}
          data-e2e-title={'fixedMonthlyPaymentsYenTitle'}
          description={mapBindable(
            loanStore.calculatedValues,
            (v) => `${v.fixedMonthlyPaymentsYen.toFixed(0)}円`,
          )}
          title={constant(dict.monthlyPaymentsYen(false))}
        />
      }
      then={
        <DataItem
          data-e2e-description={'fixedPrincipalYenPerMonthDescription'}
          data-e2e-title={'fixedPrincipalYenPerMonthTitle'}
          description={mapBindable(
            loanStore.calculatedValues,
            (v) => `${v.fixedPrincipalYenPerMonth.toFixed(0)}円`,
          )}
          title={constant(dict.monthlyPrincipalPaymentsYen(false))}
        />
      }
    />
    <DataItem
      data-e2e-description={'interestSumDescription'}
      data-e2e-title={'interestSumTitle'}
      description={mapBindable(
        loanStore.calculatedValues,
        (v) => `${v.interestSumManYen.toFixed(2)}万円`,
      )}
      title={constant(dict.interestSum)}
    />
    <DataItem
      data-e2e-description={'paymentsSumDescription'}
      data-e2e-title={'paymentsSumTitle'}
      description={derive(
        [loanStore.inputs, loanStore.calculatedValues],
        (s, v) =>
          `${(s.borrowingTotalManYen + v.interestSumManYen).toFixed(2)}万円`,
      )}
      title={constant(dict.paymentsSum)}
    />
  </dl>
);
