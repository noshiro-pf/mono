import { Button } from '@blueprintjs/core';
import { css } from '@emotion/react';
import * as React from 'react';
import { BpSelect } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { Arr, asSafeUint, Num, SafeUint } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import { type MonthEnum } from 'ts-type-forge';
import { mapOptional, monthsList } from '../../utils-ported/index.mjs';

const thisYear = asSafeUint(DateUtils.getLocaleYear(DateUtils.today()));

const thisMonth = DateUtils.getLocaleMonth(DateUtils.today());

const yearOption: readonly SafeUint[] = Arr.range(
  SafeUint.sub(thisYear, asSafeUint(100)),
  SafeUint.add(thisYear, asSafeUint(100)),
);

const monthOption: readonly OptionProps[] = monthsList.en.map((e) => ({
  value: e.value,
  label: e.name,
}));

type Props = Readonly<{
  year: SafeUint;
  month: MonthEnum;
  onYearChange: (year: SafeUint) => void;
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
    const onYearChangeHandler = React.useCallback(
      (value: string) => {
        onYearChange(
          mapOptional(
            Num.from(value),
            (a) => asSafeUint(a) satisfies SafeUint,
          ) ?? thisYear,
        );
      },
      [onYearChange],
    );

    const onMonthChangeHandler = React.useCallback(
      (value: string) => {
        onMonthChange(
          mapOptional(
            Num.from(value),
            (a) =>
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              a as MonthEnum,
          ) ?? thisMonth,
        );
      },
      [onMonthChange],
    );

    return (
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
        `}
      >
        <Button
          icon={'chevron-left'}
          variant={'minimal'}
          onClick={onPrevMonthClick}
        />
        <BpSelect
          minimal
          options={yearOption}
          value={year}
          onValueChange={onYearChangeHandler}
        />
        <BpSelect
          minimal
          options={monthOption}
          value={month}
          onValueChange={onMonthChangeHandler}
        />
        <Button
          icon={'chevron-right'}
          variant={'minimal'}
          onClick={onNextMonthClick}
        />
      </div>
    );
  },
);
