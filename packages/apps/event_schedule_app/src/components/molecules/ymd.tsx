import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { IYearMonthDate } from '../../types/record/base/year-month-date';

interface Props {
  ymd: IYearMonthDate;
}

export const YearMonthDateView = memoNamed<Props>(
  'YearMonthDateView',
  (props) => (
    <div>
      <span>{props.ymd.year}</span>
      {'/'}
      <span>{props.ymd.month}</span>
      {'/'}
      <span>{props.ymd.date}</span>
    </div>
  )
);
