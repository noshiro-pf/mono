/**
 * Every GraphQL mutation the commands send, checked against GitHub's own
 * schema. The queries they read through `pr-report-core-v2` are checked there.
 *
 * GitHub answers a mutation it cannot read with an error and no data, and a
 * mutation is a string, so nothing short of a request to GitHub says one is
 * wrong. The requests are captured rather than read out of the source, because
 * the mutation a pull request write names is spliced in, and the shape that goes
 * out is what has to be valid. A function that sends a new one belongs in
 * {@link sendEveryMutation}; the second test names any GraphQL in the source
 * that none of the captured requests contains.
 */

import { recordedTransport, type ReadContext } from 'pr-report-core-v2';
import { Arr, expectType, Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
// `tools/` is not a package and has no barrel; it is reached by relative path.
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules
import { githubGraphqlErrors } from '../../../tools/configs/github-graphql-schema.mjs';
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules
import { queriesNotSent } from '../../../tools/configs/github-graphql-source-queries.mjs';
import {
  enableAutoMerge,
  mutatePullRequest,
  type PullRequestMutation,
} from './github/index.mjs';

describe('the GraphQL requests', () => {
  test('are each valid against the schema GitHub publishes', async () => {
    const sent = await sendEveryMutation();

    // One for each pull request mutation, and auto-merge.
    assert.lengthOf(sent, PULL_REQUEST_MUTATIONS.length + 1);

    for (const query of sent) {
      assert.deepStrictEqual(
        { query, errors: githubGraphqlErrors(query) },
        { query, errors: [] },
      );
    }
  });

  test('carry every query written in the source (a function that sends one they do not belongs in `sendEveryMutation`)', async () => {
    assert.deepStrictEqual(
      queriesNotSent(import.meta.dirname, await sendEveryMutation()),
      [],
    );
  });
});

/** Each {@link PullRequestMutation}, which the type below holds to all. */
const PULL_REQUEST_MUTATIONS = [
  'convertPullRequestToDraft',
  'disablePullRequestAutoMerge',
  'markPullRequestReadyForReview',
] as const;

expectType<(typeof PULL_REQUEST_MUTATIONS)[number], PullRequestMutation>('=');

const BodySchema = t.record({ query: t.string() });

/**
 * Calls every function that sends GraphQL, with a transport that answers
 * nothing, and resolves to the query of each request, in order.
 */
const sendEveryMutation = async (): Promise<readonly string[]> => {
  const { transport, sent } = recordedTransport({});

  const context: ReadContext = {
    transport,
    owner: 'noshiro-pf',
    name: 'mono',
    token: undefined,
  } as const;

  await Promise.all(
    Arr.toPushed(
      PULL_REQUEST_MUTATIONS.map((mutation) =>
        mutatePullRequest(context, mutation, 'PR_node'),
      ),
      enableAutoMerge(context, 'PR_node'),
    ),
  );

  return sent.map(
    ({ body }) =>
      Result.unwrapThrow(
        BodySchema.validate(Result.unwrapThrow(Json.parse(body ?? ''))),
      ).query,
  );
};
