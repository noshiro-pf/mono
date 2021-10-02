import { memoNamed } from '@noshiro/react-utils';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { viewTexts } from '../../constants';
import { calculatedValues$, store$ } from '../../observables';
import { DataItem } from './data-item';

export const SummarySection = memoNamed('SummarySection', () => {
  const { repaymentType, downPaymentManYen, propertyPriceManYen } =
    useStreamValue(store$);

  const {
    fixedPrincipalYenPerMonth,
    fixedMonthlyPaymentsYen,
    interestSumManYen,
  } = useStreamValue(calculatedValues$);

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
