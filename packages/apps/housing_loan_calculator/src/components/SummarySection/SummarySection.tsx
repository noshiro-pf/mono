import { memoNamed } from '@noshiro/react-utils';
import { viewTexts } from '../../constants';
import type { RepaymentType } from '../../types';
import { DataItem } from './DataItem';

type Props = Readonly<{
  repaymentType: RepaymentType;
  propertyPriceManYen: number;
  downPaymentManYen: number;
  fixedPrincipalYenPerMonth: number;
  fixedMonthlyPaymentsYen: number;
  interestSumManYen: number;
}>;

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
  )
);
