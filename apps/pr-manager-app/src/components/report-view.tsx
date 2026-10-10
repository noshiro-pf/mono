import type { ComponentChildren } from 'preact';
import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { formatLocalTime } from '../format.mjs';
import type { BlockId } from '../layout.mjs';
import { MERGED_WITHIN_DAYS, type LoadedReport } from '../load-report.mjs';
import { Age } from './age.js';
import { BlockLayout } from './block-layout.js';
import { CyclesSection } from './cycles-section.js';
import { IssuesSection } from './issues-section.js';
import { MergeOrder } from './merge-order.js';
import { MergedSection } from './merged-section.js';
import { SummaryRow } from './summary-row.js';

type Props = Readonly<{
  report: LoadedReport;
}>;

/**
 * A report that loaded: the counts, then the three blocks — the queue, what
 * landed, and what is open that is not a pull request — laid out as the
 * reader arranged them (`layout.mts`).
 */
export const ReportView = memoNamed<Props>('ReportView', (props) => {
  const { report } = props;

  // One object per report, so that `BlockLayout` is not handed a new one on
  // every render. The ages inside follow the clock without it (`age.tsx`).
  const blocks = useMemo<ReadonlyRecord<BlockId, ComponentChildren>>(() => {
    const repoUrl =
      `https://github.com/${report.repo.owner}/${report.repo.name}` as const;

    const byNumber = new Map(
      report.entries.map((entry) => [entry.number, entry]),
    );

    return {
      open: (
        <>
          <section className={'section'}>
            <h2 className={'section-title'}>{'Merge order'}</h2>
            {Arr.isNonEmpty(report.entries) ? (
              <MergeOrder
                byNumber={byNumber}
                nodes={report.roots}
                scaleMax={divergenceScale(report.entries)}
              />
            ) : (
              <p className={'section-note'}>{'No open pull requests.'}</p>
            )}
          </section>

          {Arr.isNonEmpty(report.cycles) ? (
            <CyclesSection cycles={report.cycles} repoUrl={repoUrl} />
          ) : undefined}
        </>
      ),
      merged: (
        <MergedSection merged={report.merged} withinDays={MERGED_WITHIN_DAYS} />
      ),
      issues: (
        <IssuesSection
          issues={report.issues.items}
          totalCount={report.issues.totalCount}
        />
      ),
    };
  }, [report]);

  return (
    <>
      <p className={'page-subtitle'}>
        {'Read from GitHub '}
        <Age epochMs={report.readAtEpochMs} />
        {' · '}
        {formatLocalTime(report.readAtEpochMs)}
      </p>

      <SummaryRow summary={report.summary} />

      <BlockLayout blocks={blocks} />
    </>
  );
});

/**
 * One scale for every divergence bar on the page, so that a bar on one card
 * can be compared with a bar on another. Per-card, `-2` and `-39` would be
 * drawn the same length, which is the one thing the bars are for.
 */
const divergenceScale = (
  entries: readonly Readonly<{
    comparison: Readonly<{ aheadBy: number; behindBy: number }> | undefined;
  }>[],
): number =>
  Math.max(
    1,
    ...entries.flatMap(({ comparison }) =>
      comparison === undefined ? [] : [comparison.aheadBy, comparison.behindBy],
    ),
  );
