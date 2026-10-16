import { memoNamed } from 'preact-utils';
import { Arr } from 'ts-data-forge';
import type { IssueList } from '../load-report.mjs';
import { issuesListSignals, issuesViewSignals } from '../store/index.mjs';
import { ExternalLink } from './external-link.js';
import { IssueDagDoneToggle } from './issue-dag-done-toggle.js';
import { IssueDagZoom } from './issue-dag-zoom.js';
import { IssueDag } from './issue-dag.js';
import { IssuesListFilters } from './issues-list-filters.js';
import { IssuesViewSwitch } from './issues-view-switch.js';
import { LabelChip } from './label-chip.js';
import { LoadMoreIssues } from './load-more-issues.js';
import { Timestamp } from './timestamp.js';

type Props = Readonly<{
  issues: IssueList;
  /** Whether the list has not been read yet. */
  reading: boolean;
}>;

/**
 * What is open that is not a pull request, most recently updated first, or
 * by priority, and narrowed by priority and label (`issues-list-filters.tsx`).
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
export const IssuesSection = memoNamed<Props>(
  'IssuesSection',
  ({ issues: { items, totalCount, endCursor }, reading }) => {
    const shown = issuesListSignals.items.value;

    return (
      <section className={'section'}>
        <h2 className={'section-title'}>
          {reading
            ? 'Open issues'
            : items.length < totalCount
              ? `Open issues (${items.length} of ${totalCount} read)`
              : `Open issues (${totalCount})`}
        </h2>

        <div className={'issues-toolbar'}>
          <IssuesViewSwitch />

          {issuesViewSignals.view.value === 'dag' ? (
            <IssueDagDoneToggle />
          ) : undefined}

          {issuesViewSignals.view.value === 'dag' ? (
            <IssueDagZoom />
          ) : undefined}
        </div>

        {!reading &&
        issuesViewSignals.view.value === 'list' &&
        Arr.isNonEmpty(items) ? (
          <IssuesListFilters />
        ) : undefined}

        {reading ? (
          <p className={'section-note'}>{'Reading GitHub…'}</p>
        ) : issuesViewSignals.view.value === 'dag' ? (
          <IssueDag />
        ) : Arr.isEmpty(items) ? (
          <p className={'section-note'}>{'No open issues.'}</p>
        ) : Arr.isEmpty(shown) ? (
          <p className={'section-note'}>
            {'No open issue has the priorities and labels picked.'}
          </p>
        ) : (
          <ul className={'issue-list'}>
            {shown.map((issue) => (
              <li key={issue.number} className={'issue-item'}>
                <div className={'pull-request-heading'}>
                  <span
                    className={'pull-request-number'}
                  >{`#${issue.number}`}</span>
                  <ExternalLink href={issue.url} variant={'pull-request-title'}>
                    {issue.title}
                  </ExternalLink>
                </div>

                <div className={'pull-request-row'}>
                  <Timestamp iso={issue.updatedAt} label={'updated'} />

                  <span>{`by ${issue.author}`}</span>

                  {issue.comments > 0 ? (
                    <span>
                      {`${issue.comments} comment${issue.comments === 1 ? '' : 's'}`}
                    </span>
                  ) : undefined}

                  {issue.labels.map((label) => (
                    <LabelChip key={label.name} label={label} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        {endCursor === undefined ? undefined : (
          <LoadMoreIssues notListed={totalCount - items.length} />
        )}
      </section>
    );
  },
);
