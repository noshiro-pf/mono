import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { m } from '../i18n/index.mjs';
import {
  formatDateTime,
  formatWhen,
  type MilestoneDraftInsight,
} from '../view-model/index.mjs';

type Props = Readonly<{
  insight: Bindable<MilestoneDraftInsight>;
}>;

/**
 * Whether the milestone as drafted is reached, and if not, which of its
 * conditions are still waiting.
 */
export const MilestoneReachState = ({ insight }: Props): JSX.Element => {
  const waiting = mapBindable(insight, waitingConditions);

  return (
    <div class={constant('milestone-reach-state')}>
      <span
        class={mapBindable(
          insight,
          ({ reachedAt }) =>
            `bp6-tag bp6-round milestone-badge ${reachedAt === undefined ? 'pending' : 'reached'}`,
        )}
        data-e2e={constant('draft-status')}
      >
        {mapBindable(insight, ({ reachedAt }) =>
          reachedAt === undefined
            ? m.nodeDialog.unreached
            : m.nodeDialog.reachedAt(formatDateTime(reachedAt)),
        )}
      </span>
      <If
        cond={mapBindable(waiting, Arr.isNonEmpty)}
        then={
          <span class={constant('bp6-text-muted')}>
            {mapBindable(waiting, (w) =>
              m.nodeDialog.waitingFor(w.join(m.common.conditionSeparator)),
            )}
          </span>
        }
      />
    </div>
  );
};

/** What a milestone not yet reached still waits for; nothing once it is. */
const waitingConditions = (
  insight: MilestoneDraftInsight,
): readonly string[] =>
  insight.reachedAt !== undefined
    ? ([] as const)
    : ([
        ...(insight.waitingForDate === undefined
          ? ([] as const)
          : ([
              m.nodeDialog.waitingForDate(
                formatWhen(insight.waitingForDate, insight.dateAllDay),
              ),
            ] as const)),
        ...(insight.waitingForCheck
          ? ([m.nodeDialog.waitingForCheck] as const)
          : ([] as const)),
        ...(Arr.isNonEmpty(insight.unmet)
          ? ([
              m.nodeDialog.waitingForDependencies(insight.unmet.length),
            ] as const)
          : ([] as const)),
      ] as const);
