import * as React from 'react';
import { Arr } from 'ts-data-forge';
import { type Entry } from '../load-report.mjs';
import { AutoMergeBadge } from './auto-merge-badge.js';
import { CommitDivergence } from './commit-divergence.js';
import { ExternalLink } from './external-link.js';
import { LabelChip } from './label-chip.js';
import { LinkedIssues } from './linked-issues.js';
import { ReviewBadge } from './review-badge.js';
import { SetAsideBadge } from './set-aside-badge.js';
import { SplitViewLink } from './split-view-link.js';
import { StateBadge } from './state-badge.js';
import { VerdictBadge } from './verdict-badge.js';

type Props = Readonly<{
  entry: Entry;
  /** The scale every divergence bar in the report is drawn against. */
  scaleMax: number;
}>;

/**
 * One open pull request: what it is, and what is holding it up.
 *
 * Four rows, in the order a reader asks the questions. What state is it in —
 * the badges. What is it — the number, the title, a link that opens it in a
 * split view, and the issues it closes. Which branch, and how far from its
 * base. What has been said about it — the labels, and the names of any checks
 * that are red.
 */
export const PullRequestCard = React.memo<Props>(({ entry, scaleMax }) => (
  <article className={'pull-request'}>
    <div className={'pull-request-badges'}>
      <StateBadge isDraft={entry.isDraft} />
      <VerdictBadge checks={entry.checks} />
      <AutoMergeBadge armed={entry.autoMerge} />
      <SetAsideBadge baseRef={entry.baseRef} setAside={entry.setAside} />
      <ReviewBadge review={entry.codeOwnerReview} />
    </div>

    <div className={'pull-request-heading'}>
      <span className={'pull-request-number'}>{`#${entry.number}`}</span>
      <ExternalLink href={entry.url} variant={'pull-request-title'}>
        {entry.title}
      </ExternalLink>
      <SplitViewLink entry={entry} />
    </div>

    {Arr.isNonEmpty(entry.linkedIssues) ? (
      <div className={'pull-request-row'}>
        <LinkedIssues issues={entry.linkedIssues} />
      </div>
    ) : undefined}

    <div className={'pull-request-row'}>
      <span className={'branch'} title={'the branch this pull request is of'}>
        <span aria-hidden={'true'}>{'⎇ '}</span>
        {entry.headRef}
        <span aria-hidden={'true'} className={'branch-arrow'}>
          {' → '}
        </span>
        <span className={'branch-base'}>{entry.baseRef}</span>
      </span>

      {entry.stackedOn === undefined ? undefined : (
        <span
          className={'stacked-on'}
          title={`Its base is the branch of #${entry.stackedOn}, so its diff is its own layer. GitHub moves it onto the base of #${entry.stackedOn} once that one merges.`}
        >
          {`stacked on #${entry.stackedOn}`}
        </span>
      )}

      <CommitDivergence
        baseRef={entry.baseRef}
        comparison={entry.comparison}
        scaleMax={scaleMax}
      />
    </div>

    <div className={'pull-request-row'}>
      {entry.labels.map((label) => (
        <LabelChip key={label.name} label={label} />
      ))}

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
));

PullRequestCard.displayName = 'PullRequestCard';
