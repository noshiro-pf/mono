import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Json,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { listWorkflowFiles, readRepositoryFile } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import { parseWorkflowTriggers } from './check-workflow-event-name.mjs';

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
 * reruns the command — and a fixer takes a context only when it is the first to
 * match it, as `unblock-prs` reads them. Each top-level alternative of a
 * pattern (`a|b`) is asked on its own, since one that went stale beside a live
 * one is as silent. A pattern idle on purpose is listed in {@link KEPT_IDLE}
 * with its reason.
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
 * Read with a line scanner, as the other workflow guards read them. A job whose
 * checks it cannot name exactly is left out, with why, rather than guessed at:
 * entries that are an expression, a matrix with `exclude:`, a `name:` that
 * reads another property, a job with no matrix expression in its name whose
 * entries carry other properties (GitHub names those by all of them), and a
 * matrix job that runs none of its properties as `pnpm run ${{ matrix.<key> }}`.
 * Leaving a job out can only make a pattern fail, never pass, and the reasons
 * are printed with the failure.
 */
export const collectMatrixContexts = (workflowFile: string): MatrixContexts => {
  const results = splitJobs(workflowFile).map(collectJobContexts);

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
 * `autoFix.ignore`, and every `context` of `autoFix.prepare` and
 * `autoFix.fixers` in order, with where it is in the file, compiled as
 * `unblock-prs` compiles it. A file without `autoFix` fixes nothing and has
 * nothing to ask; a malformed `autoFix` is refused rather than read around.
 */
export const readAutoFixPatterns = (
  file: unknown,
): Result<AutoFixConfig, string> => {
  if (!isRecord(file)) {
    return Result.err('not an object');
  }

  if (!hasKey(file, 'autoFix')) {
    return Result.ok({ ignore: [], patterns: [] });
  }

  const { autoFix } = file;

  if (
    !isRecord(autoFix) ||
    !Arr.isArray(autoFix['ignore']) ||
    !Arr.isArray(autoFix['prepare']) ||
    !Arr.isArray(autoFix['fixers'])
  ) {
    return Result.err(
      '`autoFix` needs the arrays `ignore`, `prepare` and `fixers`.',
    );
  }

  const sources = [
    ...autoFix['ignore'].map(
      (entry: unknown, i) =>
        ({ where: `autoFix.ignore[${i}]`, kind: 'ignore', entry }) as const,
    ),
    ...autoFix['prepare'].map(
      (entry: unknown, i) =>
        ({
          where: `autoFix.prepare[${i}].context`,
          kind: 'prepare',
          entry: isRecord(entry) ? entry['context'] : undefined,
        }) as const,
    ),
    ...autoFix['fixers'].map(
      (entry: unknown, i) =>
        ({
          where: `autoFix.fixers[${i}].context`,
          kind: 'fixer',
          entry: isRecord(entry) ? entry['context'] : undefined,
        }) as const,
    ),
  ] as const;

  const notStrings = sources
    .filter(({ entry }) => !isString(entry))
    .map(({ where }) => where);

  if (Arr.isNonEmpty(notStrings)) {
    return Result.err(`not a string: ${notStrings.join(', ')}`);
  }

  const compiled = Arr.generate(function* () {
    for (const { where, kind, entry } of sources) {
      if (isString(entry)) {
        yield { where, kind, source: entry, regex: compile(entry) };
      }
    }
  });

  const invalid = compiled
    .filter(({ regex }) => Result.isErr(regex))
    .map(({ where }) => where);

  if (Arr.isNonEmpty(invalid)) {
    return Result.err(`not a regular expression: ${invalid.join(', ')}`);
  }

  const read = Arr.generate(function* () {
    for (const { where, kind, source, regex } of compiled) {
      if (Result.isOk(regex)) {
        yield { where, kind, source, regex: regex.value };
      }
    }
  });

  return Result.ok({
    ignore: read
      .filter(({ kind }) => kind === 'ignore')
      .map(({ regex }) => regex),
    patterns: Arr.generate(function* () {
      for (const { where, kind, source, regex } of read) {
        if (kind !== 'ignore') {
          yield {
            where,
            kind,
            source,
            regex,
            alternatives: alternativesOf(source, regex),
          };
        }
      }
    }),
  });
};

/**
 * One message per pattern, or top-level alternative of one, that takes no
 * context and is not kept idle, and per {@link KEPT_IDLE} entry that is stale.
 *
 * A context `autoFix.ignore` matches is never read, so nothing takes it. A
 * fixer takes the contexts it is the first fixer to match, since the first
 * decides. A prepare entry takes the contexts it matches that some fixer takes,
 * since a failure no fixer takes declines the whole fix before any prepare
 * runs.
 */
export const findIdlePatterns = (
  config: AutoFixConfig,
  contexts: readonly string[],
  keptIdle: readonly KeptIdle[],
): readonly string[] => {
  const { ignore, patterns } = config;

  const read = contexts.filter((context) =>
    ignore.every((regex) => !regex.test(context)),
  );

  const fixers = patterns.filter(({ kind }) => kind === 'fixer');

  const firstFixerOf = new Map(
    read.map(
      (context) =>
        [context, fixers.find(({ regex }) => regex.test(context))] as const,
    ),
  );

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
        ? firstFixerOf.get(context) !== undefined
        : firstFixerOf.get(context) === pattern,
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
        matched
          .map((context) => firstFixerOf.get(context)?.where)
          .filter(isString),
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
  ignore: readonly RegExp[];
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

type Job = Readonly<{
  id: string;
  lines: readonly string[];
}>;

type MatrixEntries = Readonly<{
  values: readonly string[];
  /** Whether the matrix has properties other than the command's key. */
  hasOtherProperties: boolean;
  hasExclude: boolean;
}>;

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

/** A job's key, once a trailing comment is dropped. */
const JOB_HEADER = /^ {2}(?<id>[\w-]+):$/u;

const JOB_NAME = /^ {4}name:\s*(?<name>.+)$/u;

const EXPRESSION = /\$\{\{.*?\}\}/gu;

const LIST_ITEM = '- ';

const MATRIX_SETS: ReadonlySet<string> = new Set<string>([
  'include',
  'exclude',
]);

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

const indentOf = (line: string): number =>
  line.length - line.trimStart().length;

const isBlankOrComment = (line: string): boolean => {
  const trimmed = line.trim();

  return trimmed === '' || trimmed.startsWith('#');
};

/**
 * The inside of a quoted scalar, its opening quote already read: `''` is a
 * quote inside single quotes, and a backslash takes the next character inside
 * double quotes (`\n` and the other named escapes are not decoded).
 */
const readQuoted = (chars: readonly string[], quote: string): string => {
  const out = Arr.generate(function* () {
    let mut_index = 0;

    while (mut_index < chars.length) {
      const char = chars[mut_index];

      const next = chars[mut_index + 1];

      if (quote === '"' && char === '\\') {
        yield next ?? '';

        mut_index += 2;
      } else if (char === quote && quote === "'" && next === "'") {
        yield "'";

        mut_index += 2;
      } else if (char === quote) {
        return;
      } else {
        yield char ?? '';

        mut_index += 1;
      }
    }
  });

  return out.join('');
};

/**
 * A scalar as written: the inside of its quotes when it is quoted, else the
 * text before a trailing comment.
 */
const scalarOf = (text: string): string => {
  const trimmed = text.trim();

  const [quote] = trimmed;

  return quote !== '"' && quote !== "'"
    ? trimmed.replace(/\s+#.*$/u, '')
    : readQuoted(Array.from(trimmed.slice(1)), quote);
};

/** The lines under `key:` that are indented deeper than it, comments kept. */
const blockAfter = (
  lines: readonly string[],
  startIndex: number,
): readonly string[] => {
  const indent = indentOf(lines[startIndex] ?? '');

  const rest = lines.slice(startIndex + 1);

  const endIndex = rest.findIndex(
    (line) => !isBlankOrComment(line) && indentOf(line) <= indent,
  );

  return endIndex === -1 ? rest : rest.slice(0, endIndex);
};

const splitJobs = (workflowFile: string): readonly Job[] => {
  const lines = workflowFile.split('\n');

  const jobsIndex = lines.findIndex((line) => line.trimEnd() === 'jobs:');

  if (jobsIndex === -1) {
    return [];
  }

  const block = blockAfter(lines, jobsIndex);

  const headers = Arr.generate(function* () {
    for (const [index, line] of block.entries()) {
      const id = JOB_HEADER.exec(line.replace(/\s+#.*$/u, '').trimEnd())
        ?.groups?.['id'];

      if (id !== undefined) {
        yield { id, index };
      }
    }
  });

  return headers.map(({ id, index }, i) => ({
    id,
    lines: block.slice(index + 1, headers[i + 1]?.index ?? block.length),
  }));
};

const withEntries = (
  job: Job,
  key: string,
  entries: MatrixEntries,
  contextOf: (value: string) => string,
): Result<readonly string[], string> => {
  if (entries.hasExclude) {
    return Result.err(
      `job \`${job.id}\`'s matrix has \`exclude:\`, which this guard does not apply.`,
    );
  }

  return Arr.isNonEmpty(entries.values)
    ? Result.ok(entries.values.map(contextOf))
    : Result.err(
        `job \`${job.id}\` is named by \`matrix.${key}\`, but no entry of it could be read from its matrix.`,
      );
};

/**
 * The items of a YAML list, each as the text after `- ` and the lines that
 * continue it.
 */
const listItemsOf = (
  block: readonly string[],
): readonly Readonly<{ head: string; rest: readonly string[] }>[] => {
  // The list's own items only, not those of a list nested in one of them.
  const itemIndent = Math.min(
    ...block.filter((line) => !isBlankOrComment(line)).map(indentOf),
  );

  return Arr.generate(function* () {
    for (const [index, line] of block.entries()) {
      const trimmed = line.trim();

      if (indentOf(line) === itemIndent && trimmed.startsWith(LIST_ITEM)) {
        yield {
          head: trimmed.slice(LIST_ITEM.length),
          rest: blockAfter(block, index),
        };
      }
    }
  });
};

const readIncludeEntry = ({
  head,
  rest,
}: Readonly<{
  head: string;
  rest: readonly string[];
}>): ReadonlyMap<string, string> =>
  new Map(
    Arr.generate(function* () {
      for (const line of Arr.toUnshifted(head)(
        rest.filter((restLine) => !isBlankOrComment(restLine)),
      )) {
        const matched = /^(?<name>[\w-]+):\s*(?<value>.*)$/u.exec(line.trim());

        const name = matched?.groups?.['name'];

        if (name !== undefined) {
          yield [name, scalarOf(matched?.groups?.['value'] ?? '')] as const;
        }
      }
    }),
  );

/**
 * The values of `key` in a job's `matrix:`, whether listed under `key:` or as
 * the `key:` property of each `include:` entry.
 */
const readMatrixEntries = (
  jobLines: readonly string[],
  key: string,
): MatrixEntries => {
  const matrixIndex = jobLines.findIndex((line) => line.trim() === 'matrix:');

  if (matrixIndex === -1) {
    return { values: [], hasOtherProperties: false, hasExclude: false };
  }

  const matrix = blockAfter(jobLines, matrixIndex);

  const propertyIndent = Math.min(
    ...matrix.filter((line) => !isBlankOrComment(line)).map(indentOf),
  );

  const properties = Arr.generate(function* () {
    for (const [index, line] of matrix.entries()) {
      if (isBlankOrComment(line) || indentOf(line) !== propertyIndent) {
        continue;
      }

      const name = /^(?<name>[\w-]+):/u.exec(line.trim())?.groups?.['name'];

      if (name !== undefined) {
        yield { name, block: blockAfter(matrix, index) };
      }
    }
  });

  const listed = properties
    .filter(({ name }) => name === key)
    .flatMap(({ block }) =>
      listItemsOf(block).map(({ head }) => scalarOf(head)),
    );

  const included = properties
    .filter(({ name }) => name === 'include')
    .flatMap(({ block }) => listItemsOf(block).map(readIncludeEntry));

  return {
    values: [
      ...listed,
      ...Arr.generate(function* () {
        for (const entry of included) {
          const value = entry.get(key);

          if (value !== undefined) {
            yield value;
          }
        }
      }),
    ],
    hasOtherProperties:
      properties.some(({ name }) => name !== key && !MATRIX_SETS.has(name)) ||
      included.some((entry) => entry.keys().some((k) => k !== key)),
    hasExclude: properties.some(({ name }) => name === 'exclude'),
  };
};

const quoteList = (items: readonly string[]): string =>
  items.map((item) => `\`${item}\``).join(', ');

const collectJobContexts = (job: Job): Result<readonly string[], string> => {
  const code = job.lines.filter((line) => !isBlankOrComment(line));

  const runKeys = Arr.uniq(
    Array.from(code.join('\n').matchAll(MATRIX_COMMAND)).flatMap(
      (matched) => matched.groups?.['key'] ?? [],
    ),
  );

  if (!Arr.isNonEmpty(runKeys)) {
    return code.some((line) => line.trim() === 'matrix:')
      ? Result.err(
          `job \`${job.id}\` has a matrix but runs none of its properties as \`pnpm run \${{ matrix.<key> }}\` or \`--command \${{ matrix.<key> }}\`.`,
        )
      : Result.ok([]);
  }

  const nameLine = code
    .map((line) => JOB_NAME.exec(line)?.groups?.['name'])
    .find(isString);

  const name = nameLine === undefined ? undefined : scalarOf(nameLine);

  const expressions =
    name === undefined
      ? ([] as const)
      : Arr.uniq(Array.from(name.matchAll(EXPRESSION), ([matched]) => matched));

  if (name === undefined || !Arr.isNonEmpty(expressions)) {
    // GitHub appends every value of the entry to a name that reads none.
    const base = name ?? job.id;

    const [runKey] = runKeys;

    const entries = readMatrixEntries(code, runKey);

    if (runKeys.length > 1 || entries.hasOtherProperties) {
      return Result.err(
        `job \`${job.id}\` has no matrix property in its name and its matrix has properties beside \`${runKey}\`, so GitHub names its checks by all of them, in an order this guard does not reproduce; a job a fixer names needs a \`name:\` that reads the property of the command (it runs ${quoteList(runKeys.map((property) => `matrix.${property}`))}) and keeps its checks' names apart.`,
      );
    }

    return withEntries(job, runKey, entries, (value) => `${base} (${value})`);
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
      `job \`${job.id}\`'s name reads ${quoteList(expressions)}, which this guard cannot put in; name it by the matrix property of the command alone (it runs ${quoteList(runKeys.map((property) => `matrix.${property}`))}).`,
    );
  }

  return withEntries(job, key, readMatrixEntries(code, key), (value) =>
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
    'tools/scripts/cmd/check-auto-fix-contexts.mts with the reason.',
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
