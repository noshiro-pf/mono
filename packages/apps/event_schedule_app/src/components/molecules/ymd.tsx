import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { IYearMonthDateType } from '../../types/record/year-month-date';

export const YearMonthDate = memoNamed<{ ymd: IYearMonthDateType }>(
  'YearMonthDate',
  ({ ymd }) => (
    <div>
      <span>{ymd.year}</span>
      {'/'}
      <span>{ymd.month}</span>
      {'/'}
      <span>{ymd.date}</span>
    </div>
  )
);
