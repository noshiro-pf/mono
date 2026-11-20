/**
 * Every GraphQL query the page writes itself, checked against GitHub's own
 * schema. The queries it sends through `pr-report-core-v2`'s readers are
 * checked there.
 *
 * GitHub answers a query it cannot read with an error and no data, and a query
 * is a string, so nothing short of a request to GitHub says one is wrong. A new
 * query, fixed or built per day, belongs in {@link QUERIES}; the second test
 * names any query in the source that none of them contains.
 */

// `tools/` is not a package and has no barrel; it is reached by relative path.
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules
import { githubGraphqlErrors } from '../../../tools/configs/github-graphql-schema.mjs';
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules
import { queriesNotSent } from '../../../tools/configs/github-graphql-source-queries.mjs';
import { activityQuery, todayOf, weekBefore } from './domain/index.mjs';

describe('the GraphQL queries', () => {
  test.each(QUERIES)(
    '%s is valid against the schema GitHub publishes',
    (_name, query) => {
      assert.deepStrictEqual(githubGraphqlErrors(query), []);
    },
  );

  test('include every query written in the source (one they do not, or its shape, belongs in `QUERIES`)', () => {
    assert.deepStrictEqual(
      queriesNotSent(
        import.meta.dirname,
        QUERIES.map(([, query]) => query),
      ),
      [],
    );
  });
});

const NOW = Date.parse('2026-11-09T23:30:00Z');

/** Every query, one of each shape the built ones take. */
const QUERIES = [
  [
    'activityQuery',
    activityQuery(
      { owner: 'noshiro-pf', name: 'mono' },
      weekBefore(NOW, 'Asia/Tokyo'),
      todayOf(NOW, 'Asia/Tokyo'),
    ).query,
  ],
] as const;
