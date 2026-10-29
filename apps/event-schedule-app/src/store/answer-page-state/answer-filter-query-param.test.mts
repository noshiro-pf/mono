import { createMemoryBrowser, createRouter } from 'tiny-router-observable';
import { asSafeUint } from 'ts-data-forge';
import {
  AnswerFilterState,
  type AnswerFilterStateAction,
} from '../../functions/index.mjs';
import { createAnswerFilterQueryParam } from './answer-filter-query-param.mjs';

describe(createAnswerFilterQueryParam, () => {
  test('writes the sort to the query string, leaving out the defaults', () => {
    const { queryParam, browser } = setup('https://example.com/event/abc/');

    queryParam.saveSortStateToQueryParams(['score', 'desc']);

    assert.strictEqual(browser.url().search, '?sort-by=score&sort-order=desc');

    queryParam.saveSortStateToQueryParams(['date', 'asc']);

    assert.strictEqual(browser.url().search, '');
  });

  test('replaces the history entry rather than adding one', () => {
    const { queryParam, browser } = setup('https://example.com/event/abc/');

    queryParam.saveSortStateToQueryParams(['score', 'desc']);

    browser.history.back();

    assert.strictEqual(browser.url().search, '?sort-by=score&sort-order=desc');
  });

  test('reads the sort back from the query string', () => {
    const { queryParam } = setup(
      'https://example.com/event/abc/?sort-by=score&sort-order=desc',
    );

    const mut_sorts: (readonly ['date' | 'score', 'asc' | 'desc'])[] = [];

    queryParam.restoreFromQueryParams(
      (sort) => {
        mut_sorts.push(sort);
      },
      () => undefined,
    );

    assert.deepStrictEqual(mut_sorts, [['score', 'desc']]);
  });

  test('a filter written to the query string reads back the same', () => {
    const { queryParam, browser } = setup('https://example.com/event/abc/');

    const filterState = AnswerFilterState.reducer(
      AnswerFilterState.reducer(AnswerFilterState.initialState, {
        type: 'set-filledDateOnly',
        checked: true,
      }),
      { type: 'set-enabled-filtering-by-dayOfWeek', value: true },
    );

    queryParam.saveFilterStateToQueryParams(filterState);

    assert.notStrictEqual(browser.url().search, '');

    const mut_actions: AnswerFilterStateAction[] = [];

    queryParam.restoreFromQueryParams(
      () => undefined,
      (action) => {
        mut_actions.push(action);
      },
    );

    const [restored] = mut_actions;

    assert.isDefined(restored);

    const filterStateRestored = AnswerFilterState.reducer(
      AnswerFilterState.initialState,
      restored,
    );

    assert.isTrue(filterStateRestored.filledDateOnly);

    assert.isTrue(filterStateRestored.dayOfWeek.enabled);
  });

  test('reads a value typed by hand that is not a number as unset', () => {
    const { queryParam } = setup(
      'https://example.com/event/abc/?good=abc--3&rank=x',
    );

    const mut_actions: AnswerFilterStateAction[] = [];

    queryParam.restoreFromQueryParams(
      () => undefined,
      (action) => {
        mut_actions.push(action);
      },
    );

    const [restored] = mut_actions;

    assert.isDefined(restored);

    assert.strictEqual(restored.type, 'setFromUrlQueryParams');

    assert.deepStrictEqual(
      restored.type === 'setFromUrlQueryParams'
        ? [restored.values.iconState.good, restored.values.rank]
        : undefined,
      [{ min: undefined, max: asSafeUint(3) }, undefined],
    );
  });
});

const setup = (
  href: string,
): Readonly<{
  queryParam: ReturnType<typeof createAnswerFilterQueryParam>;
  browser: ReturnType<typeof createMemoryBrowser>;
}> => {
  const browser = createMemoryBrowser(href);

  return {
    queryParam: createAnswerFilterQueryParam({
      router: createRouter({ browser }),
    }),
    browser,
  } as const;
};
