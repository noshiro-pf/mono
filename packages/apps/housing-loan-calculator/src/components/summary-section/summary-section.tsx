import { calculatedValues$, store$ } from '../../store';
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
        title={dict.borrowingTotalYen}
      />
      {repaymentType === 'principal-equal-payment' ? (
        <DataItem
          description={`${fixedPrincipalYenPerMonth.toFixed(0)}円`}
          title={dict.monthlyPrincipalPaymentsYen(false)}
        />
      ) : (
        <DataItem
          description={`${fixedMonthlyPaymentsYen.toFixed(0)}円`}
          title={dict.monthlyPaymentsYen(false)}
        />
      )}
      <DataItem
        description={`${interestSumManYen.toFixed(2)}万円`}
        title={dict.interestSum}
      />
      <DataItem
        description={`${(propertyPriceManYen + interestSumManYen).toFixed(
          2
        )}万円`}
        title={dict.paymentsSum}
      />
    </dl>
  );
});
