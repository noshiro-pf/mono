import { DateRangeInput, type DateRange } from '@blueprintjs/datetime';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { castMutable, pipe, tp } from 'ts-data-forge';
import {
  DateUtils,
  Ymdhm2Date,
  YmdhmFromDate,
  type YearMonthDate,
} from 'ts-fortress-types';
import { type DeepReadonly, type StrictOmit } from 'ts-type-forge';
import { mapOptional } from '../../utils/index.mjs';

export type BpDateRangeInputProps = DeepReadonly<{
  dateRange: {
    start: YearMonthDate | undefined;
    end: YearMonthDate | undefined;
  };
  minDate?: YearMonthDate;
  maxDate?: YearMonthDate;

  onDateRangeChange: (
    dateRange: Readonly<{
      start: YearMonthDate | undefined;
      end: YearMonthDate | undefined;
    }>,
  ) => void;
}> &
  StrictOmit<
    DateRangeInputPropsOriginal,
    | 'defaultValue'
    | 'formatDate'
    | 'maxDate'
    | 'minDate'
    | 'onChange'
    | 'parseDate'
    | 'value'
  >;

type DateRangeInputPropsOriginal = React.ComponentProps<typeof DateRangeInput>;

export const BpDateRangeInput = memoNamed<BpDateRangeInputProps>(
  'BpDateRangeInput',
  ({
    disabled,
    dateRange,
    onDateRangeChange,
    minDate: _minDate,
    maxDate: _maxDate,
    ...props
  }) => {
    const value = React.useMemo(
      () =>
        castMutable(
          tp(
            pipe(dateRange.start).map((__v) =>
              mapOptional(__v, (d) =>
                DateUtils.toDate(
                  Ymdhm2Date({
                    ...d,
                    hours: 0,
                    minutes: 0,
                  }),
                ),
              ),
            ).value ?? null,

            pipe(dateRange.end).map((__v) =>
              mapOptional(__v, (d) =>
                DateUtils.toDate(
                  Ymdhm2Date({
                    ...d,
                    hours: 0,
                    minutes: 0,
                  }),
                ),
              ),
            ).value ?? null,
          ),
        ),
      [dateRange],
    );

    const minDate: Date | undefined = React.useMemo(
      () =>
        castMutable(
          pipe(_minDate).map((__v) =>
            mapOptional(__v, (d) =>
              DateUtils.toDate(
                Ymdhm2Date({
                  ...d,
                  hours: 0,
                  minutes: 0,
                }),
              ),
            ),
          ).value,
        ),
      [_minDate],
    );

    const maxDate: Date | undefined = React.useMemo(
      () =>
        castMutable(
          pipe(_maxDate).map((__v) =>
            mapOptional(__v, (d) =>
              DateUtils.toDate(
                Ymdhm2Date({
                  ...d,
                  hours: 0,
                  minutes: 0,
                }),
              ),
            ),
          ).value,
        ),
      [_maxDate],
    );

    const onChange = React.useCallback(
      ([start, end]: Readonly<DateRange>) => {
        onDateRangeChange({
          start: pipe(start).map((v) => mapOptional(v, YmdhmFromDate)).value,
          end: pipe(end).map((v) => mapOptional(v, YmdhmFromDate)).value,
        });
      },
      [onDateRangeChange],
    );

    return (
      <DateRangeInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        disabled={disabled}
        formatDate={encodeDate}
        maxDate={maxDate}
        minDate={minDate}
        parseDate={decodeDate}
        value={value}
        onChange={onChange}
      />
    );
  },
);

const encodeDate = (date: Date): string => date.toLocaleDateString();

const decodeDate = (str: string): Date =>
  pipe(DateUtils.from(str)).map(DateUtils.toDate).value;
