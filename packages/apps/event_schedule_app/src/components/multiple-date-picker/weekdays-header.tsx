import { memoNamed } from '@mono/react-utils';
import { weekdays } from '@mono/ts-utils';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { WeekdaysNumberEnum } from '../../types/enum/weekdays-number-enum';

const DivPointer = styled.div`
  border-radius: 3px;
  cursor: pointer;
  &:hover {
    background: #d8e1e8;
  }
`;

const HeaderCell = memoNamed<{
  title: string;
  abbr: string;
  onClick: () => void;
}>('HeaderCell', ({ title, abbr, onClick }) => (
  <DivPointer
    className='DayPicker-Weekday'
    role='columnheader'
    onClick={onClick}
  >
    <abbr title={title}>{abbr}</abbr>
  </DivPointer>
));

export const WeekdaysHeader = memoNamed<{
  onClick: (w: WeekdaysNumberEnum) => void;
}>('WeekdaysHeader', ({ onClick }) => {
  const listWithHandler = useMemo(
    () =>
      weekdays.map((w, idx) => ({
        ...w,
        onClickHandler: () => {
          onClick(idx as WeekdaysNumberEnum);
        },
      })),
    [onClick]
  );
  return (
    <div className='DayPicker-Weekdays' role='rowgroup'>
      <div className='DayPicker-WeekdaysRow' role='row'>
        {listWithHandler.map(({ name, abbr, onClickHandler }) => (
          <HeaderCell
            key={name}
            title={name}
            abbr={abbr}
            onClick={onClickHandler}
          />
        ))}
      </div>
    </div>
  );
});
