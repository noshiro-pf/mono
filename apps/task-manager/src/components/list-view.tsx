import { combine, map } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { m } from '../i18n/index.mjs';
import {
  clockStore,
  dataStore,
  listSettingsStore,
  narrowStore,
} from '../store/index.mjs';
import { buildTaskRows } from '../view-model/index.mjs';
import { ListToolbar } from './list-toolbar.js';
import { MilestoneSection } from './milestone-section.js';
import { TaskCardList } from './task-card-list.js';
import { TaskTable } from './task-table.js';

/**
 * The tasks, sorted and filtered as the toolbar says — a table on a wide
 * screen, cards on a phone — and the milestones under them.
 */
export const ListView = (): JSX.Element => {
  const rows$ = combine([
    dataStore.state,
    clockStore.now,
    listSettingsStore.settings,
  ]).pipe(map(([state, now, settings]) => buildTaskRows(state, now, settings)));

  return (
    <main class={constant('list-view')} data-e2e={constant('list-view')}>
      <section
        aria-labelledby={constant(TASKS_HEADING_ID)}
        class={constant('list-section')}
      >
        <div class={constant('section-header')}>
          <h2 class={constant('section-title')} id={constant(TASKS_HEADING_ID)}>
            {constant(m.list.tasks)}
          </h2>
          <ListToolbar />
        </div>
        <If
          cond={view(dataStore.status, (status) => status === 'loading')}
          then={
            <output class={constant('bp6-text-muted')}>
              {constant(m.app.loading)}
            </output>
          }
          else={
            <If
              cond={view(rows$, Arr.isEmpty)}
              then={
                <p class={constant('bp6-text-muted')}>
                  {constant(m.list.noTasks)}
                </p>
              }
              else={
                <If
                  cond={narrowStore.matches}
                  then={<TaskCardList rows={rows$} />}
                  else={<TaskTable rows={rows$} />}
                />
              }
            />
          }
        />
      </section>
      <MilestoneSection />
    </main>
  );
};

const TASKS_HEADING_ID = 'tasks-heading';
