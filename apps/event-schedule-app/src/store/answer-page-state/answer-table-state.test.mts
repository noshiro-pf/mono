import { EventSchedule, type Answer } from 'event-schedule-app-shared';
import { createState } from 'synstate';
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
});

const setup = (): Readonly<{
  store: AnswerTable;
  setSort: (sort: readonly ['date' | 'score', 'asc' | 'desc']) => void;
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

  const store = createAnswerTableStore({
    eventSchedule$,
    filterAndSort: { answersFiltered$, filterState$, sortKeyAndOrder$ },
  });

  return { store, setSort } as const;
};

const dayOf = (date: number): unknown =>
  ({
    ymd: { year: 2026, month: 11, date },
    timeRange: {
      start: { hours: 10, minutes: 0 },
      end: { hours: 12, minutes: 0 },
    },
  }) as const;
