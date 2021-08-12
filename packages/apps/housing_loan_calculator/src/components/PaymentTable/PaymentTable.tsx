import { HTMLTable } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { ArrayOfLength, DeepReadonly, uint32 } from '@noshiro/ts-utils';
import { IList, seq } from '@noshiro/ts-utils';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { viewTexts } from '../../constants';
import type { RepaymentType } from '../../types';

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

type Props = Readonly<{
  repaymentType: RepaymentType;
  borrowingBalanceYen: readonly number[]; // 借入残高（円）
  interestYen: readonly number[]; // 利息（円）
  monthlyPaymentTotalYen: readonly number[]; // 月支払い額（円）
  monthlyPrincipalPaymentYen: readonly number[]; // 月々の元金支払い額（円）
}>;

export const PaymentTable = memoNamed<Props>(
  'PaymentTable',
  ({
    repaymentType,
    borrowingBalanceYen,
    interestYen,
    monthlyPaymentTotalYen,
    monthlyPrincipalPaymentYen,
  }) => {
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
        ) as uint32,
      [
        borrowingBalanceYen.length,
        interestYen.length,
        monthlyPaymentTotalYen.length,
      ]
    );

    const tableData = useMemo<DeepReadonly<ArrayOfLength<4, string>[]>>(
      () =>
        seq(numRows).map((i) => [
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
          {IList.map(tableData, (tableRow, rowIdx) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={rowIdx}>
              {IList.map(tableRow, (cell, colIdx) => (
                <td key={colIdx} style={dataCellStyle}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    );
  }
);
