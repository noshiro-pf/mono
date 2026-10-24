/** What the repository's own declarations say, read from the tree. */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { MAIN_RULESET_PATH, parseRuleset } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import { projectRootPath } from '../../project-root-path.mjs';

/**
 * The contexts a pull request has to satisfy, read from the checkout's
 * `repo-settings/rulesets/main.json`. `parseRuleset` says why the
 * declaration rather than GitHub.
 */
export const readRequiredContexts = async (): Promise<
  Result<readonly string[], string>
> => {
  const file = path.resolve(projectRootPath, MAIN_RULESET_PATH);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = await Result.fromPromise(fs.readFile(file, 'utf8'));

  if (Result.isErr(text)) {
    return Result.err(`cannot read ${file}`);
  }

  return Result.map(
    parseRuleset(text.value, file),
    ({ requiredContexts }) => requiredContexts,
  );
};
