import * as path from 'node:path';
import {
  ConfigFileSchema,
  configOf,
  failedContexts,
  firstFixerOf,
  planAutoFix,
  type AutoFixConfig as UnblockAutoFixConfig,
} from 'pr-merge-queue';
import {
  Arr,
  isRecord,
  isString,
  Json,
  Result,
  unknownToString,
} from 'ts-data-forge';
import * as t from 'ts-fortress';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  listWorkflowFiles,
  readRepositoryFile,
} from '../../lib/repo-files.mjs';
import {
  matrixValues,
  readMatrix,
  readWorkflowJobs,
  type WorkflowJob,
} from '../../lib/workflow-jobs.mjs';
import { projectRootPath } from '../../project-root-path.mjs';
import { parseWorkflowTriggers } from '../check-workflow-event-name.mjs';

/**
 * Fails when a `context` pattern in `.github/unblock-prs.json` takes no check
 * context the workflows produce.
 *
 * `unblock-prs` decides what it may fix by matching a failed check's name
 * against `autoFix.fixers[].context`, and what to build first by
 * `autoFix.prepare[].context`. Those names are written in the workflows (a
 * matrix job's `name:`, its matrix entries), and nothing else compares the two.
 * So renaming or bundling a matrix entry leaves its fixer matching nothing, and
 * that is silent: the failure it should have fixed is set aside as
 * `checks-failed` instead, and every check stays green. It happened when
 * style-check's entries were bundled (#3326).
 *
 * The contexts are those of every job, in a workflow a pull request runs, that
 * hands a matrix entry to `pnpm run` — the jobs a fixer can name, since a fixer
 * reruns the command. What a pattern takes is asked of `unblock-prs`'s own
 * reader and planner, so that this cannot keep checking rules it has changed.
 * Each top-level alternative of a pattern (`a|b`) is asked on its own, since
 * one that went stale beside a live one is as silent. A pattern idle on purpose
 * is listed in {@link KEPT_IDLE} with its reason.
 */
export const checkAutoFixContexts = (): Promise<Result<CheckSummary, string>> =>
  Result.safeTry(async function* () {
    const configFile = yield* Result.safeUnwrap(
      await readRepositoryFile(CONFIG_PATH),
    );

    const parsed = Json.parse(configFile);

    if (Result.isErr(parsed)) {
      return Result.err(
        `${CONFIG_PATH} is not JSON: ${unknownToString(parsed.value)}`,
      );
    }

    const config = yield* Result.safeUnwrap(
      Result.mapErr(
        readAutoFixPatterns(parsed.value),
        (message) => `${CONFIG_PATH}: ${message}`,
      ),
    );

    const { contexts, unreadable } = yield* Result.safeUnwrap(
      await readCheckContexts(),
    );

    const violations = findIdlePatterns(config, contexts, KEPT_IDLE);

    return Arr.isNonEmpty(violations)
      ? Result.err(formatViolations(violations, unreadable))
      : Result.ok({
          patterns: config.patterns.length,
          contexts: contexts.length,
        });
  });

/**
 * The check contexts of every job in one workflow that runs
 * `pnpm run ${{ matrix.<key> }}`, one per entry of `<key>`, named as GitHub
 * names them: the job's `name:` with the entry put in, or `<job> (<entry>)`.
 *
 * A job whose checks it cannot name exactly is left out, with why, rather than
 * guessed at: entries that are an expression, a matrix with `exclude:`, a
 * `name:` that reads another property, a job with no matrix expression in its
 * name whose entries carry other properties (GitHub names those by all of
 * them), and a matrix job that runs none of its properties as
 * `pnpm run ${{ matrix.<key> }}`. Leaving a job out can only make a pattern
 * fail, never pass, and the reasons are printed with the failure.
 */
export const collectMatrixContexts = (workflowFile: string): MatrixContexts => {
  const jobs = readWorkflowJobs(workflowFile);

  if (Result.isErr(jobs)) {
    return { contexts: [], unreadable: [jobs.value] };
  }

  const results = jobs.value.map(collectJobContexts);

  return {
    contexts: results.flatMap(Result.unwrapOkOr([])),
    unreadable: Arr.generate(function* () {
      for (const result of results) {
        if (Result.isErr(result)) {
          yield result.value;
        }
      }
    }),
  };
};

/**
 * The file read by `unblock-prs`'s own reader, and every `context` of
 * `autoFix.prepare` and `autoFix.fixers` in order, with where it is in the file.
 * A file without `autoFix` fixes nothing and has nothing to ask; a malformed one
 * is refused, as `unblock-prs` refuses it.
 */
export const readAutoFixPatterns = (
  file: unknown,
): Result<AutoFixConfig, string> => {
  const validated = ConfigFileSchema.validate(file);

  if (Result.isErr(validated)) {
    return Result.err(t.validationErrorsToMessages(validated.value).join('\n'));
  }

  const config = configOf(validated.value, CONFIG_PATH);

  if (Result.isErr(config)) {
    return config;
  }

  const autoFix = config.value.autoFix ?? NO_AUTO_FIX;

  // The sources as written, which `KEPT_IDLE` names: a `RegExp` escapes a `/`.
  const written = validated.value.autoFix;

  return Result.ok({
    autoFix,
    patterns: [
      ...autoFix.prepare.map(({ context }, i) =>
        patternOf(
          `autoFix.prepare[${i}].context`,
          'prepare',
          written?.prepare[i]?.context ?? context.source,
          context,
        ),
      ),
      ...autoFix.fixers.map(({ context }, i) =>
        patternOf(
          `autoFix.fixers[${i}].context`,
          'fixer',
          written?.fixers[i]?.context ?? context.source,
          context,
        ),
      ),
    ],
  });
};

/**
 * One message per pattern, or top-level alternative of one, that takes no
 * context and is not kept idle, and per {@link KEPT_IDLE} entry that is stale.
 *
 * `unblock-prs` decides what is read and what takes it: a context it reads
 * (`failedContexts`) goes to the fixer it says is first (`firstFixerOf`), and a
 * prepare entry takes what it matches where a plan for that context comes out
 * (`planAutoFix`), since a failure no fixer takes declines the whole fix before
 * any prepare runs.
 */
export const findIdlePatterns = (
  config: AutoFixConfig,
  contexts: readonly string[],
  keptIdle: readonly KeptIdle[],
): readonly string[] => {
  const { autoFix, patterns } = config;

  const read = contexts.filter((context) =>
    Arr.isNonEmpty(failedContexts(failing(context), autoFix)),
  );

  const firstOf = (context: string): AutoFixPattern | undefined => {
    const fixer = firstFixerOf(context, autoFix);

    return patterns.find(({ regex }) => regex === fixer?.context);
  };

  // Only the first entry with a kept source is exempt, so a copy of it is still
  // asked.
  const kept = new Set(
    keptIdle.map(({ context }) =>
      patterns.find(({ source }) => source === context),
    ),
  );

  const fromPatterns = patterns.flatMap((pattern): readonly string[] => {
    const matched = read.filter((context) => pattern.regex.test(context));

    const taken = matched.filter((context) =>
      pattern.kind === 'prepare'
        ? Result.isOk(planAutoFix(failing(context), autoFix))
        : firstOf(context) === pattern,
    );

    const name = `${pattern.where} \`${pattern.source}\`` as const;

    if (kept.has(pattern)) {
      return Arr.isNonEmpty(taken)
        ? [
            `${name} is in KEPT_IDLE but takes ${quoteList(taken)}; remove it from the list.`,
          ]
        : [];
    }

    if (Arr.isNonEmpty(taken)) {
      return pattern.alternatives
        .filter((alternative) =>
          taken.every((context) => !alternative.regex.test(context)),
        )
        .map(
          (alternative) =>
            `${name}: its alternative \`${alternative.source}\` takes no check.`,
        );
    }

    if (Arr.isNonEmpty(matched)) {
      if (pattern.kind === 'prepare') {
        return [
          `${name} matches only checks no fixer takes (${quoteList(matched)}), so it never runs.`,
        ];
      }

      const takers = Arr.uniq(
        matched.map((context) => firstOf(context)?.where).filter(isString),
      );

      return [
        `${name} matches only checks an earlier fixer takes (${takers.join(', ')}), so it never runs.`,
      ];
    }

    return contexts.some((context) => pattern.regex.test(context))
      ? [`${name} matches only checks \`autoFix.ignore\` leaves unread.`]
      : [`${name} matches no check a workflow produces.`];
  });

  const sources = new Set(patterns.map(({ source }) => source));

  const staleKept = keptIdle
    .filter(({ context }) => !sources.has(context))
    .map(
      ({ context }) =>
        `KEPT_IDLE names \`${context}\`, which ${CONFIG_PATH} no longer has; remove it from the list.`,
    );

  return [...fromPatterns, ...staleKept];
};

/**
 * The top-level alternatives of a regular expression's source: split at each
 * `|` outside a group, a character class and an escape.
 */
export const splitAlternatives = (source: string): readonly string[] => {
  const chars = Array.from(source);

  const cuts = Arr.generate(function* () {
    let mut_state: SplitState = { depth: 0, inClass: false, escaped: false };

    for (const [index, char] of chars.entries()) {
      if (
        char === '|' &&
        mut_state.depth === 0 &&
        !mut_state.inClass &&
        !mut_state.escaped
      ) {
        yield index;
      }

      mut_state = nextSplitState(mut_state, char);
    }
  });

  return Arr.toUnshifted(-1)(cuts).map((cut, i) =>
    chars.slice(cut + 1, cuts[i] ?? chars.length).join(''),
  );
};

export type AutoFixConfig = Readonly<{
  /** As `unblock-prs` reads it, which is what decides what a pattern takes. */
  autoFix: UnblockAutoFixConfig;
  patterns: readonly AutoFixPattern[];
}>;

export type MatrixContexts = Readonly<{
  contexts: readonly string[];
  /** Why each job left out was left out. */
  unreadable: readonly string[];
}>;

export type AutoFixPattern = Readonly<{
  where: string;
  kind: 'prepare' | 'fixer';
  source: string;
  regex: RegExp;
  /** The top-level alternatives, one when there is no `|` at the top. */
  alternatives: readonly Readonly<{ source: string; regex: RegExp }>[];
}>;

export type KeptIdle = Readonly<{
  /** The pattern exactly as `.github/unblock-prs.json` writes it. */
  context: string;
  reason: string;
}>;

/**
 * Patterns that take no check today and stay, each with why. A pattern here
 * that starts taking a check, or leaves the file, fails the guard, so the list
 * cannot outlive its reasons.
 */
const KEPT_IDLE: readonly KeptIdle[] = [
  {
    context: String.raw`^(?:code-check|style-check) \(((?:(?:ws|strict-lib):)?(?:fix:)?gen(?::[^)]*)?)\)$`,
    reason:
      'Runs an entry of its own that is a generator at stage 0, ahead of the lint and codemod fixes that read what it generates. No entry is one today: the generators run inside `z:ci:style-check:checks-and-generators`.',
  },
  {
    context: String.raw`^(?:code-check|style-check) \(((?:(?:ws|strict-lib):)?fix:fmt(?::[^)]*)?)\)$`,
    reason:
      'Puts an entry of its own that formats at stage 2, after the fixes whose output it formats; without it the stage-1 `fix` pattern below would take such an entry. No entry is one today: formatting is checked inside `z:ci:style-check:format-and-doc`.',
  },
] as const;

type SplitState = Readonly<{
  depth: number;
  inClass: boolean;
  escaped: boolean;
}>;

type CheckSummary = Readonly<{
  patterns: number;
  contexts: number;
}>;

type MatrixEntries = Readonly<{
  values: readonly string[];
  /** Whether the matrix has properties other than the command's key. */
  hasOtherProperties: boolean;
  hasExclude: boolean;
}>;

/** What a file without `autoFix` gives the planner to read: nothing. */
const NO_AUTO_FIX: UnblockAutoFixConfig = {
  ignore: [],
  before: [],
  prepare: [],
  fixers: [],
  after: [],
  notFixableAnnotation: undefined,
} as const;

const CONFIG_PATH = '.github/unblock-prs.json';

const PULL_REQUEST_EVENT = 'pull_request';

/**
 * A matrix key run as the job's command: `pnpm run ${{ matrix.<key> }}`, or
 * handed to `z:ci-job` as `--command ${{ matrix.<key> }}`. Its `--build` is
 * what runs first, not what the check reruns.
 */
const MATRIX_COMMAND =
  /(?:pnpm run|--command) \$\{\{ *matrix\.(?<key>[\w-]+) *\}\}/gu;

const MATRIX_PROPERTY = /^\$\{\{ *matrix\.(?<key>[\w-]+) *\}\}$/u;

const EXPRESSION = /\$\{\{.*?\}\}/gu;

const DEPTH_DELTA: ReadonlyMap<string, number> = new Map<string, number>([
  ['(', 1],
  [')', -1],
]);

const nextSplitState = (state: SplitState, char: string): SplitState => {
  if (state.escaped) {
    return { ...state, escaped: false };
  }

  if (char === '\\') {
    return { ...state, escaped: true };
  }

  if (state.inClass) {
    return { ...state, inClass: char !== ']' };
  }

  return {
    ...state,
    inClass: char === '[',
    depth: state.depth + (DEPTH_DELTA.get(char) ?? 0),
  };
};

const compile = (pattern: string): Result<RegExp, unknown> =>
  // eslint-disable-next-line security/detect-non-literal-regexp -- the repository's own configuration
  Result.fromThrowable(() => new RegExp(pattern, 'u'));

/**
 * A pattern's top-level alternatives, each compiled as the whole pattern with
 * every other alternative made to fail (`(?!)`), so that group numbers and
 * backreferences mean what they mean in the whole.
 */
const alternativesOf = (
  source: string,
  regex: RegExp,
): AutoFixPattern['alternatives'] => {
  const parts = splitAlternatives(source);

  if (!Arr.isNonEmpty(parts) || parts.length < 2) {
    return [{ source, regex }];
  }

  return Arr.generate(function* () {
    for (const [i, part] of parts.entries()) {
      const alone = compile(
        parts.map((other, j) => (i === j ? other : `(?!)${other}`)).join('|'),
      );

      // Compiles whenever the whole does, since only `(?!)` was added.
      if (Result.isOk(alone)) {
        yield { source: part, regex: alone.value };
      }
    }
  });
};

const patternOf = (
  where: string,
  kind: AutoFixPattern['kind'],
  source: string,
  regex: RegExp,
): AutoFixPattern =>
  ({
    where,
    kind,
    source,
    regex,
    alternatives: alternativesOf(source, regex),
  }) as const;

const withEntries = (
  job: WorkflowJob,
  key: string,
  entries: MatrixEntries,
  contextOf: (value: string) => string,
): Result<readonly string[], string> => {
  if (entries.hasExclude) {
    return Result.err(
      `job \`${job.name}\`'s matrix has \`exclude:\`, which this guard does not apply.`,
    );
  }

  return Arr.isNonEmpty(entries.values)
    ? Result.ok(entries.values.map(contextOf))
    : Result.err(
        `job \`${job.name}\` is named by \`matrix.${key}\`, but no entry of it could be read from its matrix.`,
      );
};

/**
 * What {@link withEntries} needs of a job's matrix, by the shared reader. Whether
 * it has other properties is read off the matrix as written, since the reader
 * keeps an entry's scalars alone, and GitHub names a check by the rest too.
 */
const readMatrixEntries = (
  job: WorkflowJob,
  key: string,
): Result<MatrixEntries, string> => {
  const read = readMatrix(job.matrix);

  if (Result.isErr(read)) {
    return Result.err(`job \`${job.name}\`'s matrix has ${read.value}.`);
  }

  const written = isRecord(job.matrix) ? job.matrix : ({} as const);

  const include = written['include'];

  return Result.ok({
    values: matrixValues(read.value, key),
    hasOtherProperties:
      Object.keys(read.value.lists).some((name) => name !== key) ||
      (Arr.isArray(include) &&
        include.some(
          (entry: unknown) =>
            isRecord(entry) && Object.keys(entry).some((name) => name !== key),
        )),
    hasExclude: written['exclude'] !== undefined,
  });
};

/** The one failed context, as `unblock-prs` reads a check rollup. */
const failing = (context: string): ReadonlyMap<string, 'failed'> =>
  new Map<string, 'failed'>([[context, 'failed']]);

const quoteList = (items: readonly string[]): string =>
  items.map((item) => `\`${item}\``).join(', ');

const collectJobContexts = (
  job: WorkflowJob,
): Result<readonly string[], string> => {
  const runKeys = Arr.uniq(
    job.steps.flatMap(({ run }) =>
      Array.from(
        (run ?? '')
          .split('\n')
          .filter((line) => !line.trimStart().startsWith('#'))
          .join('\n')
          .matchAll(MATRIX_COMMAND),
      ).flatMap((matched) => matched.groups?.['key'] ?? []),
    ),
  );

  if (!Arr.isNonEmpty(runKeys)) {
    return job.matrix === undefined
      ? Result.ok([])
      : Result.err(
          `job \`${job.name}\` has a matrix but runs none of its properties as \`pnpm run \${{ matrix.<key> }}\` or \`--command \${{ matrix.<key> }}\`.`,
        );
  }

  const name = job.displayName;

  const expressions =
    name === undefined
      ? ([] as const)
      : Arr.uniq(Array.from(name.matchAll(EXPRESSION), ([matched]) => matched));

  if (name === undefined || !Arr.isNonEmpty(expressions)) {
    // GitHub appends every value of the entry to a name that reads none.
    const base = name ?? job.name;

    const [runKey] = runKeys;

    const runKeyEntries = readMatrixEntries(job, runKey);

    if (Result.isErr(runKeyEntries)) {
      return runKeyEntries;
    }

    if (runKeys.length > 1 || runKeyEntries.value.hasOtherProperties) {
      return Result.err(
        `job \`${job.name}\` has no matrix property in its name and its matrix has properties beside \`${runKey}\`, so GitHub names its checks by all of them, in an order this guard does not reproduce; a job a fixer names needs a \`name:\` that reads the property of the command (it runs ${quoteList(runKeys.map((property) => `matrix.${property}`))}) and keeps its checks' names apart.`,
      );
    }

    return withEntries(
      job,
      runKey,
      runKeyEntries.value,
      (value) => `${base} (${value})`,
    );
  }

  const expression = Arr.isFixedLengthArray(1, expressions)
    ? expressions[0]
    : undefined;

  const key =
    expression === undefined
      ? undefined
      : MATRIX_PROPERTY.exec(expression)?.groups?.['key'];

  if (expression === undefined || key === undefined) {
    return Result.err(
      `job \`${job.name}\`'s name reads ${quoteList(expressions)}, which this guard cannot put in; name it by the matrix property of the command alone (it runs ${quoteList(runKeys.map((property) => `matrix.${property}`))}).`,
    );
  }

  const entries = readMatrixEntries(job, key);

  return Result.isErr(entries)
    ? entries
    : withEntries(job, key, entries.value, (value) =>
        name.replaceAll(expression, () => value),
      );
};

const readCheckContexts = async (): Promise<Result<MatrixContexts, string>> => {
  const paths = await listWorkflowFiles();

  if (Result.isErr(paths)) {
    return paths;
  }

  const results = await Promise.all(
    paths.value.map(async (workflowPath) => {
      const relativePath = path.relative(projectRootPath, workflowPath);

      const contents = await readRepositoryFile(relativePath);

      if (Result.isErr(contents)) {
        return contents;
      }

      if (
        !parseWorkflowTriggers(contents.value).triggerEvents.includes(
          PULL_REQUEST_EVENT,
        )
      ) {
        return Result.ok({ contexts: [], unreadable: [] });
      }

      const { contexts, unreadable } = collectMatrixContexts(contents.value);

      return Result.ok({
        contexts,
        unreadable: unreadable.map((reason) => `${relativePath}: ${reason}`),
      });
    }),
  );

  const failed = results.find(Result.isErr);

  if (failed !== undefined) {
    return Result.err(failed.value);
  }

  const read = Arr.generate(function* () {
    for (const result of results) {
      if (Result.isOk(result)) {
        yield result.value;
      }
    }
  });

  return Result.ok({
    contexts: read.flatMap(({ contexts }) => contexts),
    unreadable: read.flatMap(({ unreadable }) => unreadable),
  });
};

const formatViolations = (
  violations: readonly string[],
  unreadable: readonly string[],
): string =>
  [
    `❌ ${CONFIG_PATH} names checks the workflows do not produce:`,
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'unblock-prs sets aside a failure no fixer takes instead of fixing it, and',
    'nothing else turns red. If a matrix entry was renamed or bundled, change',
    'the pattern to the new check name (the job `name:` with the entry put in,',
    'or `<job> (<entry>)`); if the pattern is no longer needed, remove it; if it',
    'is kept for an entry to come, list it in KEPT_IDLE in',
    'tools/scripts/cmd/check-auto-fix-contexts/main.mts with the reason.',
    ...(Arr.isNonEmpty(unreadable)
      ? [
          '',
          'The checks of these jobs were not read, so no pattern can take them:',
          '',
          ...unreadable.map((reason) => `  ${reason}`),
        ]
      : []),
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkAutoFixContexts().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    [
      `Every auto-fix context pattern takes a check (${result.value.patterns}`,
      `patterns over ${result.value.contexts} check names).`,
    ].join(' '),
  );
}
