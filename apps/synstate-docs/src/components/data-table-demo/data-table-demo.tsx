import * as React from 'react';
import { useObservableValue } from 'synstate-react-hooks';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import * as State from './data-table-demo-state.mjs';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A data table with column filtering, pagination, and debounced filter inputs,
 * built entirely with SynState observables.
 *
 * Observable dependency graph (parents ─▶ child):
 *
 * ```
 * filterName, filterEmail, filterGender ─(debounce)─▶ filteredRows
 * filteredRows, itemsPerPage                  ─▶ pageLength
 * filteredRows, itemsPerPage                  ─▶ pageReset (mapTo 1)
 * pageRequest, pageReset, pageLength          ─▶ currentPage (merge, clamp)
 * filteredRows, currentPage, itemsPerPage     ─▶ tableView
 * ```
 *
 * `filteredRows`, `pageLength`, `currentPage`, and `tableView` share common
 * ancestors — multiple overlapping diamonds. SynState's atomic propagation
 * ensures `tableView` always sees a consistent snapshot.
 */
export const DataTableDemo = React.memo(() => {
  // Subscribe to source values (for input display — immediate, not debounced)
  const filterValues = useObservableValue(State.filterValuesState);

  const itemsPerPage = useObservableValue(State.itemsPerPageNormalized);

  // Subscribe to derived values (driven by the observable graph)
  const pageLength = useObservableValue(State.pageLengthState);

  const currentPage = useObservableValue(State.currentPageState);

  const tableView = useObservableValue(State.tableViewState);

  return (
    <div style={wrapperStyle}>
      <div style={controlsRowStyle}>
        <label style={controlLabelStyle}>
          {'Items / page: '}
          <input
            max={50}
            min={1}
            style={numberInputStyle}
            type={'number'}
            value={itemsPerPage}
            onChange={State.handleItemsPerPageChange}
          />
        </label>

        <label style={controlLabelStyle}>
          {'Page: '}
          <input
            max={pageLength}
            min={1}
            style={numberInputStyle}
            type={'number'}
            value={currentPage}
            onChange={State.handleCurrentPageChange}
          />
          {` / ${pageLength.toString()}`}
        </label>

        <span style={rangeStyle}>
          {`(${tableView.rangeStart.toString()}–${tableView.rangeEnd.toString()}) of ${tableView.totalFiltered.toString()} items`}
        </span>
      </div>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <colgroup>
            <col style={noColumnStyle} />
            <col style={fullNameColumnStyle} />
            <col style={emailColumnStyle} />
            <col style={genderColumnStyle} />
          </colgroup>
          <thead>
            <tr>
              <th style={thStyle}>{'No.'}</th>
              {columnKeys.map((key) => (
                <th key={key} style={thStyle}>
                  <div>{columnLabels[key]}</div>
                  <input
                    placeholder={'filter…'}
                    style={filterInputStyle}
                    type={'text'}
                    value={filterValues[key]}
                    onChange={State.handleFilterChange[key]}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Arr.isEmpty(tableView.slicedRows) ? (
              <tr>
                <td colSpan={4} style={emptyCellStyle}>
                  {'No matching rows'}
                </td>
              </tr>
            ) : (
              tableView.slicedRows.map((row, i) => (
                <tr
                  key={row.email}
                  style={i % 2 === 0 ? evenRowStyle : undefined}
                >
                  <td style={tdStyle}>{tableView.startIdx + i + 1}</td>
                  <td style={tdStyle}>{row.fullName}</td>
                  <td style={tdStyle}>{row.email}</td>
                  <td style={tdStyle}>{row.gender}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

DataTableDemo.displayName = 'DataTableDemo';

// ---------------------------------------------------------------------------
// Columns (the observable graph is `data-table-demo-state.mts`)
// ---------------------------------------------------------------------------

const columnKeys = ['fullName', 'email', 'gender'] as const;

const columnLabels: ReadonlyRecord<(typeof columnKeys)[number], string> = {
  fullName: 'FullName',
  email: 'Email Address',
  gender: 'Gender',
} as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  lineHeight: 1.5,
  color: 'var(--sl-color-text, #1a1a2e)',
  margin: '24px 0',
} as const;

const controlsRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
  marginBottom: '12px',
} as const;

const controlLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '13px',
  marginTop: 0, // overrides astro starlight default style
} as const;

const numberInputStyle: React.CSSProperties = {
  width: '56px',
  padding: '2px 6px',
  border: '1px solid var(--sl-color-gray-5, #c9c9c9)',
  borderRadius: '4px',
  fontSize: '13px',
  background: 'var(--sl-color-bg, #fff)',
  color: 'var(--sl-color-text, #1a1a2e)',
} as const;

const rangeStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--sl-color-gray-3, #6b7280)',
} as const;

const tableWrapperStyle: React.CSSProperties = {
  overflowX: 'auto',
  overflowY: 'auto',
  maxHeight: '65vh',
} as const;

const noColumnStyle: React.CSSProperties = { width: '8%' } as const;

const fullNameColumnStyle: React.CSSProperties = { width: '30%' } as const;

const emailColumnStyle: React.CSSProperties = { width: '42%' } as const;

const genderColumnStyle: React.CSSProperties = { width: '20%' } as const;

const tableStyle: React.CSSProperties = {
  width: '100%',
  tableLayout: 'fixed',
  borderCollapse: 'collapse',
  border: '1px solid var(--sl-color-gray-5, #c9c9c9)',
} as const;

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  borderBottom: '2px solid var(--sl-color-gray-5, #c9c9c9)',
  background: 'var(--sl-color-bg-nav, #f5f5f5)',
  fontWeight: 600,
  fontSize: '13px',
  verticalAlign: 'top',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
} as const;

const filterInputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '4px',
  padding: '3px 6px',
  border: '1px solid var(--sl-color-gray-5, #c9c9c9)',
  borderRadius: '3px',
  fontSize: '12px',
  background: 'var(--sl-color-bg, #fff)',
  color: 'var(--sl-color-text, #1a1a2e)',
  boxSizing: 'border-box',
} as const;

const tdStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid var(--sl-color-gray-6, #e5e5e5)',
  fontSize: '13px',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
} as const;

const evenRowStyle: React.CSSProperties = {
  background: 'var(--sl-color-bg-nav, rgba(0,0,0,0.02))',
} as const;

const emptyCellStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: 'center',
  color: 'var(--sl-color-gray-3, #6b7280)',
  padding: '24px 10px',
} as const;
