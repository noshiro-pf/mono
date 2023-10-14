import { DateInput } from '@blueprintjs/datetime';

const formatDate = (date: RawDateType): string => date.toLocaleDateString();

const parseDate = (str: string): RawDateType =>
  pipe(DateUtils.from(str)).chain(DateUtils.toDate).value;

const inputProps: HTMLInputProps & InputGroupProps = {
  style: { width: '90px' },
};

const tenYearsLater = pipe(DateUtils.today())
  .chain(
    DateUtils.updateLocaleYear((y) => toSafeUint(y + 99) satisfies YearEnum),
  )
  .chain(DateUtils.setLocaleMonth(12))
  .chain(DateUtils.toDate).value;

type DateInputPropsOriginal = React.ComponentProps<typeof DateInput>;

export type BpDatePickerProps = Omit<
  DateInputPropsOriginal,
  'formatDate' | 'parseDate' | 'shortcuts' | 'timePrecision'
> &
  Readonly<{
    ymd: YearMonthDate | undefined;
    onYmdChange: (ymd: YearMonthDate | undefined) => void;
    shortcuts?: boolean | readonly DatePickerShortcut[];
  }>;

export const BpDatePicker = memoNamed<BpDatePickerProps>(
  'BpDatePicker',
  ({
    ymd,
    onYmdChange,
    placeholder = 'yyyy-mm-dd',
    showActionsBar = true,
    canClearSelection = false,
    shortcuts = false,
    reverseMonthAndYearMenus = true,
    maxDate = tenYearsLater,
    ...props
  }) => {
    const onChangeHandler = useCallback(
      (dateStr: string | null, isUserChange?: boolean) => {
        if (dateStr == null) {
          onYmdChange(undefined);
          return;
        }
        if (isUserChange !== true) return;
        const dt = parseDate(dateStr);
        onYmdChange({
          year: DateUtils.getLocaleYear(dt),
          month: DateUtils.getLocaleMonth(dt),
          date: DateUtils.getLocaleDate(dt),
        });
      },
      [onYmdChange],
    );

    const date = useMemo<string | undefined>(
      () =>
        ymd === undefined
          ? undefined
          : DateUtils.from(
              `${ymd.year}/${ymd.month}/${ymd.date} 12:34:56`,
            ).toLocaleString(),
      [ymd],
    );

    return (
      <DateInput
        canClearSelection={canClearSelection}
        formatDate={formatDate}
        inputProps={inputProps}
        maxDate={maxDate}
        parseDate={parseDate}
        placeholder={placeholder}
        reverseMonthAndYearMenus={reverseMonthAndYearMenus}
        shortcuts={castWritable(shortcuts)}
        showActionsBar={showActionsBar}
        timePrecision={undefined}
        value={date}
        onChange={onChangeHandler}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    );
  },
);
