import { Navbar, Tab, Tabs } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { uint32 } from '@noshiro/ts-utils';
import {
  isNotUndefined,
  stringToNumber,
  tuple,
  zeros,
} from '@noshiro/ts-utils';
import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { DeadColumn } from './components/dead-column';
import { ProbabilityTable } from './components/table';
import { denom } from './constants/denom';
import { selected3List } from './constants/selected-3-list';
import { calcExpected } from './functions/calc-expected';
import { countSuccess } from './functions/count-success';
import { countSuccessForRemains } from './functions/count-success-for-remains';
import type { ResultRow } from './types/result-row';
import type { TwoDiceSumValue } from './types/two-dice-sum-value';
import { isTwoDiceSumValue } from './types/two-dice-sum-value';

const results: readonly ResultRow[] = selected3List().map(([x, y, z]) => {
  const count = countSuccess(x, y, z);
  const countSum = (denom - count.noLine) as uint32;
  return {
    selected: tuple(x, y, z),
    count,
    countSum,
    probability: countSum / denom,
    expected: calcExpected(count),
  };
});

const separator = ',';

const resultsSortedByprobability = results
  .slice()
  .sort((a, b) => a.countSum - b.countSum)
  .reverse();

export const App: FC = memoNamed('App', () => {
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
    () => (sortBy === 'dice' ? results : resultsSortedByprobability),
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
    zeros(11 as uint32).map(() => true)
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
            sortByDice={sortByDice}
            sortByProbability={sortByProbability}
            filterByString={filterByString}
            onFilterByStringChange={setFilterByString}
            filtered={filtered}
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
