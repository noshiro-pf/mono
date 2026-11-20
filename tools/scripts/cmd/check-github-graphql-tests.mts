import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import {
  mayWriteGraphql,
  queriesIn,
} from '../../configs/github-graphql-source-queries.mjs';
import {
  isUnderExperimental,
  listTrackedFiles,
  readRepositoryFile,
} from '../lib/repo-files.mjs';

/**
 * Holds every package whose `src/` writes GraphQL to a
 * `src/github-graphql.test.mts` that checks its queries against the schema
 * GitHub publishes (`githubGraphqlErrors`, `tools/configs/github-graphql-schema.mts`)
 * and names a query in its source that none of the checked ones contains
 * (`queriesNotSent`, `tools/configs/github-graphql-source-queries.mts`).
 *
 * GitHub answers a query it cannot read with an error and no data, and to `tsc`
 * and ESLint a query is a string, so a package that starts sending GraphQL
 * without that test is checked by nothing short of GitHub. GraphQL is what
 * `queriesNotSent` counts as a query.
 */
export const checkGithubGraphqlTests = (): Promise<Result<number, string>> =>
  Result.safeTry(async function* () {
    const tracked = yield* Result.safeUnwrap(await listTrackedFiles());

    const candidates = tracked.filter(
      (file) =>
        !isUnderExperimental(file) &&
        (isPackageSource(file) || file.endsWith(`/${TEST_FILE}`)),
    );

    // One file at a time, so that the whole repository is never open at once,
    // and only the files that may write GraphQL are kept for the parser.
    const mut_files: FixedLengthTuple<2, string>[] = [];

    for (const file of candidates) {
      const text = yield* Result.safeUnwrap(await readRepositoryFile(file));

      if (!isPackageSource(file) || mayWriteGraphql(text)) {
        mut_files.push([file, text]);
      }
    }

    const problems = findMissingGraphqlTests(Object.fromEntries(mut_files));

    return Arr.isNonEmpty(problems)
      ? Result.err(
          [
            `❌ ${problems.length} package(s) write GraphQL that no test checks against GitHub's schema:`,
            '',
            ...problems.map((problem) => `  ${problem}`),
            '',
            `Add \`src/${TEST_FILE}\` as \`libs/pr-report-core-v2/src/${TEST_FILE}\` does:`,
            'each query through `githubGraphqlErrors`, and `queriesNotSent` over `src/`.',
          ].join('\n'),
        )
      : Result.ok(candidates.length);
  });

/**
 * What is wrong, one line per package, given the text of each tracked file under
 * a package's `src/` that may write GraphQL and of each {@link TEST_FILE}.
 */
export const findMissingGraphqlTests = (
  files: ReadonlyRecord<string, string>,
): readonly string[] => {
  const writers = Arr.uniqBy(
    Arr.generate(function* () {
      for (const [file, text] of Object.entries(files).toSorted(([a], [b]) =>
        a.localeCompare(b),
      )) {
        const [first] = isPackageSource(file)
          ? queriesIn(file, text)
          : ([] as const);

        if (first !== undefined) {
          yield {
            pkg: packageOf(file),
            where: `${file}:${first.line} ${first.firstLine}`,
          };
        }
      }
    }),
    ({ pkg }) => pkg,
  );

  return writers.flatMap(({ pkg, where }) => {
    const testFile = `${pkg}/src/${TEST_FILE}` as const;

    const test = files[testFile];

    if (test === undefined) {
      return [`${testFile} does not exist, and ${where} is GraphQL`];
    }

    // The names alone: the test is held to existing and to calling both, not to
    // what it passes them, which its review reads.
    const missing = REQUIRED_CALLS.filter((call) => !test.includes(`${call}(`));

    return Arr.isNonEmpty(missing)
      ? [
          `${testFile} does not call ${missing.map((call) => `\`${call}\``).join(' or ')}, and ${where} is GraphQL`,
        ]
      : [];
  });
};

const TEST_FILE = 'github-graphql.test.mts';

const REQUIRED_CALLS = ['githubGraphqlErrors', 'queriesNotSent'] as const;

/**
 * A source file under a package's `src/`, as `queriesNotSent` reads them: no
 * test file and no declaration file.
 */
const isPackageSource = (file: string): boolean =>
  /.\/src\/.+\.(?:mts|tsx?)$/u.test(file) &&
  !/\.(?:test|d)\.[^./]+$/u.test(file);

/** The directory before the first `src/` of `file`. */
const packageOf = (file: string): string =>
  file.slice(0, file.indexOf('/src/'));

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkGithubGraphqlTests().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} file(s) read; every package that writes GraphQL checks it against GitHub's schema.`,
  );
}
