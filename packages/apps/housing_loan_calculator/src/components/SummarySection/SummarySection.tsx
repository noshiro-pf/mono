import { memoNamed } from '@mono/react-utils';
import { viewTexts } from '../../constants/view-texts';
import { RepaymentType } from '../../types/enum/repayment-type';
import { DataItem } from './DataItem';

interface Props {
  repaymentType: RepaymentType;
  propertyPriceManYen: number;
  downPaymentManYen: number;
  fixedPrincipalYenPerMonth: number;
  fixedMonthlyPaymentsYen: number;
  interestSumManYen: number;
}

export const SummarySection = memoNamed<Props>(
  'SummarySection',
  ({
    repaymentType,
    propertyPriceManYen,
    downPaymentManYen,
    fixedPrincipalYenPerMonth,
    fixedMonthlyPaymentsYen,
    interestSumManYen,
  }) => (
    <dl>
      <DataItem
        title={viewTexts.borrowingTotalYen}
        description={`${propertyPriceManYen - downPaymentManYen}万円`}
      />
      {repaymentType === 'principal-equal-payment' ? (
        <DataItem
          title={viewTexts.monthlyPrincipalPaymentsYen(false)}
          description={`${fixedPrincipalYenPerMonth.toFixed(0)}円`}
        />
      ) : (
        <DataItem
          title={viewTexts.monthlyPaymentsYen(false)}
          description={`${fixedMonthlyPaymentsYen.toFixed(0)}円`}
        />
      )}
      <DataItem
        title={viewTexts.interestSum}
        description={`${interestSumManYen.toFixed(2)}万円`}
      />
      <DataItem
        title={viewTexts.paymentsSum}
        description={`${(propertyPriceManYen + interestSumManYen).toFixed(
          2
        )}万円`}
      />
    </dl>
  )
);
