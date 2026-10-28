/**
 * What a repository says about itself in `.github/unblock-prs.json`: the
 * parts of the run that depend on how its CI is laid out.
 *
 * The auto-fix, and the branches the repository generates rather than
 * writes. The labels, `Merge-After:` and the version pull request's branch
 * (`changeset-release/<base>`) are conventions the PR Manager page reads too,
 * from repositories it has no configuration for, so they are fixed in
 * `pr-report-core` rather than set per repository. A repository without the
 * file gets everything but the auto-fix, and has no generated branches.
 *
 * The file's JSON Schema, `config.schema.json` beside this module, is
 * generated from {@link ConfigFileSchema}; a test holds it to the output.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { readJsonFile, repoRoot } from '../lib/index.mjs';

/** Where the file is read from, relative to the repository root. */
export const CONFIG_PATH = '.github/unblock-prs.json';

/**
 * The repository's configuration, or `undefined` when it has none. A file
 * that is there but wrong stops the run: guessing would run commands nobody
 * wrote.
 */
export const readConfig = async (
  root?: string,
): Promise<Result<Config | undefined, string>> => {
  const file = path.join(root ?? (await repoRoot()), CONFIG_PATH);

  if (!(await exists(file))) {
    return Result.ok(undefined);
  }

  const read = await readJsonFile(file, ConfigFileSchema);

  return Result.isErr(read) ? read : configOf(read.value, file);
};

/** {@link readConfig}'s validation, after the JSON has been parsed. */
export const configOf = (
  file: ConfigFile,
  source: string,
): Result<Config, string> => {
  const generatedBranches = file.generatedBranches ?? [];

  if (file.autoFix === undefined) {
    return Result.ok({ autoFix: undefined, generatedBranches });
  }

  const { ignore, before, prepare, fixers, after } = file.autoFix;

  const patterns = [
    ...ignore.map((pattern, i) => [`autoFix.ignore[${i}]`, pattern] as const),
    ...prepare.map(
      ({ context }, i) => [`autoFix.prepare[${i}].context`, context] as const,
    ),
    ...fixers.map(
      ({ context }, i) => [`autoFix.fixers[${i}].context`, context] as const,
    ),
  ] as const;

  const invalid = patterns
    .map(([where, pattern]) => [where, compile(pattern)] as const)
    .filter(([, compiled]) => Result.isErr(compiled))
    .map(([where]) => where);

  if (Arr.isNonEmpty(invalid)) {
    return Result.err(
      `${source}: not a regular expression: ${invalid.join(', ')}`,
    );
  }

  return Result.ok({
    autoFix: {
      ignore: ignore.map(compileValid),
      before,
      prepare: prepare.map(({ context, run }) => ({
        context: compileValid(context),
        run,
      })),
      fixers: fixers.map(({ context, run, stage }) => ({
        context: compileValid(context),
        run,
        stage,
      })),
      after,
    },
    generatedBranches,
  });
};

/** Declared before its first use, which runs at load: a string `configOf` compiles; `regex` is all the schema can say about it. */
const regex = (): t.Type<string> => t.annotate(t.string(), { format: 'regex' });

/**
 * The file as written. The descriptions are the file's documentation: they are
 * what `config.schema.json`, generated from this by `gen:config-schema`,
 * shows in an editor.
 */
export const ConfigFileSchema = t.annotate(
  t.strictRecord({
    $schema: t.optional(t.string()),
    autoFix: t.optional(
      t.annotate(
        t.strictRecord({
          ignore: t.annotate(t.array(regex()), {
            description:
              'Regular expressions for failed contexts that are only the echo of another, such as an aggregate job, and are not read.',
          }),
          before: t.annotate(t.array(t.string()), {
            description:
              'Commands run first, always: what CI does before any job (an install).',
          }),
          prepare: t.annotate(
            t.array(t.strictRecord({ context: regex(), run: t.string() })),
            {
              description:
                'Commands run after `before` when a context being fixed matches `context`, each command once: what CI gives some jobs and not others (a build).',
            },
          ),
          fixers: t.annotate(
            t.array(
              t.strictRecord({
                context: t.annotate(regex(), {
                  description:
                    "A regular expression for the failed context's name.",
                }),
                run: t.annotate(t.string(), {
                  description:
                    "The command, where $1 to $9 are the context's capture groups, shell-quoted.",
                }),
                stage: t.annotate(t.number(), {
                  description:
                    'Lower stages run first, and within a stage by command.',
                }),
              }),
            ),
            {
              description:
                'Every failed context not ignored has to match one of these, the first that matches deciding, or nothing is fixed.',
            },
          ),
          after: t.annotate(t.array(t.string()), {
            description:
              'Commands run last, always: settling what the fixers wrote (a formatter).',
          }),
        }),
        {
          description:
            "How to fix a failure that is only a fixer's diff: a job that runs a command and then asserts a clean tree. Absent: a failure is never fixed, only reported.",
        },
      ),
    ),
    generatedBranches: t.optional(
      t.annotate(
        t.array(
          t.strictRecord({
            branch: t.annotate(t.string(), {
              description: "The pull request's head branch, exactly.",
            }),
            rebuild: t.annotate(t.string(), {
              description:
                'How the branch is built again from the tip of the default branch, as a person or the skill would run it; push-fixed-pr names it when it refuses.',
            }),
          }),
        ),
        {
          description:
            'Branches the repository generates whole, lockfile and all, such as a dependency update. A conflict on one is resolved by building it again, never by a rebase resolved by hand: push-fixed-pr refuses that push, and the skill runs `rebuild` instead.',
        },
      ),
    ),
  }),
  {
    title: 'unblock-prs configuration',
    description:
      "What a repository says about itself in .github/unblock-prs.json: the parts of an unblock-prs run that depend on how its CI is laid out, and the branches it generates. Labels, Merge-After: and the version pull request's branch are fixed conventions, not set here.",
  },
);

export type ConfigFile = t.TypeOf<typeof ConfigFileSchema>;

export type Config = Readonly<{
  autoFix: AutoFixConfig | undefined;
  generatedBranches: readonly GeneratedBranch[];
}>;

/** A branch the repository builds rather than writes. */
export type GeneratedBranch = Readonly<{ branch: string; rebuild: string }>;

export type AutoFixConfig = Readonly<{
  ignore: readonly RegExp[];
  before: readonly string[];
  prepare: readonly Readonly<{ context: RegExp; run: string }>[];
  fixers: readonly Readonly<{ context: RegExp; run: string; stage: number }>[];
  after: readonly string[];
}>;

const exists = async (file: string): Promise<boolean> =>
  Result.isOk(await Result.fromPromise(fs.access(file)));

const compile = (pattern: string): Result<RegExp, unknown> =>
  // eslint-disable-next-line security/detect-non-literal-regexp -- the repository's own configuration
  Result.fromThrowable(() => new RegExp(pattern, 'u'));

/** Only after {@link compile} has accepted every pattern. */
const compileValid = (pattern: string): RegExp =>
  // eslint-disable-next-line security/detect-non-literal-regexp -- the repository's own configuration
  new RegExp(pattern, 'u');
