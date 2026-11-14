import dedent from 'dedent';
import {
  findUnpagedOpenPullReads,
  isScannedSource,
} from './check-open-pull-reads.mjs';

describe(findUnpagedOpenPullReads, () => {
  describe('a GraphQL connection of the open pull requests', () => {
    test('is reported without a cursor', () => {
      assert.deepStrictEqual(
        find(dedent`
          const query = [
            'query($owner: String!, $name: String!) {',
            '  repository(owner: $owner, name: $name) {',
            \`    pullRequests(states: OPEN, first: \${PAGE_SIZE}) {\`,
            '    }',
            '  }',
            '}',
          ].join('\n');
        `),
        [
          'libs/x/src/a.mts:4: pullRequests(states: OPEN, …) without `after:` reads one page of the open pull requests',
        ],
      );
    });

    test('passes with a cursor on the same line', () => {
      assert.deepStrictEqual(
        find(dedent`
          const line = \`    pullRequests(states: OPEN, first: \${PAGE_SIZE}, after: $after) {\`;
        `),
        [],
      );
    });

    test('passes for pull requests in another state', () => {
      assert.deepStrictEqual(
        find("const line = 'pullRequests(states: MERGED, first: 1) {';"),
        [],
      );
    });
  });

  describe('a REST URL of the open pull requests', () => {
    test('is reported without a page', () => {
      assert.deepStrictEqual(
        find(dedent`
          const url = \`/repos/\${o}/\${r}/pulls?state=open&per_page=\${PAGE_SIZE}&sort=created\`;
        `),
        [
          'libs/x/src/a.mts:1: /pulls?state=open without `page=` reads one page of the open pull requests',
        ],
      );
    });

    test('passes with a page', () => {
      assert.deepStrictEqual(
        find(dedent`
          const url = \`/repos/\${o}/\${r}/pulls?state=open&per_page=100&page=\${page}\`;
        `),
        [],
      );
    });

    test('passes when a head narrows it to one branch', () => {
      assert.deepStrictEqual(
        find(dedent`
          const url = \`/pulls?state=open&per_page=\${n}&head=\${branch}\`;
        `),
        [],
      );
    });

    test('passes for a base path the paging is appended to', () => {
      assert.deepStrictEqual(
        find(
          "const OPEN_PULLS_PATH = '/pulls?state=open&sort=created&direction=asc';",
        ),
        [],
      );
    });

    test('passes for the closed pull requests and for issues', () => {
      assert.deepStrictEqual(
        find(dedent`
          const a = '/pulls?state=closed&per_page=100';
          const b = '/issues?state=open&per_page=100';
        `),
        [],
      );
    });
  });

  describe('a `rest` call on /pulls', () => {
    test('is reported for the open ones without a head', () => {
      assert.deepStrictEqual(
        find(dedent`
          const open = await rest(api, 'GET', '/pulls', Schema, {
            query: { state: 'open', per_page: '100' },
          });
        `),
        [
          "libs/x/src/a.mts:1: rest(…, '/pulls', …) of the open pull requests reads one page; use restAllPages",
        ],
      );
    });

    test('sees through `as const`, `satisfies` and parentheses', () => {
      assert.lengthOf(
        find(dedent`
          const open = await rest(api, 'GET', ('/pulls' as const), Schema, ({
            query: ({ state: ('open' as const) } satisfies object),
          }) as const);
        `),
        1,
      );
    });

    test('passes when a head narrows it to one branch', () => {
      assert.deepStrictEqual(
        find(dedent`
          const listed = await rest(api, 'GET', '/pulls', Schema, {
            query: { state: 'open', per_page: '1', head: \`\${owner}:\${branch}\` },
          });
        `),
        [],
      );
    });

    test('passes through restAllPages', () => {
      assert.deepStrictEqual(
        find(dedent`
          const open = await restAllPages(api, '/pulls', Schema, {
            query: { state: 'open' },
            withBodyHtml: true,
          });
        `),
        [],
      );
    });

    test('passes for the closed ones', () => {
      assert.deepStrictEqual(
        find(dedent`
          const closed = await rest(api, 'GET', '/pulls', Schema, {
            query: { state: 'closed', per_page: '100' },
          });
        `),
        [],
      );
    });
  });
});

describe(isScannedSource, () => {
  test('reads the TypeScript of the workspace, tests aside', () => {
    assert.isTrue(isScannedSource('libs/pr-merge-queue/src/a.mts'));

    assert.isTrue(isScannedSource('apps/x/src/b.tsx'));

    assert.isTrue(isScannedSource('tools/scripts/cmd/c.mts'));

    assert.isFalse(isScannedSource('libs/pr-merge-queue/src/a.test.mts'));

    assert.isFalse(isScannedSource('libs/pr-merge-queue/test/fixtures.mts'));

    assert.isFalse(isScannedSource('experimental/x/src/a.mts'));

    assert.isFalse(isScannedSource('libs/x/README.md'));
  });
});

const find = (text: string): readonly string[] =>
  findUnpagedOpenPullReads('libs/x/src/a.mts', text);
