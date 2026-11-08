import {
  combine,
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

// embed-sample-code-ignore-below
// cspell:ignore unstub
if (import.meta.vitest !== undefined) {
  test('a data table with filters', async () => {
    vi.useFakeTimers();

    const allRows: readonly Row[] = Array.from({ length: 25 }, (_, i) => ({
      name: i % 2 === 0 ? `Alice ${i}` : `Bob ${i}`,
      email: `user${i}@example.com`,
      gender: i % 3 === 0 ? 'female' : 'male',
    }));

    vi.stubGlobal('fetch', () => Promise.resolve(Response.json(allRows)));

    const mut_rendered: (readonly Row[])[] = [];

    const renderTable = (rows: readonly Row[]): void => {
      mut_rendered.push(rows);
    };

    const mut_errors: unknown[] = [];

    const renderError = (error: unknown): void => {
      mut_errors.push(error);
    };

    try {
      // embed-sample-code-ignore-above
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

          /* embed-sample-code-ignore-this-line */ /* eslint-disable-next-line total-functions/no-unsafe-type-assertion */ // @ts-expect-error `Response.json()` is `MutableJsonValue` under the strict standard library, whose arrays are mutable, so a cast to a readonly array is not one TypeScript accepts. The cast is still what a reader would write; this line is stripped from the embedded output.
          return r.json() as Promise<readonly Row[]>;
        }),
      );

      const filters = combine([filterName, filterEmail, filterGender]).pipe(
        debounce(300),
      );

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

      const pageLength = derive(
        [filteredRows, itemsPerPage],
        (rows, perPage) =>
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

      // embed-sample-code-ignore-below

      await vi.advanceTimersByTimeAsync(0);

      assert.deepStrictEqual(
        mut_rendered.at(-1)?.map((row) => row.name),
        Array.from({ length: 10 }, (_, i) =>
          i % 2 === 0 ? `Alice ${i}` : `Bob ${i}`,
        ),
      );

      requestPage(3);

      assert.strictEqual(currentPage.peek(), 3);

      assert.strictEqual(mut_rendered.at(-1)?.length, 5);

      setFilterName('Alice');

      setFilterEmail('');

      setFilterGender('female');

      // The filters wait for the debounce, and so does the reset.
      assert.strictEqual(currentPage.peek(), 3);

      await vi.advanceTimersByTimeAsync(300);

      // Alice 0, 6, 12, 18, 24.
      assert.strictEqual(pageLength.peek(), 1);

      assert.strictEqual(currentPage.peek(), 1);

      assert.deepStrictEqual(
        mut_rendered.at(-1)?.map((row) => row.name),
        ['Alice 0', 'Alice 6', 'Alice 12', 'Alice 18', 'Alice 24'],
      );

      setItemsPerPage(2);

      requestPage(2);

      assert.deepStrictEqual(
        mut_rendered.at(-1)?.map((row) => row.name),
        ['Alice 12', 'Alice 18'],
      );

      assert.deepStrictEqual(mut_errors, []);
    } finally {
      vi.unstubAllGlobals();

      vi.useRealTimers();
    }
  });
}
