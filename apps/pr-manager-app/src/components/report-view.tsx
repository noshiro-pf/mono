import type { ComponentChildren } from 'preact';
import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { REPORT_SOURCE, repositoryUrl } from '../constants.mjs';
import type { BlockId } from '../layout.mjs';
import { MERGED_WITHIN_DAYS } from '../load-report.mjs';
import { mergeOrderSignals, readerSignals } from '../store/index.mjs';
import { BlockLayout } from './block-layout.js';
import { CyclesSection } from './cycles-section.js';
import { IssuesSection } from './issues-section.js';
import { MergeOrderFilters } from './merge-order-filters.js';
import { MergeOrder } from './merge-order.js';
import { MergedSection } from './merged-section.js';

/**
 * A report that loaded: the three blocks — the queue under the counts that
 * filter it, what landed, and what is open that is not a pull request — laid
 * out as the reader arranged them (`layout.mts`).
 *
 * Each part is its own signal, which the store changes only when a read
 * changed that part (`store/reader.mts`), so a poll that found nothing new
 * renders none of this. The time of reading, which every read does change,
 * is not here but in the header (`read-from-github.tsx`).
 */
export const ReportView = memoNamed('ReportView', () => {
  const entries = readerSignals.entries.value;

  const byNumber = readerSignals.byNumber.value;

  const scaleMax = readerSignals.scaleMax.value;

  // The merge order as the filters leave it (`merge-order-view.mts`).
  const roots = mergeOrderSignals.roots.value;

  const cycles = readerSignals.cycles.value;

  const merged = readerSignals.merged.value;

  const issues = readerSignals.issues.value;

  // The sections below the merge order that have not answered yet.
  const reading = readerSignals.reading.value;

  const readingMerged = reading.includes('merged');

  const readingIssues = reading.includes('issues');

  // One object while the parts stay the same, so that `BlockLayout` is not
  // handed a new one on every render.
  const blocks = useMemo<ReadonlyRecord<BlockId, ComponentChildren>>(
    () => ({
      open: (
        <>
          <section className={'section'}>
            {/* One sticky head: the counts stay in view under the title. */}
            <div className={'section-head'}>
              <h2 className={'section-title'}>{'Merge order'}</h2>
              <MergeOrderFilters />
            </div>
            {!Arr.isNonEmpty(entries) ? (
              <p className={'section-note'}>{'No open pull requests.'}</p>
            ) : Arr.isNonEmpty(roots) ? (
              <MergeOrder
                byNumber={byNumber}
                nodes={roots}
                scaleMax={scaleMax}
              />
            ) : (
              <p className={'section-note'}>
                {'No open pull request is left by the filters above.'}
              </p>
            )}
          </section>

          {Arr.isNonEmpty(cycles) ? (
            <CyclesSection cycles={cycles} repoUrl={REPO_URL} />
          ) : undefined}
        </>
      ),
      merged: (
        <MergedSection
          merged={merged}
          reading={readingMerged}
          withinDays={MERGED_WITHIN_DAYS}
        />
      ),
      issues: <IssuesSection issues={issues} reading={readingIssues} />,
    }),
    [
      entries,
      byNumber,
      scaleMax,
      roots,
      cycles,
      merged,
      issues,
      readingMerged,
      readingIssues,
    ],
  );

  return <BlockLayout blocks={blocks} />;
});

const REPO_URL = repositoryUrl(REPORT_SOURCE);
