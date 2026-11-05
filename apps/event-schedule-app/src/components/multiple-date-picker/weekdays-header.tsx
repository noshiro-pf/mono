import { constant, For, type JSX } from 'synstate-dom';
import type { DayOfWeekIndex } from 'ts-type-forge';
import { daysOfWeekList } from '../../utils-ported/index.mjs';
import * as styles from './multiple-date-picker.module.css';

type Props = Readonly<{
  /** Absent for a read-only picker. */
  onClick: ((w: DayOfWeekIndex) => void) | undefined;
}>;

export const WeekdaysHeader = ({ onClick }: Props): JSX.Element => (
  <div class={constant(styles.weekdays)} role={constant('rowgroup')}>
    <div class={constant(styles.row)} role={constant('row')}>
      <For items={constant(daysOfWeekList.en)} key={(w) => w.name}>
        {(w$, index$) => {
          const { name, abbr } = w$.getSnapshot().value;

          return (
            <div
              class={constant(
                onClick === undefined
                  ? styles.weekday
                  : `${styles.weekday} ${styles.weekdayClickable}`,
              )}
              role={constant('columnheader')}
              onClick={
                onClick === undefined
                  ? undefined
                  : () => {
                      onClick(
                        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                        index$.getSnapshot().value as DayOfWeekIndex,
                      );
                    }
              }
            >
              <abbr class={constant(styles.abbr)} title={constant(name)}>
                {constant(abbr)}
              </abbr>
            </div>
          );
        }}
      </For>
    </div>
  </div>
);
