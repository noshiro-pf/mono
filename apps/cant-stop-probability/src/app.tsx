import { Navbar, Tab, Tabs } from '@blueprintjs/core';
import styled from '@emotion/styled';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { createState } from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import { Arr, ISet, isNotUndefined, Num, SafeUint, tp } from 'ts-data-forge';
import { DeadColumn, ProbabilityTable } from './components/index.mjs';
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

const sortByDice = (): void => {
  setSortBy('dice');
};

const sortByProbability = (): void => {
  setSortBy('prob');
};

const [filterByString$, setFilterByString] = createState<string>('');

const [selectedTabId$, setSelectedTabId] = createState<
  'deadColumnUI' | 'table'
>('table');

const handleTabChange = (a: string): void => {
  if (a === 'deadColumnUI' || a === 'table') {
    setSelectedTabId(a);
  } else {
    console.warn(`invalid tab id "${a}"`);
  }
};

const [columnsAlive$, , { updateState: updateDeadColumns }] = createState<
  readonly boolean[]
>(Arr.newArray(11, true));

export const App = memoNamed('App', () => {
  const sortBy = useObservableValue(sortBy$);

  const filterByString = useObservableValue(filterByString$);

  const selectedTabId = useObservableValue(selectedTabId$);

  const columnsAlive = useObservableValue(columnsAlive$);

  const filterBy: readonly TwoDiceSumValue[] = React.useMemo(
    () =>
      filterByString
        .split(separator)
        .map(Num.from)
        .filter(isNotUndefined)
        .filter(isTwoDiceSumValue),
    [filterByString],
  );

  const sorted = React.useMemo(
    () => (sortBy === 'dice' ? results : resultsSortedByProbability),
    [sortBy],
  );

  const filtered = React.useMemo(
    () =>
      sorted.filter((row) => filterBy.every((v) => row.selected.includes(v))),
    [sorted, filterBy],
  );

  const columnsAliveWithHandler = React.useMemo<
    readonly Readonly<{
      columnId: TwoDiceSumValue;
      alive: boolean;
      toggle: () => void;
    }>[]
  >(
    () =>
      columnsAlive.map((alive, index) => ({
        columnId: asTwoDiceSumValue(index + 2),
        alive,
        toggle: () => {
          updateDeadColumns((prev) =>
            prev.map((b, i) => (i === index ? !b : b)),
          );
        },
      })),
    [columnsAlive],
  );

  const hitSomeAliveColumnProbability = React.useMemo(
    () =>
      Num.div(
        countSuccessForRemains(
          ISet.create(
            columnsAliveWithHandler
              .filter((a) => a.alive)
              .map((a) => a.columnId),
          ),
        ),
        denom,
      ),
    [columnsAliveWithHandler],
  );

  return (
    <Root>
      <Navbar>
        <Navbar.Group>
          <Tabs selectedTabId={selectedTabId} onChange={handleTabChange}>
            <Tab id={'table'} title={'確率表'} />
            <Tab id={'deadColumnUI'} title={'残存列確率'} />
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
