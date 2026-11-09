---
title: Declarative state
description: Declare what depends on what, and let the graph keep it up to date — from a chain of maps to a debounced search and a data table with filters.
---

synstate-next is a library for **reactive programming**: you declare how values depend on each other, and the library keeps them in step when one of them changes.

## The spreadsheet analogy

In a spreadsheet, when you change cell A1, every cell that refers to A1 is recomputed. You never recalculate B1 or C1 by hand: the spreadsheet knows the dependencies and the order to follow them in. Reactive programming brings that to application code. Instead of remembering which variables to update when something changes, you declare the dependencies once.

## You already know the pattern

React's `useMemo` declares a value that depends on others:

```text
const [count, setCount] = React.useState(0);
const doubled = React.useMemo(() => count * 2, [count]);
const quadrupled = React.useMemo(() => doubled * 2, [doubled]);
```

The same with synstate-next:

```tsx
import { createState, map } from 'synstate-next';

const [count, setCount] = createState(0);

const doubled = count.pipe(map((n) => n * 2));

const quadrupled = doubled.pipe(map((n) => n * 2));

setCount(3);

assert.strictEqual(quadrupled.value, 12);
```

The mental model is the same, but the mechanism is not. React re-runs the component and uses the memoized result when the listed dependencies did not change; synstate-next pushes a change from the state that was written to exactly the values that depend on it, and nothing else runs.

|                     | React `useMemo`                         | synstate-next                              |
| :------------------ | :-------------------------------------- | :----------------------------------------- |
| **Update model**    | Re-render, then reuse what was memoized | Push: only what depends on the change runs |
| **Scope**           | One component                           | The whole application                      |
| **Async operators** | None                                    | `debounce`, `throttle`, `switchMap`, …     |
| **Lifetime**        | The component                           | The owner it was created in                |

## Precise control over asynchronous behavior

Debouncing a search box and fetching only the latest query takes a timer, an `AbortController`, an effect and its cleanup in a React component, and each is a place for a race or a stale closure. As a pipeline, each concern is one operator:

```tsx
import {
    createState,
    debounce,
    fromAbortablePromise,
    just,
    switchMap,
} from 'synstate-next';
import { Result } from 'ts-std-forge';

const [query, setQuery] = createState('');

const results = query
    // Wait for typing to pause.
    .pipe(debounce(300))
    .pipe(
        // A new query disposes the previous request, which aborts it; so does
        // clearing the box, which follows an empty answer instead.
        switchMap((q) =>
            q.trim() === ''
                ? just(Result.ok<readonly string[]>([]))
                : fromAbortablePromise(async (signal) => {
                      const params = new URLSearchParams({ q });

                      return fetch(`/api/search?${params.toString()}`, {
                          signal,
                      }).then(
                          async (r) => r.json() as Promise<readonly string[]>,
                      );
                  }),
        ),
    );
```

`fromAbortablePromise` hands `fetch` an `AbortSignal`. When a new query arrives, `switchMap` disposes the request it was following, which aborts it, so an old answer can never overwrite a newer one. An empty box is a value like any other: it follows `just`, an answer that is already there, so it makes no request and still disposes the one in flight. Dropping it with `filter` before `switchMap` would leave that request running, and its answer would fill the results of a box that is now empty.

## A motivating example: a data table with filters

A table with a text filter per column, a page size, and pages. When a filter changes, the table waits for typing to pause, filters the rows, recounts the pages, goes back to page 1 and slices the rows of that page. Written imperatively, all of that is one `updateTable()` function whose lines have to stay in dependency order, called from every event handler, with "back to page 1" repeated in each of them and the debounce bolted on the side.

Declared as a graph:

```tsx
import {
    createState,
    createValueEmitter,
    debounce,
    derive,
    fromPromise,
    map,
    merge,
} from 'synstate-next';
import { Num } from 'ts-data-forge';
import { Result } from 'ts-std-forge';

type Row = Readonly<{ name: string; email: string; gender: string }>;

// Each input is a state of its own.
const [filterName, setFilterName] = createState('');

const [filterEmail, setFilterEmail] = createState('');

const [filterGender, setFilterGender] = createState('');

const [itemsPerPage, setItemsPerPage] = createState(10);

// Asking for a page is an event: asking for page 2 again after a reset
// has to reach the table, which a state would drop as unchanged.
const [pageRequest, requestPage] = createValueEmitter<number>();

// `Result.ok(rows)` once the rows arrive, `Result.err(error)` if not.
const tableData = fromPromise(
    fetch('/api/rows').then(async (r) => {
        if (!r.ok) {
            throw new Error(`HTTP ${r.status}`);
        }

        return r.json() as Promise<readonly Row[]>;
    }),
);

const filters = derive(
    [filterName, filterEmail, filterGender],
    (name, email, gender) => [name, email, gender] as const,
).pipe(debounce(300));

const filteredRows = derive(
    [filters, tableData],
    ([name, email, gender], result) =>
        Result.isErr(result)
            ? []
            : result.value.filter(
                  (row) =>
                      row.name.includes(name) &&
                      row.email.includes(email) &&
                      row.gender.includes(gender),
              ),
);

const fetchError = tableData.pipe(
    map((result) => (Result.isErr(result) ? result.value : undefined)),
);

const pageLength = derive([filteredRows, itemsPerPage], (rows, perPage) =>
    Num.isNonZero(perPage)
        ? Math.max(1, Math.ceil(Num.div(rows.length, perPage)))
        : 1,
);

// Back to page 1 whenever the rows or the page size change. An event, so
// `equals: () => false`: a reset to 1 when 1 is held still counts.
const pageReset = merge([filteredRows, itemsPerPage]).pipe(
    map(() => 1, { equals: () => false }),
);

// The latest request or reset, clamped to the page count.
const currentPage = derive(
    [merge([pageRequest, pageReset]), pageLength],
    (page, maxPage) => Math.max(1, Math.min(page, maxPage)),
);

const tableSliced = derive(
    [filteredRows, currentPage, itemsPerPage],
    (rows, page, perPage) => {
        const start = (page - 1) * perPage;

        return rows.slice(start, start + perPage);
    },
);

// `renderTable` and `renderError` stand for the view.
// Runs once every value above is up to date, consistent with each other.
tableSliced.subscribe(renderTable);

fetchError.subscribe((error) => {
    if (error !== undefined) {
        renderError(error);
    }
});
```

- **The dependencies are in the code.** `pageLength` depends on `filteredRows` and `itemsPerPage`, and says so.
- **The order is the graph's.** Nothing can be computed before what it reads: the depth of each node puts it after its parents.
- **The reset is in one place.** `pageReset` says what sends the table back to page 1: new rows (after the debounce, or when the data arrives) and a new page size. The reset waits for the debounce with no extra code. The requested page is an event, so asking again for the page that was held before a reset still reaches the table.
- **Fetching and errors are values.** `fromPromise` puts the server's answer into the graph as a `Result`, and `fetchError` is one more derived value.
- **Every subscriber sees one consistent table.** `tableSliced`'s subscriber runs once every value of the update is up to date, with the filters, the page count and the page all from the same update.
- **Adding a value is one more `derive`.** Nothing that exists changes.

## Next steps

- [State and writes](/mono/synstate-next/guides/state-and-writes/) goes through `createState`, `createReducer` and the event emitters.
- [How an update propagates](/mono/synstate-next/internals/how-an-update-propagates/) shows how the graph above is kept consistent.
