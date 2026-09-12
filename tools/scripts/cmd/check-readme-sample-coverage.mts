import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { countSampleBackedFences } from '../../configs/embed-examples-in-markdown.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a published package's README carries a JavaScript / TypeScript
 * code fence and nothing embeds a sample into it.
 *
 * `embedExamplesInMarkdown` in `tools/configs/embed-examples-in-markdown.mts`
 * fails when a README has a fence that no sample backs — but only for a
 * package whose `scripts/cmd/embed-examples.mts` names that README and whose
 * `doc` script reaches it, `doc` being what `ws:doc` runs and
 * `style-check (ws:doc)` asserts the tree is clean after. A package that never
 * opted in is not a package that passes: its fences are hand-written, never
 * type-checked, and nothing reports it. That is how `ts-type-forge`'s README
 * came to call functions that do not exist, and how four ESLint plugin READMEs
 * and both `better-*-use-state` READMEs went unchecked altogether.
 *
 * This asks only whether the check runs, never whether it would pass — the
 * same division as `check-example-coverage.mts`, for the same reason.
 */
export const checkReadmeSampleCoverage = async (): Promise<
  Result<Readonly<{ packages: number; withFences: number }>, string>
> => {
  const packageManifestsResult = await glob('libs/*/package.json', {
    cwd: projectRootPath,
    absolute: true,
  });

  if (Result.isErr(packageManifestsResult)) {
    return Result.err(
      `❌ Failed to list the packages: ${unknownToString(packageManifestsResult.value)}`,
    );
  }

  const packageDirs = packageManifestsResult.value.toSorted().map(path.dirname);

  const results = await Promise.all(packageDirs.map(checkPackage));

  const violations = results.flatMap(({ violation }) =>
    violation === undefined ? [] : [violation],
  );

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} package(s) have README code fences that no sample backs:`,
        '',
        ...violations.flatMap((violation) => [
          `  ${violation.packageName}`,
          `    ${violation.detail}`,
          '',
        ]),
        'Copy the wiring from an existing package: a',
        '`scripts/cmd/embed-examples.mts` calling the shared',
        '`embedExamplesInMarkdown` with README.md and its `samples/readme` files,',
        'and a `doc` script that runs it — which is what `ws:doc` runs, and',
        '`style-check (ws:doc)` checks the tree against.',
      ].join('\n'),
    );
  }

  return Result.ok({
    packages: packageDirs.length,
    withFences: results.filter(({ hasFences }) => hasFences).length,
  });
};

type Violation = Readonly<{
  packageName: string;
  detail: string;
}>;

const embedScriptRelativePath = 'scripts/cmd/embed-examples.mts';

const checkPackage = async (
  packageDir: string,
): Promise<
  Readonly<{ hasFences: boolean; violation: Violation | undefined }>
> => {
  const readme = await readFileOrUndefined(
    path.resolve(packageDir, 'README.md'),
  );

  const fenceCount = readme === undefined ? 0 : countSampleBackedFences(readme);

  if (fenceCount === 0) {
    return { hasFences: false, violation: undefined };
  }

  const violation = await findWiringViolation(packageDir, fenceCount);

  return { hasFences: true, violation };
};

/**
 * What is missing between a package's README fences and the embedder that
 * would fill and check them, or `undefined` when the wiring is whole.
 *
 * "Reaches it from `doc`" is read the ways the repository writes it: a `doc`
 * script that chains `doc:embed` (the `synstate` family) or runs the embed
 * script directly, or a `gen-docs.mts` that imports the embedder and calls it
 * (everywhere else).
 */
const findWiringViolation = async (
  packageDir: string,
  fenceCount: number,
): Promise<Violation | undefined> => {
  const packageName = path.basename(packageDir);

  const embedScript = await readFileOrUndefined(
    path.resolve(packageDir, embedScriptRelativePath),
  );

  if (embedScript === undefined) {
    return {
      packageName,
      detail: `README.md has ${fenceCount} JavaScript / TypeScript code fence(s) but there is no ${embedScriptRelativePath}.`,
    };
  }

  if (!embedScript.includes("'README.md'")) {
    return {
      packageName,
      detail: `${embedScriptRelativePath} does not embed into README.md, which has ${fenceCount} JavaScript / TypeScript code fence(s).`,
    };
  }

  const docScript = await readDocScript(packageDir);

  if (docScript === undefined) {
    return {
      packageName,
      detail:
        'has an embedder but no `doc` script to run it from; `ws:doc` runs `doc`.',
    };
  }

  // `doc:embed:jsdoc` contains `doc:embed`, so compare whole words.
  const docWords = new Set(docScript.split(/\s+/u));

  if (
    docWords.has('doc:embed') ||
    docWords.has(`./${embedScriptRelativePath}`)
  ) {
    return undefined;
  }

  const genDocs = await readFileOrUndefined(
    path.resolve(packageDir, 'scripts/cmd/gen-docs.mts'),
  );

  if (
    docScript.includes('gen-docs.mts') &&
    genDocs?.includes("'./embed-examples.mjs'") === true
  ) {
    return undefined;
  }

  return {
    packageName,
    detail:
      'has an embedder that the `doc` script never reaches. Chain `doc:embed` from `doc`, or call `embedExamples()` in `scripts/cmd/gen-docs.mts`.',
  };
};

const readDocScript = async (
  packageDir: string,
): Promise<string | undefined> => {
  const text = await readFileOrUndefined(
    path.resolve(packageDir, 'package.json'),
  );

  if (text === undefined) return undefined;

  const parsed: unknown = JSON.parse(text);

  if (!isRecord(parsed) || !hasKey(parsed, 'scripts')) return undefined;

  const { scripts } = parsed;

  if (!isRecord(scripts) || !hasKey(scripts, 'doc')) return undefined;

  return isString(scripts.doc) ? scripts.doc : undefined;
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

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkReadmeSampleCoverage().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value.packages} package(s) checked; the ${result.value.withFences} with JavaScript / TypeScript fences in README.md all embed them from samples.`,
  );
}
