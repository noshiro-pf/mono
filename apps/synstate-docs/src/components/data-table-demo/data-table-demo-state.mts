// The demo's observable graph: module-level, a singleton for this demo, which
// the component reads as `State`.
import type * as React from 'react';
import {
  createState,
  createValueEmitter,
  debounce,
  derive,
  type InitializedObservable,
  map,
  mapTo,
  merge,
  withInitialValue,
} from 'synstate';
import { Arr, asPositiveInt16, Num, Result } from 'ts-data-forge';
import type { PositiveInt16 } from 'ts-type-forge';
import { sampleCsvRows } from './sample-data.mjs';

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

export const filterValuesState = derive(
  [filterNameState, filterEmailState, filterGenderState],
  (fullName, email, gender) => ({ fullName, email, gender }),
);

const [itemsPerPageInputState, setItemsPerPageInput] = createState(10);

export const itemsPerPageNormalized: InitializedObservable<PositiveInt16> =
  itemsPerPageInputState.pipe(
    map((v) => asPositiveInt16(Num.roundToInt(Num.clamp(10, 50)(v)))),
  );

// An event, not a state: asking for the page held before a reset again must
// reach the table.
const [pageRequest, requestPage] = createValueEmitter<number>();

// Derived: filtered rows (the three filters are debounced together)
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
export const pageLengthState = derive(
  [filteredRowsState, itemsPerPageNormalized],
  // eslint-disable-next-line total-functions/no-partial-division
  (rows, perPage) => Math.max(1, Math.ceil(rows.length / perPage)),
);

// Back to page 1 whenever the rows or the page size change
const pageReset = merge([filteredRowsState, itemsPerPageNormalized]).pipe(
  mapTo(1),
);

// Derived: current page — the latest request or reset, clamped to valid range
export const currentPageState = derive(
  [merge([pageRequest, pageReset]).pipe(withInitialValue(1)), pageLengthState],
  (page, maxPage) => Math.max(1, Math.min(page, maxPage)),
);

// Output: table view (combines all derived values atomically — no glitch)
type TableView = Readonly<{
  slicedRows: readonly Row[];
  startIdx: number;
  rangeStart: number;
  rangeEnd: number;
  totalFiltered: number;
}>;

export const tableViewState = derive(
  [filteredRowsState, currentPageState, itemsPerPageNormalized],
  (rows, page, perPage): TableView => {
    const startIdx = (page - 1) * perPage;

    return {
      slicedRows: rows.slice(startIdx, startIdx + perPage),
      startIdx,
      rangeStart: Arr.isEmpty(rows) ? 0 : startIdx + 1,
      rangeEnd: Math.min(startIdx + perPage, rows.length),
      totalFiltered: rows.length,
    };
  },
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
};

export const handleCurrentPageChange = (
  e: Readonly<React.ChangeEvent<HTMLInputElement>>,
): void => {
  const numValue = Num.safeParseFloat(e.target.value);

  const v = Math.max(
    1,
    Result.isErr(numValue) ? 1 : Num.roundToInt(numValue.value),
  );

  requestPage(v);
};
