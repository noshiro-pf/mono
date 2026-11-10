import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { listTrackedFiles, readRepositoryFile } from '../lib/repo-files.mjs';

/**
 * Fails when a script or config restates the list of TypeScript expression
 * wrappers instead of calling `skipExpressionWrappers` / `isExpressionWrapper`
 * from {@link HELPER_MODULE}, or an ESLint package's `src/` does instead of
 * calling `skipTsTypeWrappers` / `isTsTypeWrapper` from eslint-rule-forge
 * ({@link PUBLISHED_HELPER_MODULE}); and when the two helpers' lists part (see
 * {@link wrapperListProblems}).
 *
 * CLAUDE.md ("Lint rules") asks every reader of code to see through
 * parentheses, `as`, `satisfies`, `!`, `<T>` and the like. Each copy of that
 * list has to be found and changed when TypeScript adds a wrapper, and a copy
 * that is missed silently stops matching. A module that tests for
 * {@link THRESHOLD} or more of the kinds the tools helper tests for is read as
 * such a copy, in a package's `src/` too.
 *
 * What it reads are the modules that can import `tools/` (those under it and a
 * package's `scripts/`) and the `src/` of the published ESLint packages
 * (`libs/eslint-*`), which depend on eslint-rule-forge or are it. Another
 * published package's `src/` has neither helper to call without taking on
 * ESLint peers.
 */
export const checkTsExpressionWrappers = async (): Promise<
  Result<number, string>
> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const helperText = await readRepositoryFile(HELPER_MODULE);

  if (Result.isErr(helperText)) {
    return Result.err(`❌ ${helperText.value}`);
  }

  const publishedHelperText = await readRepositoryFile(PUBLISHED_HELPER_MODULE);

  if (Result.isErr(publishedHelperText)) {
    return Result.err(`❌ ${publishedHelperText.value}`);
  }

  const predicates = predicatesCalledIn(helperText.value);

  const listProblems = wrapperListProblems(
    predicates,
    predicatesCalledIn(publishedHelperText.value),
  );

  const files = tracked.value.filter(isCheckedModule);

  const mut_offenders: string[] = [];

  for (const file of files) {
    const text = await readRepositoryFile(file);

    if (Result.isErr(text)) {
      return Result.err(`❌ ${text.value}`);
    }

    const kinds = copiedWrapperKinds(text.value, predicates);

    if (Arr.isNonEmpty(kinds)) {
      mut_offenders.push(`  ${file}: ${kinds.join(', ')}`);
    }
  }

  const mut_problems: string[] = [];

  if (Arr.isNonEmpty(listProblems)) {
    mut_problems.push(
      [
        '❌ The wrapper lists disagree:',
        '',
        ...listProblems.map((problem) => `  ${problem}`),
      ].join('\n'),
    );
  }

  if (Arr.isNonEmpty(mut_offenders)) {
    mut_problems.push(
      [
        `❌ ${mut_offenders.length} module(s) test for the TypeScript expression wrappers themselves:`,
        '',
        ...mut_offenders,
        '',
        `Call \`skipExpressionWrappers\` or \`isExpressionWrapper\` from ${HELPER_MODULE},`,
        'or, in libs/eslint-*/src/, `skipTsTypeWrappers` or `isTsTypeWrapper` from',
        `eslint-rule-forge (${PUBLISHED_HELPER_MODULE}), so that a wrapper`,
        'TypeScript adds is added to those lists alone.',
      ].join('\n'),
    );
  }

  return Arr.isNonEmpty(mut_problems)
    ? Result.err(mut_problems.join('\n\n'))
    : Result.ok(files.length);
};

/**
 * The wrapper kinds of `predicates` (those the tools helper calls) a module's
 * text tests for itself, when they are {@link THRESHOLD} or more; empty
 * otherwise.
 */
export const copiedWrapperKinds = (
  sourceText: string,
  predicates: readonly string[],
): readonly string[] => {
  const kinds = wrapperKindsTestedIn(sourceText, predicates);

  return Arr.isMinLengthArray(THRESHOLD, kinds) ? kinds : [];
};

/** The wrapper kinds of `predicates` a module's text tests for, as `ts.is…(` calls. */
export const wrapperKindsTestedIn = (
  sourceText: string,
  predicates: readonly string[],
): readonly string[] => {
  const called = predicatesCalledIn(sourceText);

  return predicates.filter((predicate) => called.includes(predicate));
};

/**
 * How the two lists part, given as the `ts.is…(` predicates each helper module
 * calls ({@link predicatesCalledIn}; they hold the list and nothing else). The
 * tools helper must call {@link REQUIRED_PREDICATES} and
 * {@link TOOLS_ONLY_PREDICATES}, and eslint-rule-forge's must be the tools
 * helper's less the latter. Empty when they agree, so that a wrapper cannot
 * reach or leave one list alone by mistake.
 */
export const wrapperListProblems = (
  tools: readonly string[],
  publishedCalled: readonly string[],
): readonly string[] => {
  const requiredMissing = REQUIRED_PREDICATES.filter(
    (predicate) => !tools.includes(predicate),
  );

  const toolsOnlyMissing = TOOLS_ONLY_PREDICATES.filter(
    (predicate) => !tools.includes(predicate),
  );

  if (Arr.isNonEmpty(requiredMissing) || Arr.isNonEmpty(toolsOnlyMissing)) {
    return [
      ...requiredMissing.map(
        (predicate) =>
          `${HELPER_MODULE} does not call ts.${predicate}, a wrapper CLAUDE.md ("Lint rules") asks every reader to see through: put it back, written as a \`ts.is…(\` call, which is how the guard reads the list.`,
      ),
      ...toolsOnlyMissing.map(
        (predicate) =>
          `${HELPER_MODULE} does not call ts.${predicate}, which TOOLS_ONLY_PREDICATES in this guard names: take it out there.`,
      ),
    ];
  }

  const published = tools.filter(
    (predicate) => !TOOLS_ONLY_PREDICATES.includes(predicate),
  );

  return [
    ...published
      .filter((predicate) => !publishedCalled.includes(predicate))
      .map(
        (predicate) =>
          `${PUBLISHED_HELPER_MODULE} does not call ts.${predicate}, which ${HELPER_MODULE} does: add it, or, when ESTree's \`TypeWrapper\` has no counterpart, add it to TOOLS_ONLY_PREDICATES in this guard.`,
      ),
    ...publishedCalled
      .filter((predicate) => !published.includes(predicate))
      .map((predicate) =>
        TOOLS_ONLY_PREDICATES.includes(predicate)
          ? `${PUBLISHED_HELPER_MODULE} calls ts.${predicate}, which TOOLS_ONLY_PREDICATES in this guard keeps out of it: take it out of one of the two.`
          : `${PUBLISHED_HELPER_MODULE} calls ts.${predicate}, which ${HELPER_MODULE} does not: add it there when it is a wrapper, or keep it out of the module, which holds the list alone.`,
      ),
  ];
};

/** Whether the guard reads `file`. */
export const isCheckedModule = (file: string): boolean =>
  file !== HELPER_MODULE &&
  file !== PUBLISHED_HELPER_MODULE &&
  /\.[cm]?ts$/u.test(file) &&
  !/\.test\.[cm]?ts$/u.test(file) &&
  (file.startsWith('tools/') ||
    /^(?:apps|libs)\/[^/]+\/scripts\//u.test(file) ||
    (/^libs\/eslint-[^/]+\/src\//u.test(file) &&
      // A private rebuild (`-next`, `-v2`) is never sent a fix ported from
      // elsewhere (CLAUDE.md, "Repository layout"), this one included.
      !/^libs\/[^/]+-(?:next|v\d+)\//u.test(file)));

/** The `ts.is…(` predicates `sourceText` calls, each once. */
export const predicatesCalledIn = (sourceText: string): readonly string[] =>
  Array.from(
    new Set<string>(
      Array.from(
        sourceText.matchAll(/\bts\.(is\w+)\(/gu),
        ([, name]) => name,
      ).filter((name) => name !== undefined),
    ),
  );

/** The module whose list the scripts and configs call. */
export const HELPER_MODULE = 'tools/scripts/lib/ts-expression-wrappers.mts';

/** The module whose list the ESLint packages' `src/` call. */
export const PUBLISHED_HELPER_MODULE =
  'libs/eslint-rule-forge/src/ts-type-wrappers.mts';

/**
 * How many wrapper kinds a module tests for before it reads as a copy of the
 * list: one or two are a reader that cares about that wrapper alone.
 */
const THRESHOLD = 3;

/**
 * The wrappers CLAUDE.md ("Lint rules") names, which both lists must keep:
 * parentheses, `as`, `satisfies`, `!` and `<T>`.
 */
const REQUIRED_PREDICATES: readonly string[] = [
  'isParenthesizedExpression',
  'isAsExpression',
  'isSatisfiesExpression',
  'isNonNullExpression',
  'isTypeAssertionExpression',
] as const;

/**
 * What the tools list has and eslint-rule-forge's leaves out: an instantiation
 * expression, which its ESTree `TypeWrapper` leaves out too.
 */
const TOOLS_ONLY_PREDICATES: readonly string[] = [
  'isExpressionWithTypeArguments',
] as const;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkTsExpressionWrappers().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} module(s) read; none restates the TypeScript expression wrappers, and the lists in ${HELPER_MODULE} and ${PUBLISHED_HELPER_MODULE} agree.`,
  );
}
