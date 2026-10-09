import { memoNamed } from 'preact-utils';
import { Arr } from 'ts-data-forge';
import {
  formatDateTime,
  type MilestoneDraftInsight,
} from '../view-model/index.mjs';

type Props = Readonly<{
  insight: MilestoneDraftInsight;
}>;

/**
 * Whether the milestone as drafted is reached, and if not, which of its
 * conditions are still waiting.
 */
export const MilestoneReachState = memoNamed<Props>(
  'MilestoneReachState',
  ({ insight }) => {
    const waiting = [
      ...(insight.waitingForDate === undefined
        ? ([] as const)
        : ([`日時（${formatDateTime(insight.waitingForDate)}）`] as const)),
      ...(insight.waitingForCheck
        ? (['手動チェック'] as const)
        : ([] as const)),
      ...(Arr.isNonEmpty(insight.unmet)
        ? ([`依存（未充足 ${insight.unmet.length} 件）`] as const)
        : ([] as const)),
    ] as const;

    return (
      <div className={'milestone-reach-state'}>
        <span
          className={`bp6-tag bp6-round milestone-badge ${insight.reachedAt === undefined ? 'pending' : 'reached'}`}
          data-e2e={'draft-status'}
        >
          {insight.reachedAt === undefined
            ? '◇ 未到達'
            : `◆ 到達済み（${formatDateTime(insight.reachedAt)}）`}
        </span>
        {insight.reachedAt === undefined && Arr.isNonEmpty(waiting) ? (
          <span className={'bp6-text-muted'}>
            {`待っている条件: ${waiting.join('、')}`}
          </span>
        ) : undefined}
      </div>
    );
  },
);
