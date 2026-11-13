import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, hasKey, isRecord, Result, unknownToString } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import { projectRootPath, toPosixPath } from '../project-root-path.mjs';

/**
 * Fails when a workspace member's `tsconfig.json`, or the root one, does not
 * say whether it is type-checked against the strict standard library.
 *
 * `libReplacement` defaults to `false` in TypeScript 6 and 7, and a package
 * that leaves it out is silently checked against the stock library — nothing
 * fails. That is how thirty packages added after the migration (#1737) went
 * unchecked until #2484. So the value is stated in every `tsconfig.json`, in
 * the file itself rather than inherited, and a `false` carries the reason on
 * the line above it or after it, as `libs/ts-type-forge/tsconfig.json` does.
 * See docs/strict-typescript-lib-integration.md.
 *
 * A file stating `true` also has a probe, a copy of {@link PROBE_TEMPLATE} that
 * stops compiling when the replacement stops happening, at the path
 * {@link probePathOf} names and among the files its program reads: a
 * replacement that stops happening fails nothing on its own, the package just
 * goes on passing `check:types` against the stock library.
 *
 * A member with no `tsconfig.json` (the strict library's own bundles and
 * harnesses) has nothing to declare.
 */
export const checkTsconfigLibReplacement = async (): Promise<
  Result<number, string>
> => {
  const packages = await getWorkspacePackages(projectRootPath);

  const candidates = Arr.toUnshifted(projectRootPath)(
    packages.map((pkg) => pkg.path),
  ).map((dir) => path.join(dir, 'tsconfig.json'));

  const files = await Promise.all(
    candidates.map(async (file) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await Result.fromPromise(fs.readFile(file, 'utf8'));

      if (Result.isErr(content)) {
        return undefined;
      }

      const relativePath = path.relative(projectRootPath, file);

      const probePath = path.join(projectRootPath, probePathOf(relativePath));

      const probe = await Result.fromPromise(
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a member's probe, under the repository
        fs.readFile(probePath, 'utf8'),
      );

      return {
        relativePath,
        content: content.value,
        probe: Result.isOk(probe) ? probe.value : undefined,
        // Asked only of a file stating `true`: tsc globs the whole program's
        // `include` to answer.
        probeRead: () => programReads(file, content.value, probePath),
      } as const;
    }),
  );

  const present = files.filter((file) => file !== undefined);

  const template = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed file under the repository
    fs.readFile(path.join(projectRootPath, PROBE_TEMPLATE), 'utf8'),
  );

  if (Result.isErr(template)) {
    return Result.err(
      `❌ cannot read the probe every package copies, ${PROBE_TEMPLATE}: ${unknownToString(template.value)}`,
    );
  }

  const unfit = templateProblem(template.value);

  if (unfit !== undefined) {
    return Result.err(`❌ ${unfit}`);
  }

  const violations = findLibReplacementViolations(template.value, present);

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} tsconfig.json file(s) leave the strict standard library to chance:`,
        '',
        ...violations.map(
          ({ relativePath, problem, detail }) =>
            `  ${relativePath}: ${problemText(problem, probePathOf(relativePath), detail)}`,
        ),
        '',
        'State `"libReplacement": true` in `compilerOptions` with a copy of',
        `\`${PROBE_TEMPLATE}\` where the message says, among what the program`,
        'reads, or state',
        '`"libReplacement": false` with a comment saying why. See',
        'docs/strict-typescript-lib-integration.md.',
      ].join('\n'),
    );
  }

  return Result.ok(present.length);
};

/**
 * The files among `files` that do not state `libReplacement` as a boolean,
 * state `false` without a comment on its line or the line above, or state
 * `true` with no probe the program reads, a copy of `template`. `probe` is the
 * text of the file {@link probePathOf} names, if it is there, and `probeRead`
 * asks whether the program names it ({@link programReads}).
 */
export const findLibReplacementViolations = (
  template: string,
  files: readonly TsconfigFile[],
): readonly Violation[] =>
  Arr.generate(function* () {
    for (const { relativePath, content, probe, probeRead } of files) {
      const found = problemOf(
        relativePath,
        content,
        probe,
        probeRead,
        template,
      );

      if (found !== undefined) {
        yield { relativePath, ...found };
      }
    }
  });

/**
 * Where the probe of a `tsconfig.json` is: `test/strict-lib-active.mts` beside
 * it, except the root's, whose program reads `tools/` and has no `test/`.
 */
export const probePathOf = (relativePath: string): string =>
  relativePath === 'tsconfig.json'
    ? 'tools/scripts/strict-lib-active.mts'
    : path.posix.join(path.posix.dirname(toPosixPath(relativePath)), PROBE);

/**
 * Whether `probePath` is among the files the program `tsconfig` describes
 * names, as tsc expands `include`, `files`, `exclude` and `extends`, or why tsc
 * cannot read the program. A probe reached only through an import is not: a
 * probe imports nothing and nothing imports it.
 */
export const programReads = (
  tsconfig: string,
  content: string,
  probePath: string,
): Result<boolean, string> => {
  const read = ts.parseConfigFileTextToJson(tsconfig, content);

  const json: unknown = read.config;

  if (read.error !== undefined || !isRecord(json)) {
    return Result.err(
      read.error === undefined
        ? 'not a JSON object'
        : ts.flattenDiagnosticMessageText(read.error.messageText, '\n'),
    );
  }

  const mistyped = mistypedKeys(json);

  if (Arr.isNonEmpty(mistyped)) {
    return Result.err(
      `${mistyped.map((key) => `\`${key}\``).join(', ')} of the wrong type, which tsc drops`,
    );
  }

  const parsed = ts.parseJsonConfigFileContent(
    json,
    ts.sys,
    path.dirname(tsconfig),
    undefined,
    tsconfig,
  );

  // An `extends` that does not resolve leaves the program without what it
  // inherits, and the probe would read as left out when the config is broken.
  // All but what is about an option, which the native compiler `check:types`
  // runs may take while this one does not, and "no inputs were found".
  const errors = parsed.errors.filter(
    ({ code }) => !NOT_ABOUT_READING.has(code),
  );

  if (Arr.isNonEmpty(errors)) {
    return Result.err(
      errors
        .map(({ messageText }) =>
          ts.flattenDiagnosticMessageText(messageText, '\n'),
        )
        .join('; '),
    );
  }

  return Result.ok(
    parsed.fileNames.some(
      (name) => path.resolve(name) === path.resolve(probePath),
    ),
  );
};

/**
 * Why `template` cannot be the probe every package copies, if it cannot: it has
 * to put a `// @ts-expect-error` on {@link STRICT_ONLY_LINE}, the directive's
 * comment running on over any lines it likes. Its own type check proves the
 * directive is used; this proves what it is used on is the error only the
 * strict library gives, so that copies of it prove something.
 */
export const templateProblem = (template: string): string | undefined => {
  const lines = template.split('\n').map((line) => line.trim());

  const directive = lines.findIndex((line) =>
    /^\/\/\s*@ts-expect-error\b/u.test(line),
  );

  // As tsc reads it: the first line after the directive's that is neither a
  // comment nor blank.
  const covered =
    directive === -1
      ? undefined
      : lines
          .slice(directive + 1)
          .find((line) => line !== '' && !line.startsWith('//'));

  return covered === STRICT_ONLY_LINE
    ? undefined
    : `${PROBE_TEMPLATE} has to put a \`// @ts-expect-error\` on \`${STRICT_ONLY_LINE}\`, whose error only the strict library gives; another line could expect an error every library gives, and every copy would go on compiling after the replacement stopped.`;
};

type Problem =
  | 'false-without-reason'
  | 'no-probe'
  | 'not-boolean'
  | 'probe-not-included'
  | 'program-unreadable'
  | 'undeclared';

/** A problem, and for `program-unreadable` what tsc said. */
type Finding = Readonly<{ problem: Problem; detail?: string }>;

type Violation = Readonly<{ relativePath: string } & Finding>;

export type TsconfigFile = Readonly<{
  relativePath: string;
  content: string;
  probe: string | undefined;
  /** Whether the program compiles the probe ({@link programReads}). */
  probeRead: () => Result<boolean, string>;
}>;

const PROBE = 'test/strict-lib-active.mts';

/**
 * Errors that do not say the program could not be read: TS5023 "Unknown
 * compiler option", TS5024 "requires a value of type", TS6046 "Argument for
 * option must be" and TS18003 "No inputs were found". A compiler option the
 * native compiler takes and this one does not is one of the first three; a
 * `files`, `include`, `exclude` or `extends` of the wrong type, which tsc also
 * answers with TS5024 and drops, is asked about by itself ({@link
 * mistypedKeys}).
 */
const NOT_ABOUT_READING: ReadonlySet<number> = new Set<number>([
  5023, 5024, 6046, 18_003,
]);

/** Whether `value` is what `files`, `include` and `exclude` take: a list of paths. */
const isFileList = (value: unknown): boolean =>
  Arr.isArray(value) &&
  value.every((entry: unknown) => typeof entry === 'string');

/** The keys of `json` that say which files the program has, of the wrong type. */
const mistypedKeys = (
  json: ReadonlyRecord<string, unknown>,
): readonly string[] =>
  [
    ...(['files', 'include', 'exclude'] as const).filter(
      (key) => json[key] !== undefined && !isFileList(json[key]),
    ),
    ...(json['extends'] === undefined ||
    typeof json['extends'] === 'string' ||
    isFileList(json['extends'])
      ? ([] as const)
      : (['extends'] as const)),
  ] as const;

/**
 * What the probe expects the error of: `Number.isFinite` takes a `number` in the
 * strict library and `unknown` in the stock one, so this errs only under the
 * strict library. An expected error any library gives would keep the probe
 * compiling after the replacement stopped.
 */
const STRICT_ONLY_ERROR = "Number.isFinite('1')";

/**
 * The line the template's directive is on, exactly: an edit to it, even one
 * that keeps {@link STRICT_ONLY_ERROR}, such as another type annotation, is one
 * this guard has to be changed for.
 */
const STRICT_ONLY_LINE =
  `export const probeIsFinite: boolean = ${STRICT_ONLY_ERROR};` as const;

/**
 * The probe every package copies, whose own type check proves it: a
 * `@ts-expect-error` on {@link STRICT_ONLY_ERROR}. A copy is what is asked
 * rather than something like it, so that whether a directive applies, and to
 * what, is tsc's question alone.
 */
export const PROBE_TEMPLATE =
  'libs/octokit-safe-types/test/strict-lib-active.mts';

const probeProblem = (
  probe: string | undefined,
  template: string,
  probeRead: () => Result<boolean, string>,
): Finding | undefined => {
  if (probe !== template) {
    return { problem: 'no-probe' };
  }

  const read = probeRead();

  return Result.isErr(read)
    ? { problem: 'program-unreadable', detail: read.value }
    : read.value
      ? undefined
      : { problem: 'probe-not-included' };
};

const problemText = (
  problem: Problem,
  probePath: string,
  detail: string | undefined,
): string => {
  switch (problem) {
    case 'undeclared':
      return '`compilerOptions.libReplacement` is not set, so it is `false` by default.';

    case 'not-boolean':
      return '`compilerOptions.libReplacement` is not `true` or `false`.';

    case 'false-without-reason':
      return '`"libReplacement": false` has no comment saying why.';

    case 'no-probe':
      return `\`"libReplacement": true\` has no \`${probePath}\` that is a copy of \`${PROBE_TEMPLATE}\`, which expects the error of \`${STRICT_ONLY_ERROR}\` only the strict library gives, so nothing fails if the replacement stops happening.`;

    case 'program-unreadable':
      return `tsc cannot read the program, so whether it reads the probe \`${probePath}\` is not known: ${detail ?? ''}`;

    case 'probe-not-included':
      return `\`"libReplacement": true\` and its probe \`${probePath}\` is not among the files the program reads, so the type check never reads it.`;
  }
};

/**
 * Whether the `"libReplacement": false` line has a comment after the value or
 * directly above it.
 */
const hasReason = (content: string): boolean => {
  const lines = content.split('\n');

  const index = lines.findIndex(
    (text) =>
      !text.trimStart().startsWith('//') &&
      /"libReplacement"\s*:\s*false/u.test(text),
  );

  if (index === -1) {
    return false;
  }

  const line = lines[index] ?? '';

  const above = (lines[index - 1] ?? '').trim();

  return (
    /"libReplacement"\s*:\s*false\s*,?\s*(?:\/\/|\/\*)/u.test(line) ||
    above.startsWith('//') ||
    above.endsWith('*/')
  );
};

const problemOf = (
  relativePath: string,
  content: string,
  probe: string | undefined,
  probeRead: () => Result<boolean, string>,
  template: string,
): Finding | undefined => {
  // These files are JSONC. `parseConfigFileTextToJson` is what tsc itself reads
  // them with, so a commented-out entry is not taken for one.
  const parsed: unknown = ts.parseConfigFileTextToJson(
    relativePath,
    content,
  ).config;

  if (!isRecord(parsed) || !hasKey(parsed, 'compilerOptions')) {
    return { problem: 'undeclared' };
  }

  const compilerOptions: unknown = parsed.compilerOptions;

  if (
    !isRecord(compilerOptions) ||
    !hasKey(compilerOptions, 'libReplacement')
  ) {
    return { problem: 'undeclared' };
  }

  const value: unknown = compilerOptions.libReplacement;

  return value === true
    ? probeProblem(probe, template, probeRead)
    : value !== false
      ? { problem: 'not-boolean' }
      : hasReason(content)
        ? undefined
        : { problem: 'false-without-reason' };
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkTsconfigLibReplacement().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} tsconfig.json file(s) checked; each states \`libReplacement\`, every \`false\` says why, and every \`true\` has a probe.`,
  );
}
