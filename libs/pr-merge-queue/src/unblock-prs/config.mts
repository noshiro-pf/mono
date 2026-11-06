/**
 * What a repository says about itself in `.github/unblock-prs.json`: the parts
 * of the run that depend on how its CI is laid out.
 *
 * The auto-fix, the branches the repository generates rather than writes, and
 * the heading its descriptions are translated under (`../pr-description/`). The
 * labels, `Merge-After:` and the version pull request's branch
 * (`changeset-release/<base>`) are conventions the PR Manager page reads too,
 * from repositories it has no configuration for, so they are fixed in
 * `pr-report-core` rather than set per repository. A repository without the
 * file gets everything but the auto-fix, and has no generated branches.
 *
 * The file's JSON Schema, `config.schema.json` beside this module, is generated
 * from {@link ConfigFileSchema}; a test holds it to the output.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { readJsonFile, repoRoot } from '../lib/index.mjs';

/** Where the file is read from, relative to the repository root. */
export const CONFIG_PATH = '.github/unblock-prs.json';

/**
 * The repository's configuration, or `undefined` when it has none. A file that
 * is there but wrong stops the run: guessing would run commands nobody wrote.
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

  const translation = file.translation?.heading;

  const speculate = file.speculate;

  if (
    speculate !== undefined &&
    (!Number.isSafeInteger(speculate.depth) ||
      speculate.depth < 1 ||
      !Arr.isNonEmpty(speculate.workflows) ||
      speculate.workflows.some((name) => !WORKFLOW_FILE.test(name)) ||
      Arr.uniq(speculate.workflows).length !== speculate.workflows.length)
  ) {
    return Result.err(
      `${source}: speculate needs a whole depth of 1 or more and at least one workflow, each a file name of .github/workflows (such as code-check.yml) named once`,
    );
  }

  const patterns = [
    ...(file.autoFix?.ignore ?? []).map(
      (pattern, i) => [`autoFix.ignore[${i}]`, pattern] as const,
    ),
    ...(file.autoFix?.prepare ?? []).map(
      ({ context }, i) => [`autoFix.prepare[${i}].context`, context] as const,
    ),
    ...(file.autoFix?.fixers ?? []).map(
      ({ context }, i) => [`autoFix.fixers[${i}].context`, context] as const,
    ),
    ...(file.regenerate?.generators ?? []).map(
      ({ path: pattern }, i) =>
        [`regenerate.generators[${i}].path`, pattern] as const,
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

  const regenerate =
    file.regenerate === undefined
      ? undefined
      : ({
          before: file.regenerate.before,
          generators: file.regenerate.generators.map(
            ({ path: pattern, run }) => ({ path: compileValid(pattern), run }),
          ),
        } as const);

  if (file.autoFix === undefined) {
    return Result.ok({
      autoFix: undefined,
      generatedBranches,
      translation,
      regenerate,
      speculate,
    });
  }

  const { ignore, before, prepare, fixers, after } = file.autoFix;

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
    translation,
    regenerate,
    speculate,
  });
};

/** A workflow file name, as `speculate.workflows` names one. */
const WORKFLOW_FILE = /^[\w.-]+\.ya?ml$/u;

/** Declared before its first use, which runs at load: a string `configOf` compiles; `regex` is all the schema can say about it. */
const regex = (): t.Type<string> => t.annotate(t.string(), { format: 'regex' });

/**
 * The file as written. The descriptions are the file's documentation: they are
 * what `config.schema.json`, generated from this by `gen:config-schema`, shows
 * in an editor.
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
    regenerate: t.optional(
      t.annotate(
        t.strictRecord({
          before: t.annotate(t.array(t.string()), {
            description:
              'Commands run first, before any generator: what the generators need (an install).',
          }),
          generators: t.annotate(
            t.array(
              t.strictRecord({
                path: t.annotate(regex(), {
                  description:
                    'A regular expression for a path, from the repository root, that the command writes whole.',
                }),
                run: t.annotate(t.string(), {
                  description:
                    "The command that writes it, where $1 to $9 are the path's capture groups, shell-quoted.",
                }),
              }),
            ),
            {
              description:
                'The first whose `path` matches a conflicted file decides how it is written again; a conflicted file none matches is resolved by hand.',
            },
          ),
        }),
        {
          description:
            "How to resolve a rebase whose conflicts are all in generated files: take the base's side of each, finish the rebase, run `before` and the generators, and amend what they wrote onto the pull request's one commit. A file the generators leave as the base has it, though the pull request changed it, stops this: the generator did not reproduce the pull request's side. Absent: every conflict is set aside, as it is when any conflicted file is not generated.",
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
    speculate: t.optional(
      t.annotate(
        t.strictRecord({
          workflows: t.annotate(t.array(t.string()), {
            description:
              'The file names of the check workflows to dispatch on each layer, such as `code-check.yml`: every workflow that reports a required context. Each takes the `diff-parent` input.',
          }),
          depth: t.annotate(t.number(), {
            description:
              'How many queued pull requests are stacked and checked ahead at most, the first included.',
          }),
        }),
        {
          description:
            'Check queued pull requests ahead of their turn: the leading ones are stacked on the default branch, one commit each, each on a `queue/pr-<number>` branch, and the workflows are dispatched on each with `diff-parent`. A pull request is released once its layer is green, and the gate reuses that verdict. Absent: one pull request is checked at a time.',
        },
      ),
    ),
    translation: t.optional(
      t.annotate(
        t.strictRecord({
          heading: t.annotate(t.string(), {
            description:
              'The text of the `## ` heading the translation follows the original under, such as `日本語`.',
          }),
        }),
        {
          description:
            'Pull request and issue descriptions are written twice: the original, which tools and sessions read, then its translation under one `## <heading>`, its headings one level down, ending at the first `---` rule. Present: `open-pr --body-file` and `pr-description push` / `create` refuse a body whose halves do not mirror each other, and `pr-description read` leaves the translation out. Absent: descriptions are taken as they are.',
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
  /** The heading descriptions are translated under, when they are. */
  translation: string | undefined;
  /** How a conflict in generated files is resolved, when it is. */
  regenerate: RegenerateConfig | undefined;
  /** Checking queued pull requests ahead of their turn, when it is on. */
  speculate: SpeculateConfig | undefined;
}>;

/** The files the repository generates whole, and how each is written again. */
export type RegenerateConfig = Readonly<{
  before: readonly string[];
  generators: readonly Readonly<{ path: RegExp; run: string }>[];
}>;

export type SpeculateConfig = Readonly<{
  workflows: readonly string[];
  depth: number;
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
