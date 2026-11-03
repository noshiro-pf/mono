import { Button, HtmlSelect } from 'blueprint-synstate';
import type { InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import { Arr, asSafeUint, mapNullable, Num, SafeUint } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import type { MonthEnum } from 'ts-type-forge';
import type { CalendarCurrentPageReducerState } from '../../functions/index.mjs';
import { monthsList } from '../../utils-ported/index.mjs';
import * as styles from './multiple-date-picker.module.css';

const thisYear = asSafeUint(DateUtils.getLocaleYear(DateUtils.today()));

const thisMonth = DateUtils.getLocaleMonth(DateUtils.today());

const yearOptions: readonly SafeUint[] = Arr.range(
  SafeUint.sub(thisYear, asSafeUint(100)),
  SafeUint.add(thisYear, asSafeUint(100)),
);

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
}: Props): JSX.Element => (
  <div class={constant(styles.nav)}>
    <Button
      icon={'chevron-left'}
      variant={constant('minimal')}
      onClick={onPrevMonthClick}
    />
    <HtmlSelect
      minimal
      value={view(calendarCurrentPage, (p) => p.year.toString())}
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
      value={view(calendarCurrentPage, (p) => p.month.toString())}
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
        <option value={constant(m.value.toString())}>{constant(m.name)}</option>
      ))}
    </HtmlSelect>
    <Button
      icon={'chevron-right'}
      variant={constant('minimal')}
      onClick={onNextMonthClick}
    />
  </div>
);
