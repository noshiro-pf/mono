import {
  constant,
  derive,
  If,
  mapBindable,
  MatchOptional,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Num, Optional } from 'ts-data-forge';
import type { Entry } from '../load-report.mjs';

type Props = Readonly<{
  /**
   * The comparison is absent when GitHub could not compare them; the base is
   * named, because "behind" without "behind what" is half a sentence.
   */
  entry: Bindable<Entry>;
  /**
   * The largest count on either side anywhere in the report, so that a bar on
   * one card can be compared with a bar on another. A per-card scale would draw
   * `-2` and `-39` the same length.
   */
  scaleMax: Bindable<number>;
}>;

/**
 * How far the branch is from its base, drawn the way GitHub's branches view
 * draws it: one bar each side of a centre line.
 *
 * This is a diverging quantity — commits the head has that the base does not,
 * against commits the base has that the head does not — so it gets the
 * diverging pair and a neutral middle rather than two arbitrary hues. Behind is
 * the arm that matters: the ruleset refuses to merge a branch that is behind,
 * so anything but zero on the left is a rebase waiting to happen.
 *
 * Both numbers are written out beside the bars. A reader should never have to
 * measure a bar to learn a count that is three characters long.
 */
export const CommitDivergence = ({ entry, scaleMax }: Props): JSX.Element => (
  <If
    cond={mapBindable(entry, ({ reading }) => reading.includes('comparison'))}
    then={
      <span class={constant('divergence-unread')}>
        {constant('reading ahead/behind…')}
      </span>
    }
    else={
      <MatchOptional
        value={mapBindable(entry, ({ comparison, baseRef }) =>
          comparison === undefined
            ? Optional.none
            : Optional.some({ ...comparison, baseRef }),
        )}
        some={(shown$) => (
          <span
            class={constant('divergence')}
            title={mapBindable(
              shown$,
              ({ aheadBy, behindBy, baseRef }) =>
                `${aheadBy} commit(s) ${baseRef} does not have, ${behindBy} of ${baseRef} this branch does not`,
            )}
          >
            <span class={constant('divergence-count')}>
              {mapBindable(shown$, ({ behindBy }) => `${behindBy} behind`)}
            </span>

            <span
              aria-hidden={constant('true')}
              class={constant('divergence-track')}
            >
              <span class={constant('divergence-half divergence-behind')}>
                <span
                  class={constant('divergence-bar')}
                  style={{
                    'inline-size': derive(
                      [shown$, scaleMax],
                      ({ behindBy }, max) => share(behindBy, max),
                    ),
                  }}
                />
              </span>
              <span class={constant('divergence-half divergence-ahead')}>
                <span
                  class={constant('divergence-bar')}
                  style={{
                    'inline-size': derive(
                      [shown$, scaleMax],
                      ({ aheadBy }, max) => share(aheadBy, max),
                    ),
                  }}
                />
              </span>
            </span>

            <span class={constant('divergence-count')}>
              {mapBindable(shown$, ({ aheadBy }) => `${aheadBy} ahead`)}
            </span>
          </span>
        )}
        none={
          <span class={constant('divergence-unread')}>
            {constant('ahead/behind unread')}
          </span>
        }
      />
    }
  />
);

/**
 * A zero draws nothing at all rather than a sliver: "nothing on this side" is
 * the answer the reader wants most often, and a hairline that could be rounding
 * is the one way to get it wrong.
 */
const share = (count: number, scaleMax: number): string =>
  count === 0 || !Num.isNonZero(scaleMax)
    ? '0'
    : (`${Math.max(Num.div(count, scaleMax) * 100, MIN_VISIBLE_PERCENT)}%` as const);

/** Small enough to read as "barely any", large enough to see. */
const MIN_VISIBLE_PERCENT = 4;
