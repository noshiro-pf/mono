import {
  constant,
  derive,
  For,
  If,
  mapBindable,
  view,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { newIssueUrl, openIssuesUrl } from '../github-links.mjs';
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
import { Timestamp } from './timestamp.js';

/**
 * What is open that is not a pull request, most recently updated first, by
 * priority or by start state, and narrowed by priority and `pending`
 * (`issues-summary.tsx`) and by start state, label and a search of the titles
 * (`issues-list-filters.tsx`). Each row says how the issue stands for being
 * started and what it waits for (`issue-start-row.tsx`). The DAG is narrowed
 * by the priorities and `pending` alone, which lead either view with how many
 * issues are shown of how many are open: what an issue drawn waits on is
 * drawn, whatever its priority (`omitFilteredIssues`).
 *
 * Last, because it is the one section that is not about the queue: a reader
 * asks "what is in flight" first and "what is waiting to be started" second.
 * Rows rather than the cards the pull requests get — an issue has no branch,
 * no checks and no place in a merge order, and a card shaped like a pull
 * request's would spend most of its height saying so.
 *
 * The list starts at the most recently updated few, which come with the
 * report, and the rest are read a page at a time after them
 * (`issues-view-store.mts`), each added as it comes in. The button under it
 * is there while some are not listed, for a page that failed.
 *
 * Or, switched to it, the DAG of what each waits for (`issue-dag.tsx`), with
 * the zoom at the other end of the row from the List / DAG switch. What is
 * done — closed as completed, or merged — it never draws.
 */
export const IssuesSection = (): JSX.Element => {
  const issues$ = reader.issues;

  // Whether the list has not been read yet.
  const reading = view(reader.reading, (parts) => parts.includes('issues'));

  const dag = view(issuesViewStore.view, (shown) => shown === 'dag');

  return (
    <section class={constant('section')}>
      <h2 class={constant('section-title')}>
        {derive([reading, issues$], (isReading, { items, totalCount }) =>
          isReading
            ? 'Open issues'
            : items.length < totalCount
              ? `Open issues (${items.length} of ${totalCount} read)`
              : `Open issues (${totalCount})`,
        )}
        {constant(' ')}
        <ExternalLink
          href={constant(openIssuesUrl(reportSource))}
          variant={'section-link'}
        >
          {constant('on GitHub')}
        </ExternalLink>
        <ExternalLink
          href={constant(newIssueUrl(reportSource))}
          variant={'section-action'}
        >
          {constant('New issue')}
        </ExternalLink>
      </h2>

      <div class={constant('issues-toolbar')}>
        <IssuesViewSwitch />

        <If cond={dag} then={<IssueDagZoom />} />
      </div>

      <If
        cond={derive(
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
        else={<If cond={dag} then={<IssueDag />} else={<IssueList />} />}
      />

      <If
        cond={view(issues$, ({ endCursor }) => endCursor !== undefined)}
        then={
          <LoadMoreIssues
            notListed={view(
              issues$,
              ({ items, totalCount }) => totalCount - items.length,
            )}
          />
        }
      />
    </section>
  );
};

const IssueList = (): JSX.Element => (
  <If
    cond={view(reader.issues, ({ items }) => Arr.isEmpty(items))}
    then={<p class={constant('section-note')}>{constant('No open issues.')}</p>}
    else={
      <If
        cond={view(issuesListStore.items, Arr.isEmpty)}
        then={
          <p class={constant('section-note')}>
            {view(issuesListStore.query, (query) =>
              query.trim() === ''
                ? 'No open issue has the priorities, pending and labels picked.'
                : 'No open issue with the priorities, pending and labels picked has a title matching the search.',
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
                      {view(issue$, (issue) => `#${issue.number}`)}
                    </span>
                    <ExternalLink
                      href={view(issue$, (issue) => issue.url)}
                      variant={'pull-request-title'}
                    >
                      {view(issue$, (issue) => issue.title)}
                    </ExternalLink>
                  </div>

                  <IssueStartRow
                    issue={issue$}
                    start={derive(
                      [issuesListStore.starts, issue$],
                      (starts, { number }) => starts.get(number),
                    )}
                  />

                  <div class={constant('pull-request-row')}>
                    <Timestamp
                      iso={view(issue$, (issue) => issue.updatedAt)}
                      label={'updated'}
                    />

                    <span>{view(issue$, (issue) => `by ${issue.author}`)}</span>

                    <If
                      cond={view(issue$, (issue) => issue.comments > 0)}
                      then={
                        <span>
                          {view(
                            issue$,
                            ({ comments }) =>
                              `${comments} comment${comments === 1 ? '' : 's'}`,
                          )}
                        </span>
                      }
                    />

                    <For
                      items={view(issue$, (issue) => issue.labels)}
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
