import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  checkTestDocuments,
  findTestDocumentViolations,
  readsMarkdown,
} from './check-test-documents.mjs';

describe(readsMarkdown, () => {
  test('finds a read of a Markdown file on one line', () => {
    assert.isTrue(
      readsMarkdown(dedent`
        const readme = await fs.readFile(path.join(import.meta.dirname, 'README.md'), 'utf8');
      `),
    );
  });

  test('finds a read whose path is on the next line', () => {
    assert.isTrue(
      readsMarkdown(dedent`
        const readme = fs.readFileSync(
          path.resolve(import.meta.dirname, '../../README.md'),
          'utf8',
        );
      `),
    );
  });

  // A test that writes a README into a temporary directory reads no document of
  // the repository.
  test('does not find a write of a Markdown file', () => {
    assert.isFalse(
      readsMarkdown(dedent`
        await write(path.join(dir, 'README.md'), '# A');

        const text = await fs.readFile(path.join(dir, 'a.mts'), 'utf8');
      `),
    );
  });
});

const tracked = new Set<string>(['libs/a/README.md', 'libs/b/docs/b.md']);

const lists = {
  code: ['**.md', '!apps/*/src/', '!libs/a/README.md'],
  runtime: ['**.md', '!libs/a/README.md'],
} as const;

describe(findTestDocumentViolations, () => {
  test('accepts a table naming every reader, each document taken back', () => {
    assert.deepStrictEqual(
      findTestDocumentViolations({
        tracked,
        readers: ['libs/a/src/a.test.mts'],
        table: { 'libs/a/src/a.test.mts': 'libs/a/README.md' },
        lists,
      }),
      [],
    );
  });

  test('names a test that reads a document and is not in the table', () => {
    assert.deepStrictEqual(
      findTestDocumentViolations({
        tracked,
        readers: ['libs/a/src/a.test.mts', 'libs/b/src/b.test.mts'],
        table: { 'libs/a/src/a.test.mts': 'libs/a/README.md' },
        lists,
      }),
      [
        'libs/b/src/b.test.mts reads a Markdown document and is not in TEST_DOCUMENTS: add it with the document it reads.',
      ],
    );
  });

  // The table shrinks with the tests.
  test('names a table entry whose test reads no document', () => {
    assert.deepStrictEqual(
      findTestDocumentViolations({
        tracked,
        readers: [],
        table: { 'libs/a/src/a.test.mts': 'libs/a/README.md' },
        lists,
      }),
      [
        'libs/a/src/a.test.mts is in TEST_DOCUMENTS but no read of a Markdown document is found in it: remove its entry if it reads none (or rename its key if the test was renamed), or name the `.md` path in its `readFile` call, which is what this check finds.',
      ],
    );
  });

  // The exception would make each diff of the document run the tests for
  // nothing; a directory exception, an app's, is left alone.
  test('names an exception that names no document of the table', () => {
    assert.deepStrictEqual(
      findTestDocumentViolations({
        tracked,
        readers: [],
        table: {},
        lists: {
          code: ['**.md', '!libs/a/README.md', '!apps/*/src/'],
          runtime: ['**.md', '!libs/a/**/*.md'],
        },
      }),
      [
        'The `code` list of tools/configs/gate-ignore-lists.json has "!libs/a/README.md", which names no document of TEST_DOCUMENTS: remove it.',
        'The `runtime` list of tools/configs/gate-ignore-lists.json has "!libs/a/**/*.md", which names no document of TEST_DOCUMENTS: remove it.',
      ],
    );
  });

  // Its path is what is wrong, so the lists are not asked about it.
  test('names a document of the table that is not a tracked file, once', () => {
    assert.deepStrictEqual(
      findTestDocumentViolations({
        tracked: new Set<string>(),
        readers: ['libs/a/src/a.test.mts'],
        table: { 'libs/a/src/a.test.mts': 'libs/a/README.md' },
        lists: { code: ['**.md'], runtime: ['**.md'] },
      }),
      [
        'libs/a/README.md is in TEST_DOCUMENTS but is not a tracked file: write the path of the document the test reads, or `git add` it.',
      ],
    );
  });

  test('names each list with no exception naming a document of the table', () => {
    assert.deepStrictEqual(
      findTestDocumentViolations({
        tracked,
        readers: ['libs/a/src/a.test.mts', 'libs/b/src/b.test.mts'],
        table: {
          'libs/a/src/a.test.mts': 'libs/a/README.md',
          'libs/b/src/b.test.mts': 'libs/b/docs/b.md',
        },
        lists,
      }),
      [
        'libs/b/docs/b.md, which libs/b/src/b.test.mts reads, has no exception "!libs/b/docs/b.md" in the `code` list of tools/configs/gate-ignore-lists.json, so a diff of it alone runs no unit test: add it.',
        'libs/b/docs/b.md, which libs/b/src/b.test.mts reads, has no exception "!libs/b/docs/b.md" in the `runtime` list of tools/configs/gate-ignore-lists.json, so a diff of it alone runs no unit test: add it.',
      ],
    );
  });

  // A pattern takes back more than the document, and outlives its entry.
  test('asks for the exception naming a document a pattern takes back', () => {
    assert.deepStrictEqual(
      findTestDocumentViolations({
        tracked,
        readers: ['libs/a/src/a.test.mts'],
        table: { 'libs/a/src/a.test.mts': 'libs/a/README.md' },
        lists: {
          code: ['**.md', '!libs/a/README.md'],
          runtime: ['**.md', '!libs/a/**/*.md'],
        },
      }),
      [
        'libs/a/README.md, which libs/a/src/a.test.mts reads, has no exception "!libs/a/README.md" in the `runtime` list of tools/configs/gate-ignore-lists.json, so a diff of it alone runs no unit test: add it.',
        'The `runtime` list of tools/configs/gate-ignore-lists.json has "!libs/a/**/*.md", which names no document of TEST_DOCUMENTS: remove it.',
      ],
    );
  });

  // The entry is what is wrong, so the lists are not asked about it.
  test('asks nothing of the lists for an entry whose test reads no document', () => {
    const messages = findTestDocumentViolations({
      tracked,
      readers: [],
      table: { 'libs/b/src/b.test.mts': 'libs/b/docs/b.md' },
      lists,
    });

    assert.deepStrictEqual(
      messages.filter((message) => message.includes('has no exception')),
      [],
    );
  });
});

describe(checkTestDocuments, () => {
  test("holds for the repository's tests and lists", async () => {
    const result = await checkTestDocuments();

    // `assert.isTrue` takes no message in this repository's typings; the
    // comparison shows the messages when it fails.
    assert.deepStrictEqual(Result.isErr(result) ? result.value : '', '');
  });
});
