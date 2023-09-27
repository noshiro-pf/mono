import { DateInput } from '@blueprintjs/datetime';

const formatDate = (date: RawDateType): string =>
  `${DateUtils.toLocaleYMD(date, '-')}  ${DateUtils.toLocaleHM(date, ':')}`;

const parseDate = (str: string): RawDateType =>
  pipe(DateUtils.from(str)).chain(DateUtils.toDate).value;

const tenYearsLater = pipe(DateUtils.today())
  .chain(DateUtils.updateLocaleYear((a) => (a + 99) as YearEnum))
  .chain(DateUtils.setLocaleMonth(12))
  .chain(DateUtils.toDate).value;

type DateInputPropsOriginal = React.ComponentProps<typeof DateInput>;

export type BpDatetimePickerProps = Omit<
  DateInputPropsOriginal,
  | 'className'
  | 'defaultValue'
  | 'formatDate'
  | 'onChange'
  | 'parseDate'
  | 'shortcuts'
  | 'timePrecision'
  | 'value'
> &
  Readonly<{
    ymdhm: Ymdhm | undefined;
    onYmdhmChange: (ymdhm: Ymdhm | undefined) => void;
    shortcuts?: boolean | readonly DatePickerShortcut[];
  }>;

export const BpDatetimePicker = memoNamed<BpDatetimePickerProps>(
  'BpDatetimePicker',
  ({
    ymdhm,
    onYmdhmChange,
    placeholder = 'YYYY-MM-DD HH:mm',
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
          onYmdhmChange(undefined);
          return;
        }
        if (isUserChange !== true) return;
        const dt = parseDate(dateStr);
        onYmdhmChange({
          year: DateUtils.getLocaleYear(dt),
          month: DateUtils.getLocaleMonth(dt),
          date: DateUtils.getLocaleDate(dt),
          hours: DateUtils.getLocaleHours(dt),
          minutes: DateUtils.getLocaleMinutes(dt),
        });
      },
      [onYmdhmChange]
    );

    const date = useMemo<string | undefined>(
      () =>
        ymdhm === undefined
          ? undefined
          : DateUtils.from(
              `${ymdhm.year}/${ymdhm.month}/${ymdhm.date} ${ymdhm.hours}:${ymdhm.minutes}:00`
            ).toLocaleString(),
      [ymdhm]
    );

    return (
      <DateInput
        canClearSelection={canClearSelection}
        formatDate={formatDate}
        maxDate={maxDate}
        parseDate={parseDate}
        placeholder={placeholder}
        reverseMonthAndYearMenus={reverseMonthAndYearMenus}
        shortcuts={shortcuts as Writable<typeof shortcuts>}
        showActionsBar={showActionsBar}
        /**
         * FIXME: Blueprintjs v5 から showTimezoneSelect = true としていると
         * 以下のエラーが発生するようになったため一旦非表示にしている。
         * "Internal React error: Expected static flag was missing."
         */
        showTimezoneSelect={false}
        timePrecision={'minute'}
        value={date}
        onChange={onChangeHandler}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    );
  }
);
