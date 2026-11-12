/**
 * The queue as `pr-report` reads and decides it, for a command that acts on one
 * pull request by what the queue says of it: its owner, above all, which only
 * the whole snapshot decides (a stack, a merge-order cycle).
 */

import {
  branchTipsNotRead,
  decideQueue,
  OPEN_PULLS_PATH,
  readSnapshotRest,
  restLeadingItems,
  type QueueDecision,
  type ReadContext,
  type Snapshot,
  type SnapshotOptions,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { StrictPick } from 'ts-type-forge';
import { messageOf } from '../../github/index.mjs';
import {
  DEFAULT_ISSUES_LIMIT,
  DEFAULT_MERGED_DAYS,
  DEFAULT_MERGED_LIMIT,
} from './options.mjs';

/**
 * Every decision over the snapshot read now, with the report's defaults. It
 * reads the checks as well, for who owns a pull request rests on them. The cap
 * of {@link readCappedSnapshot} holds here as in the report, for the rate limit
 * is the one the worker spends.
 */
export const readQueue = async (
  context: ReadContext,
  nowEpochMs: number,
): Promise<Result<QueueDecision, string>> => {
  const snapshot = await readCappedSnapshot(context, {
    nowEpochMs,
    issuesLimit: DEFAULT_ISSUES_LIMIT,
    mergedLimit: DEFAULT_MERGED_LIMIT,
    mergedDays: DEFAULT_MERGED_DAYS,
  });

  if (Result.isErr(snapshot)) {
    return snapshot;
  }

  return Result.mapErr(
    decideQueue(snapshot.value, { nowEpochMs, demoted: new Set<number>() }),
    messageOf,
  );
};

/**
 * The snapshot over REST, refused when more than {@link MAX_OPEN_PULLS} pull
 * requests are open.
 */
export const readCappedSnapshot = async (
  context: ReadContext,
  options: StrictPick<
    SnapshotOptions,
    'issuesLimit' | 'mergedDays' | 'mergedLimit' | 'nowEpochMs'
  >,
): Promise<Result<Snapshot, string>> => {
  // Counted before the snapshot fans out. The cap is the commands', so the
  // reader does not carry it; the count costs a page or two that the snapshot
  // then reads again.
  const open = await restLeadingItems(
    context,
    'the open pull requests',
    OPEN_PULLS_PATH,
    t.array(t.unknown()),
    () => true,
    MAX_OPEN_PULLS + 1,
  );

  if (Result.isErr(open)) {
    return Result.err(messageOf(open.value));
  }

  if (open.value.items.length > MAX_OPEN_PULLS) {
    return Result.err(
      `more than ${MAX_OPEN_PULLS} pull requests are open, more than one read of the queue covers`,
    );
  }

  const snapshot = await readSnapshotRest(context, {
    ...options,
    follow: [],
    readBranchTips: branchTipsNotRead,
  });

  return Result.mapErr(snapshot, messageOf);
};

/**
 * How many open pull requests a report covers: each fans out to a dozen
 * requests, and past this one run spends most of an hour's rate limit.
 */
export const MAX_OPEN_PULLS = 100;
