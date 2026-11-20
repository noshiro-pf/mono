import { findMissingGraphqlTests } from './check-github-graphql-tests.mjs';

describe(findMissingGraphqlTests, () => {
  test('names a package that writes GraphQL and has no test', () => {
    assert.deepStrictEqual(
      findMissingGraphqlTests({
        'libs/a/src/read/github.mts': [
          'export const QUERY = [',
          "  'query Read($owner: String!) {',",
          '  \'  repository(owner: $owner, name: "n") { id }\',',
          "  '}',",
          String.raw`].join('\n');`,
        ].join('\n'),
        'libs/a/src/read/other.mts':
          "export const MUTATION = 'mutation ($id: ID!) { x(id: $id) { y } }';",
      }),
      [
        'libs/a/src/github-graphql.test.mts does not exist, and libs/a/src/read/github.mts:2 query Read($owner: String!) { is GraphQL',
      ],
    );
  });

  test('names a test that does not call both helpers', () => {
    assert.deepStrictEqual(
      findMissingGraphqlTests({
        'apps/b/src/github.mts':
          "export const QUERY = 'query { viewer { login } }';",
        'apps/b/src/github-graphql.test.mts':
          'assert.deepStrictEqual(githubGraphqlErrors(QUERY), []);',
      }),
      [
        'apps/b/src/github-graphql.test.mts does not call `queriesNotSent`, and apps/b/src/github.mts:1 query { viewer { login } } is GraphQL',
      ],
    );
  });

  test('accepts a package whose test calls both', () => {
    assert.deepStrictEqual(
      findMissingGraphqlTests({
        'apps/b/src/github.mts':
          "export const QUERY = 'query { viewer { login } }';",
        'apps/b/src/github-graphql.test.mts': [
          'githubGraphqlErrors(QUERY);',
          'queriesNotSent(import.meta.dirname, [QUERY]);',
        ].join('\n'),
      }),
      [],
    );
  });

  test('reads only the source under a package’s src/', () => {
    assert.deepStrictEqual(
      findMissingGraphqlTests({
        'libs/a/src/github.test.mts':
          "const query = 'query { viewer { login } }';",
        'libs/a/src/types.d.mts': "type Q = 'query { viewer { login } }';",
        'libs/a/scripts/github.mts':
          "const query = 'query { viewer { login } }';",
        'libs/a/src/prose.mts': "const message = 'query the API again';",
      }),
      [],
    );
  });
});
