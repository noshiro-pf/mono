import { map, type InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import { Arr, asSafeUint, Num, Optional, SafeUint } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import * as styles from './histogram.module.css';

type Props = Readonly<{
  sumCount: InitializedObservable<FixedLengthTuple<11, SafeUint>>;
}>;

/** The count of each sum rolled, as a bar per sum from 2 to 12. */
export const Histogram = ({ sumCount }: Props): JSX.Element => {
  // Each bar's height is a share of the tallest one: found once per update, not
  // once per bar.
  const bars$ = sumCount.pipe(map(toBars));

  return (
    <div class={constant(styles.root)}>
      <div class={constant(styles.header)}>
        <div
          class={constant(styles.rollCount)}
          data-e2e={constant('roll-count')}
        >
          {view(sumCount, (counts) => `N = ${counts.reduce(SafeUint.add, 0)}`)}
        </div>
      </div>
      <div class={constant(styles.columns)}>
        {domain.map((sum, index) => (
          <div class={constant(styles.column)}>
            <div class={constant(styles.track)}>
              <div
                class={constant(styles.bar)}
                data-e2e={constant(`histogram-count-${sum}`)}
                style={{
                  height: view(bars$, (bars) => bars[index]?.height ?? '0%'),
                }}
              >
                {view(bars$, (bars) => bars[index]?.label ?? '')}
              </div>
            </div>
            <div class={constant(styles.label)}>{constant(sum)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const domain = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/**
 * Each bar's height, as a share of the tallest bar's, and its label: the count,
 * or nothing for none.
 */
const toBars = (
  counts: FixedLengthTuple<11, SafeUint>,
): readonly Readonly<{ height: string; label: number | '' }>[] => {
  // `counts` is a fixed 11-tuple, so `Arr.max` is always `Some`.
  const max = Optional.unwrapOr(Arr.max(counts), asSafeUint(0));

  return counts.map((count) => ({
    height: `${Num.isPositive(max) ? Num.div(100 * count, max) : 0}%`,
    label: count > 0 ? count : '',
  }));
};
