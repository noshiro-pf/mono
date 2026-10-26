import {
  PNPM_UPDATE_BRANCH,
  SKIP_CI_LABEL,
  stackDescendants,
  type QueueComments,
  type QueueOwner,
  type ReportEntry,
} from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import {
  addLabel,
  git,
  pullRequestNumber,
  resolveApiContext,
  sh,
} from '../lib/index.mjs';
import { readQueueState } from '../pr-report/index.mjs';
import { pushLeased, restack, type BranchOf } from '../unblock-prs/index.mjs';

/** What `push-fixed-pr --help` prints. */
export const PUSH_FIXED_PR_HELP = [
  'Usage: push-fixed-pr <number> --by <claimant> --head <commit>',
  '',
  'Hands a fixed pull request back to unblock-prs: pushes <commit> onto the',
  'branch --by claimed, under skip-ci, and restacks the pull requests stacked',
  "on it. It refuses unless the claim on it is --by's.",
  '',
  'Options:',
  '  --by <claimant>  the claimant, as given to claim-pr',
  "  --head <commit>  the fix, already in this repository's objects",
  '  -h, --help       show this help',
].join('\n');

/**
 * Hands a fixed pull request back to the worker: pushes the commit a session
 * made onto the branch it claimed, under `skip-ci`, and carries the layers
 * stacked on it along — with the worker's own code (`pushLeased`, `restack`
 * in `unblock-prs/rebase.mts`), so that a session's push is the push the
 * worker would have made.
 *
 * ```sh
 * push-fixed-pr 2267 --by <session URL> --head <commit>
 * ```
 *
 * It refuses unless the pull request is a skill's (`pr-report-core`'s
 * `queue-owner.mts`, read as every other command reads it) and the claim on
 * it is `--by`'s: the claim is what kept the worker off it, and its head is
 * the lease. `<commit>` is the fix, already in this repository's objects —
 * any worktree of it will do. The push moves the head, which ends the claim
 * and resolves the set-aside: from then on the pull request is the worker's.
 */
export const pushFixedPr = async (
  args: PushArgs,
): Promise<Result<string, string>> => {
  const commit = await git(
    `git rev-parse --verify --quiet ${sh(`${args.head}^0`)}`,
  );

  if (Result.isErr(commit)) {
    return Result.err(`${args.head} is not a commit here.`);
  }

  const state = await readQueueState();

  if (Result.isErr(state)) {
    return Result.err(`cannot read the queue: ${state.value}`);
  }

  const { decided, queue, owners } = state.value;

  const decision = decidePush({
    number: args.number,
    by: args.by,
    head: commit.value.trim(),
    entries: decided.entries,
    owner: owners.get(args.number),
    comments: queue.get(args.number),
  });

  if (decision.kind === 'refuse') {
    return Result.err(`#${args.number} not pushed: ${decision.reason}.`);
  }

  if (decision.addSkipCi) {
    const api = await resolveApiContext();

    const added = Result.isErr(api)
      ? api
      : await addLabel(api.value, args.number, SKIP_CI_LABEL);

    if (Result.isErr(added)) {
      return Result.err(
        `#${args.number} not pushed: cannot put ${SKIP_CI_LABEL} on it first, and without it the push runs the matrix: ${added.value}`,
      );
    }
  }

  const pushed = await pushLeased(
    decision.pr.headRefName,
    decision.head,
    decision.pr.headRefOid,
  );

  if (Result.isErr(pushed)) {
    return Result.err(`#${args.number}: push refused: ${pushed.value}`);
  }

  if (pushed.value === 'moved') {
    return Result.err(
      `#${args.number}: someone pushed to ${decision.pr.headRefName} since it was claimed; throw the work away and survey again.`,
    );
  }

  await restack(decision.pr, decision.head, decision.layers);

  return Result.ok(
    `#${args.number}: pushed ${decision.head.slice(0, 10)} under ${SKIP_CI_LABEL}${Arr.isNonEmpty(decision.layers) ? `, and carried ${decision.layers.map(({ number }) => `#${number}`).join(', ')} along` : ''}; it is the worker's again.`,
  );
};

/**
 * Whether `by` may push `head` to pull request `number`, and what that
 * involves: the lease, whether `skip-ci` has to go on first, and the layers
 * to carry along, lowest first.
 */
export const decidePush = ({
  number,
  by,
  head,
  entries,
  owner,
  comments,
}: Readonly<{
  number: number;
  by: string;
  head: string;
  entries: readonly ReportEntry[];
  owner: QueueOwner | undefined;
  comments: QueueComments | undefined;
}>): Readonly<
  | {
      kind: 'push';
      pr: BranchOf;
      head: string;
      addSkipCi: boolean;
      layers: readonly BranchOf[];
    }
  | { kind: 'refuse'; reason: string }
> => {
  const entry = entries.find((e) => e.number === number);

  if (entry === undefined) {
    return { kind: 'refuse', reason: 'it is not open' };
  }

  if (owner?.owner !== 'skill') {
    return {
      kind: 'refuse',
      reason:
        owner === undefined
          ? 'who owns it could not be read'
          : `it is the ${owner.owner}'s (${owner.reason}), not a skill's`,
    };
  }

  const claim = comments?.claim;

  if (
    claim?.applies !== true ||
    claim.says.kind !== 'standing' ||
    claim.says.claim.by !== by
  ) {
    return {
      kind: 'refuse',
      reason: `${by} holds no claim on it at its head; claim it first (claim-pr)`,
    };
  }

  if (head === entry.headSha) {
    return { kind: 'refuse', reason: `${head} is already its head` };
  }

  // A generated branch, lockfile and all: its conflict is resolved by
  // generating it again from the tip, not by a rebase resolved by hand.
  if (
    entry.headRef === PNPM_UPDATE_BRANCH &&
    comments?.setAside?.says.kind === 'standing' &&
    comments.setAside.says.setAside.reason === 'rebase-failed'
  ) {
    return {
      kind: 'refuse',
      reason:
        'a conflict on the dependency update is resolved by building it again: pnpm run rebuild-pnpm-update',
    };
  }

  const parents: ReadonlyMap<number, number> = new Map(
    Arr.generate(function* () {
      for (const e of entries) {
        if (e.stackedOn !== undefined) {
          yield [e.number, e.stackedOn] as const;
        }
      }
    }),
  );

  return {
    kind: 'push',
    pr: branchOf(entry),
    head,
    addSkipCi: entry.labels.every(({ name }) => name !== SKIP_CI_LABEL),
    layers: stackDescendants(parents, number).flatMap((n) =>
      entries.filter((e) => e.number === n).map(branchOf),
    ),
  };
};

/** The command line, or what is wrong with it. */
export const parsePushArgs = (args: readonly string[]): PushArgs | string => {
  const flagValue = (flag: string): string | undefined => {
    const at = args.indexOf(flag);

    return at === -1 ? undefined : args[at + 1];
  };

  const by = flagValue('--by');

  const head = flagValue('--head');

  const flagged = new Set(
    Arr.generate(function* () {
      for (const flag of ['--by', '--head']) {
        const at = args.indexOf(flag);

        if (at === -1) {
          continue;
        }

        yield at;

        yield at + 1;
      }
    }),
  );

  const positional = args.filter(
    (arg, index) => arg !== '--' && !flagged.has(index),
  );

  const [first] = positional;

  const number = first === undefined ? undefined : pullRequestNumber(first);

  return positional.length > 1
    ? `unexpected argument: ${Arr.tail(positional).join(' ')}`
    : number === undefined
      ? 'name the pull request by its number'
      : by === undefined || by.startsWith('--')
        ? '--by names the claimant, as it claimed the pull request'
        : head === undefined || !/^[0-9a-f]{7,40}$/u.test(head)
          ? '--head names the commit to push, by its SHA'
          : { number, by, head };
};

export type PushArgs = Readonly<{ number: number; by: string; head: string }>;

const branchOf = (entry: ReportEntry): BranchOf =>
  ({
    number: entry.number,
    // Every entry is an open pull request.
    state: 'OPEN',
    headRefName: entry.headRef,
    headRefOid: entry.headSha,
    baseRefName: entry.baseRef,
    isCrossRepository: entry.fromFork,
  }) as const;
