import { Navbar, Tab, Tabs } from '@blueprintjs/core';
import { memoNamed, useState } from '@noshiro/react-utils';
import {
  IList,
  isNotUndefined,
  stringToNumber,
  tuple,
} from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
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

export const Main = memoNamed('Main', () => {
  const { state: sortBy, setState: setSortBy } = useState<'dice' | 'prob'>(
    'prob'
  );

  const sortByDice = useCallback(() => {
    setSortBy('dice');
  }, [setSortBy]);

  const sortByProbability = useCallback(() => {
    setSortBy('prob');
  }, [setSortBy]);

  const { state: filterByString, setState: setFilterByString } =
    useState<string>('');
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

  const { state: selectedTabId, setState: handleTabChange } = useState<
    'deadColumnUI' | 'table'
  >('table');

  const { state: columnsAlive, updateState: updateDeadColumns } = useState<
    readonly boolean[]
  >(IList.newArrayThrow(11, true));

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

    [columnsAlive, updateDeadColumns]
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
