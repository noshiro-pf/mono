import type { InitializedObservable } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { editorStore } from '../store/index.mjs';
import { formatWhen, type MilestoneRow } from '../view-model/index.mjs';

type Props = Readonly<{
  row: InitializedObservable<MilestoneRow>;
}>;

/** One milestone: whether it is reached, its date, and its manual check. */
export const MilestoneItem = ({ row }: Props): JSX.Element => (
  <li>
    <button
      class={constant('bp6-card milestone-item')}
      data-e2e={constant('milestone-row')}
      type={constant('button')}
      onClick={() => {
        editorStore.open({
          kind: 'milestone',
          id: row.getSnapshot().value.milestone.id,
        });
      }}
    >
      <span
        class={view(
          row,
          ({ reachedAt }) =>
            `bp6-tag bp6-round milestone-badge ${reachedAt === undefined ? 'pending' : 'reached'}`,
        )}
      >
        {view(row, ({ reachedAt }) =>
          reachedAt === undefined ? m.list.unreached : m.list.reached,
        )}
      </span>
      <span class={constant('milestone-title')}>
        {view(row, ({ milestone }) => milestone.title)}
      </span>
      <span class={constant('milestone-meta')}>
        <If
          cond={view(row, ({ milestone }) => milestone.date !== undefined)}
          then={
            <span>
              {view(row, ({ milestone }) =>
                milestone.date === undefined
                  ? ''
                  : formatWhen(milestone.date, milestone.dateAllDay),
              )}
            </span>
          }
        />
        <If
          cond={view(row, ({ milestone }) => milestone.requiresManualCheck)}
          then={
            <span
              class={view(
                row,
                ({ awaitingCheck }) =>
                  `bp6-tag bp6-minimal ${awaitingCheck ? 'bp6-intent-warning' : 'bp6-intent-success'}`,
              )}
            >
              {view(row, ({ awaitingCheck }) =>
                awaitingCheck ? m.list.awaitingCheck : m.list.checked,
              )}
            </span>
          }
        />
      </span>
    </button>
  </li>
);
