import { HtmlTable } from 'blueprint-synstate';
import { constant, derive, For, mapBindable, type JSX } from 'synstate-dom';
import { Arr, Uint32 } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import { dict } from '../../constants/index.mjs';
import { loanStore } from '../../store/index.mjs';
import {
  Yen,
  type CalculatedValues,
  type RepaymentType,
} from '../../types/index.mjs';
import { formatYen } from '../../utils/index.mjs';

export const PaymentTable = (): JSX.Element => (
  <HtmlTable bordered compact striped>
    <thead>
      <tr>
        <th style={headerCellStyle}>{constant(dict.numPayments)}</th>
        <th style={headerCellStyle}>{constant(dict.borrowingBalanceYen)}</th>
        <th style={headerCellStyle}>{constant(dict.interestYen)}</th>
        <th style={headerCellStyle}>
          {mapBindable(repaymentType$, (type) =>
            type === 'principal-equal-payment'
              ? dict.monthlyPaymentsYen(true)
              : dict.monthlyPrincipalPaymentsYen(true),
          )}
        </th>
      </tr>
    </thead>
    <tbody>
      <For items={rows} key={(_, index) => index}>
        {(row$) => (
          <tr>
            {Arr.seq(4).map((column) => (
              <td style={dataCellStyle}>
                {mapBindable(row$, (row) => row[column])}
              </td>
            ))}
          </tr>
        )}
      </For>
    </tbody>
  </HtmlTable>
);

type Row = FixedLengthTuple<4, string>;

// Inline, as Blueprint's `table.bp6-html-table td` outranks a single class.
const headerCellStyle = constant('text-align: center');

const dataCellStyle = constant('text-align: right');

const rowsOf = (
  repaymentType: RepaymentType,
  {
    borrowingBalanceYen,
    interestYen,
    monthlyPaymentTotalYen,
    monthlyPrincipalPaymentYen,
  }: CalculatedValues,
): readonly Row[] => {
  const monthlyPayment =
    repaymentType === 'principal-equal-payment'
      ? monthlyPaymentTotalYen
      : monthlyPrincipalPaymentYen;

  const numRows = Uint32.max(
    Arr.length(borrowingBalanceYen),
    Arr.length(interestYen),
    Arr.length(monthlyPaymentTotalYen),
  );

  return Arr.seq(numRows).map((i) => [
    i.toString(),
    formatYen(borrowingBalanceYen[i] ?? Yen.cast(0)),
    formatYen(interestYen[i] ?? Yen.cast(0)),
    formatYen(monthlyPayment[i] ?? Yen.cast(0)),
  ]);
};

const repaymentType$ = mapBindable(loanStore.inputs, (s) => s.repaymentType);

// From the repayment type alone, so that a change to another input, which
// starts a calculation, does not format the rows again before its result.
const rows = derive([repaymentType$, loanStore.calculatedValues], rowsOf);
