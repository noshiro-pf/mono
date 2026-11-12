/**
 * The comments the worker keeps (`spec/worker.md`, "Settle comments"): a
 * set-aside that no longer applies rewritten as resolved, and one decided this
 * cycle, or decided before and never written, written.
 */

import {
  findRecord,
  moveSetAsideBase,
  ownerOfReason,
  parseSetAsideComment,
  setAsideApplies,
  writeResolvedSetAsideComment,
  writeSetAsideComment,
  type OwnComment,
  type PullRequestFacts,
  type ReadContext,
  type SetAsideDecision,
  type Snapshot,
  type UnannouncedSetAside,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import { writeComment } from '../../github/index.mjs';

/**
 * `snapshot` with every set-aside comment that no longer applies settled: a
 * `rebase-failed` whose base moved but which still conflicts keeps standing on
 * the new base; any other is rewritten as resolved. The snapshot handed on
 * reads the comments as written, so the plan decides on them; under
 * `--dry-run`, as they would be.
 */
export const settleComments = async (
  snapshot: Snapshot,
  world: SettleWorld,
): Promise<Snapshot> => {
  const { pullRequests } = snapshot;

  if (Result.isErr(pullRequests)) {
    return snapshot;
  }

  const { defaultBranch, defaultBranchTip } = snapshot.repository;

  const settled = await Promise.all(
    pullRequests.value.map(async (pr): Promise<PullRequestFacts> => {
      const rewrite = await rewriteOf(pr, world, {
        defaultBranch,
        tip: defaultBranchTip,
      });

      if (rewrite === undefined) {
        return pr;
      }

      world.log(`#${pr.number}: ${rewrite.why}.`);

      if (!world.dryRun) {
        const written = await writeComment(
          world.context,
          pr.number,
          rewrite.commentId,
          rewrite.body,
        );

        if (Result.isErr(written)) {
          world.log(`#${pr.number}: ${written.value}`);

          return pr;
        }
      }

      return {
        ...pr,
        comments: Result.map(pr.comments, (comments) =>
          comments.map((comment): OwnComment =>
            comment.id === rewrite.commentId
              ? { ...comment, body: rewrite.body }
              : comment,
          ),
        ),
      };
    }),
  );

  return { ...snapshot, pullRequests: Result.ok(settled) };
};

/**
 * Writes each set-aside as a comment, over the pull request's set-aside comment
 * where it has one; the ones whose write failed, to be written next cycle.
 * Under `--dry-run`, says what it would write and writes nothing.
 */
export const announceSetAsides = async (
  setAsides: readonly UnannouncedSetAside[],
  snapshot: Snapshot,
  world: SettleWorld,
): Promise<readonly UnannouncedSetAside[]> => {
  const pulls = Result.isOk(snapshot.pullRequests)
    ? snapshot.pullRequests.value
    : ([] as const);

  const failed = await Promise.all(
    Arr.uniqBy(setAsides, ({ number }) => number).map(async (setAside) => {
      const pr = pulls.find(({ number }) => number === setAside.number);

      world.log(
        `#${setAside.number}: ${world.dryRun ? 'would set' : 'setting'} it aside as \`${setAside.reason}\`: ${setAside.prose.split('\n', 1)[0] ?? ''}`,
      );

      if (world.dryRun || pr?.headSha !== setAside.head) {
        return undefined;
      }

      const existing = Result.isOk(pr.comments)
        ? findRecord(pr.comments.value, parseSetAsideComment)?.commentId
        : undefined;

      const written = await writeComment(
        world.context,
        setAside.number,
        existing,
        writeSetAsideComment(
          {
            reason: setAside.reason,
            headSha: setAside.head,
            baseSha: setAside.baseSha,
          },
          setAside.prose,
        ),
      );

      if (Result.isErr(written)) {
        world.log(`#${setAside.number}: ${written.value}`);

        return setAside;
      }

      return undefined;
    }),
  );

  return failed.filter((each) => each !== undefined);
};

/** A set-aside decided this cycle, with the prose its comment carries. */
export const unannouncedOf = (
  setAside: SetAsideDecision,
  baseSha: string,
): UnannouncedSetAside =>
  ({
    number: setAside.number,
    head: setAside.head,
    reason: setAside.reason,
    baseSha,
    prose: proseOf(setAside),
  }) as const;

export type SettleWorld = Readonly<{
  context: ReadContext;
  dryRun: boolean;
  log: (line: string) => void;
  /** Whether the commit `head` still conflicts with the commit `tip`. */
  conflictsWithTip: (
    head: string,
    tip: string,
  ) => Promise<Result<boolean, string>>;
}>;

const capitalized = (text: string): string =>
  `${text.slice(0, 1).toUpperCase()}${text.slice(1)}` as const;

/**
 * The comment's prose (`spec/worker.md`, "The set-aside comment's prose"): what
 * happened, then whose it is and what clears it.
 */
const proseOf = (setAside: SetAsideDecision): string =>
  [
    `Set aside: ${setAside.detail}.`,
    '',
    `${capitalized(ownerOfReason(setAside.reason).why)}. A push to the branch clears it, and so does ticking the box below.`,
  ].join('\n');

/** What a standing set-aside that no longer applies is rewritten to, if any. */
const rewriteOf = async (
  pr: PullRequestFacts,
  world: SettleWorld,
  base: Readonly<{ defaultBranch: string; tip: string }>,
): Promise<
  Readonly<{ commentId: number; body: string; why: string }> | undefined
> => {
  if (Result.isErr(pr.comments)) {
    return undefined;
  }

  const found = findRecord(pr.comments.value, parseSetAsideComment);

  if (found?.says.kind !== 'standing') {
    return undefined;
  }

  const { record, retry } = found.says;

  const body = pr.comments.value.find(({ id }) => id === found.commentId)?.body;

  if (
    body === undefined ||
    (!retry && setAsideApplies(record, pr.headSha, base.tip))
  ) {
    return undefined;
  }

  const resolved = (why: string): ReturnType<typeof rewriteOf> =>
    Promise.resolve({
      commentId: found.commentId,
      body: writeResolvedSetAsideComment(`Resolved: ${why}.`),
      why: `its \`${record.reason}\` set-aside is resolved: ${why}`,
    });

  if (retry) {
    return resolved('a retry was asked for');
  }

  if (record.headSha !== pr.headSha) {
    return resolved('the branch was pushed to');
  }

  // Only the base moved. A conflict that a rebase onto the new tip would meet
  // again stays the skill's.
  if (record.reason === 'rebase-failed' && !pr.fromFork) {
    const conflicts = await world.conflictsWithTip(pr.headSha, base.tip);

    // Unknown is left as it stands: rewritten as resolved, it would be set
    // aside again by the rebase that meets the same conflict.
    if (Result.isErr(conflicts)) {
      world.log(
        `#${pr.number}: cannot tell whether it still conflicts with ${base.defaultBranch}: ${conflicts.value}`,
      );

      return undefined;
    }

    if (conflicts.value) {
      return {
        commentId: found.commentId,
        body: moveSetAsideBase(body, base.tip),
        why: `it still conflicts with ${base.defaultBranch} at ${base.tip.slice(0, 10)}; its set-aside stands there`,
      };
    }
  }

  return resolved(`${base.defaultBranch} moved`);
};
