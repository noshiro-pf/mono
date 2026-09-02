import { HTMLTable } from '@blueprintjs/core';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { useObservableValue } from 'synstate-react-hooks';
import { Arr, Uint32 } from 'ts-data-forge';
import { type DeepReadonly, type FixedLengthTuple } from 'ts-type-forge';
import { dict } from '../../constants/index.mjs';
import { calculatedValues$, store$ } from '../../store/index.mjs';
import { Yen } from '../../types/index.mjs';

const headerCellStyle = {
  textAlign: 'center',
} as const satisfies React.CSSProperties;

const dataCellStyle = {
  textAlign: 'right',
} as const satisfies React.CSSProperties;

const yenFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
});

const formatYenValue = (value: Yen): string => yenFormatter.format(value);

export const PaymentTable = memoNamed('PaymentTable', () => {
  const { repaymentType } = useObservableValue(store$);

  const {
    borrowingBalanceYen,
    interestYen,
    monthlyPaymentTotalYen,
    monthlyPrincipalPaymentYen,
  } = useObservableValue(calculatedValues$);

  const monthlyPayment = React.useMemo<readonly Yen[]>(
    () =>
      repaymentType === 'principal-equal-payment'
        ? monthlyPaymentTotalYen
        : monthlyPrincipalPaymentYen,
    [repaymentType, monthlyPaymentTotalYen, monthlyPrincipalPaymentYen],
  );

  const numRows = React.useMemo(
    () =>
      Uint32.max(
        Arr.length(borrowingBalanceYen),
        Arr.length(interestYen),
        Arr.length(monthlyPaymentTotalYen),
      ),
    [borrowingBalanceYen, interestYen, monthlyPaymentTotalYen],
  );

  const tableData = React.useMemo<DeepReadonly<FixedLengthTuple<4, string>[]>>(
    () =>
      Arr.seq(numRows).map((i) => [
        i.toString(),
        formatYenValue(borrowingBalanceYen[i] ?? Yen.cast(0)),
        formatYenValue(interestYen[i] ?? Yen.cast(0)),
        formatYenValue(monthlyPayment[i] ?? Yen.cast(0)),
      ]),
    [numRows, borrowingBalanceYen, interestYen, monthlyPayment],
  );

  return (
    <HTMLTable bordered compact striped>
      <thead>
        <tr>
          <th style={headerCellStyle}>{dict.numPayments}</th>
          <th style={headerCellStyle}>{dict.borrowingBalanceYen}</th>
          <th style={headerCellStyle}>{dict.interestYen}</th>
          <th style={headerCellStyle}>
            {repaymentType === 'principal-equal-payment'
              ? dict.monthlyPaymentsYen(true)
              : dict.monthlyPrincipalPaymentsYen(true)}
          </th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((tableRow, rowIdx) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={rowIdx}>
            {tableRow.map((cell, colIdx) => (
              // eslint-disable-next-line react/no-array-index-key
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
