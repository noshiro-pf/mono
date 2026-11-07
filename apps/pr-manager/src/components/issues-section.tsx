import { map } from 'synstate';
import {
  constant,
  deriveBindable,
  For,
  If,
  mapBindable,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { newIssueUrl, openIssuesUrl } from '../github-links.mjs';
import {
  githubIssuesSearchOf,
  githubIssuesSearchTitle,
} from '../issues-search.mjs';
import { isUnread } from '../part-failures.mjs';
import {
  issuesListStore,
  issuesViewStore,
  reader,
  reportSource,
} from '../store/index.mjs';
import { ExternalLink } from './external-link.js';
import { IssueDagZoom } from './issue-dag-zoom.js';
import { IssueDag } from './issue-dag.js';
import { IssueStartRow } from './issue-start-row.js';
import { IssuesListFilters } from './issues-list-filters.js';
import { IssuesSummary } from './issues-summary.js';
import { IssuesViewSwitch } from './issues-view-switch.js';
import { LabelChip } from './label-chip.js';
import { LoadMoreIssues } from './load-more-issues.js';
import { PaneRefresh } from './pane-refresh.js';
import { PartFailureNotes } from './part-failure-notes.js';
import { Timestamp } from './timestamp.js';

/**
 * What is open that is not a pull request, most recently updated first, by
 * priority or by start state, and narrowed by tier and `in progress`
 * (`issues-summary.tsx`) and by start state, label and a search of the titles
 * and numbers (`issues-list-filters.tsx`), which its "on GitHub" link carries
 * as far as GitHub's search can (`issues-search.mts`). Each row says how the
 * issue stands for being started and what it waits for (`issue-start-row.tsx`).
 * The DAG is narrowed by the tiers and `in progress` alone, which lead either
 * view with how many issues are shown of how many are open: what an issue drawn
 * waits on is drawn, whatever its priority (`omitFilteredIssues`).
 *
 * Last, because it is the one section that is not about the queue: a reader
 * asks "what is in flight" first and "what is waiting to be started" second.
 * Rows rather than the cards the pull requests get — an issue has no branch, no
 * checks and no place in a merge order, and a card shaped like a pull request's
 * would spend most of its height saying so.
 *
 * The list starts at the most recently updated few, which come with the report,
 * and the rest are read a page at a time after them (`issues-view-store.mts`),
 * each added as it comes in. The button under it is there while some are not
 * listed, for a page that failed.
 *
 * Or, switched to it, the DAG of what each waits for (`issue-dag.tsx`), with
 * the zoom at the other end of the row from the List / DAG switch. What is done
 * — closed as completed, or merged — it never draws.
 */
export const IssuesSection = (): JSX.Element => {
  const issues$ = reader.issues;

  // Whether the list has not been read yet.
  const reading = reader.reading.pipe(map((parts) => parts.includes('issues')));

  // Whether the read of it failed with no list to keep, which the note under
  // the title says: the list is not empty, it is not there.
  const unread = reader.failed.pipe(
    map((failed) => isUnread(failed, 'issues')),
  );

  const dag = issuesViewStore.view.pipe(map((shown) => shown === 'dag'));

  // The filters as a GitHub search, for the "on GitHub" link.
  const search = deriveBindable(
    [issuesListStore.view, issuesListStore.query, issuesViewStore.view],
    githubIssuesSearchOf,
  );

  return (
    <section class={constant('section')}>
      <h2 class={constant('section-title')}>
        {deriveBindable(
          [reading, unread, issues$],
          (isReading, isUnreadNow, { items, totalCount }) =>
            isReading || isUnreadNow
              ? 'Open issues'
              : items.length < totalCount
                ? `Open issues (${items.length} of ${totalCount} read)`
                : `Open issues (${totalCount})`,
        )}
        {constant(' ')}
        <ExternalLink
          href={mapBindable(search, ({ qualifiers }) =>
            openIssuesUrl(reportSource, qualifiers),
          )}
          title={mapBindable(search, githubIssuesSearchTitle)}
          variant={'section-link'}
        >
          {constant('on GitHub')}
        </ExternalLink>
        <PaneRefresh pane={'issues'} what={'the open issues'} />
        <ExternalLink
          href={constant(newIssueUrl(reportSource))}
          variant={'section-action'}
        >
          {constant('New issue')}
        </ExternalLink>
      </h2>

      <PartFailureNotes parts={PARTS} />

      <div class={constant('issues-toolbar')}>
        <IssuesViewSwitch />

        <If cond={dag} then={<IssueDagZoom />} />
      </div>

      <If
        cond={deriveBindable(
          [reading, issues$],
          (isReading, { items }) => !isReading && Arr.isNonEmpty(items),
        )}
        then={
          <>
            <IssuesSummary />
            <If
              cond={mapBindable(dag, (shown) => !shown)}
              then={<IssuesListFilters />}
            />
          </>
        }
      />

      <If
        cond={reading}
        then={
          <p class={constant('section-note')}>{constant('Reading GitHub…')}</p>
        }
        else={
          <If
            cond={mapBindable(unread, (isUnreadNow) => !isUnreadNow)}
            then={<If cond={dag} then={<IssueDag />} else={<IssueList />} />}
          />
        }
      />

      <If
        cond={issues$.pipe(map(({ endCursor }) => endCursor !== undefined))}
        then={
          <LoadMoreIssues
            notListed={issues$.pipe(
              map(({ items, totalCount }) => totalCount - items.length),
            )}
          />
        }
      />
    </section>
  );
};

const PARTS = ['issues'] as const;

const IssueList = (): JSX.Element => (
  <If
    cond={reader.issues.pipe(map(({ items }) => Arr.isEmpty(items)))}
    then={<p class={constant('section-note')}>{constant('No open issues.')}</p>}
    else={
      <If
        cond={issuesListStore.items.pipe(map(Arr.isEmpty))}
        then={
          <p class={constant('section-note')}>
            {issuesListStore.query.pipe(
              map((query) =>
                query.trim() === ''
                  ? 'No open issue has the priorities and labels picked.'
                  : 'No loaded open issue the filters leave matches the search by title or number.',
              ),
            )}
          </p>
        }
        else={
          <ul class={constant('issue-list')}>
            <For items={issuesListStore.items} key={(issue) => issue.number}>
              {(issue$) => (
                <li class={constant('issue-item')}>
                  <div class={constant('pull-request-heading')}>
                    <span class={constant('pull-request-number')}>
                      {issue$.pipe(map((issue) => `#${issue.number}`))}
                    </span>
                    <ExternalLink
                      href={issue$.pipe(map((issue) => issue.url))}
                      variant={'pull-request-title'}
                    >
                      {issue$.pipe(map((issue) => issue.title))}
                    </ExternalLink>
                  </div>

                  <IssueStartRow
                    issue={issue$}
                    start={deriveBindable(
                      [issuesListStore.starts, issue$],
                      (starts, { number }) => starts.get(number),
                    )}
                  />

                  <div class={constant('pull-request-row')}>
                    <Timestamp
                      iso={issue$.pipe(map((issue) => issue.updatedAt))}
                      label={'updated'}
                    />

                    <span>
                      {issue$.pipe(map((issue) => `by ${issue.author}`))}
                    </span>

                    <If
                      cond={issue$.pipe(map((issue) => issue.comments > 0))}
                      then={
                        <span>
                          {issue$.pipe(
                            map(
                              ({ comments }) =>
                                `${comments} comment${comments === 1 ? '' : 's'}`,
                            ),
                          )}
                        </span>
                      }
                    />

                    <For
                      items={issue$.pipe(map((issue) => issue.labels))}
                      key={(label) => label.name}
                    >
                      {(label$) => <LabelChip label={label$} />}
                    </For>
                  </div>
                </li>
              )}
            </For>
          </ul>
        }
      />
    }
  />
);
