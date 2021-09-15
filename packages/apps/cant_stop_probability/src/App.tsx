import { Navbar, Tab, Tabs } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import {
  IList,
  isNotUndefined,
  stringToNumber,
  tuple,
} from '@noshiro/ts-utils';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { DeadColumn, ProbabilityTable } from './components';
import { denom, selected3List, separator } from './constants';
import {
  calcExpected,
  countSuccess,
  countSuccessForRemains,
} from './functions';
import type { ResultRow, TwoDiceSumValue } from './types';
import { isTwoDiceSumValue } from './types';

const results: readonly ResultRow[] = selected3List().map(([x, y, z]) => {
  const count = countSuccess(x, y, z);
  const countSum = denom - count.noLine;
  return {
    id: `${x}-${y}-${z}`,
    selected: tuple(x, y, z),
    count,
    countSum,
    probability: countSum / denom,
    expected: calcExpected(count),
  };
});

const resultsSortedByProbability = [...results]
  .sort((a, b) => a.countSum - b.countSum)
  .reverse();

export const App = memoNamed('App', () => {
  const [sortBy, setSortBy] = useState<'dice' | 'prob'>('prob');

  const sortByDice = useCallback(() => {
    setSortBy('dice');
  }, []);

  const sortByProbability = useCallback(() => {
    setSortBy('prob');
  }, []);

  const [filterByString, setFilterByString] = useState<string>('');
  const filterBy: TwoDiceSumValue[] = useMemo(
    () =>
      filterByString
        .split(separator)
        .map(stringToNumber)
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

  const [
    //
    selectedTabId,
    handleTabChange,
  ] = useState<'deadColumnUI' | 'table'>('table');

  const [columnsAlive, setDeadColumns] = useState<readonly boolean[]>(
    IList.newArrayThrow(11, true)
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
          setDeadColumns((prev) => prev.map((b, i) => (i === index ? !b : b)));
        },
      })),

    [columnsAlive]
  );

  const hitSomeAliveColumnProbability = useMemo(
    () =>
      countSuccessForRemains(
        new Set(
          columnsAliveWithHandler.filter((a) => a.alive).map((a) => a.columnId)
        )
      ) / denom,
    [columnsAliveWithHandler]
  );

  return (
    <div>
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
    </div>
  );
});

const Wrapper = styled.div`
  padding: 20px;
`;
