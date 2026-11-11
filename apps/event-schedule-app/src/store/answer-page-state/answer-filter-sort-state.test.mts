import { Answer, type EventSchedule } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { Optional } from 'ts-data-forge';
import type { AnswerFilterState } from '../../functions/index.mjs';
import type { AnswerFilterQueryParam } from './answer-filter-query-param.mjs';
import {
  createAnswerFilterAndSortStore,
  type AnswerFilterAndSort,
} from './answer-filter-sort-state.mjs';

describe(createAnswerFilterAndSortStore, () => {
  test('sorts by date, ascending, at first', () => {
    const { store } = setup();

    assert.deepStrictEqual(
      Optional.unwrap(store.sortKeyAndOrder$.getSnapshot()),
      ['date', 'asc'],
    );
  });

  test('a sort change is kept and written to the query string', () => {
    const { store, savedSorts } = setup();

    store.onScoreSortOrderChange('desc');

    assert.deepStrictEqual(
      Optional.unwrap(store.sortKeyAndOrder$.getSnapshot()),
      ['score', 'desc'],
    );

    assert.deepStrictEqual(savedSorts, [['score', 'desc']]);
  });

  test('a filter change is kept and written to the query string', () => {
    const { store, savedFilters } = setup();

    store.setOnlyFilledDate(true);

    assert.isTrue(
      Optional.unwrap(store.filterState$.getSnapshot()).filledDateOnly,
    );

    assert.strictEqual(savedFilters.at(-1)?.filledDateOnly, true);
  });

  test.each([true, false] as const)(
    'setOnlyFilledDate(%j) twice keeps the value it was given',
    (checked) => {
      const { store, savedFilters } = setup();

      // Checked after each call: two flips of `false` end at `false` too.
      for (const _call of [1, 2]) {
        store.setOnlyFilledDate(checked);

        assert.strictEqual(
          Optional.unwrap(store.filterState$.getSnapshot()).filledDateOnly,
          checked,
        );

        assert.strictEqual(savedFilters.at(-1)?.filledDateOnly, checked);
      }
    },
  );

  test('restores the sort from the query string', () => {
    const { store } = setup(['score', 'desc']);

    store.restoreFromQueryParams();

    assert.deepStrictEqual(
      Optional.unwrap(store.sortKeyAndOrder$.getSnapshot()),
      ['score', 'desc'],
    );
  });

  test('leaves out the respondents unchecked in the filter', () => {
    const { store } = setup();

    assert.deepStrictEqual(
      Optional.unwrap(store.answersFiltered$.getSnapshot())?.map(
        (a) => a.user.name,
      ),
      ['bob', 'carol'],
    );

    store.setEnabledFilteringByRespondent(true);

    const bob = Optional.unwrap(store.respondentCheckState$.getSnapshot()).find(
      (r) => r.username === 'bob',
    );

    assert.isDefined(bob);

    bob.checkState.onCheck(false);

    assert.deepStrictEqual(
      Optional.unwrap(store.answersFiltered$.getSnapshot())?.map(
        (a) => a.user.name,
      ),
      ['carol'],
    );
  });
});

type Setup = Readonly<{
  store: AnswerFilterAndSort;
  savedSorts: readonly (readonly ['date' | 'score', 'asc' | 'desc'])[];
  savedFilters: readonly AnswerFilterState[];
}>;

const setup = (
  sortInUrl?: readonly ['date' | 'score', 'asc' | 'desc'],
): Setup => {
  const mut_savedSorts: (readonly ['date' | 'score', 'asc' | 'desc'])[] = [];

  const mut_savedFilters: AnswerFilterState[] = [];

  const queryParam: AnswerFilterQueryParam = {
    saveSortStateToQueryParams: (sort) => {
      mut_savedSorts.push(sort);
    },
    saveFilterStateToQueryParams: (filterState) => {
      mut_savedFilters.push(filterState);
    },
    restoreFromQueryParams: (setSortOrderAndKey) => {
      if (sortInUrl !== undefined) {
        setSortOrderAndKey(sortInUrl);
      }
    },
  } as const;

  const [answers$] = createState<readonly Answer[] | undefined>([
    Answer.fill({ id: 'a1', user: { id: null, name: 'bob' } }),
    Answer.fill({ id: 'a2', user: { id: null, name: 'carol' } }),
  ]);

  const [eventSchedule$] = createState<EventSchedule | undefined>(undefined);

  const store = createAnswerFilterAndSortStore({
    answers$,
    eventSchedule$,
    queryParam,
  });

  return {
    store,
    savedSorts: mut_savedSorts,
    savedFilters: mut_savedFilters,
  } as const;
};
