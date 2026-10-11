import { memoNamed } from 'preact-utils';
import { Arr } from 'ts-data-forge';
import type { IssueList } from '../load-report.mjs';
import { ExternalLink } from './external-link.js';
import { LabelChip } from './label-chip.js';
import { LoadMoreIssues } from './load-more-issues.js';
import { Timestamp } from './timestamp.js';

type Props = Readonly<{
  issues: IssueList;
}>;

/**
 * What is open that is not a pull request, most recently updated first.
 *
 * Last, because it is the one section that is not about the queue: a reader
 * asks "what is in flight" first and "what is waiting to be started" second.
 * Rows rather than the cards the pull requests get — an issue has no branch,
 * no checks and no place in a merge order, and a card shaped like a pull
 * request's would spend most of its height saying so.
 *
 * The list starts at the most recently updated few and goes on a page at a
 * time from the button under it, which is there until every open issue is
 * listed.
 */
export const IssuesSection = memoNamed<Props>(
  'IssuesSection',
  ({ issues: { items, totalCount, endCursor } }) => (
    <section className={'section'}>
      <h2 className={'section-title'}>
        {items.length < totalCount
          ? `Open issues (${items.length} of ${totalCount}, most recently updated)`
          : `Open issues (${totalCount})`}
      </h2>

      {Arr.isEmpty(items) ? (
        <p className={'section-note'}>{'No open issues.'}</p>
      ) : (
        <ul className={'issue-list'}>
          {items.map((issue) => (
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
  ),
);
