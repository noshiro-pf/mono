import { IOptionProps } from '@blueprintjs/core';
import { BpButton, BpSelect } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import {
  getMonth,
  getYear,
  MonthEnum,
  monthsList,
  range,
  stringToNumber,
  today,
  YearEnum,
} from '@noshiro/ts-utils';
import { useCallback } from 'react';
import styled from 'styled-components';

const thisYear = getYear(today());
const thisMonth = getMonth(today());

const yearOption: number[] = range(thisYear - 100, thisYear + 100);
const monthOption: IOptionProps[] = monthsList.en.map((e) => ({
  value: e.value,
  label: e.name,
}));

type Props = Readonly<{
  year: YearEnum;
  month: MonthEnum;
  onYearChange: (year: YearEnum) => void;
  onMonthChange: (month: MonthEnum) => void;
  onPrevMonthClick: () => void;
  onNextMonthClick: () => void;
}>;

export const DatepickerNav = memoNamed<Props>(
  'DatepickerNav',
  ({
    year,
    month,
    onYearChange,
    onMonthChange,
    onPrevMonthClick,
    onNextMonthClick,
  }) => {
    const onYearChangeHandler = useCallback(
      (value: string) => {
        onYearChange((stringToNumber(value) ?? thisYear) as YearEnum);
      },
      [onYearChange]
    );

    const onMonthChangeHandler = useCallback(
      (value: string) => {
        onMonthChange((stringToNumber(value) ?? thisMonth) as MonthEnum);
      },
      [onMonthChange]
    );

    return (
      <Nav>
        <BpButton
          icon={'chevron-left'}
          type='button'
          minimal={true}
          onClick={onPrevMonthClick}
        />
        <BpSelect
          minimal={true}
          options={yearOption}
          value={year}
          onValueChange={onYearChangeHandler}
        />
        <BpSelect
          minimal={true}
          options={monthOption}
          value={month}
          onValueChange={onMonthChangeHandler}
        />
        <BpButton
          icon={'chevron-right'}
          type='button'
          minimal={true}
          onClick={onNextMonthClick}
        />
      </Nav>
    );
  }
);

const Nav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
