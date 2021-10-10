import { memoNamed } from '@noshiro/react-utils';
import type { WeekDayEnum } from '@noshiro/ts-utils';
import { weekdaysList } from '@noshiro/ts-utils';
import { useMemo } from 'react';
import styled from 'styled-components';
import {
  DatePickerWeekday,
  DatePickerWeekdayReadonly,
  DatePickerWeekdays,
  DatePickerWeekdaysRow,
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
      <DatePickerWeekdays role='rowgroup'>
        <DatePickerWeekdaysRow role='row'>
          {listWithHandler.map(({ name: title, abbr, onClickHandler }) => (
            <HeaderCell
              key={title}
              abbr={abbr}
              title={title}
              onClick={onClickHandler}
            />
          ))}
        </DatePickerWeekdaysRow>
      </DatePickerWeekdays>
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const DatePickerWeekdayResolved =
      onClick === undefined ? DatePickerWeekdayReadonly : DatePickerWeekday;

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
