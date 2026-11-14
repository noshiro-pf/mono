import {
  DateInput,
  FormGroup,
  toDateTimeValue,
  toDateValue,
  type WallClock,
} from 'blueprint-synstate';
import {
  deriveBindable,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import { createAnswerDeadlineShortcuts, dict } from '../../constants/index.mjs';
import {
  dateInputMaxDate,
  parseDateInputText,
} from '../../functions/index.mjs';
import { isMobile$ } from '../../store/index.mjs';
import { pad2, todayYearMonthDate } from '../../utils/index.mjs';

type Props = Readonly<{
  useAnswerDeadline: Bindable<boolean>;
  answerDeadline: Bindable<Ymdhm | undefined>;
  onAnswerDeadlineChange: (value: Ymdhm | undefined) => void;
}>;

export const AnswerDeadlineDatepicker = ({
  useAnswerDeadline,
  answerDeadline,
  onAnswerDeadlineChange,
}: Props): JSX.Element => {
  const showError$ = deriveBindable(
    [useAnswerDeadline, answerDeadline],
    (use, deadline) => use && deadline === undefined,
  );

  return (
    <FormGroup
      helperText={mapBindable(showError$, (e) =>
        e
          ? dict.eventSettingsPage.errorMessages.answerDeadlineIsEnabledButEmpty
          : undefined,
      )}
      intent={mapBindable(showError$, (e) => (e ? 'danger' : 'primary'))}
    >
      <DateInput
        canClearSelection={false}
        disabled={mapBindable(useAnswerDeadline, (use) => !use)}
        formatDate={formatDate}
        maxDate={dateInputMaxDate()}
        parseDate={(text) => parseDateInputText(text, 'minute')}
        placeholder={'YYYY-MM-DD HH:mm'}
        reverseMonthAndYearMenus
        // Counted from the day the calendar opens: the page may have been open
        // since an earlier day.
        shortcuts={() => {
          if (Optional.unwrap(isMobile$.getSnapshot())) {
            return undefined;
          }

          const today = todayYearMonthDate();

          return createAnswerDeadlineShortcuts(
            DateUtils.create(today.year, today.month, today.date),
          );
        }}
        showActionsBar={false}
        timePrecision={'minute'}
        value={mapBindable(answerDeadline, (deadline) =>
          deadline === undefined
            ? ''
            : toDateTimeValue(wallClockFrom(deadline)),
        )}
        onChange={(value) => {
          onAnswerDeadlineChange(
            value === '' ? undefined : ymdhmFrom(new Date(value)),
          );
        }}
      />
    </FormGroup>
  );
};

const wallClockFrom = (a: Ymdhm): WallClock =>
  ({
    year: a.year,
    month: a.month,
    day: a.date,
    hour: a.hours,
    minute: a.minutes,
  }) as const;

const ymdhmFrom = (date: Date): Ymdhm =>
  ({
    year: DateUtils.getLocaleYear(date),
    month: DateUtils.getLocaleMonth(date),
    date: DateUtils.getLocaleDate(date),
    hours: DateUtils.getLocaleHours(date),
    minutes: DateUtils.getLocaleMinutes(date),
  }) as const;

/** As Blueprint's input showed it before: `YYYY-MM-DD  HH:mm`. */
const formatDate = (clock: WallClock): string =>
  `${toDateValue(clock)}  ${pad2(clock.hour)}:${pad2(clock.minute)}` as const;
