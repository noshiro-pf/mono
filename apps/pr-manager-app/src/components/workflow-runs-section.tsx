import { memoNamed } from 'preact-utils';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { REPORT_SOURCE } from '../constants.mjs';
import type { RunsStatus } from '../store/index.mjs';
import type { StatusRole } from '../verdict.mjs';
import {
  actionsQueryUrl,
  type RunState,
  type WorkflowRunList,
} from '../workflow-runs.mjs';
import { ExternalLink } from './external-link.js';
import { RunStateIcon } from './run-state-icon.js';
import { Timestamp } from './timestamp.js';

type Props = Readonly<{ runs: RunsStatus }>;

/**
 * The workflow runs still going, or waiting on someone, newest first: what
 * the Actions tab shows filtered to them, which the title links to.
 *
 * Rows, as the merged pull requests and the issues are: a run is a name, a
 * state and where it came from, and reads in one line and a half.
 */
export const WorkflowRunsSection = memoNamed<Props>(
  'WorkflowRunsSection',
  ({ runs }) => (
    <section className={'section'}>
      <h2 className={'section-title'}>
        {runs.type === 'ready' ? titleOf(runs.list) : 'Running workflows'}{' '}
        <ExternalLink href={ACTIONS_URL} variant={'section-link'}>
          {'on GitHub'}
        </ExternalLink>
      </h2>

      {runs.type === 'reading' ? (
        <p className={'section-note'}>{'Reading GitHub…'}</p>
      ) : runs.type === 'failed' ? (
        <p className={'section-note'} data-status={'critical'}>
          {runs.message}
        </p>
      ) : (
        <>
          {runs.error === undefined ? undefined : (
            <p className={'section-note'} data-status={'critical'}>
              {`The last read failed, so this is the one before it: ${runs.error}`}
            </p>
          )}

          {Arr.isEmpty(runs.list.runs) ? (
            <p className={'section-note'}>{'No workflow is running.'}</p>
          ) : (
            <ul className={'run-list'}>
              {runs.list.runs.map((run) => (
                <li key={run.id} className={'run-item'}>
                  <div className={'pull-request-heading'}>
                    <RunStateMark state={run.state} />

                    <ExternalLink href={run.url} variant={'pull-request-title'}>
                      {run.title}
                    </ExternalLink>
                  </div>

                  <div className={'pull-request-row'}>
                    <span>{`${run.workflow} #${run.runNumber}`}</span>

                    <span>{run.event}</span>

                    {run.branch === undefined ? undefined : (
                      <span className={'branch'}>
                        <span aria-hidden={'true'}>{'⎇ '}</span>
                        {run.branch}
                      </span>
                    )}

                    <Timestamp iso={run.createdAt} label={'started'} />

                    <span>{`by ${run.actor}`}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  ),
);

/**
 * A run's state: the icon the Actions tab draws, for the two states that are
 * most of what this block lists, and a badge with the word for the rest,
 * which are rare enough that a word reads better than a glyph to learn.
 */
const RunStateMark = memoNamed<Readonly<{ state: RunState }>>(
  'RunStateMark',
  ({ state }) => {
    const { label, status: role } = STATE_PRESENTATION[state];

    return state === 'in_progress' ? (
      <RunStateIcon kind={'running'} label={label} />
    ) : state === 'queued' ? (
      <RunStateIcon kind={'queued'} label={label} />
    ) : (
      <span className={'badge'} data-status={role}>
        {label}
      </span>
    );
  },
);

const ACTIONS_URL = actionsQueryUrl(REPORT_SOURCE);

const titleOf = ({ runs, totalCount }: WorkflowRunList): string =>
  runs.length < totalCount
    ? (`Running workflows (${runs.length} of ${totalCount})` as const)
    : (`Running workflows (${runs.length})` as const);

/**
 * A word for each state — the badge's, or the icon's label — and the colour
 * the verdict badges give the same thing: a run waiting for an approval or a
 * person is a wait, and a neutral or stale run is over.
 */
const STATE_PRESENTATION = {
  in_progress: { label: 'running', status: 'warning' },
  queued: { label: 'queued', status: 'neutral' },
  waiting: { label: 'waiting', status: 'warning' },
  action_required: { label: 'action required', status: 'warning' },
  neutral: { label: 'neutral', status: 'neutral' },
  stale: { label: 'stale', status: 'neutral' },
} as const satisfies ReadonlyRecord<
  RunState,
  Readonly<{ label: string; status: StatusRole }>
>;
