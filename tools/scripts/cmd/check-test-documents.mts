import { Arr, hasKey, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { plural } from '../lib/plural.mjs';
import { listTrackedFiles, readRepositoryFile } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import { GATE_LISTS_FILE, readGateList } from './workflow-steps.mjs';

/**
 * Holds every unit test that reads a Markdown document of the repository to
 * {@link TEST_DOCUMENTS}, and each document there to an exception in the `code`
 * and the `runtime` lists of the gate (`tools/configs/gate-ignore-lists.json`).
 *
 * Unit tests run in `code-check.yml` and `node-version-compatibility.yml`
 * alone, and both lists ignore `**.md`, so a diff of such a document alone
 * would run neither: the test judging the edit would not run, and would fail on
 * the next pull request that touched code (`.github/workflows/README.md`, "The
 * ignore lists"). It also reports a `.md` exception of the two lists that names
 * no document of the table, which would make each diff of what it matches run
 * the unit tests for nothing, and a document of the table that is not a tracked
 * file.
 */
export const checkTestDocuments = (): Promise<
  Result<readonly string[], string>
> =>
  Result.safeTry(async function* () {
    const tracked = yield* Result.safeUnwrap(await listTrackedFiles());

    const testFiles = tracked.filter(isUnitTestFile);

    const code = readGateList('code', projectRootPath);

    if (!code.ok) {
      return Result.err(code.message);
    }

    const runtime = readGateList('runtime', projectRootPath);

    if (!runtime.ok) {
      return Result.err(runtime.message);
    }

    // One file at a time, each tested as it is read, which takes about a second
    // for all of them: every test file of the repository open at once can pass
    // a low limit of open files.
    const mut_readers: string[] = [];

    for (const file of testFiles) {
      const text = yield* Result.safeUnwrap(await readRepositoryFile(file));

      if (readsMarkdown(text)) {
        mut_readers.push(file);
      }
    }

    const readers: readonly string[] = mut_readers;

    const violations = findTestDocumentViolations({
      readers,
      tracked: new Set(tracked),
      table: TEST_DOCUMENTS,
      lists: { code: code.value, runtime: runtime.value },
    });

    return Arr.isNonEmpty(violations)
      ? Result.err(violations.join('\n'))
      : Result.ok(readers);
  });

/**
 * Whether a test's text reads a Markdown file: a `readFile` or `readFileSync`
 * call whose arguments name a `.md` path before the statement ends. Run over
 * every tracked test file, it finds every entry of {@link TEST_DOCUMENTS} and
 * nothing else, a test writing a README into a temporary directory included.
 */
export const readsMarkdown = (text: string): boolean =>
  READS_MARKDOWN.test(text);

// A document is taken back by an exception naming it, `!<its path>`, in each of
// the two lists, and each `.md` exception of the lists names a document of the
// table: an exception written as a pattern takes back more than the document,
// and outlives its entry unseen. The lists' other exceptions, the apps' pages
// and tables, are directories, and left alone.
/** What is wrong with the readers, the table and the lists, one message each. */
export const findTestDocumentViolations = ({
  readers,
  tracked,
  table,
  lists,
}: Readonly<{
  readers: readonly string[];
  tracked: ReadonlySet<string>;
  table: ReadonlyRecord<string, string>;
  lists: ReadonlyRecord<TestList, readonly string[]>;
}>): readonly string[] => {
  const reading = new Set(readers);

  const documents = new Set(Object.values(table));

  const unlisted = readers
    .filter((file) => !hasKey(table, file))
    .map(
      (file) =>
        `${file} reads a Markdown document and is not in TEST_DOCUMENTS: add it with the document it reads.`,
    );

  const stale = Object.entries(table)
    .filter(([file]) => !reading.has(file))
    .map(
      ([file]) =>
        `${file} is in TEST_DOCUMENTS but no read of a Markdown document is found in it: remove its entry if it reads none (or rename its key if the test was renamed), or name the \`.md\` path in its \`readFile\` call, which is what this check finds.`,
    );

  // Only for an entry whose test reads its document, and a document that is
  // tracked: otherwise the entry or the path is what is wrong, not the lists.
  const notTakenBack = Object.entries(table)
    .filter(([file, document]) => reading.has(file) && tracked.has(document))
    .flatMap(([file, document]) =>
      TEST_LISTS.filter((list) => !lists[list].includes(`!${document}`)).map(
        (list) =>
          `${document}, which ${file} reads, has no exception "!${document}" in the \`${list}\` list of ${GATE_LISTS_FILE}, so a diff of it alone runs no unit test: add it.`,
      ),
    );

  const unneeded = TEST_LISTS.flatMap((list) =>
    lists[list]
      .filter(
        (pattern) =>
          pattern.startsWith('!') &&
          pattern.endsWith('.md') &&
          !documents.has(pattern.slice(1)),
      )
      .map(
        (pattern) =>
          `The \`${list}\` list of ${GATE_LISTS_FILE} has "${pattern}", which names no document of TEST_DOCUMENTS: remove it.`,
      ),
  );

  const missing = Array.from(documents)
    .filter((document) => !tracked.has(document))
    .map(
      (document) =>
        `${document} is in TEST_DOCUMENTS but is not a tracked file: write the path of the document the test reads, or \`git add\` it.`,
    );

  return [...unlisted, ...stale, ...notTakenBack, ...unneeded, ...missing];
};

// One document a test: a test that reads a second is not told apart from one
// that reads one, which is the limit of reading the calls as text, as is a path
// held in a variable before the call, or a read in a test written in a source
// file rather than in a test file; none of the tests does any.
/**
 * Each unit test that reads a Markdown document, and the document. Kept by
 * hand: the path cannot be read from the call in general (`path.join(root,
 * 'docs/rule-rationale.md')`, `root` computed above it), and this check is
 * what keeps the table whole.
 */
export const TEST_DOCUMENTS = {
  'libs/eslint-config-typed/src/rules/rule-rationale-doc.test.mts':
    'libs/eslint-config-typed/docs/rule-rationale.md',
  'libs/eslint-plugin-ts-std-forge/src/rules/counterparts.test.mts':
    'libs/eslint-plugin-ts-std-forge/README.md',
  'libs/github-settings-as-code/src/cmd/cli-spec.test.mts':
    'libs/github-settings-as-code/README.md',
  'libs/pr-merge-queue/src/unblock-prs/options.test.mts':
    'libs/pr-merge-queue/src/unblock-prs/README.md',
} as const satisfies ReadonlyRecord<string, string>;

/** The lists of the workflows that run the unit tests. */
const TEST_LISTS = ['code', 'runtime'] as const;

type TestList = (typeof TEST_LISTS)[number];

const READS_MARKDOWN = /\breadFile(?:Sync)?\(\s*[^;]{0,200}?\.md['"`]/u;

// This check's own tests are left out: their fixtures are such reads, written
// as text, and read nothing.
const OWN_TEST = 'tools/scripts/cmd/check-test-documents.test.mts';

const isUnitTestFile = (file: string): boolean =>
  !file.startsWith('experimental/') &&
  file !== OWN_TEST &&
  (file.endsWith('.test.mts') || file.endsWith('.test.tsx'));

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkTestDocuments().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(
      [
        '❌ The unit tests that read a Markdown document, TEST_DOCUMENTS and the',
        '   gate lists do not agree (.github/workflows/README.md, "The ignore lists"):',
        '',
        result.value,
      ].join('\n'),
    );

    process.exit(1);
  }

  console.info(
    `${plural(result.value.length, 'unit test')} read a Markdown document, and both lists take each document back.`,
  );
}
