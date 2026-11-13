import type { PullRequestFacts, RepoRef } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import type { Client } from './github.mjs';
import { readRequiredContexts } from './repo-settings.mjs';

/**
 * The default branch, the contexts it requires and the open pull requests: what
 * the report and the queue are both built from.
 *
 * `checks: false` reads neither the required contexts nor any pull request's
 * comparison and check states — about four requests for each pull request, and
 * the checkout's ruleset or two requests for the contexts — for a caller whose
 * answer depends on none of them: `required` is then empty, and the facts say
 * nothing of either.
 */
export const readOpenPulls = async (
  client: Client,
  repo: RepoRef,
  checks: boolean,
): Promise<Result<OpenPulls, string>> => {
  const defaultBranch = await client.defaultBranch(repo);

  if (Result.isErr(defaultBranch)) {
    return defaultBranch;
  }

  const required = checks
    ? await readRequiredContexts(client, repo, defaultBranch.value)
    : Result.ok(NOTHING_REQUIRED);

  if (Result.isErr(required)) {
    return required;
  }

  const pulls = await client.facts(repo, { checks });

  if (Result.isErr(pulls)) {
    return pulls;
  }

  return Result.ok({
    defaultBranch: defaultBranch.value,
    required: required.value,
    pulls: pulls.value,
  });
};

export type OpenPulls = Readonly<{
  defaultBranch: string;
  required: readonly string[];
  pulls: readonly PullRequestFacts[];
}>;

const NOTHING_REQUIRED: readonly string[] = [] as const;
