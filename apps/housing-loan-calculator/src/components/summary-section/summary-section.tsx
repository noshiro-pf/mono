import { memoNamed } from 'react-utils';
import { useObservableValue } from 'synstate-react-hooks';
import { dict } from '../../constants/index.mjs';
import { loanStore } from '../../store/index.mjs';
import { DataItem } from './data-item.js';

export const SummarySection = memoNamed('SummarySection', () => {
  const { repaymentType, borrowingTotalManYen } = useObservableValue(
    loanStore.inputs,
  );

  const {
    fixedPrincipalYenPerMonth,
    fixedMonthlyPaymentsYen,
    interestSumManYen,
  } = useObservableValue(loanStore.calculatedValues);

  return (
    <dl>
      {repaymentType === 'principal-equal-payment' ? (
        <DataItem
          cyIdForDescription={'fixedPrincipalYenPerMonthDescription'}
          cyIdForTitle={'fixedPrincipalYenPerMonthTitle'}
          description={`${fixedPrincipalYenPerMonth.toFixed(0)}円`}
          title={dict.monthlyPrincipalPaymentsYen(false)}
        />
      ) : (
        <DataItem
          cyIdForDescription={'fixedMonthlyPaymentsYenDescription'}
          cyIdForTitle={'fixedMonthlyPaymentsYenTitle'}
          description={`${fixedMonthlyPaymentsYen.toFixed(0)}円`}
          title={dict.monthlyPaymentsYen(false)}
        />
      )}
      <DataItem
        cyIdForDescription={'interestSumDescription'}
        cyIdForTitle={'interestSumTitle'}
        description={`${interestSumManYen.toFixed(2)}万円`}
        title={dict.interestSum}
      />
      <DataItem
        cyIdForDescription={'paymentsSumDescription'}
        cyIdForTitle={'paymentsSumTitle'}
        description={`${(borrowingTotalManYen + interestSumManYen).toFixed(2)}万円`}
        title={dict.paymentsSum}
      />
    </dl>
  );
});
