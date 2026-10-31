/** The contexts a pull request has to satisfy, from where the repository says. */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { MAIN_RULESET_PATH, parseRuleset, type RepoRef } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import { repoRoot, resolveRepo } from '../lib/index.mjs';
import type { Client } from './github.mjs';

/**
 * The required contexts: from the checkout's `repo-settings/rulesets/main.json`
 * where the repository declares its ruleset there (`parseRuleset` says why the
 * declaration rather than
 * GitHub), and otherwise from what GitHub enforces on the default branch.
 *
 * The file is read only when `repo` is the checkout's own repository: with
 * `--repo` naming another, the checkout's ruleset says nothing about it.
 */
export const readRequiredContexts = async (
  client: Client,
  repo: RepoRef,
  defaultBranch: string,
): Promise<Result<readonly string[], string>> => {
  const checkout = await resolveRepo();

  if (Result.isErr(checkout) || !isSameRepo(checkout.value, repo)) {
    return client.requiredContexts(repo, defaultBranch);
  }

  const file = path.resolve(await repoRoot(), MAIN_RULESET_PATH);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = await Result.fromPromise(fs.readFile(file, 'utf8'));

  if (Result.isErr(text)) {
    return client.requiredContexts(repo, defaultBranch);
  }

  return Result.map(
    parseRuleset(text.value, file),
    ({ requiredContexts }) => requiredContexts,
  );
};

/** Whether `a` and `b` name one repository: GitHub ignores the case of both names. */
export const isSameRepo = (a: RepoRef, b: RepoRef): boolean =>
  a.owner.toLowerCase() === b.owner.toLowerCase() &&
  a.name.toLowerCase() === b.name.toLowerCase();
