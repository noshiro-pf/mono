import { combine, map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import { Num } from 'ts-data-forge';

type Props = Readonly<{
  comparison: InitializedObservable<
    Readonly<{ aheadBy: number; behindBy: number }> | undefined
  >;
  /** The most commits any card is ahead or behind: one scale for the page. */
  scaleMax: InitializedObservable<number>;
}>;

/**
 * How far the branch is from its base, as GitHub's branches view draws it: a
 * bar each side of a centre line, behind in red on the left and ahead in blue
 * on the right, with both numbers written out so nobody measures a bar.
 */
export const Divergence = ({ comparison, scaleMax }: Props): JSX.Element => {
  const widths = combine([comparison, scaleMax]).pipe(
    map(([c, max]) => ({
      behind: percentOf(c?.behindBy ?? 0, max),
      ahead: percentOf(c?.aheadBy ?? 0, max),
    })),
  );

  return (
    <If
      cond={comparison.pipe(map((c) => c !== undefined))}
      then={
        <span
          class={constant('divergence')}
          title={comparison.pipe(
            map(
              (c) =>
                `${c?.behindBy ?? 0} commits behind its base, ${c?.aheadBy ?? 0} ahead`,
            ),
          )}
        >
          <span class={constant('divergence-count')}>
            {comparison.pipe(map((c) => `-${c?.behindBy ?? 0}`))}
          </span>
          <span
            aria-hidden={constant('true')}
            class={constant('divergence-bars')}
          >
            <span class={constant('divergence-side divergence-behind')}>
              <span
                style={{ width: widths.pipe(map((w) => `${w.behind}%`)) }}
              />
            </span>
            <span class={constant('divergence-side divergence-ahead')}>
              <span style={{ width: widths.pipe(map((w) => `${w.ahead}%`)) }} />
            </span>
          </span>
          <span class={constant('divergence-count')}>
            {comparison.pipe(map((c) => `+${c?.aheadBy ?? 0}`))}
          </span>
        </span>
      }
      else={
        <span
          class={constant('muted')}
          title={constant('GitHub could not compare the branch with its base.')}
        >
          {constant('ahead/behind unread')}
        </span>
      }
    />
  );
};

const percentOf = (count: number, max: number): number =>
  Num.isNonZero(max) ? Num.div(count * 100, max) : 0;
