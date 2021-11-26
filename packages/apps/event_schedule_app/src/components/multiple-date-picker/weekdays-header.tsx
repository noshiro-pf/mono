/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { memoNamed } from '@noshiro/react-utils';
import type { WeekDayEnum } from '@noshiro/ts-utils';
import { weekdaysList } from '@noshiro/ts-utils';
import { useMemo } from 'react';
import styled from 'styled-components';
import {
  DatePickerWeekdayReadonlyStyled,
  DatePickerWeekdaysRowStyled,
  DatePickerWeekdaysStyled,
  DatePickerWeekdayStyled,
} from '../bp';

type Props = Readonly<{
  onClick?: (w: WeekDayEnum) => void;
}>;

export const WeekdaysHeader = memoNamed<Props>(
  'WeekdaysHeader',
  ({ onClick }) => {
    const listWithHandler = useMemo(
      () =>
        weekdaysList.en.map((w, idx) => ({
          ...w,
          onClickHandler:
            onClick === undefined
              ? undefined
              : () => {
                  onClick(idx as WeekDayEnum);
                },
        })),
      [onClick]
    );

    return (
      <DatePickerWeekdaysStyled role='rowgroup'>
        <DatePickerWeekdaysRowStyled role='row'>
          {listWithHandler.map(({ name: title, abbr, onClickHandler }) => (
            <HeaderCell
              key={title}
              abbr={abbr}
              title={title}
              onClick={onClickHandler}
            />
          ))}
        </DatePickerWeekdaysRowStyled>
      </DatePickerWeekdaysStyled>
    );
  }
);

type PropsHeaderCell = Readonly<{
  title: string;
  abbr: string;
  onClick?: () => void;
}>;

const HeaderCell = memoNamed<PropsHeaderCell>(
  'HeaderCell',
  ({ title, abbr, onClick }) => {
    const DatePickerWeekdayResolved =
      onClick === undefined
        ? DatePickerWeekdayReadonlyStyled
        : DatePickerWeekdayStyled;

    return (
      <DatePickerWeekdayResolved role={'columnheader'} onClick={onClick}>
        <Abbr title={title}>{abbr}</Abbr>
      </DatePickerWeekdayResolved>
    );
  }
);

const Abbr = styled.abbr`
  text-decoration: none !important;
`;
