/* eslint-disable total-functions/no-partial-division */
/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable @stylistic/padding-line-between-statements */
// embed-sample-code-ignore-above

import {
  combine,
  createState,
  debounce,
  fromPromise,
  map,
  mapTo,
  merge,
} from 'synstate';
import { Result } from 'ts-data-forge';

/* embed-sample-code-ignore-this-line */ // prettier-ignore
/* embed-sample-code-ignore-this-line */ const renderTable = (_rows: readonly Row[]): void => {};
/* embed-sample-code-ignore-this-line */ // prettier-ignore
/* embed-sample-code-ignore-this-line */ const renderError = (_error: unknown): void => {};

// Source state — each input is an independent Observable
const [filterName, setFilterName] = createState('');
const [filterEmail, setFilterEmail] = createState('');
const [filterGender, setFilterGender] = createState('');
const [itemsPerPage, setItemsPerPage] = createState(10);
const [pageInput, setPageInput] = createState(1);

// Fetch table data from server
// fromPromise emits Result.Ok(rows) on success, Result.Err(error) on failure
const tableDataResult = fromPromise(
  fetch('/api/rows').then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<readonly Row[]>;
  }),
);

// Derived: debounced filters → filtered rows (only when data loaded successfully)
const headerValues = combine([filterName, filterEmail, filterGender]).pipe(
  debounce(300),
);

const filteredRows = combine([headerValues, tableDataResult]).pipe(
  map(([filters, result]) =>
    Result.isErr(result)
      ? [] // show empty table on error
      : result.value.filter(
          (row) =>
            row.name.includes(filters[0]) &&
            row.email.includes(filters[1]) &&
            row.gender.includes(filters[2]),
        ),
  ),
);

// Error state is also a derived value — no separate error variable needed
const fetchError = tableDataResult.pipe(
  map((result) => (Result.isErr(result) ? result.value : undefined)),
);

// Derived: page count
const pageLength = combine([filteredRows, itemsPerPage]).pipe(
  map(([rows, perPage]) => Math.ceil(rows.length / perPage)),
);

// Reset page to 1 whenever pageLength changes (filters or itemsPerPage changed)
const pageReset = pageLength.pipe(mapTo(1));

// Derived: current page — merge user input and auto-reset, then clamp
const currentPage = merge([
  pageReset,
  combine([pageInput, pageLength]).pipe(
    map(([page, maxPage]) => Math.max(1, Math.min(page, maxPage))),
  ),
]);

// Output: visible table rows
const tableSliced = combine([filteredRows, currentPage, itemsPerPage]).pipe(
  map(([rows, page, perPage]) => {
    const start = (page - 1) * perPage;
    return rows.slice(start, start + perPage);
  }),
);

// Subscribe to render — called automatically when any dependency changes
tableSliced.subscribe(renderTable);

// Subscribe to errors — renderError is called only when the error state changes
fetchError.subscribe((err) => {
  renderError(err);
});
// embed-sample-code-ignore-below

type Row = Readonly<{
  name: string;
  email: string;
  gender: string;
}>;

const noop = (..._args: readonly unknown[]): void => {};

noop(
  setFilterName,
  setFilterEmail,
  setFilterGender,
  setItemsPerPage,
  setPageInput,
  renderTable,
  fetchError,
  pageLength,
  currentPage,
);

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    assert.isTrue(true);
  });
}
