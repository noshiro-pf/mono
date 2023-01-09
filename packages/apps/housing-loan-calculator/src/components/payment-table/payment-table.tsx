import { HTMLTable } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useObservableValue } from '@noshiro/syncflow-react-hooks';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { viewTexts } from '../../constants';
import { calculatedValues$, store$ } from '../../observables';

const headerCellStyle: CSSProperties = {
  textAlign: 'center',
};

const dataCellStyle: CSSProperties = {
  textAlign: 'right',
};

const formatYenValue = (value: number): string =>
  Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(value);

export const PaymentTable = memoNamed('PaymentTable', () => {
  const { repaymentType } = useObservableValue(store$);

  const {
    borrowingBalanceYen,
    interestYen,
    monthlyPaymentTotalYen,
    monthlyPrincipalPaymentYen,
  } = useObservableValue(calculatedValues$);

  const monthlyPayment = useMemo<readonly number[]>(
    () =>
      repaymentType === 'principal-equal-payment'
        ? monthlyPaymentTotalYen
        : monthlyPrincipalPaymentYen,
    [repaymentType, monthlyPaymentTotalYen, monthlyPrincipalPaymentYen]
  );

  const numRows = useMemo(
    () =>
      Math.max(
        borrowingBalanceYen.length,
        interestYen.length,
        monthlyPaymentTotalYen.length
      ),
    [
      borrowingBalanceYen.length,
      interestYen.length,
      monthlyPaymentTotalYen.length,
    ]
  );

  const tableData = useMemo<DeepReadonly<ArrayOfLength<4, string>[]>>(
    () =>
      Arr.seqUnwrapped(numRows).map((i) => [
        i.toString(),
        formatYenValue(borrowingBalanceYen[i] ?? 0),
        formatYenValue(interestYen[i] ?? 0),
        formatYenValue(monthlyPayment[i] ?? 0),
      ]),
    [numRows, borrowingBalanceYen, interestYen, monthlyPayment]
  );

  return (
    <HTMLTable bordered={true} condensed={true} striped={true}>
      <thead>
        <tr>
          <th style={headerCellStyle}>{viewTexts.numPayments}</th>
          <th style={headerCellStyle}>{viewTexts.borrowingBalanceYen}</th>
          <th style={headerCellStyle}>{viewTexts.interestYen}</th>
          <th style={headerCellStyle}>
            {repaymentType === 'principal-equal-payment'
              ? viewTexts.monthlyPaymentsYen(true)
              : viewTexts.monthlyPrincipalPaymentsYen(true)}
          </th>
        </tr>
      </thead>
      <tbody>
        {Arr.map(tableData, (tableRow, rowIdx) => (
          <tr key={rowIdx}>
            {Arr.map(tableRow, (cell, colIdx) => (
              <td key={colIdx} style={dataCellStyle}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  );
});
