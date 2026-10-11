/**
 * When an issue may be started, read from the `Start-After:` declarations in
 * the issue bodies. The rules are `docs/issue-start-after.md`; the parsing is
 * `merge-after.mts`'s, shared with `Merge-After:`.
 */

import { Arr } from 'ts-data-forge';
import { findMergeAfterCycles } from './merge-after.mjs';

/**
 * Where one thing a declaration names stands, as far as starting goes.
 *
 * - `waiting` — open, a draft pull request included: what names it waits.
 * - `done` — a merged pull request, or an issue closed as completed.
 * - `abandoned` — closed without being done: a pull request closed unmerged,
 *   an issue closed as not planned or as a duplicate. Not read as done,
 *   because the work that was waited for never happened; a person has to
 *   decide whether the declaration should name something else or go.
 * - `unknown` — a number that names nothing, or nothing the reader may see.
 */
export type ReferenceStatus = 'abandoned' | 'done' | 'unknown' | 'waiting';

/**
 * How an issue stands for being started, the first that applies:
 *
 * - `cycle` — its declarations and other issues' run back to it.
 * - `blocked` — something it names is still open.
 * - `attention` — nothing it names is open, but something was abandoned or
 *   is unknown, and the declaration wants looking at.
 * - `ready` — everything it names is done: it waited, and need not any more.
 * - `free` — it declares nothing.
 *
 * `ready` and `free` are both startable, and kept apart so that an issue that
 * has just become startable can stand out from one that always was.
 */
export type StartState = 'attention' | 'blocked' | 'cycle' | 'free' | 'ready';

/**
 * What GitHub says about a numbered item, in the terms both of its APIs
 * share once lower-cased: GraphQL's `CLOSED` / `NOT_PLANNED` are REST's
 * `closed` / `not_planned`.
 */
export type ReferencedFacts = Readonly<
  | {
      kind: 'issue';
      state: string;
      /** `undefined` for an issue closed before GitHub recorded reasons. */
      stateReason: string | undefined;
    }
  | { kind: 'pull-request'; state: string; merged: boolean }
>;

/**
 * Where one named item stands. An issue closed with no reason recorded is
 * taken as completed, which was the only way to close one before reasons
 * existed.
 */
export const referenceStatusOf = (facts: ReferencedFacts): ReferenceStatus => {
  if (facts.state.toLowerCase() === 'open') {
    return 'waiting';
  }

  if (facts.kind === 'pull-request') {
    return facts.merged ? 'done' : 'abandoned';
  }

  const reason = facts.stateReason?.toLowerCase() ?? 'completed';

  return reason === 'completed' ? 'done' : 'abandoned';
};

/**
 * Each issue's {@link StartState}, keyed by its number.
 *
 * `statusOf` says where each named number stands; the open issues among
 * `issues` are `waiting` whatever it says, so a caller need only know about
 * what is not in the list. Cycles are found among the declarations of
 * `issues` alone: a pull request declares no `Start-After:`, and the body of
 * an issue that is not listed was not read.
 *
 * Nothing is transitive: an issue that names an open one is blocked whatever
 * that one is waiting for in turn.
 */
export const decideStartStates = (
  issues: readonly Readonly<{
    number: number;
    startAfter: readonly number[];
  }>[],
  statusOf: (number: number) => ReferenceStatus,
): ReadonlyMap<number, StartState> => {
  const open = new Set(issues.map(({ number }) => number));

  const onCycle = new Set(
    findMergeAfterCycles(
      new Map(issues.map(({ number, startAfter }) => [number, startAfter])),
    ).flat(),
  );

  const status = (number: number): ReferenceStatus =>
    open.has(number) ? 'waiting' : statusOf(number);

  return new Map(
    issues.map(({ number, startAfter }) => {
      const statuses = new Set(startAfter.map(status));

      const state: StartState = onCycle.has(number)
        ? 'cycle'
        : statuses.has('waiting')
          ? 'blocked'
          : statuses.has('abandoned') || statuses.has('unknown')
            ? 'attention'
            : Arr.isNonEmpty(startAfter)
              ? 'ready'
              : 'free';

      return [number, state];
    }),
  );
};
