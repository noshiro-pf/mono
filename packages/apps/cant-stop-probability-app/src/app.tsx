import { Navbar, Tab, Tabs } from '@blueprintjs/core';
import { DeadColumn, ProbabilityTable } from './components';
import { denom, selected3List, separator } from './constants';
import {
  calcExpected,
  countSuccess,
  countSuccessForRemains,
} from './functions';
import {
  isTwoDiceSumValue,
  type ResultRow,
  type TwoDiceSumValue,
} from './types';

const results: readonly ResultRow[] = selected3List().map(([x, y, z]) => {
  const count = countSuccess(x, y, z);
  const countSum = denom - count.noLine;
  return {
    id: `${x}-${y}-${z}`,
    selected: tp(x, y, z),
    count,
    countSum,
    probability: countSum / denom,
    expected: calcExpected(count),
  };
});

const resultsSortedByProbability = pipe(Arr.from(results)).chain((list) =>
  Arr.sort(list, (a, b) => -(a.countSum - b.countSum))
).value;

const { state$: sortBy$, setState: setSortBy } = createState<'dice' | 'prob'>(
  'prob'
);

const sortByDice = (): void => {
  setSortBy('dice');
};

const sortByProbability = (): void => {
  setSortBy('prob');
};

const { state$: filterByString$, setState: setFilterByString } =
  createState<string>('');

const { state$: selectedTabId$, setState: handleTabChange } = createState<
  'deadColumnUI' | 'table'
>('table');

const { state$: columnsAlive$, updateState: updateDeadColumns } = createState<
  readonly boolean[]
>(Arr.newArrayUnwrapped(11, true));

export const App = memoNamed('App', () => {
  const sortBy = useObservableValue(sortBy$);
  const filterByString = useObservableValue(filterByString$);
  const selectedTabId = useObservableValue(selectedTabId$);
  const columnsAlive = useObservableValue(columnsAlive$);

  const filterBy: readonly TwoDiceSumValue[] = useMemo(
    () =>
      filterByString
        .split(separator)
        .map(Str.toNumber)
        .filter(isNotUndefined)
        .filter(isTwoDiceSumValue),
    [filterByString]
  );

  const sorted = useMemo(
    () => (sortBy === 'dice' ? results : resultsSortedByProbability),
    [sortBy]
  );

  const filtered = useMemo(
    () =>
      sorted.filter((row) => filterBy.every((v) => row.selected.includes(v))),
    [sorted, filterBy]
  );

  const columnsAliveWithHandler = useMemo<
    readonly Readonly<{
      columnId: TwoDiceSumValue;
      alive: boolean;
      toggle: () => void;
    }>[]
  >(
    () =>
      columnsAlive.map((alive, index) => ({
        columnId: (index + 2) as TwoDiceSumValue,
        alive,
        toggle: () => {
          updateDeadColumns((prev) =>
            prev.map((b, i) => (i === index ? !b : b))
          );
        },
      })),

    [columnsAlive]
  );

  const hitSomeAliveColumnProbability = useMemo(
    () =>
      countSuccessForRemains(
        ISet.new(
          columnsAliveWithHandler.filter((a) => a.alive).map((a) => a.columnId)
        )
      ) / denom,
    [columnsAliveWithHandler]
  );

  return (
    <Root>
      <Navbar>
        <Navbar.Group>
          <Tabs
            selectedTabId={selectedTabId}
            onChange={handleTabChange as (value: string) => void}
          >
            <Tab id='table' title='確率表' />
            <Tab id='deadColumnUI' title='残存列確率' />
          </Tabs>
        </Navbar.Group>
      </Navbar>
      <Wrapper>
        {selectedTabId === 'table' ? (
          <ProbabilityTable
            filterByString={filterByString}
            filtered={filtered}
            sortByDice={sortByDice}
            sortByProbability={sortByProbability}
            onFilterByStringChange={setFilterByString}
          />
        ) : undefined}
        {selectedTabId === 'deadColumnUI' ? (
          <DeadColumn
            columnsAliveWithHandler={columnsAliveWithHandler}
            hitSomeAliveColumnProbability={hitSomeAliveColumnProbability}
          />
        ) : undefined}
      </Wrapper>
    </Root>
  );
});

const Root = styled.div`
  min-height: 100vh;
`;

const Wrapper = styled.div`
  padding: 20px;
`;