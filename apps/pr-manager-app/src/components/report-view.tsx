import type * as React from 'react';
import { Arr } from 'ts-data-forge';
import { type LoadedReport } from '../fetch-report.mjs';
import { describeAge } from '../format.mjs';
import { CyclesSection } from './cycles-section.js';
import { MergeOrder } from './merge-order.js';
import { SummaryRow } from './summary-row.js';

type Props = Readonly<{
  report: LoadedReport;
  /** Passed in so that "generated 3 hours ago" is a function of its inputs. */
  nowMs: number;
}>;

/** A report that loaded: the counts, the merge order, and the caveats. */
export const ReportView = ({ report, nowMs }: Props): React.ReactElement => {
  const { payload, issueUrl } = report;

  const repoUrl = `https://github.com/${payload.repo.owner}/${payload.repo.name}`;

  const byNumber = new Map(
    payload.entries.map((entry) => [entry.number, entry]),
  );

  return (
    <>
      <p className={'page-subtitle'}>
        {`Generated ${describeAge(payload.generatedAtEpochMs, nowMs)} `}
        <a href={issueUrl}>{'from the report issue'}</a>
        {` · ${payload.generatedAt}`}
      </p>

      <SummaryRow summary={payload.summary} />

      <section className={'section'}>
        <h2 className={'section-title'}>{'Merge order'}</h2>
        {Arr.isNonEmpty(payload.entries) ? (
          <MergeOrder byNumber={byNumber} nodes={payload.roots} />
        ) : (
          <p className={'section-note'}>{'No open pull requests.'}</p>
        )}
      </section>

      {Arr.isNonEmpty(payload.cycles) ? (
        <CyclesSection cycles={payload.cycles} repoUrl={repoUrl} />
      ) : undefined}

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
