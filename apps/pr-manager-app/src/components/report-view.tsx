import type * as React from 'react';
import { Arr, type Result } from 'ts-data-forge';
import { type LoadedReport, type LoadedRunLog } from '../fetch-report.mjs';
import { describeAge } from '../format.mjs';
import { CyclesSection } from './cycles-section.js';
import { MergeOrder } from './merge-order.js';
import { MergedSection } from './merged-section.js';
import { RunLogSection } from './run-log-section.js';
import { SummaryRow } from './summary-row.js';

type Props = Readonly<{
  report: LoadedReport;
  /** The log, or the sentence saying why the page has not got one. */
  runLog: Result<LoadedRunLog, string>;
  /** Passed in so that "generated 3 hours ago" is a function of its inputs. */
  nowMs: number;
}>;

/** A report that loaded: the counts, the queue, what landed, and the caveats. */
export const ReportView = ({
  report,
  runLog,
  nowMs,
}: Props): React.ReactElement => {
  const { payload, sourceUrl } = report;

  const repoUrl =
    `https://github.com/${payload.repo.owner}/${payload.repo.name}` as const;

  const byNumber = new Map(
    payload.entries.map((entry) => [entry.number, entry]),
  );

  return (
    <>
      <p className={'page-subtitle'}>
        {`Generated ${describeAge(payload.generatedAtEpochMs, nowMs)} `}
        <a href={sourceUrl}>{'from the report data'}</a>
        {` · ${payload.generatedAt}`}
      </p>

      <SummaryRow summary={payload.summary} />

      <section className={'section'}>
        <h2 className={'section-title'}>{'Merge order'}</h2>
        {Arr.isNonEmpty(payload.entries) ? (
          <MergeOrder
            byNumber={byNumber}
            nodes={payload.roots}
            scaleMax={divergenceScale(payload.entries)}
          />
        ) : (
          <p className={'section-note'}>{'No open pull requests.'}</p>
        )}
      </section>

      {Arr.isNonEmpty(payload.cycles) ? (
        <CyclesSection cycles={payload.cycles} repoUrl={repoUrl} />
      ) : undefined}

      <MergedSection
        merged={payload.merged}
        nowMs={nowMs}
        withinDays={payload.mergedWithinDays}
      />

      <RunLogSection nowMs={nowMs} repoUrl={repoUrl} runLog={runLog} />

      {payload.authenticated ? undefined : (
        <p className={'footnote'}>
          {
            'This report was read without a token: the linked issues are the ones'
          }
          {'the bodies declare with a closing keyword, not GitHub’s own list.'}
        </p>
      )}
    </>
  );
};

/**
 * One scale for every divergence bar on the page, so that a bar on one card
 * can be compared with a bar on another. Per-card, `-2` and `-39` would be
 * drawn the same length, which is the one thing the bars are for.
 */
const divergenceScale = (
  entries: readonly Readonly<{
    comparison: Readonly<{ aheadBy: number; behindBy: number }> | null;
  }>[],
): number =>
  Math.max(
    1,
    ...entries.flatMap(({ comparison }) =>
      comparison === null ? [] : [comparison.aheadBy, comparison.behindBy],
    ),
  );
