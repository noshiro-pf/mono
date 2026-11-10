import type { MergedPullRequestFacts } from 'pr-report-core-v2';
import {
  combine,
  map,
  skipIfNoChange,
  type InitializedObservable,
} from 'synstate';
import { constant, For, If, MatchOptional, type JSX } from 'synstate-dom';
import { Arr, Optional, Result } from 'ts-data-forge';
import {
  githubSearchUrl,
  instantMsOf,
  mergedSinceQuery,
  repoUrl,
  type Repo,
} from '../../../domain/index.mjs';
import { describeReadError, type PageReport } from '../../../store/index.mjs';
import {
  Age,
  ExternalLink,
  FailuresNotice,
  LabelChip,
} from '../../common/index.mjs';
import type { BlockView } from '../../layout/index.mjs';
import './lists.css';

/** The pull requests merged in the last 7 days (spec §10), newest first. */
export const mergedBlock = (
  report: InitializedObservable<PageReport | undefined>,
  repo: Repo,
  now: InitializedObservable<number>,
): BlockView => {
  const today = now
    .pipe(map((ms) => Math.floor(ms / DAY_MS)))
    .pipe(skipIfNoChange());

  const merged = report.pipe(
    map((r) =>
      r === undefined || Result.isErr(r.snapshot.merged)
        ? Optional.none
        : Optional.some(
            r.snapshot.merged.value.toSorted((a, b) =>
              b.mergedAt.localeCompare(a.mergedAt),
            ),
          ),
    ),
  );

  return {
    title: (
      <>
        {constant('Merged in the last 7 days')}
        {merged.pipe(
          map((o) => (Optional.isSome(o) ? ` (${o.value.length})` : '')),
        )}
      </>
    ),
    extras: (
      <ExternalLink
        class={constant('on-github')}
        // The window of the read the list is from, moving with each read and
        // with the day before one, never with each tick. A merged part that
        // failed keeps an older list, which the block says above it.
        href={combine([report, today]).pipe(
          map(([r, day]) =>
            githubSearchUrl(
              repo,
              'pulls',
              mergedSinceQuery(r?.readAtMs ?? day * DAY_MS, 7),
            ),
          ),
        )}
        title={constant(
          'A day is as fine as GitHub’s search goes, so it may list a few merged earlier on the first day.',
        )}
      >
        {constant('on GitHub')}
      </ExternalLink>
    ),
    body: () => (
      <MatchOptional
        value={merged}
        some={(list$) => (
          <>
            <FailuresNotice
              failures={report.pipe(map((r) => r?.failures.merged ?? []))}
            />
            <If
              cond={list$.pipe(map(Arr.isEmpty))}
              then={
                <p class={constant('muted')}>
                  {constant('Nothing merged in the last 7 days.')}
                </p>
              }
              else={
                <ul class={constant('rows')}>
                  <For items={list$} key={({ number }) => number}>
                    {(pr$) => <MergedRow now={now} pr={pr$} repo={repo} />}
                  </For>
                </ul>
              }
            />
          </>
        )}
        none={
          <p class={constant('muted')}>
            {report.pipe(
              map((r) =>
                r !== undefined && Result.isErr(r.snapshot.merged)
                  ? describeReadError(r.snapshot.merged.value)
                  : 'Not read yet.',
              ),
            )}
          </p>
        }
      />
    ),
  };
};

const MergedRow = ({
  pr,
  repo,
  now,
}: Readonly<{
  pr: InitializedObservable<MergedPullRequestFacts>;
  repo: Repo;
  now: InitializedObservable<number>;
}>): JSX.Element => (
  <li class={constant('row')}>
    <span class={constant('merged-mark')} title={constant('merged')}>
      {constant('⮑')}
    </span>
    <span class={constant('row-main')}>
      <span>
        <span class={constant('card-number')}>
          {pr.pipe(map(({ number }) => `#${number} `))}
        </span>
        <ExternalLink
          class={constant('row-title')}
          href={pr.pipe(map(({ url }) => url))}
        >
          {pr.pipe(map(({ title }) => title))}
        </ExternalLink>
      </span>
      <span class={constant('row-meta')}>
        {pr.pipe(
          map(
            ({ author, headRef, baseRef }) =>
              `${author} · ${headRef} → ${baseRef} · `,
          ),
        )}
        <Age
          at={pr.pipe(map(({ mergedAt }) => instantMsOf(mergedAt)))}
          now={now}
          prefix={'merged '}
        />
      </span>
      <If
        cond={pr.pipe(
          map(
            ({ labels, closingIssues }) =>
              Arr.isNonEmpty(labels) || Arr.isNonEmpty(closingIssues),
          ),
        )}
        then={
          <span class={constant('row-meta')}>
            <For
              items={pr.pipe(map(({ closingIssues }) => closingIssues))}
              key={(n) => n}
            >
              {(n$) => (
                <ExternalLink
                  href={n$.pipe(map((n) => `${repoUrl(repo)}/issues/${n}`))}
                >
                  {n$.pipe(map((n) => `closed #${n}`))}
                </ExternalLink>
              )}
            </For>
            <For
              items={pr.pipe(map(({ labels }) => labels))}
              key={({ name }) => name}
            >
              {(label$) => <LabelChip label={label$} />}
            </For>
          </span>
        }
      />
    </span>
  </li>
);

const DAY_MS = 86_400_000;
