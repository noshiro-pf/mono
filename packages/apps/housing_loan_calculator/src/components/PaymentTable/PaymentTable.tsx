import { HTMLTable } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import { seq } from '@mono/ts-utils';
import React, { CSSProperties, useMemo } from 'react';
import { viewTexts } from '../../constants/view-texts';
import { RepaymentType } from '../../types/enum/repayment-type';

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

interface Props {
  repaymentType: RepaymentType;
  borrowingBalanceYen: number[]; // 借入残高（円）
  interestYen: number[]; // 利息（円）
  monthlyPaymentTotalYen: number[]; // 月支払い額（円）
  monthlyPrincipalPaymentYen: number[]; // 月々の元金支払い額（円）
}

export const PaymentTable = memoNamed<Props>(
  'PaymentTable',
  ({
    repaymentType,
    borrowingBalanceYen,
    interestYen,
    monthlyPaymentTotalYen,
    monthlyPrincipalPaymentYen,
  }) => {
    const monthlyPayment = useMemo<number[]>(
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

    const tableData = useMemo<string[][]>(
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
      <HTMLTable condensed={true} striped={true} bordered={true}>
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
          {tableData.map((tableRow, rowidx) => (
            <tr key={rowidx}>
              {tableRow.map((cell, colidx) => (
                <td style={dataCellStyle} key={colidx}>
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
