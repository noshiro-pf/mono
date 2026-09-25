import * as React from 'react';
import { Arr } from 'ts-data-forge';
import { describeAge, formatLocalTime } from '../format.mjs';
import { MERGED_WITHIN_DAYS, type LoadedReport } from '../load-report.mjs';
import { CyclesSection } from './cycles-section.js';
import { MergeOrder } from './merge-order.js';
import { MergedSection } from './merged-section.js';
import { SummaryRow } from './summary-row.js';

type Props = Readonly<{
  report: LoadedReport;
  /** Passed in so that "read 3 minutes ago" is a function of its inputs. */
  nowMs: number;
}>;

/** A report that loaded: the counts, the queue, and what landed. */
export const ReportView = React.memo<Props>((props) => {
  const { report, nowMs } = props;

  const repoUrl =
    `https://github.com/${report.repo.owner}/${report.repo.name}` as const;

  const byNumber = new Map(
    report.entries.map((entry) => [entry.number, entry]),
  );

  return (
    <>
      <p className={'page-subtitle'}>
        {`Read from GitHub ${describeAge(report.readAtEpochMs, nowMs)} · `}
        {formatLocalTime(report.readAtEpochMs)}
      </p>

      <SummaryRow summary={report.summary} />

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

      <MergedSection
        merged={report.merged}
        nowMs={nowMs}
        withinDays={MERGED_WITHIN_DAYS}
      />
    </>
  );
});

ReportView.displayName = 'ReportView';

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
