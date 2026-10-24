/** What the repository's own declarations say, read from the tree. */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { MAIN_RULESET_PATH, parseRuleset, type RepoRef } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { readJsonFile } from '../../lib/json.mjs';
import { projectRootPath } from '../../project-root-path.mjs';

const PackageJsonSchema = t.record({
  repository: t.record({ url: t.string() }),
});

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

/** The repository this checkout is of, from its own manifest. */
export const readRepoRef = async (): Promise<Result<RepoRef, string>> => {
  const manifest = await readJsonFile(
    path.resolve(projectRootPath, 'package.json'),
    PackageJsonSchema,
  );

  if (Result.isErr(manifest)) {
    return manifest;
  }

  const match =
    /github\.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+?)(?:\.git)?$/u.exec(
      manifest.value.repository.url,
    );

  const { owner, name } = match?.groups ?? {};

  return owner === undefined || name === undefined
    ? Result.err(
        `the root package.json does not name a GitHub repository: ${manifest.value.repository.url}`,
      )
    : Result.ok({ owner, name });
};
