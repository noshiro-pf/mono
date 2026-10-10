import { memoNamed } from 'preact-utils';
import { Arr } from 'ts-data-forge';
import {
  dataStatusSignal,
  narrowSignal,
  taskRowsSignal,
} from '../store/index.mjs';
import { ListToolbar } from './list-toolbar.js';
import { MilestoneSection } from './milestone-section.js';
import { TaskCardList } from './task-card-list.js';
import { TaskTable } from './task-table.js';

/**
 * The tasks, sorted and filtered as the toolbar says — a table on a wide
 * screen, cards on a phone — and the milestones under them.
 */
export const ListView = memoNamed('ListView', () => {
  const rows = taskRowsSignal.value;

  return (
    <main className={'list-view'} data-e2e={'list-view'}>
      <section aria-labelledby={TASKS_HEADING_ID} className={'list-section'}>
        <div className={'section-header'}>
          <h2 className={'section-title'} id={TASKS_HEADING_ID}>
            {'タスク'}
          </h2>
          <ListToolbar />
        </div>
        {dataStatusSignal.value === 'loading' ? (
          <output className={'bp6-text-muted'}>{'読み込み中…'}</output>
        ) : Arr.isEmpty(rows) ? (
          <p className={'bp6-text-muted'}>
            {'表示するタスクはありません。「＋タスク」から追加できます。'}
          </p>
        ) : narrowSignal.value ? (
          <TaskCardList rows={rows} />
        ) : (
          <TaskTable rows={rows} />
        )}
      </section>
      <MilestoneSection />
    </main>
  );
});

const TASKS_HEADING_ID = 'tasks-heading';
