// The fixtures are TypeScript source, and `${` in them is a template literal's.
/* eslint-disable no-template-curly-in-string */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
import { queriesNotSent } from './github-graphql-source-queries.mjs';

describe(queriesNotSent, () => {
  test('a query sent with other whitespace and its substitutions filled in is sent', () => {
    assert.deepStrictEqual(
      inSrc(
        {
          'github.mts': [
            'const query = [',
            "  `query Read(${declarations.join(', ')}) {`,",
            "  '  repository(owner: $owner, name: $name) {',",
            '  `    pullRequests(first: ${PAGE_SIZE}) { nodes { number } }`,',
            "  '  }',",
            "  '}',",
            String.raw`].join('\n');`,
          ],
        },
        [
          'query Read($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { pullRequests(first: 100) { nodes { number } } } }',
        ],
      ),
      [],
    );
  });

  test('a query whose fixed text no request contains is named, with where it is', () => {
    assert.deepStrictEqual(
      inSrc(
        {
          'github.mts': [
            'const ONE = [',
            "  'query($owner: String!, $name: String!) {',",
            "  '  repository(owner: $owner, name: $name) { nameWithOwner }',",
            "  '}',",
            String.raw`].join('\n');`,
            '',
            'const OTHER = [',
            "  'query($owner: String!, $name: String!) {',",
            "  '  repository(owner: $owner, name: $name) { isPrivate }',",
            "  '}',",
            String.raw`].join('\n');`,
          ],
        },
        [
          'query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { nameWithOwner } }',
        ],
      ),
      ['github.mts:8 query($owner: String!, $name: String!) {'],
    );
  });

  test('a field built per alias is a query of its own', () => {
    const files = {
      'lib/fields.mts': [
        'const field = (alias: string): string =>',
        '  `${alias}: pullRequest(number: $${alias}) { title }`;',
      ],
    } as const;

    assert.deepStrictEqual(inSrc(files, ['query { viewer { login } }']), [
      'lib/fields.mts:2 …: pullRequest(number: $…) { title }',
    ]);

    assert.deepStrictEqual(
      inSrc(files, [
        'query($pr_1: Int!) { repository(owner: "o", name: "n") { pr_1: pullRequest(number: $pr_1) { title } } }',
      ]),
      [],
    );
  });

  test('a mutation in a tagged template is a query', () => {
    const files = {
      'mutation.mts': [
        'const markReady = dedent`',
        '  mutation ($id: ID!) {',
        '    markPullRequestReadyForReview(input: { pullRequestId: $id }) { clientMutationId }',
        '  }',
        '`;',
      ],
    } as const;

    assert.deepStrictEqual(inSrc(files, []), [
      'mutation.mts:2 mutation ($id: ID!) {',
    ]);

    assert.deepStrictEqual(
      inSrc(files, [
        'mutation ($id: ID!) { markPullRequestReadyForReview(input: { pullRequestId: $id }) { clientMutationId } }',
      ]),
      [],
    );
  });

  test('a query behind a type assertion is still in its array', () => {
    assert.deepStrictEqual(
      inSrc(
        {
          'github.mts': [
            'const query = [',
            "  ('query Read {' as const),",
            "  '  viewer { login }',",
            "  '}',",
            String.raw`].join('\n');`,
          ],
        },
        ['query Read { viewer { name } }'],
      ),
      ['github.mts:2 query Read {'],
    );
  });

  test('prose, comments and tests are not queries', () => {
    assert.deepStrictEqual(
      inSrc(
        {
          'prose.mts': [
            '// query Read($owner: String!) { repository { name } }',
            "const message = 'query the API again';",
            "const kind = 'query';",
            'const price = `costs: $${amount}`;',
          ],
          'github.test.mts': [
            "const query = 'query Unsent { viewer { login } }';",
          ],
        },
        [],
      ),
      [],
    );
  });
});

/**
 * {@link queriesNotSent} over a `src/` holding `files`, each given as its
 * lines, removed once it returns.
 */
const inSrc = (
  files: ReadonlyRecord<string, readonly string[]>,
  sent: readonly string[],
): readonly string[] => {
  const srcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'source-queries-'));

  try {
    for (const [file, lines] of Object.entries(files)) {
      const filePath = path.join(srcDir, file);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFileSync(filePath, lines.join('\n'));
    }

    return queriesNotSent(srcDir, sent);
  } finally {
    fs.rmSync(srcDir, { recursive: true, force: true });
  }
};
