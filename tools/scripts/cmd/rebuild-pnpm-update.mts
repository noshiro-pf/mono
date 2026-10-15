import {
  PNPM_UPDATE_BRANCH,
  type QueueComments,
  type QueueOwner,
  type ReportEntry,
} from 'pr-report-core';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { resolveApiContext, rest } from './open-pr/api.mjs';
import { readQueueState } from './pr-report/queue.mjs';

/**
 * Resolves a conflict on the dependency update the way that branch is made:
 * by having `pnpm-update.yml` build it again from the tip of the default
 * branch, rather than by a rebase. The branch is generated — the lockfile
 * above all — and a hand-resolved lockfile is one nothing checked was
 * resolved under `minimumReleaseAge`.
 *
 * ```sh
 * pnpm run rebuild-pnpm-update -- <number> --by <session URL>
 * ```
 *
 * It refuses unless the pull request is `chore/pnpm-update`, is the skill's
 * (`pr-report-core`'s `queue-owner.mts`, read as every other command reads
 * it) because the worker set it aside `rebase-failed`, and is claimed by
 * `--by`. The workflow force-pushes the branch when it finishes, which moves
 * the head: the claim ends, the set-aside is resolved, and the pull request
 * is the worker's again — as `push-fixed-pr` hands back any other.
 */
export const rebuildPnpmUpdate = async (
  args: RebuildArgs,
): Promise<Result<string, string>> => {
  const state = await readQueueState();

  if (Result.isErr(state)) {
    return Result.err(`cannot read the queue: ${state.value}`);
  }

  const { decided, queue, owners, defaultBranch } = state.value;

  const decision = decideRebuild({
    entry: decided.entries.find((e) => e.number === args.number),
    by: args.by,
    owner: owners.get(args.number),
    comments: queue.get(args.number),
  });

  if (decision !== undefined) {
    return Result.err(`#${args.number} not rebuilt: ${decision}.`);
  }

  const api = await resolveApiContext();

  if (Result.isErr(api)) {
    return api;
  }

  const dispatched = await rest(
    api.value,
    'POST',
    `/actions/workflows/${WORKFLOW}/dispatches`,
    t.unknown(),
    { body: { ref: defaultBranch } },
  );

  return Result.isErr(dispatched)
    ? Result.err(
        `#${args.number}: cannot start ${WORKFLOW} (the token needs \`actions: write\`): ${dispatched.value}`,
      )
    : Result.ok(
        `#${args.number}: started ${WORKFLOW} on ${defaultBranch}; it force-pushes ${PNPM_UPDATE_BRANCH} when it finishes, and the pull request is the worker's again.`,
      );
};

/**
 * Why `by` may not have the dependency update rebuilt, or `undefined` when
 * it may.
 */
export const decideRebuild = ({
  entry,
  by,
  owner,
  comments,
}: Readonly<{
  entry: ReportEntry | undefined;
  by: string;
  owner: QueueOwner | undefined;
  comments: QueueComments | undefined;
}>): string | undefined => {
  if (entry === undefined) {
    return 'it is not open';
  }

  if (entry.headRef !== PNPM_UPDATE_BRANCH) {
    return `it is not the dependency update (${PNPM_UPDATE_BRANCH}); push a fix with pnpm run push-fixed-pr`;
  }

  if (owner?.owner !== 'skill') {
    return owner === undefined
      ? 'who owns it could not be read'
      : `it is the ${owner.owner}'s (${owner.reason}), not a skill's`;
  }

  const setAside = comments?.setAside?.says;

  if (
    setAside?.kind !== 'standing' ||
    setAside.setAside.reason !== 'rebase-failed'
  ) {
    return 'it is not set aside `rebase-failed`; a failing check is fixed and pushed with pnpm run push-fixed-pr';
  }

  const claim = comments?.claim;

  return claim?.applies === true &&
    claim.says.kind === 'standing' &&
    claim.says.claim.by === by
    ? undefined
    : `${by} holds no claim on it at its head; claim it first (pnpm run claim-pr)`;
};

/** The command line, or what is wrong with it. */
export const parseRebuildArgs = (
  args: readonly string[],
): RebuildArgs | string => {
  const byAt = args.indexOf('--by');

  const by = byAt === -1 ? undefined : args[byAt + 1];

  const positional = args.filter(
    (arg, index) =>
      arg !== '--' && (byAt === -1 || (index !== byAt && index !== byAt + 1)),
  );

  const [first] = positional;

  const number =
    first !== undefined && /^#?[1-9]\d*$/u.test(first)
      ? Result.unwrapOkOr(Num.safeParseInt(first.replace('#', '')), undefined)
      : undefined;

  return positional.length > 1
    ? `unexpected argument: ${Arr.tail(positional).join(' ')}`
    : number === undefined
      ? 'name the pull request by its number'
      : by === undefined || by.startsWith('--')
        ? '--by names the claimant, as it claimed the pull request'
        : { number, by };
};

export type RebuildArgs = Readonly<{ number: number; by: string }>;

const WORKFLOW = 'pnpm-update.yml';

if (isDirectlyExecuted(import.meta.url)) {
  const args = parseRebuildArgs(Arr.skip(process.argv, 2));

  if (typeof args === 'string') {
    console.error(
      `${args}\n\nUsage: pnpm run rebuild-pnpm-update -- <number> --by <claimant>`,
    );

    process.exit(1);
  }

  const result = await rebuildPnpmUpdate(args).catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
}
