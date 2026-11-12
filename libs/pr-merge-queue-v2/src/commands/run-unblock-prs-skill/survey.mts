/** Which pull request a round hands the skill, read without the model. */

import {
  labelNames,
  pickPriorityOf,
  type PullRequestDecision,
  type PullRequestFacts,
  type QueueComments,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';

/**
 * Sorts the queue the way step 1 of the skill does, so that the model is
 * started only when the skill would find something to do.
 *
 * `attempted` is the keys handed to earlier rounds. A pull request the skill
 * gives up on — a decision it leaves to a person, a failure it could not
 * reproduce — stays the skill's at the same head, and the skill under `/loop`
 * would try it again every round. Here every try is paid for, so it waits for
 * the head or the set-aside to move instead; a restart forgets the keys and
 * tries each once more.
 */
export const surveyQueue = (
  pullRequests: readonly SurveyedPullRequest[],
  attempted: ReadonlySet<string>,
): Survey => {
  const mut_fresh: (Candidate & Readonly<{ rank: number }>)[] = [];

  const mut_left: Candidate[] = [];

  const mut_claimed: number[] = [];

  const mut_unowned: number[] = [];

  for (const { facts, owner, comments } of pullRequests) {
    const owned = Result.isOk(owner) ? owner.value?.owner : undefined;

    if (owned === 'none') {
      mut_unowned.push(facts.number);

      continue;
    }

    if (owned !== 'skill') {
      continue;
    }

    const read = Result.isOk(comments) ? comments.value : undefined;

    if (read?.claim?.applies === true) {
      mut_claimed.push(facts.number);

      continue;
    }

    const candidate: Candidate = {
      number: facts.number,
      key: `${keyPrefix(facts.number, facts.headSha)}${setAsideReason(read)}`,
    } as const;

    if (attempted.has(candidate.key)) {
      mut_left.push(candidate);
    } else {
      mut_fresh.push({
        ...candidate,
        rank: RANKS[pickPriorityOf(labelNames(facts.labels))],
      });
    }
  }

  return {
    fresh: mut_fresh
      .toSorted((a, b) =>
        a.rank === b.rank ? a.number - b.number : a.rank - b.rank,
      )
      .map(({ number, key }) => ({ number, key })),
    left: mut_left,
    claimed: mut_claimed,
    unowned: mut_unowned,
  };
};

/**
 * What every {@link Candidate} key for this pull request at this head starts
 * with, for telling which keys still name an open pull request as it stands.
 */
export const keyPrefix = (number: number, headSha: string): string =>
  `#${number}@${headSha} ` as const;

/** What the survey reads of a pull request the queue decided. */
export type SurveyedPullRequest = Readonly<
  StrictPick<PullRequestDecision, 'comments' | 'owner'> & {
    facts: StrictPick<PullRequestFacts, 'headSha' | 'labels' | 'number'>;
  }
>;

/** A pull request the skill owns, and what it was set aside as. */
export type Candidate = Readonly<{
  number: number;
  /**
   * The pull request, its head and the reason it was set aside, as one string:
   * a round that leaves it unfixed leaves all three as they were, and a push or
   * a new reason changes one. Not the base the set-aside was written at: the
   * worker moves the base a `rebase-failed` one records each time the default
   * branch moves and it still conflicts, and that is the same conflict.
   */
  key: string;
}>;

export type Survey = Readonly<{
  /**
   * The skill's, unclaimed, and not yet handed to a round as they stand, in the
   * order step 1 of the skill takes them: `priority:high` first, `priority:low`
   * last, the lowest number first within each.
   */
  fresh: readonly Candidate[];
  /** The skill's, unclaimed, and left by an earlier round as they stand. */
  left: readonly Candidate[];
  /** The skill's, and claimed by someone. */
  claimed: readonly number[];
  /** The ones nobody owns, for `report-unowned-prs`. */
  unowned: readonly number[];
}>;

/** Both labels count as neither, as the queue's order counts them. */
const RANKS = {
  high: 0,
  normal: 1,
  conflicting: 1,
  low: 2,
} as const;

const setAsideReason = (comments: QueueComments | undefined): string => {
  const says = comments?.setAside?.says;

  return says === undefined
    ? 'none'
    : says.kind === 'standing'
      ? says.record.reason
      : says.kind;
};
