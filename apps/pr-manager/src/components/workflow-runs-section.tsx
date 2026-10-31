import type { InitializedObservable } from 'synstate';
import {
  constant,
  For,
  If,
  mapBindable,
  MatchOptional,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import type { ReadonlyRecord, RelaxedExtract } from 'ts-type-forge';
import { reader, reportSource, type RunsStatus } from '../store/index.mjs';
import type { StatusRole } from '../verdict.mjs';
import {
  actionsQueryUrl,
  type RunState,
  type WorkflowRunList,
} from '../workflow-runs.mjs';
import { ExternalLink } from './external-link.js';
import { RunStateIcon } from './run-state-icon.js';
import { Timestamp } from './timestamp.js';

/**
 * The workflow runs still going, or waiting on someone, newest first: what the
 * Actions tab shows filtered to them, which the title links to.
 *
 * Rows, as the merged pull requests and the issues are: a run is a name, a
 * state and where it came from, and reads in one line and a half.
 */
export const WorkflowRunsSection = (): JSX.Element => (
  <section class={constant('section')}>
    <h2 class={constant('section-title')}>
      {view(reader.runs, (runs) =>
        runs.type === 'ready' ? titleOf(runs.list) : 'Running workflows',
      )}
      {constant(' ')}
      <ExternalLink href={constant(ACTIONS_URL)} variant={'section-link'}>
        {constant('on GitHub')}
      </ExternalLink>
    </h2>

    <MatchOptional
      value={view(reader.runs, readyOf)}
      some={(ready$) => <RunList ready$={ready$} />}
      none={
        <MatchOptional
          value={view(reader.runs, (runs) =>
            runs.type === 'failed'
              ? Optional.some(runs.message)
              : Optional.none,
          )}
          some={(message$) => (
            <p
              class={constant('section-note')}
              data-status={constant('critical')}
            >
              {message$}
            </p>
          )}
          none={
            <p class={constant('section-note')}>
              {constant('Reading GitHub…')}
            </p>
          }
        />
      }
    />
  </section>
);

type Ready = RelaxedExtract<RunsStatus, Readonly<{ type: 'ready' }>>;

/**
 * A run's state: the icon the Actions tab draws, for the two states that are
 * most of what this block lists, and a badge with the word for the rest, which
 * are rare enough that a word reads better than a glyph to learn.
 */
const RunStateMark = ({
  state,
}: Readonly<{ state: Bindable<RunState> }>): JSX.Element => (
  <If
    cond={mapBindable(state, (current) => current === 'in_progress')}
    then={
      <RunStateIcon
        kind={'running'}
        label={STATE_PRESENTATION.in_progress.label}
      />
    }
    else={
      <If
        cond={mapBindable(state, (current) => current === 'queued')}
        then={
          <RunStateIcon
            kind={'queued'}
            label={STATE_PRESENTATION.queued.label}
          />
        }
        else={
          <span
            class={constant('badge')}
            data-status={mapBindable(
              state,
              (current) => STATE_PRESENTATION[current].status,
            )}
          >
            {mapBindable(state, (current) => STATE_PRESENTATION[current].label)}
          </span>
        }
      />
    }
  />
);

const RunList = ({
  ready$,
}: Readonly<{ ready$: InitializedObservable<Ready> }>): JSX.Element => (
  <>
    <MatchOptional
      value={view(ready$, ({ error }) => Optional.fromNullable(error))}
      some={(error$) => (
        <p class={constant('section-note')} data-status={constant('critical')}>
          {view(
            error$,
            (error) =>
              `The last read failed, so this is the one before it: ${error}`,
          )}
        </p>
      )}
    />

    <If
      cond={view(ready$, ({ list }) => Arr.isEmpty(list.runs))}
      then={
        <p class={constant('section-note')}>
          {constant('No workflow is running.')}
        </p>
      }
      else={
        <ul class={constant('run-list')}>
          <For
            items={view(ready$, ({ list }) => list.runs)}
            key={(run) => run.id}
          >
            {(run$) => (
              <li class={constant('run-item')}>
                <div class={constant('pull-request-heading')}>
                  <RunStateMark state={view(run$, (run) => run.state)} />

                  <ExternalLink
                    href={view(run$, (run) => run.url)}
                    variant={'pull-request-title'}
                  >
                    {view(run$, (run) => run.title)}
                  </ExternalLink>
                </div>

                <div class={constant('pull-request-row')}>
                  <span>
                    {view(run$, (run) => `${run.workflow} #${run.runNumber}`)}
                  </span>

                  <span>{view(run$, (run) => run.event)}</span>

                  <MatchOptional
                    value={view(run$, (run) =>
                      Optional.fromNullable(run.branch),
                    )}
                    some={(branch$) => (
                      <span class={constant('branch')}>
                        <span aria-hidden={constant('true')}>
                          {constant('⎇ ')}
                        </span>
                        {branch$}
                      </span>
                    )}
                  />

                  <Timestamp
                    iso={view(run$, (run) => run.createdAt)}
                    label={'started'}
                  />

                  <span>{view(run$, (run) => `by ${run.actor}`)}</span>
                </div>
              </li>
            )}
          </For>
        </ul>
      }
    />
  </>
);

const readyOf = (runs: RunsStatus): Optional<Ready> =>
  runs.type === 'ready' ? Optional.some(runs) : Optional.none;

const ACTIONS_URL = actionsQueryUrl(reportSource);

const titleOf = ({ runs, totalCount }: WorkflowRunList): string =>
  runs.length < totalCount
    ? (`Running workflows (${runs.length} of ${totalCount})` as const)
    : (`Running workflows (${runs.length})` as const);

/**
 * A word for each state — the badge's, or the icon's label — and the colour the
 * verdict badges give the same thing: a run waiting for an approval or a person
 * is a wait, and a neutral or stale run is over.
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
