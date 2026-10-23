import { constant, derive, For, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { issuesListStore, issuesViewStore, reader } from '../store/index.mjs';
import { ExternalLink } from './external-link.js';
import { IssueDagDoneToggle } from './issue-dag-done-toggle.js';
import { IssueDagZoom } from './issue-dag-zoom.js';
import { IssueDag } from './issue-dag.js';
import { IssuesListFilters } from './issues-list-filters.js';
import { IssuesViewSwitch } from './issues-view-switch.js';
import { LabelChip } from './label-chip.js';
import { LoadMoreIssues } from './load-more-issues.js';
import { Timestamp } from './timestamp.js';

/**
 * What is open that is not a pull request, most recently updated first, or
 * by priority, and narrowed by priority, label and a search of the titles
 * (`issues-list-filters.tsx`). The DAG is not narrowed by any of them: what
 * an issue waits for is drawn whole.
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
 * a switch beside the List / DAG one for whether it draws what is done, and the zoom
 * at the other end of the row.
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
      </h2>

      <div class={constant('issues-toolbar')}>
        <IssuesViewSwitch />

        <If
          cond={dag}
          then={
            <>
              <IssueDagDoneToggle />
              <IssueDagZoom />
            </>
          }
        />
      </div>

      <If
        cond={derive(
          [reading, issuesViewStore.view, issues$],
          (isReading, shown, { items }) =>
            !isReading && shown === 'list' && Arr.isNonEmpty(items),
        )}
        then={<IssuesListFilters />}
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
                ? 'No open issue has the priorities and labels picked.'
                : 'No open issue with the priorities and labels picked has a title matching the search.',
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
