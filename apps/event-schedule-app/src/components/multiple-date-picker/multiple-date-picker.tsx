import { Button } from 'blueprint-synstate';
import { createState, type Observable } from 'synstate';
import {
  constant,
  For,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import type { IMapMapped } from 'ts-data-forge';
import type {
  CalendarCurrentPageReducerState,
  YmdKey,
} from '../../functions/index.mjs';
import { createMultipleDatePickerState } from '../../hooks/index.mjs';
import { DatePickerDate } from './date-picker-day.js';
import * as styles from './multiple-date-picker.module.css';
import { DatepickerNav } from './navigation.js';
import { WeekdaysHeader } from './weekdays-header.js';

type Props = Readonly<{
  selectedDates: Bindable<readonly YearMonthDate[]>;
  /** Absent for a read-only picker. */
  onSelectedDatesChange?: (value: readonly YearMonthDate[]) => void;
  setYearMonth$?: Observable<CalendarCurrentPageReducerState>;
  holidaysJpDefinition?: Bindable<
    IMapMapped<YearMonthDate, string, YmdKey> | undefined
  >;
  useOutlinedSelectedStyle?: boolean;
}>;

export const MultipleDatePicker = ({
  selectedDates,
  onSelectedDatesChange,
  setYearMonth$,
  holidaysJpDefinition,
  useOutlinedSelectedStyle = false,
}: Props): JSX.Element => {
  const {
    calendarCurrentPage$,
    onPrevMonthClick,
    onNextMonthClick,
    onYearChange,
    onMonthChange,
    onWeekdaysHeaderCellClick,
    calendarCells$,
    onDateClick,
    onTodayClick,
  } = createMultipleDatePickerState(
    toObservable(selectedDates),
    onSelectedDatesChange,
    setYearMonth$,
    holidaysJpDefinition === undefined
      ? noHolidays$
      : toObservable(holidaysJpDefinition),
  );

  return (
    <div>
      <div class={constant(styles.datePicker)}>
        <div class={constant(styles.dayPicker)} lang={constant('en')}>
          {/* eslint-disable-next-line synstate-dom-a11y/no-noninteractive-tabindex -- recorded, not fixed, when jsx-a11y came to synstate-dom (#3764) */}
          <div class={constant(styles.column)} tabIndex={constant(0)}>
            <DatepickerNav
              calendarCurrentPage={calendarCurrentPage$}
              onMonthChange={onMonthChange}
              onNextMonthClick={onNextMonthClick}
              onPrevMonthClick={onPrevMonthClick}
              onYearChange={onYearChange}
            />
            <div class={constant(styles.month)} role={constant('grid')}>
              <WeekdaysHeader onClick={onWeekdaysHeaderCellClick} />
              {/* eslint-disable-next-line synstate-dom-a11y/prefer-tag-over-role -- recorded, not fixed, when jsx-a11y came to synstate-dom (#3764) */}
              <div class={constant(styles.body)} role={constant('rowgroup')}>
                <For items={calendarCells$} key={(_, index) => index}>
                  {(week$) => (
                    // eslint-disable-next-line synstate-dom-a11y/prefer-tag-over-role -- recorded, not fixed, when jsx-a11y came to synstate-dom (#3764)
                    <div class={constant(styles.row)} role={constant('row')}>
                      <For items={week$} key={(_, index) => index}>
                        {(cell$) => (
                          <DatePickerDate
                            cell={cell$}
                            useOutlinedSelectedStyle={useOutlinedSelectedStyle}
                            onClick={onDateClick}
                          />
                        )}
                      </For>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class={constant(styles.today)}>
        <Button text={constant('Today')} onClick={onTodayClick} />
      </div>
    </div>
  );
};

/** For a picker given no holidays. */
const [noHolidays$] = createState<
  IMapMapped<YearMonthDate, string, YmdKey> | undefined
>(undefined);
