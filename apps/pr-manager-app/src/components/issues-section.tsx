import { type OpenIssue } from 'pr-report-core';
import * as React from 'react';
import { Arr } from 'ts-data-forge';
import { ExternalLink } from './external-link.js';
import { LabelChip } from './label-chip.js';
import { Timestamp } from './timestamp.js';

type Props = Readonly<{
  issues: readonly OpenIssue[];
  /** How many are open in all, which the list may be a part of. */
  totalCount: number;
  nowMs: number;
}>;

/**
 * What is open that is not a pull request, most recently updated first.
 *
 * Last, because it is the one section that is not about the queue: a reader
 * asks "what is in flight" first and "what is waiting to be started" second.
 * Rows rather than the cards the pull requests get — an issue has no branch,
 * no checks and no place in a merge order, and a card shaped like a pull
 * request's would spend most of its height saying so.
 */
export const IssuesSection = React.memo<Props>(
  ({ issues, totalCount, nowMs }) => (
    <section className={'section'}>
      <h2 className={'section-title'}>
        {issues.length < totalCount
          ? `Open issues (${issues.length} of ${totalCount}, most recently updated)`
          : `Open issues (${totalCount})`}
      </h2>

      {Arr.isEmpty(issues) ? (
        <p className={'section-note'}>{'No open issues.'}</p>
      ) : (
        <ul className={'issue-list'}>
          {issues.map((issue) => (
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
                <Timestamp
                  iso={issue.updatedAt}
                  label={'updated'}
                  nowMs={nowMs}
                />

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
    </section>
  ),
);

IssuesSection.displayName = 'IssuesSection';
