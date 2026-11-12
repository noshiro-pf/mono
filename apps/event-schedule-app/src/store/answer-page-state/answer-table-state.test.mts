import { EventSchedule, type Answer } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { Result } from 'ts-data-forge';
import { AnswerFilterState } from '../../functions/index.mjs';
import {
  createAnswerTableStore,
  type AnswerTable,
} from './answer-table-state.mjs';

describe(createAnswerTableStore, () => {
  test('has a row per date of the event', () => {
    const { store } = setup();

    assert.deepStrictEqual(
      store.tableBodyValuesFiltered$
        .getSnapshot()
        .value.map((row) => row.datetimeRange.ymd.date),
      [1, 2],
    );
  });

  test('the rows follow the sort order', () => {
    const { store, setSort } = setup();

    setSort(['date', 'desc']);

    assert.deepStrictEqual(
      store.tableBodyValuesFiltered$
        .getSnapshot()
        .value.map((row) => row.datetimeRange.ymd.date),
      [2, 1],
    );
  });

  test('each toggle flips and reports its new value', () => {
    const { store } = setup();

    assert.isTrue(store.toggleTableIsMinimized());

    assert.isFalse(store.toggleTableIsMinimized());

    assert.isTrue(store.toggleDetailedFilter());
  });

  test('the table starts at the width storage kept and saves each change', () => {
    const { store, saved } = setup({ storedTableIsFullWidth: true });

    assert.isTrue(store.tableIsFullWidth$.getSnapshot().value);

    assert.isFalse(store.toggleTableIsFullWidth());

    assert.isFalse(store.tableIsFullWidth$.getSnapshot().value);

    assert.deepStrictEqual(saved, [false]);
  });

  test('the table starts at the page width when storage has nothing', () => {
    assert.isFalse(
      setup({
        storedTableIsFullWidth: undefined,
      }).store.tableIsFullWidth$.getSnapshot().value,
    );
  });

  test('the table starts at the page width, with a warning, when storage cannot be read', () => {
    const consoleWarn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    onTestFinished(() => {
      consoleWarn.mockRestore();
    });

    assert.isFalse(
      setup({
        storedTableIsFullWidth: 'blocked',
      }).store.tableIsFullWidth$.getSnapshot().value,
    );

    expect(consoleWarn).toHaveBeenCalledExactlyOnceWith(
      'SecurityError: The operation is insecure.',
    );
  });

  test('the toggle still flips, with a warning, when storage cannot be written', () => {
    const consoleWarn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    onTestFinished(() => {
      consoleWarn.mockRestore();
    });

    const { store } = setup({ saveFails: true });

    assert.isTrue(store.toggleTableIsFullWidth());

    assert.isTrue(store.tableIsFullWidth$.getSnapshot().value);

    expect(consoleWarn).toHaveBeenCalledExactlyOnceWith(
      'QuotaExceededError: The quota has been exceeded.',
    );
  });
});

const dayOf = (date: number): unknown =>
  ({
    ymd: { year: 2026, month: 11, date },
    timeRange: {
      start: { hours: 10, minutes: 0 },
      end: { hours: 12, minutes: 0 },
    },
  }) as const;

const setup = ({
  storedTableIsFullWidth,
  saveFails = false,
}: Readonly<{
  /** What storage holds; `'blocked'` for storage that cannot be read. */
  storedTableIsFullWidth?: boolean | 'blocked';
  /** Whether storage refuses each write. */
  saveFails?: boolean;
}> = {}): Readonly<{
  store: AnswerTable;
  setSort: (sort: readonly ['date' | 'score', 'asc' | 'desc']) => void;
  /** Each value the store saved, in order. */
  saved: readonly boolean[];
}> => {
  const [eventSchedule$] = createState<EventSchedule | undefined>(
    EventSchedule.fill({
      title: 'event',
      datetimeRangeList: [dayOf(1), dayOf(2)],
    }),
  );

  const [sortKeyAndOrder$, setSort] = createState<
    readonly ['date' | 'score', 'asc' | 'desc']
  >(['date', 'asc']);

  const [filterState$] = createState(AnswerFilterState.initialState);

  const [answersFiltered$] = createState<readonly Answer[] | undefined>([]);

  const mut_saved: boolean[] = [];

  const store = createAnswerTableStore({
    eventSchedule$,
    filterAndSort: { answersFiltered$, filterState$, sortKeyAndOrder$ },
    storage: {
      restoreTableIsFullWidth: () =>
        storedTableIsFullWidth === 'blocked'
          ? Result.err('SecurityError: The operation is insecure.')
          : Result.ok(storedTableIsFullWidth),
      saveTableIsFullWidth: (value) => {
        if (saveFails) {
          return Result.err('QuotaExceededError: The quota has been exceeded.');
        }

        mut_saved.push(value);

        return Result.ok(undefined);
      },
    },
  });

  return { store, setSort, saved: mut_saved } as const;
};
