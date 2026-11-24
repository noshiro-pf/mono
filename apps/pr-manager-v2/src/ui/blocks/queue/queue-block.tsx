import { PullRequestLabel, type ReadError } from 'pr-report-core-v2';
import { map, type InitializedObservable } from 'synstate';
import { constant, For, If, MatchOptional, type JSX } from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import {
  anyLabelQualifier,
  githubSearchUrl,
  notLabelQualifier,
  queueSummary,
  type QueueView,
  type Repo,
} from '../../../domain/index.mjs';
import type { QueueBlockView } from '../../../store/index.mjs';
import { ExternalLink, FailuresNotice } from '../../common/index.mjs';
import type { BlockView } from '../../layout/index.mjs';
import { QueueLegend } from './queue-legend.js';
import { QueueOutsideBox } from './queue-outside-box.js';
import { QueueRow } from './queue-row.js';
import './queue.css';

/**
 * The queue block (spec §8): what the merge queue is running, what it would
 * pick next and in what order, what waits and why, and what is outside it.
 */
export const queueBlock = (
  view: InitializedObservable<QueueBlockView>,
  repo: Repo,
): BlockView => {
  const ready = view.pipe(
    map((v) => (v.kind === 'ready' ? Optional.some(v) : Optional.none)),
  );

  return {
    title: constant('Queue'),
    extras: (
      <>
        <ExternalLink
          class={constant('on-github')}
          href={constant(githubSearchUrl(repo, 'pulls', QUEUED))}
          title={constant(
            'Every queued pull request, by number: GitHub cannot order them as the worker picks them.',
          )}
        >
          {constant('on GitHub')}
        </ExternalLink>
        <ExternalLink
          class={constant('on-github')}
          href={constant(githubSearchUrl(repo, 'pulls', PICKED))}
          title={constant(
            'The queued pull requests without skip-ci: the one running, those picked before whose checks failed or that were set aside, and any whose label came off another way.',
          )}
        >
          {constant('picked on GitHub')}
        </ExternalLink>
        <MatchOptional
          value={ready}
          some={(view$) => (
            <span class={constant('muted queue-summary')}>
              {view$.pipe(map((v) => queueSummary(v.view)))}
            </span>
          )}
        />
      </>
    ),
    body: () => (
      <MatchOptional
        value={ready}
        some={(ready$) => (
          <QueueBody
            failures={ready$.pipe(map(({ failures }) => failures))}
            view={ready$.pipe(map(({ view: v }) => v))}
          />
        )}
        none={
          <p class={constant('muted')}>
            {view.pipe(
              map((v) =>
                v.kind === 'absent'
                  ? 'This repository has no merge-queued label: no queue runs here.'
                  : v.kind === 'unread' && v.reason !== undefined
                    ? `Could not decide the queue: ${v.reason}`
                    : 'Not read yet.',
              ),
            )}
          </p>
        }
      />
    ),
  };
};

const QueueBody = ({
  view,
  failures,
}: Readonly<{
  view: InitializedObservable<QueueView>;
  failures: InitializedObservable<readonly ReadError[]>;
}>): JSX.Element => (
  <div class={constant('queue-block')}>
    <FailuresNotice failures={failures} />

    <If
      cond={view.pipe(map(({ orderKnown }) => !orderKnown))}
      then={
        <p class={constant('muted')}>
          {constant(
            'A fact the order turns on is unread: the queued pull requests are listed by number, the order unknown.',
          )}
        </p>
      }
    />

    <If
      cond={view.pipe(
        map(
          ({ running, next, waiting }) =>
            Arr.isEmpty(running) && Arr.isEmpty(next) && Arr.isEmpty(waiting),
        ),
      )}
      then={
        // With only what is outside the row, the row is left out, as v1 does.
        <If
          cond={view.pipe(map(({ outside }) => Arr.isEmpty(outside)))}
          then={
            <p class={constant('muted')}>
              {constant('No open pull request is labelled merge-queued.')}
            </p>
          }
        />
      }
      else={<QueueRow view={view} />}
    />

    <div class={constant('queue-foot')}>
      <If
        cond={view.pipe(map(({ outside }) => Arr.isNonEmpty(outside)))}
        then={
          <div class={constant('queue-outside')}>
            <span class={constant('queue-outside-label')}>
              {constant('set aside')}
            </span>
            <ul class={constant('queue-outside-list')}>
              <For
                items={view.pipe(map(({ outside }) => outside))}
                key={({ number }) => number}
              >
                {(item$) => <QueueOutsideBox item={item$} />}
              </For>
            </ul>
          </div>
        }
      />

      <QueueLegend />
    </div>
  </div>
);

const QUEUED = [
  'is:pr is:open',
  anyLabelQualifier([PullRequestLabel.mergeQueued]),
  'sort:created-asc',
].join(' ');

const PICKED = [
  'is:pr is:open',
  anyLabelQualifier([PullRequestLabel.mergeQueued]),
  notLabelQualifier(PullRequestLabel.skipCi),
  'sort:created-asc',
].join(' ');
