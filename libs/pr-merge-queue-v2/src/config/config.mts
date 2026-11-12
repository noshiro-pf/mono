/**
 * What a repository says about itself in `.github/unblock-prs.json`
 * (`spec/commands.md`): the parts of the worker and the commands that depend on
 * how its CI is laid out, and the branches it generates. A repository without
 * the file gets everything but the auto-fix, and has no generated branches.
 *
 * The file is v1's, unchanged: its JSON Schema, `config.schema.json` beside
 * this module, is generated from {@link ConfigFileSchema} by
 * `gen:config-schema`, and a test holds it to v1's.
 */

import * as path from 'node:path';
import type { GeneratedBranch } from 'pr-report-core-v2';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { readTextFile } from '../state/index.mjs';

/** Where the file is read from, relative to the repository root. */
export const CONFIG_PATH = '.github/unblock-prs.json';

/**
 * The configuration of the repository checked out at `root`, or `undefined`
 * when it has none. A file that is there but wrong stops the run: guessing
 * would run commands nobody wrote.
 */
export const readConfig = async (
  root: string,
): Promise<Result<Config | undefined, string>> => {
  const file = path.join(root, CONFIG_PATH);

  const read = await readTextFile(file);

  if (Result.isErr(read)) {
    return read;
  }

  const text = read.value;

  if (text === undefined) {
    return Result.ok(undefined);
  }

  const parsed = Result.fromThrowable((): unknown => JSON.parse(text));

  if (Result.isErr(parsed)) {
    return Result.err(`${file}: not JSON (${unknownToString(parsed.value)})`);
  }

  const validated = ConfigFileSchema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(
        `${file}: ${t.validationErrorsToMessages(validated.value).join('; ')}`,
      )
    : configOf(validated.value, file);
};

/**
 * {@link readConfig}'s validation once the file parsed: every pattern compiles,
 * and `speculate` names a whole depth of 1 or more and at least one workflow
 * file, each once.
 */
export const configOf = (
  file: ConfigFile,
  source: string,
): Result<Config, string> => {
  const translation = file.translation?.heading;

  const openingHeading = file.pullRequestDescription?.openingHeading;

  if (openingHeading !== undefined && translation === undefined) {
    return Result.err(
      `${source}: pullRequestDescription needs translation: a description is checked only where it is written twice`,
    );
  }

  // A heading's text is read trimmed, so a padded or empty one matches nothing.
  if (
    openingHeading !== undefined &&
    (openingHeading.trim() === '' || openingHeading.trim() !== openingHeading)
  ) {
    return Result.err(
      `${source}: pullRequestDescription.openingHeading is the heading's text, not empty and with no spaces around it, such as "Background"`,
    );
  }

  const { speculate } = file;

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

  const invalid = patternsOf(file)
    .filter(([, pattern]) => Result.isErr(compile(pattern)))
    .map(([where]) => where);

  if (Arr.isNonEmpty(invalid)) {
    return Result.err(
      `${source}: not a regular expression: ${invalid.join(', ')}`,
    );
  }

  const { autoFix, regenerate } = file;

  return Result.ok({
    autoFix:
      autoFix === undefined
        ? undefined
        : {
            ignore: autoFix.ignore.map(compileValid),
            before: autoFix.before,
            prepare: autoFix.prepare.map(({ context, run }) => ({
              context: compileValid(context),
              run,
            })),
            fixers: autoFix.fixers.map(({ context, run, stage }) => ({
              context: compileValid(context),
              run,
              stage,
            })),
            after: autoFix.after,
            notFixableAnnotation: autoFix.notFixableAnnotation,
          },
    generatedBranches: file.generatedBranches ?? [],
    translation,
    openingHeading,
    regenerate:
      regenerate === undefined
        ? undefined
        : {
            before: regenerate.before,
            generators: regenerate.generators.map(({ path: pattern, run }) => ({
              path: compileValid(pattern),
              run,
            })),
          },
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
          notFixableAnnotation: t.optional(
            t.annotate(t.string(), {
              description:
                'The title of an annotation a job leaves on its check run when its command failed, rather than only leaving a diff: such a context is declined at planning, without an install. For a job that runs its command and its clean-tree check in one step, whose steps cannot say which failed. Absent: every failed context matching a fixer is tried.',
            }),
          ),
        }),
        {
          description:
            "How to fix a failure that is only a fixer's diff: a job whose clean-tree check fails once its command has run. Absent: a failure is never fixed, only reported.",
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
              'The file names of the check workflows to dispatch on each layer, such as `code-check.yml`: every workflow that reports a required context, each a caller of the gate.',
          }),
          depth: t.annotate(t.number(), {
            description:
              'How many queued pull requests are stacked and checked ahead at most, the first included.',
          }),
        }),
        {
          description:
            'Check queued pull requests ahead of their turn: the leading ones are stacked on the default branch, one commit each, each on a `queue/pr-<number>` branch, and the workflows are dispatched on each, judging it against the default branch as a pull request is. A pull request is released once its layer is green, and the gate reuses that verdict. Absent: one pull request is checked at a time.',
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
    pullRequestDescription: t.optional(
      t.annotate(
        t.strictRecord({
          openingHeading: t.annotate(t.string(), {
            description:
              "The text of the `## ` heading a pull request's original opens with, such as `Background`.",
          }),
        }),
        {
          description:
            "What a pull request's description must have beyond the translation's rules; needs `translation`. Present: `open-pr --body-file`, `pr-description push` and `check` refuse a pull request's description whose original does not open with `## <openingHeading>` (declarations aside): the section that says what the change is about and why, for a reader who has not read the issue. Issues are not asked. Absent: a description may open with any section.",
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
  /** The `## ` heading a pull request's description opens with, when one is asked for. */
  openingHeading: string | undefined;
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

export type AutoFixConfig = Readonly<{
  ignore: readonly RegExp[];
  before: readonly string[];
  prepare: readonly Readonly<{ context: RegExp; run: string }>[];
  fixers: readonly Readonly<{ context: RegExp; run: string; stage: number }>[];
  after: readonly string[];
  /** Absent in a repository whose jobs leave no such annotation. */
  notFixableAnnotation: string | undefined;
}>;

/** Every pattern of the file, with where it is written. */
const patternsOf = (
  file: ConfigFile,
): readonly (readonly [where: string, pattern: string])[] =>
  [
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

const compile = (pattern: string): Result<RegExp, unknown> =>
  // eslint-disable-next-line security/detect-non-literal-regexp -- the repository's own configuration
  Result.fromThrowable(() => new RegExp(pattern, 'u'));

/** Only after {@link compile} has accepted every pattern. */
const compileValid = (pattern: string): RegExp =>
  // eslint-disable-next-line security/detect-non-literal-regexp -- the repository's own configuration
  new RegExp(pattern, 'u');
