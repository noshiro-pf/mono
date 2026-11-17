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
 * on the right, on a track that shows the scale, with both numbers written out
 * so nobody measures a bar.
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
            {comparison.pipe(map((c) => `${c?.behindBy ?? 0} behind`))}
          </span>
          <span
            aria-hidden={constant('true')}
            class={constant('divergence-bars')}
          >
            <span class={constant('divergence-side divergence-behind')}>
              <span style={{ width: widths.pipe(map((w) => w.behind)) }} />
            </span>
            <span class={constant('divergence-side divergence-ahead')}>
              <span style={{ width: widths.pipe(map((w) => w.ahead)) }} />
            </span>
          </span>
          <span class={constant('divergence-count')}>
            {comparison.pipe(map((c) => `${c?.aheadBy ?? 0} ahead`))}
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

/** Small enough to read as "barely any", large enough to see. */
const MIN_VISIBLE_PERCENT = 4;

/**
 * A zero draws nothing rather than a sliver, since "nothing on this side" is
 * the answer read most often; anything else at least a few percent, so a count
 * of one beside a count of hundreds still shows.
 */
const percentOf = (count: number, max: number): string =>
  count === 0 || !Num.isNonZero(max)
    ? '0'
    : (`${Math.max(Num.div(count * 100, max), MIN_VISIBLE_PERCENT)}%` as const);
