import { type PayloadEntry } from 'pr-report-payload';
import * as React from 'react';
import { Arr } from 'ts-data-forge';
import { describeComparison } from '../format.mjs';
import { VerdictBadge } from './verdict-badge.js';

type Props = Readonly<{ entry: PayloadEntry }>;

/**
 * One open pull request: what it is, and what is holding it up.
 *
 * `auto-merge` is shown when it is armed and not otherwise, and the labels
 * sit beside it — which is how the combination that matters, `merge-queued`
 * with nothing armed to land it, reads here. The app deliberately does not
 * know the label's spelling: that string lives in the workflows and in
 * `unblock-prs`, and a copy of it here would be another place to change.
 */
export const PullRequestCard = ({ entry }: Props): React.ReactElement => (
  <article className={'pull-request'}>
    <div className={'pull-request-heading'}>
      <VerdictBadge checks={entry.checks} />
      {entry.isDraft ? (
        <span className={'badge'} data-status={'neutral'}>
          {'draft'}
        </span>
      ) : undefined}
      <span className={'pull-request-number'}>{`#${entry.number}`}</span>
      <a className={'pull-request-title'} href={entry.url}>
        {entry.title}
      </a>
    </div>

    <div className={'pull-request-meta'}>
      <span
        className={'commit-counts'}
        title={`commits ahead of and behind ${entry.baseRef}`}
      >
        {describeComparison(entry.comparison)}
      </span>

      {entry.labels.map((label) => (
        <span key={label} className={'label-chip'}>
          {label}
        </span>
      ))}

      {entry.autoMerge ? <span>{'auto-merge'}</span> : undefined}

      {Arr.isNonEmpty(entry.linkedIssues) ? (
        <span>
          {'closes '}
          {entry.linkedIssues.map((issue, index) => (
            <React.Fragment key={issue.number}>
              {index === 0 ? '' : ', '}
              <a href={issue.url} title={issue.title}>
                {`#${issue.number}`}
              </a>
            </React.Fragment>
          ))}
        </span>
      ) : undefined}

      {Arr.isNonEmpty(entry.checks.failed) ? (
        <span
          className={
            entry.checks.verdict === 'paused' ? 'stale-checks' : 'failed-checks'
          }
        >
          {entry.checks.verdict === 'paused'
            ? `stale red: ${entry.checks.failed.join(', ')}`
            : `failed: ${entry.checks.failed.join(', ')}`}
        </span>
      ) : undefined}
    </div>
  </article>
);
