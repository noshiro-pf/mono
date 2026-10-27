import { combine, map } from 'synstate';
import { constant, For, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { clockStore, dataStore } from '../store/index.mjs';
import { buildMilestoneRows } from '../view-model/index.mjs';
import { MilestoneItem } from './milestone-item.js';

export const MilestoneSection = (): JSX.Element => {
  const rows$ = combine([dataStore.state, clockStore.now]).pipe(
    map(([state, now]) => buildMilestoneRows(state, now)),
  );

  return (
    <section
      aria-labelledby={constant(HEADING_ID)}
      class={constant('list-section')}
    >
      <div class={constant('section-header')}>
        <h2 class={constant('section-title')} id={constant(HEADING_ID)}>
          {constant('マイルストーン')}
        </h2>
      </div>
      <If
        cond={view(rows$, Arr.isEmpty)}
        then={
          <p class={constant('bp6-text-muted')}>
            {constant(
              'マイルストーンはありません。「＋マイルストーン」から追加できます。',
            )}
          </p>
        }
        else={
          <ul class={constant('milestone-list')}>
            <For items={rows$} key={(row) => row.milestone.id}>
              {(row$) => <MilestoneItem row={row$} />}
            </For>
          </ul>
        }
      />
    </section>
  );
};

const HEADING_ID = 'milestones-heading';
