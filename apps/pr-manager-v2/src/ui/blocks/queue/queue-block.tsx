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
    title: constant('queue'),
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
  <div class={constant('queue')}>
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

    <QueueRow view={view} />

    <If
      cond={view.pipe(map(({ outside }) => Arr.isNonEmpty(outside)))}
      then={
        <section class={constant('queue-outside')}>
          <h3>{constant('Outside the queue')}</h3>
          <ul>
            <For
              items={view.pipe(map(({ outside }) => outside))}
              key={({ number }) => number}
            >
              {(item$) => (
                <li title={item$.pipe(map(({ detail }) => detail))}>
                  <ExternalLink href={item$.pipe(map(({ url }) => url))}>
                    {item$.pipe(map(({ number }) => `#${number}`))}
                  </ExternalLink>
                  <span class={constant('queue-why')}>
                    {item$.pipe(map(({ why }) => why))}
                  </span>
                  <span class={constant('muted')}>
                    {item$.pipe(map(({ whose }) => `— ${whose}`))}
                  </span>
                  <span class={constant('queue-outside-title')}>
                    {item$.pipe(map(({ title }) => title))}
                  </span>
                </li>
              )}
            </For>
          </ul>
        </section>
      }
    />

    <ul aria-label={constant('Legend')} class={constant('queue-legend')}>
      <li>
        <span class={constant('spinner')} />
        {constant(' running')}
      </li>
      <li>
        <span class={constant('legend-box legend-waiting')} />
        {constant(' waits for another pull request')}
      </li>
      <li>
        <span class={constant('legend-box legend-ahead')} />
        {constant(' checked ahead')}
      </li>
      <li>
        <span aria-hidden={constant('true')}>{constant('⚑')}</span>
        {constant(' only a ruleset bypass merges it')}
      </li>
      <li>
        <span
          class={constant('priority-pill')}
          data-priority={constant('high')}
        >
          {constant('high')}
        </span>
        <span class={constant('priority-pill')} data-priority={constant('mid')}>
          {constant('mid')}
        </span>
        <span class={constant('priority-pill')} data-priority={constant('low')}>
          {constant('low')}
        </span>
      </li>
    </ul>
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
