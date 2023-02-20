import { DateRangeInput2, type DateRange } from '@blueprintjs/datetime2';
import { ymdFromDate, ymdhm2Date } from '@noshiro/event-schedule-app-shared';

const formatDate = (date: RawDateType): string => date.toLocaleDateString();

const parseDate = (str: string): RawDateType =>
  pipe(DateUtils.from(str)).chain(DateUtils.toDate).value;

type DateRangeInputPropsOriginal = React.ComponentProps<typeof DateRangeInput2>;

type Props = DeepReadonly<{
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
    }>
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

export const BpDateRangeInput = memoNamed<Props>(
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
        castWritable(
          tp(
            pipe(dateRange.start).chainOptional((d) =>
              DateUtils.toDate(
                ymdhm2Date({
                  ...d,
                  hours: 0,
                  minutes: 0,
                })
              )
            ).value ?? null,

            pipe(dateRange.end).chainOptional((d) =>
              DateUtils.toDate(
                ymdhm2Date({
                  ...d,
                  hours: 0,
                  minutes: 0,
                })
              )
            ).value ?? null
          )
        ),
      [dateRange]
    );

    const minDate: RawDateMutType | undefined = useMemo(
      () =>
        castWritable(
          pipe(_minDate).chainOptional((d) =>
            DateUtils.toDate(
              ymdhm2Date({
                ...d,
                hours: 0,
                minutes: 0,
              })
            )
          ).value
        ),
      [_minDate]
    );

    const maxDate: RawDateMutType | undefined = useMemo(
      () =>
        castWritable(
          pipe(_maxDate).chainOptional((d) =>
            DateUtils.toDate(
              ymdhm2Date({
                ...d,
                hours: 0,
                minutes: 0,
              })
            )
          ).value
        ),
      [_maxDate]
    );

    const onChange = useCallback(
      ([start, end]: Readonly<DateRange>) => {
        onDateRangeChange({
          start: pipe(start).chainOptional(ymdFromDate).value ?? undefined,
          end: pipe(end).chainOptional(ymdFromDate).value ?? undefined,
        });
      },
      [onDateRangeChange]
    );

    return (
      <DateRangeInput2
        disabled={disabled}
        formatDate={formatDate}
        maxDate={maxDate}
        minDate={minDate}
        parseDate={parseDate}
        value={value}
        onChange={onChange}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    );
  }
);
