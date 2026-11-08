import { Button, HtmlSelect } from 'blueprint-synstate';
import { type InitializedObservable, map } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { Arr, asSafeUint, mapNullable, Num, SafeUint } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import type { MonthEnum } from 'ts-type-forge';
import type { CalendarCurrentPageReducerState } from '../../functions/index.mjs';
import { monthsList } from '../../utils-ported/index.mjs';
import * as styles from './multiple-date-picker.module.css';

type Props = Readonly<{
  calendarCurrentPage: InitializedObservable<CalendarCurrentPageReducerState>;
  onYearChange: (year: SafeUint) => void;
  onMonthChange: (month: MonthEnum) => void;
  onPrevMonthClick: () => void;
  onNextMonthClick: () => void;
}>;

export const DatepickerNav = ({
  calendarCurrentPage,
  onYearChange,
  onMonthChange,
  onPrevMonthClick,
  onNextMonthClick,
}: Props): JSX.Element => {
  // Read when the picker is drawn, not when the module loads: a page left open
  // past a year's end would otherwise centre the years on the old one.
  const today = DateUtils.today();

  const thisYear = asSafeUint(DateUtils.getLocaleYear(today));

  const thisMonth = DateUtils.getLocaleMonth(today);

  const yearOptions: readonly SafeUint[] = Arr.range(
    SafeUint.sub(thisYear, asSafeUint(100)),
    SafeUint.add(thisYear, asSafeUint(100)),
  );

  return (
    <div class={constant(styles.nav)}>
      <Button
        icon={'chevron-left'}
        variant={constant('minimal')}
        onClick={onPrevMonthClick}
      />
      <HtmlSelect
        minimal
        value={calendarCurrentPage.pipe(map((p) => p.year.toString()))}
        onChange={({ currentTarget }) => {
          onYearChange(
            mapNullable(Num.from(currentTarget.value), asSafeUint) ?? thisYear,
          );
        }}
      >
        {yearOptions.map((year) => (
          <option value={constant(year.toString())}>
            {constant(year.toString())}
          </option>
        ))}
      </HtmlSelect>
      <HtmlSelect
        minimal
        value={calendarCurrentPage.pipe(map((p) => p.month.toString()))}
        onChange={({ currentTarget }) => {
          onMonthChange(
            mapNullable(
              Num.from(currentTarget.value),
              (a) =>
                // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                a as MonthEnum,
            ) ?? thisMonth,
          );
        }}
      >
        {monthsList.en.map((m) => (
          <option value={constant(m.value.toString())}>
            {constant(m.name)}
          </option>
        ))}
      </HtmlSelect>
      <Button
        icon={'chevron-right'}
        variant={constant('minimal')}
        onClick={onNextMonthClick}
      />
    </div>
  );
};
