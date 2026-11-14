/**
 * Repairing the candidates checking ahead has stacked, or tried to, before
 * their turn, while the worker waits for the first layer's checks.
 *
 * Without this, a candidate whose commits conflict stops the stack, and a red
 * layer above the first waits, until it is first: only then does its release
 * resolve the conflict, set it aside for the skill, or fix a fixer's diff. Both
 * repairs are the pull request's own, whatever becomes of the layers below, so
 * they are made as soon as checking ahead finds them:
 *
 * - **A conflict with the default branch** is rebased as "3a" rebases a waiting
 *   pull request (`restackBehind`): a conflict only in generated files is
 *   resolved by generating them again (`regenerate.mts`), and any other sets it
 *   aside `rebase-failed`, for the skill to fix now. A conflict with the layers
 *   below alone is with pull requests that have not merged, and waits for them,
 *   as before.
 * - **A red layer whose failures are all fixers' diffs** has those fixers run on
 *   the pull request's own head (`autoFix`, reading the layer's jobs), and what
 *   they write amended and pushed. Once a head, and never on the head a fix
 *   pushed: the fixers read the head alone, so a fixer that changed nothing,
 *   because the diff comes of the layers below, would change nothing again, and
 *   one that writes something on every run would push for ever. The layer then
 *   waits until it is first, where the release fixes it.
 *
 * Every push is under `skip-ci`, so it runs no checks; the layer built at the old
 * head is cleaned up, and the next survey stacks the new one.
 */

import type { QueueOwner } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import { currentEpochMs, log, type ApiContext } from '../lib/index.mjs';
import { autoFix } from './auto-fix.mjs';
import type { AutoFixConfig, RegenerateConfig } from './config.mjs';
import { conflictsOnTip } from './conflict-persists.mjs';
import { isMergeQueued } from './labels.mjs';
import { restackBehind } from './rebase.mjs';
import { layerBranch, type BuiltLayer } from './speculate-plan.mjs';
import type { Ahead } from './speculate.mjs';
import { autoRebaseTargets } from './stack.mjs';
import type { OutOfSync, PullRequest, SkipRecords } from './types.mjs';
import { stopRequested } from './util.mjs';

/**
 * What to repair ahead of the turn, in order: the conflicted candidate first,
 * whose rebase moves its head and lets the next survey stack it, then each red
 * layer, by its fixers when the repository has any. Only a pull request in
 * `eligible` ({@link mayRepairAhead}), and a red layer only at a head other
 * than the one its fixers were tried at or pushed (`tried`).
 */
export const planRepairsAhead = ({
  conflicted,
  red,
  eligible,
  fixers,
  tried,
}: Readonly<{
  conflicted: number | undefined;
  red: readonly BuiltLayer[];
  eligible: ReadonlySet<number>;
  fixers: boolean;
  tried: ReadonlyMap<number, string>;
}>): readonly RepairAhead[] =>
  [
    ...(conflicted !== undefined && eligible.has(conflicted)
      ? ([{ kind: 'rebase', number: conflicted }] as const)
      : ([] as const)),
    ...(fixers
      ? red
          .filter(
            ({ number, head }) =>
              eligible.has(number) && tried.get(number) !== head,
          )
          .map(
            ({ number, head, tip }) =>
              ({ kind: 'fix', number, head, tip }) as const,
          )
      : ([] as const)),
  ] as const;

/**
 * The pull requests a repair ahead may push to: those "3a" rebases while they
 * wait (`autoRebaseTargets` — paused by `skip-ci`, on the default branch, the
 * worker's own), and of them only those their author has queued, since both
 * repairs run the branch's own install and scripts.
 */
export const mayRepairAhead = (
  pullRequests: readonly PullRequest[],
  defaultBranch: string,
  owners: ReadonlyMap<number, QueueOwner>,
): ReadonlySet<number> =>
  new Set<number>(
    autoRebaseTargets(pullRequests, defaultBranch, { owners })
      .filter(isMergeQueued)
      .map(({ number }) => number),
  );

/**
 * The heads whose fixers were tried ahead of their turn, of the pull requests
 * still at them.
 */
export const pruneTriedAhead = (
  tried: ReadonlyMap<number, string>,
  pullRequests: readonly PullRequest[],
): ReadonlyMap<number, string> =>
  new Map<number, string>(
    Array.from(tried).filter(([number, head]) =>
      pullRequests.some((pr) => pr.number === number && pr.headRefOid === head),
    ),
  );

/**
 * Carries out {@link planRepairsAhead}. Resolves to the set-asides and
 * out-of-sync sightings as the rebase leaves them, the layers tried, and whether
 * any branch moved, which makes the survey stale.
 */
export const repairAhead = async (
  api: ApiContext,
  ahead: Ahead,
  context: RepairContext,
): Promise<Repaired> => {
  const { pullRequests, defaultBranch } = context;

  const repairs = planRepairsAhead({
    ...ahead,
    eligible: mayRepairAhead(pullRequests, defaultBranch, context.owners),
    fixers: context.autoFix !== undefined,
    tried: context.tried,
  });

  let mut_repaired: Repaired = {
    skipped: context.skipped,
    outOfSync: context.outOfSync,
    tried: context.tried,
    moved: false,
  };

  for (const repair of repairs) {
    if (stopRequested()) {
      break;
    }

    const pr = pullRequests.find(({ number }) => number === repair.number);

    if (pr !== undefined) {
      mut_repaired =
        repair.kind === 'rebase'
          ? await rebaseAhead(pr, context, mut_repaired)
          : await fixAhead(api, pr, repair, context, mut_repaired);
    }
  }

  return mut_repaired;
};

/** One repair {@link planRepairsAhead} asks for. */
export type RepairAhead = Readonly<
  | { kind: 'rebase'; number: number }
  | { kind: 'fix'; number: number; head: string; tip: string }
>;

/** What {@link repairAhead} reads. */
type RepairContext = Readonly<{
  pullRequests: readonly PullRequest[];
  defaultBranch: string;
  baseSha: string;
  skipped: SkipRecords;
  outOfSync: OutOfSync;
  owners: ReadonlyMap<number, QueueOwner>;
  regenerate: RegenerateConfig | undefined;
  /** `undefined` under `--no-auto-fix`, or when the repository has none. */
  autoFix: AutoFixConfig | undefined;
  tried: ReadonlyMap<number, string>;
}>;

/** What {@link repairAhead} resolves to. */
type Repaired = Readonly<{
  skipped: SkipRecords;
  outOfSync: OutOfSync;
  tried: ReadonlyMap<number, string>;
  moved: boolean;
}>;

/**
 * Rebases a candidate the stack stopped at onto the default branch when its
 * commits conflict with it, as "3a" rebases (`restackBehind`); one that
 * conflicts only with the layers below waits for them.
 */
const rebaseAhead = async (
  pr: PullRequest,
  context: RepairContext,
  repaired: Repaired,
): Promise<Repaired> => {
  const { defaultBranch, baseSha } = context;

  // The objects are in the clone: the survey fetched the tip, and building the
  // layer fetched the head.
  const conflicts = await conflictsOnTip(baseSha, pr.headRefOid);

  if (Result.isErr(conflicts)) {
    log(
      `#${pr.number}: cannot tell whether it conflicts with ${defaultBranch}: ${conflicts.value}`,
    );

    return repaired;
  }

  if (Arr.isEmpty(conflicts.value)) {
    log(
      `#${pr.number}: its commits conflict only with the layers below it, which have not merged; it waits for them.`,
    );

    return repaired;
  }

  log(
    `#${pr.number}: conflicts with ${defaultBranch} in ${conflicts.value.join(', ')}; rebasing it ahead of its turn.`,
  );

  const rebased = await restackBehind(context.pullRequests, defaultBranch, {
    baseSha,
    skipped: repaired.skipped,
    outOfSync: repaired.outOfSync,
    owners: context.owners,
    dryRun: false,
    nowEpochMs: currentEpochMs(),
    regenerate: context.regenerate,
    only: new Set<number>([pr.number]),
  });

  return {
    ...repaired,
    skipped: rebased.skipped,
    outOfSync: rebased.outOfSync,
    moved: repaired.moved || rebased.moved,
  };
};

/**
 * Runs the fixers on a pull request's own head for what failed on its layer
 * (`autoFix`, reading the layer's tip), and records the head they leave it at:
 * the one they were tried at, or the one they pushed.
 */
const fixAhead = async (
  api: ApiContext,
  pr: PullRequest,
  repair: Readonly<{ head: string; tip: string }>,
  context: RepairContext,
  repaired: Repaired,
): Promise<Repaired> => {
  log(
    `#${pr.number}: its layer ${layerBranch(pr.number)} went red ahead of its turn; trying the fixers on its head.`,
  );

  const fixed = await autoFix(
    api,
    pr,
    repair.head,
    context.defaultBranch,
    context.autoFix,
    repair.tip,
  );

  const triedAt = (head: string): ReadonlyMap<number, string> =>
    new Map<number, string>([...repaired.tried, [pr.number, head]]);

  switch (fixed.kind) {
    case 'declined':
      log(
        `#${pr.number}: not fixed ahead of its turn (${fixed.detail}); its layer waits until it is first.`,
      );

      return { ...repaired, tried: triedAt(repair.head) };

    case 'moved':
      return { ...repaired, moved: true };

    case 'pushed':
      log(
        `#${pr.number}: pushed what ${fixed.commands.join(', ')} wrote as ${fixed.head.slice(0, 10)}, ahead of its turn.`,
      );

      return { ...repaired, tried: triedAt(fixed.head), moved: true };
  }
};
