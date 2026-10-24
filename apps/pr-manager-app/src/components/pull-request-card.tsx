import {
  constant,
  For,
  If,
  mapBindable,
  MatchOptional,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import type { Entry } from '../load-report.mjs';
import { AutoMergeBadge } from './auto-merge-badge.js';
import { ClaudeSessions } from './claude-sessions.js';
import { CommitDivergence } from './commit-divergence.js';
import { ExternalLink } from './external-link.js';
import { LabelChip } from './label-chip.js';
import { LinkedIssues } from './linked-issues.js';
import { ReviewBadge } from './review-badge.js';
import { SetAsideBadge } from './set-aside-badge.js';
import { SplitViewLink } from './split-view-link.js';
import { StateBadge } from './state-badge.js';
import { Timestamp } from './timestamp.js';
import { VerdictBadge } from './verdict-badge.js';

type Props = Readonly<{
  entry: Bindable<Entry>;
  /** The scale every divergence bar in the report is drawn against. */
  scaleMax: Bindable<number>;
}>;

/**
 * One open pull request: what it is, and what is holding it up.
 *
 * Five rows, in the order a reader asks the questions. What state is it in —
 * the badges. What is it — the number, the title, a link that opens it in a
 * split view, the issues it closes and the Claude Code sessions it was
 * written in. Which branch, and how far from its base. When did it last
 * move. What has been said about it — the labels, and
 * the names of any checks that are red.
 *
 * The card is drawn as soon as the pull request is read; the verdict, the
 * distance from the base and the badges read from its details come by
 * queries of their own, and say they are being read until they answer
 * (`entry.reading`). A poll that changes a pull request rewrites the parts of
 * its card bound to what changed, and leaves the rest of it alone.
 */
export const PullRequestCard = ({ entry, scaleMax }: Props): JSX.Element => (
  <article class={constant('pull-request')}>
    <div class={constant('pull-request-badges')}>
      <StateBadge isDraft={mapBindable(entry, ({ isDraft }) => isDraft)} />
      <VerdictBadge
        checks={mapBindable(entry, ({ reading, checks }) =>
          reading.includes('checks') ? undefined : checks,
        )}
      />
      <AutoMergeBadge
        armed={mapBindable(entry, ({ autoMerge }) => autoMerge)}
      />
      <SetAsideBadge entry={entry} />
      <If
        cond={mapBindable(entry, ({ reading }) => !reading.includes('details'))}
        then={
          <ReviewBadge
            review={mapBindable(
              entry,
              ({ codeOwnerReview }) => codeOwnerReview,
            )}
          />
        }
      />
    </div>

    <div class={constant('pull-request-heading')}>
      <span class={constant('pull-request-number')}>
        {mapBindable(entry, ({ number }) => `#${number}`)}
      </span>
      <ExternalLink
        href={mapBindable(entry, ({ url }) => url)}
        variant={'pull-request-title'}
      >
        {mapBindable(entry, ({ title }) => title)}
      </ExternalLink>
      <SplitViewLink entry={entry} />
    </div>

    <If
      cond={mapBindable(entry, ({ linkedIssues }) =>
        Arr.isNonEmpty(linkedIssues),
      )}
      then={
        <div class={constant('pull-request-row')}>
          <LinkedIssues
            issues={mapBindable(entry, ({ linkedIssues }) => linkedIssues)}
          />
        </div>
      }
    />

    <If
      cond={mapBindable(entry, ({ claudeSessions }) =>
        Arr.isNonEmpty(claudeSessions),
      )}
      then={
        <div class={constant('pull-request-row')}>
          <ClaudeSessions
            sessions={mapBindable(
              entry,
              ({ claudeSessions }) => claudeSessions,
            )}
          />
        </div>
      }
    />

    <div class={constant('pull-request-row')}>
      <span
        class={constant('branch')}
        title={constant('the branch this pull request is of')}
      >
        <span aria-hidden={constant('true')}>{constant('⎇ ')}</span>
        {mapBindable(entry, ({ headRef }) => headRef)}
        <span aria-hidden={constant('true')} class={constant('branch-arrow')}>
          {constant(' → ')}
        </span>
        <span class={constant('branch-base')}>
          {mapBindable(entry, ({ baseRef }) => baseRef)}
        </span>
      </span>

      <MatchOptional
        value={mapBindable(entry, ({ stackedOn }) =>
          Optional.fromNullable(stackedOn),
        )}
        some={(stackedOn$) => (
          <span
            class={constant('stacked-on')}
            title={view(
              stackedOn$,
              (stackedOn) =>
                `Its base is the branch of #${stackedOn}, so its diff is its own layer. GitHub moves it onto the base of #${stackedOn} once that one merges.`,
            )}
          >
            {view(stackedOn$, (stackedOn) => `stacked on #${stackedOn}`)}
          </span>
        )}
      />

      <If
        cond={mapBindable(
          entry,
          ({ inheritedMergeAfter, notStartedIssues }) =>
            Arr.isNonEmpty(inheritedMergeAfter) ||
            Arr.isNonEmpty(notStartedIssues),
        )}
        then={
          <span
            class={constant('stacked-on')}
            title={constant(
              'An issue this closes declares Start-After, which it inherits as a merge order. An open issue nobody is working on holds nothing.',
            )}
          >
            {mapBindable(entry, inheritedOrderText)}
          </span>
        }
      />

      <CommitDivergence entry={entry} scaleMax={scaleMax} />
    </div>

    {/*
     * Two instants that look like one question. `updatedAt` moves when
     * anything about the pull request does — a label, a comment, an edit —
     * and the head commit is when the branch itself last moved.
     */}
    <div class={constant('pull-request-row')}>
      <Timestamp
        iso={mapBindable(entry, ({ headCommittedAt }) => headCommittedAt)}
        label={'pushed'}
      />
      <Timestamp
        iso={mapBindable(entry, ({ updatedAt }) => updatedAt)}
        label={'updated'}
      />
    </div>

    <div class={constant('pull-request-row')}>
      <For
        items={mapBindable(entry, ({ labels }) => labels)}
        key={(label) => label.name}
      >
        {(label$) => <LabelChip label={label$} />}
      </For>

      <If
        cond={mapBindable(entry, ({ checks }) => Arr.isNonEmpty(checks.failed))}
        then={
          <span
            class={mapBindable(entry, ({ checks }) =>
              checks.verdict === 'paused' ? 'stale-checks' : 'failed-checks',
            )}
          >
            {mapBindable(entry, ({ checks }) =>
              checks.verdict === 'paused'
                ? `stale red: ${checks.failed.join(', ')}`
                : `failed: ${checks.failed.join(', ')}`,
            )}
          </span>
        }
      />
    </div>
  </article>
);

/**
 * What the issues it closes add to its merge order, in a line: the pull
 * requests it now waits for, and the issues named that nobody has started.
 */
const inheritedOrderText = ({
  inheritedMergeAfter,
  notStartedIssues,
}: Entry): string =>
  [
    ...(Arr.isNonEmpty(inheritedMergeAfter)
      ? [`after ${numbers(inheritedMergeAfter)} (Start-After)`]
      : []),
    ...(Arr.isNonEmpty(notStartedIssues)
      ? [`${numbers(notStartedIssues)} (issue) not done`]
      : []),
  ].join(' · ');

const numbers = (list: readonly number[]): string =>
  list.map((number) => `#${number}`).join(', ');
