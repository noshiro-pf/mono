import { constant, For, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { DayOfWeekIndex } from 'ts-type-forge';
import { daysOfWeekList } from '../../utils-ported/index.mjs';
import * as styles from './multiple-date-picker.module.css';

type Props = Readonly<{
  /** Absent for a read-only picker. */
  onClick: ((w: DayOfWeekIndex) => void) | undefined;
}>;

export const WeekdaysHeader = ({ onClick }: Props): JSX.Element => (
  <thead class={constant(styles.weekdays)}>
    <tr class={constant(styles.row)}>
      <For items={constant(daysOfWeekList.en)} key={(w) => w.name}>
        {(w$, index$) => {
          const { name, abbr } = Optional.unwrap(w$.getSnapshot());

          const label = (
            <abbr class={constant(styles.abbr)} title={constant(name)}>
              {constant(abbr)}
            </abbr>
          );

          return (
            <th
              class={constant(
                onClick === undefined
                  ? styles.weekday
                  : `${styles.weekday} ${styles.weekdayClickable}`,
              )}
              scope={constant('col')}
            >
              {onClick === undefined ? (
                label
              ) : (
                <button
                  class={constant(styles.weekdayButton)}
                  type={constant('button')}
                  onClick={() => {
                    onClick(
                      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                      Optional.unwrap(index$.getSnapshot()) as DayOfWeekIndex,
                    );
                  }}
                >
                  {label}
                </button>
              )}
            </th>
          );
        }}
      </For>
    </tr>
  </thead>
);
