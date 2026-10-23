import { constant, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { BlockId } from '../layout.mjs';
import { mergeOrderStore, reader } from '../store/index.mjs';
import { BlockLayout } from './block-layout.js';
import { CyclesSection } from './cycles-section.js';
import { IssuesSection } from './issues-section.js';
import { MergeOrderFilters } from './merge-order-filters.js';
import { MergeOrder } from './merge-order.js';
import { MergedSection } from './merged-section.js';
import { QueueSection } from './queue-section.js';
import { WorkflowRunsSection } from './workflow-runs-section.js';

/**
 * A report that loaded: the five blocks — the merge order under the counts
 * that filter it, the queue `unblock-prs` works through, the workflow runs
 * still going, what landed, and what is open that is not a pull request —
 * laid out as the reader arranged them
 * (`layout.mts`).
 *
 * Each part is its own observable, which the store changes only when a read
 * changed that part (`store/reader.mts`), so a poll that found nothing new
 * rewrites none of this. The time of reading, which every read does change,
 * is not here but in the header (`read-from-github.tsx`).
 */
export const ReportView = (): JSX.Element => <BlockLayout blocks={blocks} />;

/**
 * What each block holds: descriptions, mounted where the layout puts them,
 * and again if a block moves to another column.
 */
const blocks: ReadonlyRecord<BlockId, JSX.Element> = {
  open: (
    <>
      <section class={constant('section')}>
        {/* One sticky head: the counts stay in view under the title. */}
        <div class={constant('section-head')}>
          <h2 class={constant('section-title')}>{constant('Merge order')}</h2>
          <MergeOrderFilters />
        </div>
        <If
          cond={view(reader.entries, Arr.isNonEmpty)}
          then={
            <If
              // The merge order as the filters leave it
              // (`merge-order-view.mts`).
              cond={view(mergeOrderStore.roots, Arr.isNonEmpty)}
              then={<MergeOrder depth={0} nodes={mergeOrderStore.roots} />}
              else={
                <p class={constant('section-note')}>
                  {constant(
                    'No open pull request is left by the filters above.',
                  )}
                </p>
              }
            />
          }
          else={
            <p class={constant('section-note')}>
              {constant('No open pull requests.')}
            </p>
          }
        />
      </section>

      <If cond={view(reader.cycles, Arr.isNonEmpty)} then={<CyclesSection />} />
    </>
  ),
  queue: <QueueSection />,
  runs: <WorkflowRunsSection />,
  merged: <MergedSection />,
  issues: <IssuesSection />,
} as const;
