import { type DateRange } from '@blueprintjs/datetime';
import { DateRangeInput3 } from '@blueprintjs/datetime2';
import {
  Ymdhm2Date,
  YmdhmFromDate,
  type YearMonthDate,
} from '@noshiro/io-ts-types';
import { memoNamed } from '@noshiro/react-utils';
import { DateUtils, castMutable, pipe, tp } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';

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
  Omit<
    DateRangeInputPropsOriginal,
    | 'defaultValue'
    | 'formatDate'
    | 'maxDate'
    | 'minDate'
    | 'onChange'
    | 'parseDate'
    | 'value'
  >;

type DateRangeInputPropsOriginal = React.ComponentProps<typeof DateRangeInput3>;

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
    const value = useMemo(
      () =>
        castMutable(
          tp(
            pipe(dateRange.start).chainOptional((d) =>
              DateUtils.toDate(
                Ymdhm2Date({
                  ...d,
                  hours: 0,
                  minutes: 0,
                }),
              ),
            ).value ?? null,

            pipe(dateRange.end).chainOptional((d) =>
              DateUtils.toDate(
                Ymdhm2Date({
                  ...d,
                  hours: 0,
                  minutes: 0,
                }),
              ),
            ).value ?? null,
          ),
        ),
      [dateRange],
    );

    const minDate: RawDateMutType | undefined = useMemo(
      () =>
        castMutable(
          pipe(_minDate).chainOptional((d) =>
            DateUtils.toDate(
              Ymdhm2Date({
                ...d,
                hours: 0,
                minutes: 0,
              }),
            ),
          ).value,
        ),
      [_minDate],
    );

    const maxDate: RawDateMutType | undefined = useMemo(
      () =>
        castMutable(
          pipe(_maxDate).chainOptional((d) =>
            DateUtils.toDate(
              Ymdhm2Date({
                ...d,
                hours: 0,
                minutes: 0,
              }),
            ),
          ).value,
        ),
      [_maxDate],
    );

    const onChange = useCallback(
      ([start, end]: Readonly<DateRange>) => {
        onDateRangeChange({
          start: pipe(start).chainOptional(YmdhmFromDate).value ?? undefined,
          end: pipe(end).chainOptional(YmdhmFromDate).value ?? undefined,
        });
      },
      [onDateRangeChange],
    );

    return (
      <DateRangeInput3
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

const encodeDate = (date: RawDateType): string => date.toLocaleDateString();

const decodeDate = (str: string): RawDateType =>
  pipe(DateUtils.from(str)).chain(DateUtils.toDate).value;
