import { HTMLTable } from '@blueprintjs/core';
import { calculatedValues$, store$ } from '../../store';

const headerCellStyle: React.CSSProperties = {
  textAlign: 'center',
} as const;

const dataCellStyle: React.CSSProperties = {
  textAlign: 'right',
} as const;

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
