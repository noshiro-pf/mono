import { createState, derive, map, type InitializedObservable } from 'synstate';
import { Arr, ISet, isNotUndefined, Num, SafeUint, tp } from 'ts-data-forge';
import { denom, selected3List, separator } from './constants/index.mjs';
import {
  calcExpected,
  countSuccess,
  countSuccessForRemains,
} from './functions/index.mjs';
import {
  asTwoDiceSumValue,
  isTwoDiceSumValue,
  type ResultRow,
  type TwoDiceSumValue,
} from './types/index.mjs';

const results: readonly ResultRow[] = selected3List().map(([x, y, z]) => {
  const count = countSuccess(x, y, z);

  const countSum = SafeUint.sub(denom, count.noLine);

  return {
    id: `${x}-${y}-${z}`,
    selected: tp(x, y, z),
    count,
    countSum,
    probability: Num.div(countSum, denom),
    expected: calcExpected(count),
  };
});

const resultsSortedByProbability = results.toSorted(
  (a, b) => -(a.countSum - b.countSum),
);

const [sortBy$, setSortBy] = createState<'dice' | 'prob'>('prob');

export const sortByDice = (): void => {
  setSortBy('dice');
};

export const sortByProbability = (): void => {
  setSortBy('prob');
};

const [filterByString$, setFilterByString] = createState<string>('');

export { filterByString$, setFilterByString };

const [selectedTabId$, setSelectedTabId] = createState<TabId>('table');

export { selectedTabId$, setSelectedTabId };

/** The columns, 2 to 12, in order. */
export const columnIds: readonly TwoDiceSumValue[] = Arr.seq(11).map((i) =>
  asTwoDiceSumValue(i + 2),
);

const [columnsAlive$, , { updateState: updateColumnsAlive }] = createState<
  readonly boolean[]
>(Arr.newArray(11, true));

export { columnsAlive$ };

export const toggleColumn = (index: number): void => {
  updateColumnsAlive((prev) => prev.map((b, i) => (i === index ? !b : b)));
};

/** The rows of the table, sorted as asked and filtered by the columns typed. */
export const filtered$: InitializedObservable<readonly ResultRow[]> = derive(
  [sortBy$, filterByString$],
  (sortBy, filterByString) => {
    const filterBy = filterByString
      .split(separator)
      .map(Num.from)
      .filter(isNotUndefined)
      .filter(isTwoDiceSumValue);

    return (sortBy === 'dice' ? results : resultsSortedByProbability).filter(
      (row) => filterBy.every((v) => row.selected.includes(v)),
    );
  },
);

/** The chance that a roll of four dice makes a column still open. */
export const hitSomeAliveColumnProbability$: InitializedObservable<number> =
  columnsAlive$.pipe(
    map((columnsAlive) =>
      Num.div(
        countSuccessForRemains(
          ISet.create(columnIds.filter((_, i) => columnsAlive[i] === true)),
        ),
        denom,
      ),
    ),
  );

export type TabId = 'deadColumnUI' | 'table';
