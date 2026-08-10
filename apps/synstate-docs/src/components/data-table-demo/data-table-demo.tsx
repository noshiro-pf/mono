import * as React from 'react';
import {
  combine,
  createState,
  debounce,
  type InitializedObservable,
  map,
} from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import { Arr, asPositiveInt16, Num, Result } from 'ts-data-forge';
import { type PositiveInt16, type ReadonlyRecord } from 'ts-type-forge';
import { sampleCsvRows } from './sample-data.mjs';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A data table with column filtering, pagination, and debounced filter inputs,
 * built entirely with SynState observables.
 *
 * Observable dependency graph:
 *
 * ```
 * filterName   ─(debounce)─┐
 * filterEmail  ─(debounce)─┼─▶ filteredRows ─┬─▶ pageLength ──▶ currentPage
 * filterGender ─(debounce)─┘        │        │                       │
 *                                   │        │                       │
 * itemsPerPage ─────────────────────┼────────┘                       │
 *       │                           │                                │
 *       └───────────────────────────┼────────────────────────────────┤
 *                                   └──────────▶ tableView ◀─────────┘
 * pageInput ──────────────────────────────────────────────────▶ (currentPage)
 * ```
 *
 * `filteredRows`, `pageLength`, `currentPage`, and `tableView` share
 * common ancestors — multiple overlapping diamonds. SynState's atomic
 * propagation ensures `tableView` always sees a consistent snapshot.
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
          {` / ${String(pageLength)}`}
        </label>

        <span style={rangeStyle}>
          {`(${String(tableView.rangeStart)}–${String(tableView.rangeEnd)}) of ${String(tableView.totalFiltered)} items`}
        </span>
      </div>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '42%' }} />
            <col style={{ width: '20%' }} />
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
                <tr key={i} style={i % 2 === 0 ? evenRowStyle : undefined}>
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
// Observable graph (module-level — singleton for this demo)
// ---------------------------------------------------------------------------

const columnKeys = ['fullName', 'email', 'gender'] as const;

const columnLabels: ReadonlyRecord<(typeof columnKeys)[number], string> = {
  fullName: 'FullName',
  email: 'Email Address',
  gender: 'Gender',
} as const;

namespace State {
  type Row = Readonly<{ fullName: string; email: string; gender: string }>;

  const allRows: readonly Row[] = sampleCsvRows.map(
    ([fullName, email, gender]) => ({
      fullName,
      email,
      gender,
    }),
  );

  const DEBOUNCE_MS = 300;

  // Sources
  const [filterNameState, setFilterName] = createState('');

  const [filterEmailState, setFilterEmail] = createState('');

  const [filterGenderState, setFilterGender] = createState('');

  export const filterValuesState = combine([
    filterNameState,
    filterEmailState,
    filterGenderState,
  ]).pipe(map(([fullName, email, gender]) => ({ fullName, email, gender })));

  const [itemsPerPageInputState, setItemsPerPageInput] = createState(10);

  export const itemsPerPageNormalized: InitializedObservable<PositiveInt16> =
    itemsPerPageInputState.pipe(
      map((v) => asPositiveInt16(Num.roundToInt(Num.clamp(10, 50)(v)))),
    );

  const [pageInputState, setPageInput] = createState(1);

  // Derived: filtered rows (each filter is debounced independently)
  const filteredRowsState = filterValuesState.pipe(debounce(DEBOUNCE_MS)).pipe(
    map(({ fullName, email, gender }) => {
      const nameLower = fullName.toLowerCase();

      const emailLower = email.toLowerCase();

      const genderLower = gender.toLowerCase();

      return allRows.filter(
        (row) =>
          row.fullName.toLowerCase().includes(nameLower) &&
          row.email.toLowerCase().includes(emailLower) &&
          row.gender.toLowerCase().includes(genderLower),
      );
    }),
  );

  // Derived: page length
  export const pageLengthState = combine([
    filteredRowsState,
    itemsPerPageNormalized,
  ]).pipe(
    // eslint-disable-next-line total-functions/no-partial-division
    map(([rows, perPage]) => Math.max(1, Math.ceil(rows.length / perPage))),
  );

  // Derived: current page (clamped to valid range)
  export const currentPageState = combine([
    pageInputState,
    pageLengthState,
  ]).pipe(map(([input, maxPage]) => Math.max(1, Math.min(input, maxPage))));

  // Output: table view (combines all derived values atomically — no glitch)
  type TableView = Readonly<{
    slicedRows: readonly Row[];
    startIdx: number;
    rangeStart: number;
    rangeEnd: number;
    totalFiltered: number;
  }>;

  export const tableViewState = combine([
    filteredRowsState,
    currentPageState,
    itemsPerPageNormalized,
  ]).pipe(
    map(([rows, page, perPage]): TableView => {
      const startIdx = (page - 1) * perPage;

      return {
        slicedRows: rows.slice(startIdx, startIdx + perPage),
        startIdx,
        rangeStart: Arr.isEmpty(rows) ? 0 : startIdx + 1,
        rangeEnd: Math.min(startIdx + perPage, rows.length),
        totalFiltered: rows.length,
      };
    }),
  );

  // ---------------------------------------------------------------------------
  // Event handlers (module-level — stable references, no useCallback needed)
  // ---------------------------------------------------------------------------

  export const handleFilterChange = {
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    fullName: (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterName(e.target.value);
    },
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    email: (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterEmail(e.target.value);
    },
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    gender: (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterGender(e.target.value);
    },
  } as const;

  export const handleItemsPerPageChange = (
    e: Readonly<React.ChangeEvent<HTMLInputElement>>,
  ): void => {
    const numValue = Num.safeParseFloat(e.target.value);

    const v = Math.max(
      1,
      Math.min(50, Result.isErr(numValue) ? 1 : numValue.value),
    );

    setItemsPerPageInput(v);

    setPageInput(1);
  };

  export const handleCurrentPageChange = (
    e: Readonly<React.ChangeEvent<HTMLInputElement>>,
  ): void => {
    const numValue = Num.safeParseFloat(e.target.value);

    const v = Math.max(1, Result.isErr(numValue) ? 1 : numValue.value);

    setPageInput(v);
  };
}

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
