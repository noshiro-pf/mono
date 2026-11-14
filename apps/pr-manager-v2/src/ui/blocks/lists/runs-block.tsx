import { map, type InitializedObservable } from 'synstate';
import { constant, For, If, MatchOptional, type JSX } from 'synstate-dom';
import { Arr, Optional, Result } from 'ts-data-forge';
import { actionsUrl, instantMsOf, type Repo } from '../../../domain/index.mjs';
import type { RunningWorkflow } from '../../../github/index.mjs';
import { describeReadError, type RunsReport } from '../../../store/index.mjs';
import { Age, ExternalLink, Notice } from '../../common/index.mjs';
import type { BlockView } from '../../layout/index.mjs';
import './lists.css';

/**
 * The running workflows block (spec §9), read beside the report with a budget
 * and a failure of its own: newest first, each with its state, what it runs
 * for, and since when.
 */
export const runsBlock = (
  report: InitializedObservable<RunsReport | undefined>,
  repo: Repo,
  now: InitializedObservable<number>,
): BlockView => {
  const runs = report.pipe(
    map((r) =>
      r === undefined || Result.isErr(r.runs)
        ? Optional.none
        : Optional.some(r.runs.value.runs),
    ),
  );

  return {
    title: (
      <>
        {constant('Running workflows')}
        {runs.pipe(
          map((o) =>
            Optional.isSome(o) ? ` (${Optional.unwrap(o).length})` : '',
          ),
        )}
      </>
    ),
    extras: (
      <ExternalLink
        class={constant('on-github')}
        href={constant(actionsUrl(repo, RUNNING))}
      >
        {constant('on GitHub')}
      </ExternalLink>
    ),
    body: () => (
      <div>
        <If
          cond={report.pipe(map((r) => r?.failure !== undefined))}
          then={
            <Notice>
              {report.pipe(
                map((r) =>
                  r?.failure === undefined ? '' : describeReadError(r.failure),
                ),
              )}
            </Notice>
          }
        />
        <If
          cond={report.pipe(
            map(
              (r) =>
                r !== undefined &&
                Result.isOk(r.runs) &&
                !r.runs.value.complete,
            ),
          )}
          then={
            <Notice>
              {constant(
                'More runs wait in some state than one page lists: on GitHub has them all.',
              )}
            </Notice>
          }
        />
        <MatchOptional
          value={runs}
          some={(list$) => (
            <If
              cond={list$.pipe(map(Arr.isEmpty))}
              then={
                <p class={constant('muted')}>
                  {constant('Nothing is running.')}
                </p>
              }
              else={
                <ul class={constant('rows')}>
                  <For items={list$} key={({ id }) => id}>
                    {(run$) => <RunRow now={now} run={run$} />}
                  </For>
                </ul>
              }
            />
          )}
          none={<p class={constant('muted')}>{constant('Not read yet.')}</p>}
        />
      </div>
    ),
  };
};

const RunRow = ({
  run,
  now,
}: Readonly<{
  run: InitializedObservable<RunningWorkflow>;
  now: InitializedObservable<number>;
}>): JSX.Element => (
  <li class={constant('row')}>
    <span
      class={constant('run-state')}
      data-status={run.pipe(map(({ status }) => status))}
      title={run.pipe(map(({ status }) => status.replaceAll('_', ' ')))}
    >
      <If
        cond={run.pipe(map(({ status }) => status === 'in_progress'))}
        then={<span class={constant('spinner')} />}
        else={
          <If
            cond={run.pipe(map(({ status }) => status === 'queued'))}
            then={
              <span aria-hidden={constant('true')} class={constant('dot')} />
            }
            else={
              <span class={constant('badge')} data-tone={constant('warning')}>
                {run.pipe(map(({ status }) => status.replaceAll('_', ' ')))}
              </span>
            }
          />
        }
      />
    </span>
    <span class={constant('row-main')}>
      <ExternalLink
        class={constant('row-title')}
        href={run.pipe(map(({ url }) => url))}
      >
        {run.pipe(map(({ title }) => title))}
      </ExternalLink>
      <span class={constant('row-meta')}>
        {run.pipe(
          map(
            ({ workflow, runNumber, event, branch, actor }) =>
              `${workflow} #${runNumber} · ${event} · ${branch} · ${actor}`,
          ),
        )}
        {constant(' · ')}
        <Age
          at={run.pipe(map(({ startedAt }) => instantMsOf(startedAt)))}
          now={now}
          prefix={'started '}
        />
      </span>
    </span>
  </li>
);

const RUNNING =
  'is:in_progress is:queued is:waiting is:action_required is:neutral is:stale';
