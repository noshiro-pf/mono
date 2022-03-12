import { memoNamed } from '@noshiro/react-utils';
import { useObservableValue } from '@noshiro/syncflow-react-hooks';
import { viewTexts } from '../../constants';
import { calculatedValues$, store$ } from '../../observables';
import { DataItem } from './data-item';

export const SummarySection = memoNamed('SummarySection', () => {
  const { repaymentType, downPaymentManYen, propertyPriceManYen } =
    useObservableValue(store$);

  const {
    fixedPrincipalYenPerMonth,
    fixedMonthlyPaymentsYen,
    interestSumManYen,
  } = useObservableValue(calculatedValues$);

  return (
    <dl>
      <DataItem
        description={`${propertyPriceManYen - downPaymentManYen}万円`}
        title={viewTexts.borrowingTotalYen}
      />
      {repaymentType === 'principal-equal-payment' ? (
        <DataItem
          description={`${fixedPrincipalYenPerMonth.toFixed(0)}円`}
          title={viewTexts.monthlyPrincipalPaymentsYen(false)}
        />
      ) : (
        <DataItem
          description={`${fixedMonthlyPaymentsYen.toFixed(0)}円`}
          title={viewTexts.monthlyPaymentsYen(false)}
        />
      )}
      <DataItem
        description={`${interestSumManYen.toFixed(2)}万円`}
        title={viewTexts.interestSum}
      />
      <DataItem
        description={`${(propertyPriceManYen + interestSumManYen).toFixed(
          2
        )}万円`}
        title={viewTexts.paymentsSum}
      />
    </dl>
  );
});
