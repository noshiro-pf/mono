import {
  buildEntries,
  queueOwnerOfEntry,
  type DecidedEntries,
  type QueueComments,
  type QueueOwner,
  type RepoRef,
} from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import { createClient, parseRepoRef } from './github.mjs';
import { readRepoRef, readRequiredContexts } from './repo-settings.mjs';

/**
 * Who moves each open pull request in the queue next (`pr-report-core`'s
 * `queue-owner.mts`), from what `pr-report` reads.
 *
 * Every command a session runs on the queue decides through here — the
 * `owner` in `pr-report --format json`, `claim-pr`, `push-fixed-pr`,
 * `rebuild-pnpm-update` and `report-unowned-prs` — so none of them can come
 * to a different answer from the others, and the worker asks the same
 * function with the same facts read through `gh`.
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
  decided: DecidedEntries;
  queue: ReadonlyMap<number, QueueComments>;
  owners: ReadonlyMap<number, QueueOwner>;
}>;

/**
 * Reads the open pull requests, this account's comments on them and the
 * owner of each, for a command that acts on the queue. It needs a token
 * whose account is the one `unblock-prs` writes as: without one no comment
 * is trusted, and there is no owner to read.
 */
export const readQueueState = async (
  repoOption?: string,
): Promise<Result<QueueState, string>> => {
  const repo =
    repoOption === undefined ? await readRepoRef() : parseRepoRef(repoOption);

  if (Result.isErr(repo)) {
    return repo;
  }

  const required = await readRequiredContexts();

  if (Result.isErr(required)) {
    return required;
  }

  const client = createClient(
    process.env['GITHUB_TOKEN'] ?? process.env['GH_TOKEN'],
  );

  if (!client.authenticated) {
    return Result.err(
      'no GITHUB_TOKEN or GH_TOKEN: the queue comments, and so the owners, cannot be read',
    );
  }

  const defaultBranch = await client.defaultBranch(repo.value);

  if (Result.isErr(defaultBranch)) {
    return defaultBranch;
  }

  const facts = await client.facts(repo.value);

  if (Result.isErr(facts)) {
    return facts;
  }

  const queue = await client.queueComments(
    repo.value,
    defaultBranch.value,
    facts.value,
  );

  const decided = buildEntries({
    required: required.value,
    defaultBranch: defaultBranch.value,
    pulls: facts.value,
  });

  return Result.ok({
    repo: repo.value,
    defaultBranch: defaultBranch.value,
    decided,
    queue,
    owners: ownersOf(
      decided,
      queue,
      defaultBranch.value,
      Temporal.Now.instant().epochMilliseconds,
    ),
  });
};
