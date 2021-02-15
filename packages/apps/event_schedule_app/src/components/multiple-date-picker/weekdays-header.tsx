import { memoNamed } from '@noshiro/react-utils';
import { WeekDayEnum, weekdaysList } from '@noshiro/ts-utils';
import { useMemo } from 'react';
import styled from 'styled-components';

type Props = Readonly<{
  onClick: (w: WeekDayEnum) => void;
}>;

export const WeekdaysHeader = memoNamed<Props>(
  'WeekdaysHeader',
  ({ onClick }) => {
    const listWithHandler = useMemo(
      () =>
        weekdaysList.en.map((w, idx) => ({
          ...w,
          onClickHandler: () => {
            onClick(idx as WeekDayEnum);
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
  }
);

type PropsHeaderCell = Readonly<{
  title: string;
  abbr: string;
  onClick: () => void;
}>;

const HeaderCell = memoNamed<PropsHeaderCell>('HeaderCell', (props) => (
  <DivPointer
    className='DayPicker-Weekday'
    role='columnheader'
    onClick={props.onClick}
  >
    <abbr title={props.title}>{props.abbr}</abbr>
  </DivPointer>
));

const DivPointer = styled.div`
  border-radius: 3px;
  cursor: pointer;
  outline: none;
  &:hover {
    background: #d8e1e8;
  }
`;
