/** What the repository's own declarations say, read from the tree. */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { projectRootPath } from '../../project-root-path.mjs';
import { type RepoRef } from './types.mjs';

const RulesetSchema = t.record({ rules: t.array(t.unknown()) });

/**
 * One rule of the several kinds a ruleset holds. The others carry entirely
 * different parameters, so each rule is tried against this and the ones that
 * do not match are simply not the rule being looked for.
 */
const RequiredStatusChecksRuleSchema = t.record({
  type: t.literal('required_status_checks'),
  parameters: t.record({
    required_status_checks: t.array(t.record({ context: t.string() })),
  }),
});

const PackageJsonSchema = t.record({
  repository: t.record({ url: t.string() }),
});

/**
 * The contexts a pull request has to satisfy, read from
 * `repo-settings/rulesets/main.json` rather than from GitHub.
 *
 * The API that serves a ruleset wants an admin token, and the file is the
 * desired state anyway. The gap is that a root file under `repo-settings/`
 * changes nothing until `pnpm run repo-settings:apply` runs, so a context
 * added here and not applied would be reported as missing on every pull
 * request — which is a fair thing for a report to say out loud.
 */
export const readRequiredContexts = async (): Promise<
  Result<readonly string[], string>
> => {
  const file = path.resolve(
    projectRootPath,
    'repo-settings/rulesets/main.json',
  );

  const parsed = await readJson(file, RulesetSchema);

  if (Result.isErr(parsed)) return parsed;

  return Result.ok(
    parsed.value.rules.flatMap((rule) => {
      const validated = RequiredStatusChecksRuleSchema.validate(rule);

      return Result.isErr(validated)
        ? []
        : validated.value.parameters.required_status_checks.map(
            ({ context }) => context,
          );
    }),
  );
};

/** The repository this checkout is of, from its own manifest. */
export const readRepoRef = async (): Promise<Result<RepoRef, string>> => {
  const parsed = await readJson(
    path.resolve(projectRootPath, 'package.json'),
    PackageJsonSchema,
  );

  if (Result.isErr(parsed)) return parsed;

  const match =
    /github\.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+?)(?:\.git)?$/u.exec(
      parsed.value.repository.url,
    );

  const { owner, name } = match?.groups ?? {};

  return owner === undefined || name === undefined
    ? Result.err(
        `the root package.json does not name a GitHub repository: ${parsed.value.repository.url}`,
      )
    : Result.ok({ owner, name });
};

const readJson = async <A,>(
  file: string,
  schema: t.Type<A>,
): Promise<Result<A, string>> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = await Result.fromPromise(fs.readFile(file, 'utf8'));

  if (Result.isErr(text)) return Result.err(`cannot read ${file}`);

  const parsed = Json.parse(text.value);

  if (Result.isErr(parsed)) {
    return Result.err(`${file} is not valid JSON: ${parsed.value}`);
  }

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(
        `${file} has an unexpected shape:\n${t.validationErrorsToMessages(validated.value).join('\n')}`,
      )
    : Result.ok(validated.value);
};
