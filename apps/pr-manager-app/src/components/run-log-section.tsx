import { type RunLogOutcome } from 'pr-report-payload';
import type * as React from 'react';
import { Arr, Result } from 'ts-data-forge';
import { type LoadedRunLog } from '../fetch-report.mjs';
import { describeAge } from '../format.mjs';
import { type StatusRole } from '../verdict.mjs';

type Props = Readonly<{
  /** The log, or the sentence saying why there is not one. */
  runLog: Result<LoadedRunLog, string>;
  repoUrl: string;
  nowMs: number;
}>;

/**
 * What `unblock-prs` did, most recent run first.
 *
 * The script runs on someone's machine and says everything on standard
 * output, which is exactly where nobody can see it afterwards. A rebase that
 * conflicted, a push that was refused, a queued pull request passed over —
 * each happened once, on a terminal, and was never visible again. This is
 * that, kept.
 */
export const RunLogSection = ({
  runLog,
  repoUrl,
  nowMs,
}: Props): React.ReactElement => (
  <section className={'section'}>
    <h2 className={'section-title'}>{'unblock-prs'}</h2>

    {Result.isErr(runLog) ? (
      <p className={'section-note'}>{runLog.value}</p>
    ) : Arr.isEmpty(runLog.value.log.runs) ? (
      <p className={'section-note'}>{'No runs recorded yet.'}</p>
    ) : (
      <ul className={'run-log'}>
        {runLog.value.log.runs.map((run) => (
          <li key={run.startedAtEpochMs} className={'run-log-run'}>
            <h3 className={'run-log-when'}>
              {describeAge(run.startedAtEpochMs, nowMs)}
              {run.dryRun ? ' · dry run' : ''}
              <span className={'run-log-exact'}>{run.startedAt}</span>
            </h3>

            <ul className={'run-log-events'}>
              {run.events.map((logged) => (
                <li key={logged.atEpochMs} className={'run-log-event'}>
                  <span
                    className={'badge'}
                    data-status={toneFor(logged.outcome)}
                    title={logged.at}
                  >
                    {logged.outcome}
                  </span>
                  <a href={`${repoUrl}/pull/${logged.number}`}>
                    {`#${logged.number}`}
                  </a>
                  <span className={'run-log-detail'}>{logged.detail}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    )}
  </section>
);

/**
 * Only two of the outcomes are verdicts about a pull request. `unfinished` is
 * about the run — the base moved, the branch was pushed, someone pressed
 * Ctrl-C — and colouring that as a failure would put red beside a pull
 * request nothing is wrong with.
 */
const toneFor = (outcome: RunLogOutcome): StatusRole => {
  switch (outcome) {
    case 'merged':
    case 'released':
      return 'good';

    case 'failed':
      return 'critical';

    case 'set-aside':
      return 'warning';

    case 'unfinished':
      return 'neutral';
  }
};
