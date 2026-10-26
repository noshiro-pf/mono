/** The contexts a pull request has to satisfy, from where the repository says. */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { MAIN_RULESET_PATH, parseRuleset, type RepoRef } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import { repoRoot } from '../lib/index.mjs';
import type { Client } from './github.mjs';

/**
 * The required contexts: from the checkout's
 * `repo-settings/rulesets/main.json` where the repository declares its
 * ruleset there (`parseRuleset` says why the declaration rather than
 * GitHub), and otherwise from what GitHub enforces on the default branch.
 */
export const readRequiredContexts = async (
  client: Client,
  repo: RepoRef,
  defaultBranch: string,
): Promise<Result<readonly string[], string>> => {
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
