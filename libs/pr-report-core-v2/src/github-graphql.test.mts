/**
 * Every GraphQL query the readers send, checked against GitHub's own schema.
 *
 * GitHub answers a query it cannot read with an error and no data, and a query
 * is a string, so nothing short of a request to GitHub says one is wrong. A
 * fixed query belongs in {@link QUERIES}; one a reader builds per call is
 * captured from that reader's request, as {@link mergedClosingIssuesQuery}
 * does, since the shape that goes out is what has to be valid. The last test
 * names any query in the source that none of them contains.
 */

import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
// `tools/` is not a package and has no barrel; it is reached by relative path.
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules
import { githubGraphqlErrors } from '../../../tools/configs/github-graphql-schema.mjs';
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules
import { queriesNotSent } from '../../../tools/configs/github-graphql-source-queries.mjs';
import {
  DETAILS_QUERY,
  MERGED_HEAD_QUERY,
  PULL_REQUESTS_QUERY,
  readIssueExtrasGraphql,
  readLinkedClosingIssuesGraphql,
  readNumbersGraphql,
  recordedTransport,
  REPOSITORY_QUERY,
} from './read/index.mjs';

describe('the GraphQL queries', () => {
  test.each(QUERIES)(
    '%s is valid against the schema GitHub publishes',
    (_name, query) => {
      assert.deepStrictEqual(githubGraphqlErrors(query), []);
    },
  );

  test('MergedClosingIssues, built per chunk of pull requests, is valid against the schema GitHub publishes', async () => {
    assert.deepStrictEqual(
      githubGraphqlErrors(await mergedClosingIssuesQuery()),
      [],
    );
  });

  test('NamedNumbers and IssueExtras, built per chunk of numbers, are valid against the schema GitHub publishes', async () => {
    assert.deepStrictEqual(githubGraphqlErrors(await namedNumbersQuery()), []);

    assert.deepStrictEqual(githubGraphqlErrors(await issueExtrasQuery()), []);
  });

  test('include every query written in the source (one they do not belongs in `QUERIES`, or is captured beside it)', async () => {
    assert.deepStrictEqual(
      queriesNotSent(import.meta.dirname, [
        ...QUERIES.map(([, query]) => query),
        await mergedClosingIssuesQuery(),
        await namedNumbersQuery(),
        await issueExtrasQuery(),
      ]),
      [],
    );
  });
});

/** Every fixed query the readers send. */
const QUERIES = [
  ['REPOSITORY_QUERY', REPOSITORY_QUERY],
  ['PULL_REQUESTS_QUERY', PULL_REQUESTS_QUERY],
  ['DETAILS_QUERY', DETAILS_QUERY],
  ['MERGED_HEAD_QUERY', MERGED_HEAD_QUERY],
] as const;

const BodySchema = t.record({ query: t.string() });

/**
 * The query `readLinkedClosingIssuesGraphql` sends for two pull requests,
 * captured from a transport that answers nothing.
 */
const mergedClosingIssuesQuery = async (): Promise<string> => {
  const { transport, sent } = recordedTransport({});

  await readLinkedClosingIssuesGraphql(
    { transport, owner: 'noshiro-pf', name: 'mono', token: undefined },
    [1, 2],
  );

  assert.lengthOf(sent, 1);

  return Result.unwrapThrow(
    BodySchema.validate(Result.unwrapThrow(Json.parse(sent[0]?.body ?? ''))),
  ).query;
};

/**
 * The query `readNumbersGraphql` sends for two numbers, captured from a
 * transport that answers nothing.
 */
const namedNumbersQuery = async (): Promise<string> => {
  const { transport, sent } = recordedTransport({});

  await readNumbersGraphql(
    { transport, owner: 'noshiro-pf', name: 'mono', token: undefined },
    [1, 2],
    Result.ok('me'),
  );

  assert.lengthOf(sent, 1);

  return Result.unwrapThrow(
    BodySchema.validate(Result.unwrapThrow(Json.parse(sent[0]?.body ?? ''))),
  ).query;
};

/**
 * The query `readIssueExtrasGraphql` sends for two issues, captured from a
 * transport that answers nothing.
 */
const issueExtrasQuery = async (): Promise<string> => {
  const { transport, sent } = recordedTransport({});

  await readIssueExtrasGraphql(
    { transport, owner: 'noshiro-pf', name: 'mono', token: undefined },
    [
      { number: 1, commentCount: 1, dependencies: undefined },
      { number: 2, commentCount: 1, dependencies: undefined },
    ],
    Result.ok('me'),
  );

  assert.lengthOf(sent, 1);

  return Result.unwrapThrow(
    BodySchema.validate(Result.unwrapThrow(Json.parse(sent[0]?.body ?? ''))),
  ).query;
};
