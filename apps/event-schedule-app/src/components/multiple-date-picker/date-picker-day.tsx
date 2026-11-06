import type { InitializedObservable } from 'synstate';
import { constant, inlineMap, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import type { CalendarCell } from '../../hooks/index.mjs';
import * as styles from './multiple-date-picker.module.css';

type Props = Readonly<{
  cell: InitializedObservable<CalendarCell>;
  /** Absent for a read-only picker. */
  onClick: ((ymd: YearMonthDate) => void) | undefined;
  useOutlinedSelectedStyle: boolean;
}>;

export const DatePickerDate = ({
  cell,
  onClick,
  useOutlinedSelectedStyle,
}: Props): JSX.Element => (
  <div
    aria-disabled={inlineMap(cell, (c) => (c.outside ? 'true' : 'false'))}
    aria-label={inlineMap(cell, ({ ymd }) =>
      DateUtils.create(ymd.year, ymd.month, ymd.date).toString(),
    )}
    aria-selected={inlineMap(cell, (c) => (c.selected ? 'true' : 'false'))}
    class={inlineMap(cell, (c) =>
      dayClass(c, onClick !== undefined, useOutlinedSelectedStyle),
    )}
    role={constant('gridcell')}
    tabIndex={constant(-1)}
    title={inlineMap(cell, (c) => c.holidayJpName)}
    onClick={
      onClick === undefined
        ? undefined
        : () => {
            const { outside, ymd } = cell.getSnapshot().value;

            if (!outside) {
              onClick(ymd);
            }
          }
    }
  >
    <div class={constant(styles.dayWrapper)}>
      {inlineMap(cell, (c) => c.ymd.date.toString())}
    </div>
  </div>
);

/**
 * The classes of a day, as react-blueprintjs-utils picked one styled cell for
 * it: a read-only picker draws no hover, and a selected day outside the month
 * is drawn selected but does not take a click.
 */
const dayClass = (
  { selected, outside, dayType }: CalendarCell,
  clickable: boolean,
  outlined: boolean,
): string => {
  const color =
    dayType === 'Saturday'
      ? styles.saturday
      : dayType === 'normal'
        ? undefined
        : styles.holiday;

  const classes: readonly (string | undefined)[] = selected
    ? clickable
      ? outside
        ? ([styles.selected] as const)
        : ([styles.selected, styles.selectedClickable] as const)
      : outlined
        ? ([styles.outlinedSelected, color] as const)
        : ([styles.selected] as const)
    : outside
      ? ([styles.outside] as const)
      : clickable
        ? ([styles.clickable, color] as const)
        : ([color] as const);

  return Arr.toUnshifted(styles.day)(classes)
    .filter((c) => c !== undefined)
    .join(' ');
};
