import { type Comparison } from 'pr-report-core';
import * as React from 'react';
import { Num } from 'ts-data-forge';

type Props = Readonly<{
  /** Absent when GitHub could not compare them. */
  comparison: Comparison | undefined;
  /**
   * The largest count on either side anywhere in the report, so that a bar on
   * one card can be compared with a bar on another. A per-card scale would
   * draw `-2` and `-39` the same length.
   */
  scaleMax: number;
  /** Named, because "behind" without "behind what" is half a sentence. */
  baseRef: string;
}>;

/**
 * How far the branch is from its base, drawn the way GitHub's branches view
 * draws it: one bar each side of a centre line.
 *
 * This is a diverging quantity — commits the head has that the base does not,
 * against commits the base has that the head does not — so it gets the
 * diverging pair and a neutral middle rather than two arbitrary hues. Behind
 * is the arm that matters: the ruleset refuses to merge a branch that is
 * behind, so anything but zero on the left is a rebase waiting to happen.
 *
 * Both numbers are written out beside the bars. A reader should never have to
 * measure a bar to learn a count that is three characters long.
 */
export const CommitDivergence = React.memo<Props>((props) => {
  const { comparison, scaleMax, baseRef } = props;

  const behind = React.useMemo(
    () => ({ inlineSize: share(comparison?.behindBy ?? 0, scaleMax) }),
    [comparison?.behindBy, scaleMax],
  );

  const ahead = React.useMemo(
    () => ({ inlineSize: share(comparison?.aheadBy ?? 0, scaleMax) }),
    [comparison?.aheadBy, scaleMax],
  );

  if (comparison === undefined) {
    return <span className={'divergence-unread'}>{'ahead/behind unread'}</span>;
  }

  return (
    <span
      className={'divergence'}
      title={`${comparison.aheadBy} commit(s) ${baseRef} does not have, ${comparison.behindBy} of ${baseRef} this branch does not`}
    >
      <span
        className={'divergence-count'}
      >{`${comparison.behindBy} behind`}</span>

      <span aria-hidden={'true'} className={'divergence-track'}>
        <span className={'divergence-half divergence-behind'}>
          <span className={'divergence-bar'} style={behind} />
        </span>
        <span className={'divergence-half divergence-ahead'}>
          <span className={'divergence-bar'} style={ahead} />
        </span>
      </span>

      <span
        className={'divergence-count'}
      >{`${comparison.aheadBy} ahead`}</span>
    </span>
  );
});

CommitDivergence.displayName = 'CommitDivergence';

/**
 * A zero draws nothing at all rather than a sliver: "nothing on this side" is
 * the answer the reader wants most often, and a hairline that could be
 * rounding is the one way to get it wrong.
 */
const share = (count: number, scaleMax: number): string =>
  count === 0 || !Num.isNonZero(scaleMax)
    ? '0'
    : (`${Math.max(Num.div(count, scaleMax) * 100, MIN_VISIBLE_PERCENT)}%` as const);

/** Small enough to read as "barely any", large enough to see. */
const MIN_VISIBLE_PERCENT = 4;
