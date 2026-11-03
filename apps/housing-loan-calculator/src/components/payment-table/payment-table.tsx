import { HtmlTable } from 'blueprint-synstate';
import { constant, derive, For, mapBindable, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { dict } from '../../constants/index.mjs';
import { loanStore } from '../../store/index.mjs';
import { paymentTableRows } from './payment-table-rows.mjs';

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

// Inline, as Blueprint's `table.bp6-html-table td` outranks a single class.
const headerCellStyle = constant('text-align: center');

const dataCellStyle = constant('text-align: right');

const repaymentType$ = mapBindable(loanStore.inputs, (s) => s.repaymentType);

// From the repayment type alone, so that a change to another input, which
// starts a calculation, does not format the rows again before its result.
const rows = derive(
  [repaymentType$, loanStore.calculatedValues],
  paymentTableRows,
);
