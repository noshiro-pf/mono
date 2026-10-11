import { type ComponentChildren } from 'preact';
import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { Arr } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { REPORT_SOURCE, repositoryUrl } from '../constants.mjs';
import { type BlockId } from '../layout.mjs';
import { MERGED_WITHIN_DAYS } from '../load-report.mjs';
import { readerSignals } from '../store/index.mjs';
import { BlockLayout } from './block-layout.js';
import { CyclesSection } from './cycles-section.js';
import { IssuesSection } from './issues-section.js';
import { MergeOrder } from './merge-order.js';
import { MergedSection } from './merged-section.js';
import { ReadFromGitHub } from './read-from-github.js';
import { SummaryRow } from './summary-row.js';

/**
 * A report that loaded: the counts, then the three blocks — the queue, what
 * landed, and what is open that is not a pull request — laid out as the
 * reader arranged them (`layout.mts`).
 *
 * Each part is its own signal, which the store changes only when a read
 * changed that part (`store/reader.mts`), so a poll that found nothing new
 * renders none of this. The time of reading, which every read does change,
 * is read by the one line that shows it.
 */
export const ReportView = memoNamed('ReportView', () => {
  const summary = readerSignals.summary.value;

  const entries = readerSignals.entries.value;

  const byNumber = readerSignals.byNumber.value;

  const scaleMax = readerSignals.scaleMax.value;

  const roots = readerSignals.roots.value;

  const cycles = readerSignals.cycles.value;

  const merged = readerSignals.merged.value;

  const issues = readerSignals.issues.value;

  // One object while the parts stay the same, so that `BlockLayout` is not
  // handed a new one on every render.
  const blocks = useMemo<ReadonlyRecord<BlockId, ComponentChildren>>(
    () => ({
      open: (
        <>
          <section className={'section'}>
            <h2 className={'section-title'}>{'Merge order'}</h2>
            {Arr.isNonEmpty(entries) ? (
              <MergeOrder
                byNumber={byNumber}
                nodes={roots}
                scaleMax={scaleMax}
              />
            ) : (
              <p className={'section-note'}>{'No open pull requests.'}</p>
            )}
          </section>

          {Arr.isNonEmpty(cycles) ? (
            <CyclesSection cycles={cycles} repoUrl={REPO_URL} />
          ) : undefined}
        </>
      ),
      merged: <MergedSection merged={merged} withinDays={MERGED_WITHIN_DAYS} />,
      issues: (
        <IssuesSection issues={issues.items} totalCount={issues.totalCount} />
      ),
    }),
    [entries, byNumber, scaleMax, roots, cycles, merged, issues],
  );

  return (
    <>
      <ReadFromGitHub />

      <SummaryRow summary={summary} />

      <BlockLayout blocks={blocks} />
    </>
  );
});

const REPO_URL = repositoryUrl(REPORT_SOURCE);
