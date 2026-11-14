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
  // eslint-disable-next-line synstate-dom-a11y/prefer-tag-over-role -- recorded, not fixed, when jsx-a11y came to synstate-dom (#3764)
  <div class={constant(styles.weekdays)} role={constant('rowgroup')}>
    {/* eslint-disable-next-line synstate-dom-a11y/prefer-tag-over-role -- recorded, not fixed, when jsx-a11y came to synstate-dom (#3764) */}
    <div class={constant(styles.row)} role={constant('row')}>
      <For items={constant(daysOfWeekList.en)} key={(w) => w.name}>
        {(w$, index$) => {
          const { name, abbr } = Optional.unwrap(w$.getSnapshot());

          return (
            // eslint-disable-next-line synstate-dom-a11y/click-events-have-key-events, synstate-dom-a11y/interactive-supports-focus, synstate-dom-a11y/prefer-tag-over-role -- recorded, not fixed, when jsx-a11y came to synstate-dom (#3764)
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
                        Optional.unwrap(index$.getSnapshot()) as DayOfWeekIndex,
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
