import { type InitializedObservable, map } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
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
  // eslint-disable-next-line synstate-dom-a11y/click-events-have-key-events, synstate-dom-a11y/prefer-tag-over-role -- recorded, not fixed, when jsx-a11y came to synstate-dom (#3764)
  <div
    aria-disabled={cell.pipe(map((c) => (c.outside ? 'true' : 'false')))}
    aria-label={cell.pipe(
      map(({ ymd }) =>
        DateUtils.create(ymd.year, ymd.month, ymd.date).toString(),
      ),
    )}
    aria-selected={cell.pipe(map((c) => (c.selected ? 'true' : 'false')))}
    class={cell.pipe(
      map((c) => dayClass(c, onClick !== undefined, useOutlinedSelectedStyle)),
    )}
    role={constant('gridcell')}
    tabIndex={constant(-1)}
    title={cell.pipe(map((c) => c.holidayJpName))}
    onClick={
      onClick === undefined
        ? undefined
        : () => {
            const { outside, ymd } = Optional.unwrap(cell.getSnapshot());

            if (!outside) {
              onClick(ymd);
            }
          }
    }
  >
    <div class={constant(styles.dayWrapper)}>
      {cell.pipe(map((c) => c.ymd.date.toString()))}
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
