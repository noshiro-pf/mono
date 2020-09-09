import { Button, IOptionProps } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import { stringToNumber } from '@mono/ts-utils';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { months } from '../../utils/datetime/constants/months';
import { getMonth } from '../../utils/datetime/functions/date-method-wrapper/month';
import { today } from '../../utils/datetime/functions/date-method-wrapper/today';
import { getYear } from '../../utils/datetime/functions/date-method-wrapper/year';
import { MonthEnum } from '../../utils/datetime/types/month';
import { YearEnum } from '../../utils/datetime/types/year';
import { IRange } from '../../utils/immutable';
import { BpSelect } from '../atoms/blueprint-js-wrapper/bp-select';

const Nav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const thisYear = getYear(today());
const thisMonth = getMonth(today());

const yearOption: number[] = IRange(thisYear, thisYear + 100).toArray();
const monthOption: IOptionProps[] = months.map((e) => ({
  value: e.value,
  label: e.name,
}));

export const DatepickerNav = memoNamed<{
  year: YearEnum;
  month: MonthEnum;
  onYearChange: (year: YearEnum) => void;
  onMonthChange: (month: MonthEnum) => void;
  onPrevMonthClick: () => void;
  onNextMonthClick: () => void;
}>(
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
        <Button
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
        <Button
          icon={'chevron-right'}
          type='button'
          minimal={true}
          onClick={onNextMonthClick}
        />
      </Nav>
    );
  }
);
