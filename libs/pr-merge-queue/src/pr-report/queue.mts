import {
  buildEntries,
  queueOwnerOfEntry,
  type DecidedEntries,
  type QueueComments,
  type QueueOwner,
  type RepoRef,
} from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import { currentEpochMs, resolveRepo, tokenFromEnv } from '../lib/index.mjs';
import { createClient, type Client } from './github.mjs';
import { readOpenPulls } from './open-pulls.mjs';

/**
 * Who moves each open pull request in the queue next (`pr-report-core`'s
 * `queue-owner.mts`), from what `pr-report` reads.
 *
 * Every command a session runs on the queue decides through here — the `owner`
 * in `pr-report --format json`, `claim-pr`, `push-fixed-pr`,
 * `report-unowned-prs` and a repository's own `rebuild` scripts — so none of
 * them can come to a different answer from the others, and the worker asks the
 * same function with the same facts read through `gh`.
 */
export const ownersOf = (
  decided: DecidedEntries,
  queue: ReadonlyMap<number, QueueComments>,
  defaultBranch: string,
  nowEpochMs: number,
): ReadonlyMap<number, QueueOwner> =>
  new Map(
    Arr.generate(function* () {
      for (const entry of decided.entries) {
        // A pull request whose comments could not be read has no owner rather
        // than the worker's: nothing is known of a set-aside on it.
        const comments = queue.get(entry.number);

        const owner =
          comments === undefined
            ? undefined
            : queueOwnerOfEntry(entry, comments, {
                defaultBranch,
                cycles: decided.cycles,
                nowEpochMs,
              });

        if (owner !== undefined) {
          yield [entry.number, owner] as const;
        }
      }
    }),
  );

export type QueueState = Readonly<{
  repo: RepoRef;
  defaultBranch: string;
  /**
   * Read without `checks: true`, nothing is required, and its entries' check
   * verdicts and comparisons are made from nothing read and mean nothing.
   */
  decided: DecidedEntries;
  queue: ReadonlyMap<number, QueueComments>;
  owners: ReadonlyMap<number, QueueOwner>;
}>;

/**
 * Reads the open pull requests, this account's comments on them and the owner
 * of each, for a command that acts on the queue. It needs a token whose account
 * is the one `unblock-prs` writes as: without one no comment is trusted, and
 * there is no owner to read. `token` is for a command that resolved its own
 * (`gh auth token` included); otherwise it comes from the environment.
 * `checks: true` reads the required contexts and every pull request's
 * comparison and check states too (`readOpenPulls`), which no owner reads;
 * without it the entries say nothing of either.
 */
export const readQueueState = async (
  repoOption?: string,
  {
    token = tokenFromEnv(),
    checks,
  }: Readonly<{ token?: string | undefined; checks?: boolean }> = {},
): Promise<Result<QueueState, string>> => {
  const repo = await resolveRepo(repoOption);

  return Result.isErr(repo)
    ? repo
    : readQueueStateWith(createClient(token), repo.value, { checks });
};

/** {@link readQueueState} of `repo`, through `client`. */
export const readQueueStateWith = async (
  client: Client,
  repo: RepoRef,
  { checks = false }: Readonly<{ checks?: boolean | undefined }> = {},
): Promise<Result<QueueState, string>> => {
  if (!client.authenticated) {
    return Result.err(
      'no GH_TOKEN or GITHUB_TOKEN: the queue comments, and so the owners, cannot be read',
    );
  }

  const open = await readOpenPulls(client, repo, checks);

  if (Result.isErr(open)) {
    return open;
  }

  const { defaultBranch, required, pulls } = open.value;

  const queue = await client.queueComments(repo, defaultBranch, pulls);

  const decided = buildEntries({
    required,
    defaultBranch,
    pulls,
  });

  return Result.ok({
    repo,
    defaultBranch,
    decided,
    queue,
    owners: ownersOf(decided, queue, defaultBranch, currentEpochMs()),
  });
};
