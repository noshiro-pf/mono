import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Obj,
  Optional,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { type ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a published package carries a JSDoc `@example` and nothing checks
 * that a sample file backs it.
 *
 * `assertAllExamplesAreMapped` in `tools/configs/embed-examples-in-jsdoc.mts`
 * is what answers "is this `@example` backed by a type-checked sample" — but it
 * only ever runs for a package that opted in, by having a
 * `scripts/cmd/embed-examples-in-jsdoc.mts` and reaching it from `doc`, which
 * is the script `ws:doc` runs and `style-check (ws:doc)` asserts the tree is
 * clean after. A package that never opted in is not a package that passes: it
 * is a package nothing looked at, and there is no failure to notice. That is
 * the one thing the per-package check cannot say about itself, so it is said
 * here, once, for every package at once.
 *
 * The division is deliberate — this asks only whether the check runs, never
 * whether it would pass. Two implementations of "is this `@example` mapped"
 * would be two things to keep in agreement, and the one that silently
 * disagreed would be the one nobody read.
 *
 * Scope is `libs/*` — the published packages, the ones whose JSDoc ships in
 * `.d.mts` and becomes the TypeDoc output, and the ones that have a `samples/`
 * directory to be embedded from. `apps/*` publishes nothing and has no
 * samples, so an `@example` there is a comment in a private program.
 */
export const checkExampleCoverage = async (): Promise<
  Result<Readonly<{ packages: number; withExamples: number }>, string>
> => {
  const packageDirsResult = await collectPackageDirs();

  if (Result.isErr(packageDirsResult)) {
    return Result.err(packageDirsResult.value);
  }

  const packageDirs = packageDirsResult.value;

  const perPackage = await Promise.all(packageDirs.map(checkPackage));

  const firstError = perPackage.find(Result.isErr);

  if (firstError !== undefined) {
    return Result.err(firstError.value);
  }

  const results = perPackage.flatMap((result) =>
    Result.isErr(result) ? [] : [result.value],
  );

  const violations = results.flatMap(({ violation }) =>
    violation === undefined ? [] : [violation],
  );

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} package(s) carry a JSDoc \`@example\` that nothing checks:`,
        '',
        ...violations.flatMap((violation) => [
          `  ${violation.packageName}`,
          `    ${violation.detail}`,
          `    → ${violation.hint}`,
          '',
        ]),
        'Copy the wiring from an existing package: a',
        '`scripts/cmd/embed-examples-in-jsdoc.mts` calling the shared',
        '`embedExamplesInJsDoc`, a `scripts/cmd/embed-examples-in-jsdoc-map.mts`',
        'next to it, and a call from the package `doc` script — which is what',
        '`ws:doc` runs, and `style-check (ws:doc)` checks the tree against.',
      ].join('\n'),
    );
  }

  return Result.ok({
    packages: packageDirs.length,
    withExamples: results.filter(({ hasExamples }) => hasExamples).length,
  });
};

type Violation = Readonly<{
  packageName: string;
  detail: string;
  hint: string;
}>;

/**
 * Files under `src/` that never carry a hand-written `@example`: the barrels
 * `gi` generates, the entry point, the ambient globals, and the tests. Kept in
 * step with `defaultExemptFileNames` in
 * `tools/configs/embed-examples-in-jsdoc.mts`, whose check they are exempt
 * from for the same reason.
 */
const isExempt = (filePath: string): boolean =>
  filePath.endsWith('.test.mts') ||
  ['index.mts', 'global.mts', 'entry-point.mts'].includes(
    path.basename(filePath),
  );

const embedScriptRelativePath = 'scripts/cmd/embed-examples-in-jsdoc.mts';

const mapRelativePath = 'scripts/cmd/embed-examples-in-jsdoc-map.mts';

/**
 * Number of `@example` JSDoc tags in a source file.
 *
 * The pattern is anchored to the ` * ` comment-line prefix rather than matching
 * the bare word, so prose mentioning `@example` — this file's own doc comments,
 * for instance — is not counted as a tag.
 */
const countExampleTags = (content: string): number =>
  Array.from(content.matchAll(/^\s*\*\s*@example\b/gmu)).length;

const collectPackageDirs = async (): Promise<
  Result<readonly string[], string>
> => {
  const result = await glob('libs/*/package.json', {
    cwd: projectRootPath,
    absolute: true,
  });

  if (Result.isErr(result)) {
    return Result.err(
      `❌ Failed to list the packages: ${unknownToString(result.value)}`,
    );
  }

  return Result.ok(result.value.toSorted().map(path.dirname));
};

const checkPackage = async (
  packageDir: string,
): Promise<
  Result<
    Readonly<{ hasExamples: boolean; violation: Violation | undefined }>,
    string
  >
> => {
  const filesResult = await glob('src/**/*.mts', {
    cwd: packageDir,
    absolute: true,
  });

  if (Result.isErr(filesResult)) {
    return Result.err(
      `❌ Failed to list the sources of ${path.basename(packageDir)}: ${unknownToString(filesResult.value)}`,
    );
  }

  const files = filesResult.value.filter((f) => !isExempt(f));

  const perFile = await Promise.all(
    files.map(async (filePath) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await fs.readFile(filePath, 'utf8');

      return countExampleTags(content) > 0;
    }),
  );

  const hasExamples = perFile.includes(true);

  if (!hasExamples) {
    return Result.ok({ hasExamples, violation: undefined });
  }

  const violation = await findWiringViolation(packageDir);

  return Result.ok({ hasExamples, violation });
};

/**
 * What is missing between a package's `@example` blocks and the check that
 * would look at them, or `undefined` when the wiring is whole.
 *
 * "Reaches it from `doc`" is read two ways because the repository writes it two
 * ways: a `doc` script that chains `doc:embed:jsdoc` (the `synstate` family), or
 * a `gen-docs.mts` that imports the embedder and calls it (everywhere else).
 */
const findWiringViolation = async (
  packageDir: string,
): Promise<Violation | undefined> => {
  const packageName = path.basename(packageDir);

  const hasEmbedScript = await fileExists(
    path.resolve(packageDir, embedScriptRelativePath),
  );

  if (!hasEmbedScript) {
    return {
      packageName,
      detail: `has \`@example\` blocks under src/ but no ${embedScriptRelativePath}.`,
      hint: 'Nothing embeds a sample into them, and nothing checks that a sample exists.',
    };
  }

  const hasMap = await fileExists(path.resolve(packageDir, mapRelativePath));

  if (!hasMap) {
    return {
      packageName,
      detail: `has ${embedScriptRelativePath} but no ${mapRelativePath} beside it.`,
      hint: 'The embedder reads its mapping from that file.',
    };
  }

  const scripts = await readScripts(packageDir);

  const docScript = scripts?.['doc'];

  if (docScript === undefined) {
    return {
      packageName,
      detail: 'has an embedder but no `doc` script to run it from.',
      hint: '`ws:doc` runs `doc`, and that is what puts the check in front of CI.',
    };
  }

  if (docScript.includes('doc:embed:jsdoc')) return undefined;

  const genDocs = await readFileOrUndefined(
    path.resolve(packageDir, 'scripts/cmd/gen-docs.mts'),
  );

  if (genDocs?.includes('embed-examples-in-jsdoc.mjs') === true) {
    return undefined;
  }

  return {
    packageName,
    detail: 'has an embedder that the `doc` script never reaches.',
    hint: 'Chain `doc:embed:jsdoc` from `doc`, or call `embedExamplesInJsDoc()` in `scripts/cmd/gen-docs.mts`; otherwise `ws:doc` runs everything but this.',
  };
};

const readScripts = async (
  packageDir: string,
): Promise<ReadonlyRecord<string, string> | undefined> => {
  const text = await readFileOrUndefined(
    path.resolve(packageDir, 'package.json'),
  );

  if (text === undefined) return undefined;

  const parsed: unknown = JSON.parse(text);

  if (!isRecord(parsed) || !hasKey(parsed, 'scripts')) return undefined;

  const scripts: unknown = parsed.scripts;

  if (!isRecord(scripts)) return undefined;

  return Obj.filterMap(scripts, (value) =>
    isString(value) ? Optional.some(value) : Optional.none,
  );
};

const readFileOrUndefined = async (
  filePath: string,
): Promise<string | undefined> => {
  const result = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(filePath, 'utf8'),
  );

  return Result.isErr(result) ? undefined : result.value;
};

const fileExists = async (filePath: string): Promise<boolean> =>
  (await readFileOrUndefined(filePath)) !== undefined;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkExampleCoverage().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value.packages} package(s) checked; the ${result.value.withExamples} carrying a JSDoc \`@example\` all run the sample-coverage check.`,
  );
}
