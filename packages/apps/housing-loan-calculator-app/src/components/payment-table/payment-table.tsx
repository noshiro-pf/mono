import { HTMLTable } from '@blueprintjs/core';
import { calculatedValues$, store$ } from '../../store';
import { toYen, type Yen } from '../../types';

const headerCellStyle = {
  textAlign: 'center',
} as const satisfies React.CSSProperties;

const dataCellStyle = {
  textAlign: 'right',
} as const satisfies React.CSSProperties;

const formatYenValue = (value: Yen): string =>
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

  const monthlyPayment = useMemo<readonly Yen[]>(
    () =>
      repaymentType === 'principal-equal-payment'
        ? monthlyPaymentTotalYen
        : monthlyPrincipalPaymentYen,
    [repaymentType, monthlyPaymentTotalYen, monthlyPrincipalPaymentYen]
  );

  const numRows = useMemo(
    () =>
      SafeUint.max(
        Arr.length(borrowingBalanceYen),
        Arr.length(interestYen),
        Arr.length(monthlyPaymentTotalYen)
      ),
    [borrowingBalanceYen, interestYen, monthlyPaymentTotalYen]
  );

  const tableData = useMemo<DeepReadonly<ArrayOfLength<4, string>[]>>(
    () =>
      Arr.seq(numRows).map((i) => [
        i.toString(),
        formatYenValue(borrowingBalanceYen[i] ?? toYen(0)),
        formatYenValue(interestYen[i] ?? toYen(0)),
        formatYenValue(monthlyPayment[i] ?? toYen(0)),
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
