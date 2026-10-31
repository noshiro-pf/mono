/** Which pull request a round hands the skill, read without the model. */

import { priorityRankOfLabels, type QueueComments } from 'pr-report-core';
import type { StrictPick } from 'ts-type-forge';
import type { QueueState } from '../pr-report/index.mjs';

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
  state: StrictPick<QueueState, 'decided' | 'owners' | 'queue'>,
  attempted: ReadonlySet<string>,
): Survey => {
  const mut_fresh: (Candidate & Readonly<{ rank: number }>)[] = [];

  const mut_left: Candidate[] = [];

  const mut_claimed: number[] = [];

  const mut_unowned: number[] = [];

  for (const entry of state.decided.entries) {
    const owner = state.owners.get(entry.number)?.owner;

    if (owner === 'none') {
      mut_unowned.push(entry.number);

      continue;
    }

    if (owner !== 'skill') {
      continue;
    }

    const comments = state.queue.get(entry.number);

    if (comments?.claim?.applies === true) {
      mut_claimed.push(entry.number);

      continue;
    }

    const candidate: Candidate = {
      number: entry.number,
      key: `${keyPrefix(entry.number, entry.headSha)}${setAsideReason(comments)}`,
    } as const;

    if (attempted.has(candidate.key)) {
      mut_left.push(candidate);
    } else {
      mut_fresh.push({
        ...candidate,
        rank: priorityRankOfLabels(entry.labels.map(({ name }) => name)),
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

/** A pull request the skill owns, and what it was set aside as. */
export type Candidate = Readonly<{
  number: number;
  /**
   * The pull request, its head and the reason it was set aside, as one string:
   * a round that leaves it unfixed leaves all three as they were, and a push or
   * a new reason changes one. Not the base the set-aside was written at: the
   * worker writes a `rebase-failed` one again each time the default branch
   * moves and the rebase still conflicts, and that is the same conflict, not a
   * new one to pay for.
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

const setAsideReason = (comments: QueueComments | undefined): string => {
  const says = comments?.setAside?.says;

  return says === undefined
    ? 'none'
    : says.kind === 'standing'
      ? says.setAside.reason
      : says.kind;
};
