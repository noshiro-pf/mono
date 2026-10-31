/**
 * Every GraphQL query the page sends, checked against GitHub's own schema.
 *
 * GitHub answers a query it cannot read with an error and no data, and a query
 * is a string, so nothing short of a request to GitHub says one is wrong. A new
 * query, fixed or built per pull request, issue or day, belongs in
 * {@link QUERIES}; the second test names any query in the source that none of
 * them contains.
 *
 * The schema is GitHub's public one, vendored under
 * `tools/configs/github-graphql/` (its `README.md` says from where, and how to
 * refresh it). `libs/pr-merge-queue` checks its own requests the same way.
 */

import { buildSchema, parse, validate, type GraphQLSchema } from 'graphql';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { unknownToString } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
// `tools/` is not a package and has no barrel; it is reached by relative path.
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules
import { queriesNotSent } from '../../../tools/configs/github-graphql-source-queries.mjs';
import type { ReportSource } from './constants.mjs';
import {
  CHECKS_QUERY,
  DETAILS_QUERY,
  followUpQuery,
  issuesQuery,
  MERGED_QUERY,
  OPEN_ISSUES_QUERY,
  PULL_REQUESTS_QUERY,
  referencesQuery,
} from './report-query.mjs';
import {
  todayOf,
  weekBefore,
  weeklyActivityQuery,
} from './weekly-activity.mjs';

// The repository the fixtures were taken from.
const SOURCE: ReportSource = { owner: 'noshiro-pf', repo: 'mono' } as const;

describe('the GraphQL queries', () => {
  test.each(QUERIES)(
    '%s is valid against the schema GitHub publishes',
    (_name, query) => {
      assert.deepStrictEqual(errorsOf(query), []);
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

/**
 * Every query, the fixed ones and one of each shape the built ones take.
 */
const QUERIES: readonly FixedLengthTuple<2, string>[] = [
  ['PULL_REQUESTS_QUERY', PULL_REQUESTS_QUERY],
  ['CHECKS_QUERY', CHECKS_QUERY],
  ['DETAILS_QUERY', DETAILS_QUERY],
  ['MERGED_QUERY', MERGED_QUERY],
  ['OPEN_ISSUES_QUERY', OPEN_ISSUES_QUERY],
  [
    'followUpQuery (compare)',
    followUpQuery('Compare', [
      {
        kind: 'compare',
        number: 1,
        baseQualifiedName: 'refs/heads/main',
        headSha: 'abc',
      },
      {
        kind: 'compare',
        number: 2,
        baseQualifiedName: 'refs/heads/main',
        headSha: 'def',
      },
    ]).query,
  ],
  [
    'followUpQuery (contexts)',
    followUpQuery('MoreChecks', [
      { kind: 'contexts', number: 1, headSha: 'abc', after: 'cursor' },
    ]).query,
  ],
  [
    'followUpQuery (files)',
    followUpQuery('MoreFiles', [{ kind: 'files', number: 1, after: 'cursor' }])
      .query,
  ],
  ['issuesQuery', issuesQuery([1, 2]).query],
  ['referencesQuery', referencesQuery([1, 2]).query],
  [
    'weeklyActivityQuery',
    weeklyActivityQuery(
      SOURCE,
      weekBefore(/* 2026-10-18T13:00:00Z */ 1_792_328_400_000, 'Asia/Tokyo'),
      todayOf(/* 2026-10-18T13:00:00Z */ 1_792_328_400_000, 'Asia/Tokyo'),
    ).query,
  ],
] as const;

/** What GitHub would say is wrong with `query`, empty when nothing is. */
const errorsOf = (query: string): readonly string[] => {
  try {
    return validate(githubSchema(), parse(query)).map(({ message }) => message);
  } catch (error: unknown) {
    return [unknownToString(error)];
  }
};

/**
 * GitHub's schema as GitHub publishes it, built once. Built without its own
 * validation: GitHub's SDL does not pass every rule `graphql` checks a schema
 * against (an interface field that is not deprecated where an implementation's
 * is), and what is checked here is the queries.
 */
const githubSchema = (() => {
  let mut_schema: GraphQLSchema | undefined = undefined;

  return (): GraphQLSchema => {
    mut_schema ??= buildSchema(
      fs.readFileSync(
        path.resolve(
          import.meta.dirname,
          '../../../tools/configs/github-graphql/schema.docs.graphql',
        ),
        'utf8',
      ),
      { assumeValid: true, assumeValidSDL: true },
    );

    return mut_schema;
  };
})();
