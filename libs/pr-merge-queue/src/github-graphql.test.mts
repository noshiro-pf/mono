// cspell:ignore unstub
/**
 * Every GraphQL request the commands send, checked against GitHub's own
 * schema.
 *
 * GitHub answers a query it cannot read with an error and no data, and the
 * commands report that as "could not read …" and go on: a selection left
 * open once stopped `unblock-prs` from reading any pull request's checks,
 * and it released a second pull request beside one still running. Nothing
 * short of a request to GitHub said so, because the queries are strings.
 *
 * The requests are captured rather than read out of the source, because
 * most are built at run time — an alias per pull request — and the shape
 * that goes out is what has to be valid. A function that sends a new query
 * belongs in {@link sendEveryQuery}; the second test names any query in the
 * source that none of the captured requests contains.
 *
 * The schema is GitHub's public one, vendored under
 * `tools/configs/github-graphql/` (its `README.md` says from where, and how
 * to refresh it).
 */

import { buildSchema, parse, validate, type GraphQLSchema } from 'graphql';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
// `tools/` is not a package and has no barrel; it is reached by relative path.
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules
import { queriesNotSent } from '../../../tools/configs/github-graphql-source-queries.mjs';
import { parseJson, type ApiContext } from './lib/index.mjs';
import { markReady } from './open-pr/index.mjs';
import { createClient } from './pr-report/index.mjs';
import {
  armAutoMerge,
  listPullRequests,
  listRequiredChecks,
  readBaseChanges,
  readIssueOrder,
  readNativeStack,
  readOwnComments,
  readReviewStates,
  viewPullRequest,
  viewReviewDecision,
} from './unblock-prs/index.mjs';

describe('the GraphQL requests', () => {
  test('are each valid against the schema GitHub publishes', async () => {
    const sent = await sendEveryQuery();

    // One for each function in `sendEveryQuery`, and the follow-up that
    // `readIssueOrder` sends for an issue the pull request does not link.
    assert.lengthOf(sent, 13);

    assert.isTrue(sent.some(({ operation }) => operation === 'UnlinkedIssues'));

    for (const { operation, query } of sent) {
      assert.deepStrictEqual(
        { operation, errors: errorsOf(query) },
        { operation, errors: [] },
      );
    }
  });

  test('carry every query written in the source (a function that sends one they do not belongs in `sendEveryQuery`)', async () => {
    const sent = await sendEveryQuery();

    assert.deepStrictEqual(
      queriesNotSent(
        import.meta.dirname,
        sent.map(({ query }) => query),
      ),
      [],
    );
  });
});

type Sent = Readonly<{ operation: string; query: string }>;

/**
 * Calls every function that sends a GraphQL request, with `fetch` answering
 * each request with nothing GitHub would accept, and resolves to what was
 * sent. The answers are errors, so each function stops at its first
 * request — except `ClosingIssues`, answered so that `readIssueOrder` goes
 * on to ask about the issue the body closes and the pull request does not
 * link.
 */
const sendEveryQuery = async (): Promise<readonly Sent[]> => {
  const mut_sent: Sent[] = [];

  vi.stubGlobal(
    'fetch',
    (url: string, init?: Readonly<{ body?: unknown }>): Promise<Response> => {
      if (!url.endsWith('/graphql')) {
        // The REST list `pr-report` reads before its GraphQL query.
        return Promise.resolve(new Response('[]', { status: 200 }));
      }

      const { query } = Result.unwrapThrow(
        parseJson(
          typeof init?.body === 'string' ? init.body : '',
          t.record({ query: t.string() }),
          url,
        ),
      );

      const operation = /^\s*(?:query|mutation)\s+(\w+)/u.exec(query)?.[1];

      mut_sent.push({ operation: operation ?? firstFieldOf(query), query });

      return Promise.resolve(
        new Response(
          JSON.stringify(
            operation === 'ClosingIssues'
              ? CLOSING_ISSUES_ANSWER
              : { errors: [{ message: 'not answered in this test' }] },
          ),
          { status: 200 },
        ),
      );
    },
  );

  try {
    const api: ApiContext = {
      repo: { owner: 'noshiro-pf', name: 'mono' },
      token: 'token',
    } as const;

    await listPullRequests(api);

    await viewPullRequest(api, 1);

    await viewReviewDecision(api, 1);

    await readReviewStates(api, [1, 2], 'main');

    await readIssueOrder(api, [1]);

    await readOwnComments(api, [1, 2]);

    await readBaseChanges(api, 1);

    await readNativeStack(api, 1);

    await armAutoMerge(api, 'PR_node');

    await listRequiredChecks(api, 1);

    await markReady(api, 'PR_node');

    await createClient('token').facts(api.repo);
  } finally {
    vi.unstubAllGlobals();
  }

  return mut_sent;
};

/**
 * What GitHub would answer `ClosingIssues` with for a pull request whose
 * body closes #5 in words and links nothing.
 */
const CLOSING_ISSUES_ANSWER = {
  data: {
    repository: {
      nameWithOwner: 'noshiro-pf/mono',
      pr_1: {
        bodyHTML: [
          '<p dir="auto"><span class="issue-keyword">Closes</span> ',
          '<a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="1" data-permission-text="Title is private"',
          ' data-url="https://github.com/noshiro-pf/mono/issues/5"',
          ' data-hovercard-type="issue"',
          ' data-hovercard-url="/noshiro-pf/mono/issues/5/hovercard"',
          ' href="https://github.com/noshiro-pf/mono/issues/5">#5</a></p>',
        ].join(''),
        closingIssuesReferences: { nodes: [] },
      },
    },
  },
} as const;

/** An anonymous operation is named after its first field. */
const firstFieldOf = (query: string): string =>
  /\{\s*(\w+)/u.exec(query)?.[1] ?? '(anonymous)';

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
 * validation: GitHub's SDL does not pass every rule `graphql` checks a
 * schema against (an interface field that is not deprecated where an
 * implementation's is), and what is checked here is the queries.
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
