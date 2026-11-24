import { Arr, asUint32, Result } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
import {
  readIssueExtrasGraphql,
  readNumbersGraphql,
} from './graphql-issues.mjs';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import type { ReadContext } from './transport.mjs';

describe(readNumbersGraphql, () => {
  test('reads a level of numbers in one query: issues, pull requests, and numbers naming nothing', async () => {
    const { context, sent } = contextOf({
      'graphql:query NamedNumbers(': ok({
        data: {
          repository: {
            n0: issueNode(5, { state: 'CLOSED', stateReason: 'COMPLETED' }),
            n1: pullNode(6, {
              title: 'feat: x',
              prState: 'MERGED',
              merged: true,
            }),
            n2: pullNode(7, {
              title: 'issue 7',
              prState: 'OPEN',
              merged: false,
            }),
            n3: null,
            // Transferred: answered as another repository's.
            n4: issueNode(10, { repository: { nameWithOwner: 'other/repo' } }),
            n5: pullNode(12, {
              title: 'fix: z',
              prState: 'CLOSED',
              merged: false,
            }),
          },
        },
        errors: [notFound('n3')],
      }),
    });

    const read = await readNumbersGraphql(
      context,
      [5, 6, 7, 8, 10, 12],
      Result.ok('me'),
    );

    assert.isTrue(Result.isOk(read));

    assert.strictEqual(sent.length, 1);

    assert.deepStrictEqual(read.value.issues.get(5), {
      number: 5,
      state: 'closed',
      stateReason: 'completed',
      title: 'issue 5',
      body: '',
      author: 'author',
      url: 'https://github.com/o/n/issues/5',
      labels: [{ name: 'bug', color: 'd73a4a', description: '' }],
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-02T00:00:00Z',
      commentCount: 0,
      blockedBy: Result.ok([]),
      comments: Result.ok([]),
    });

    assert.deepStrictEqual(Array.from(read.value.references.values()), [
      {
        kind: 'pull-request',
        number: 6,
        title: 'feat: x',
        state: 'closed',
        merged: true,
      },
      {
        kind: 'pull-request',
        number: 7,
        title: 'issue 7',
        state: 'open',
        merged: false,
      },
      { kind: 'unknown', number: 8 },
      { kind: 'unknown', number: 10 },
      {
        kind: 'pull-request',
        number: 12,
        title: 'fix: z',
        state: 'closed',
        merged: false,
      },
    ]);
  });

  test('keeps the token’s account’s comments, oldest first, and this repository’s blockers', async () => {
    const { context } = contextOf({
      'graphql:query NamedNumbers(': ok({
        data: {
          repository: {
            n0: issueNode(5, {
              comments: connection([
                comment(1, 'me', 'first'),
                comment(2, 'someone', 'not mine'),
                comment(3, 'me', 'second'),
              ]),
              blockedBy: connection([
                { number: 2, repository: { nameWithOwner: 'O/N' } },
                { number: 3, repository: { nameWithOwner: 'other/repo' } },
              ]),
            }),
          },
        },
      }),
    });

    const issue = Result.unwrapThrow(
      await readNumbersGraphql(context, [5], Result.ok('me')),
    ).issues.get(5);

    assert.strictEqual(issue?.commentCount, 3);

    assert.deepStrictEqual(
      issue?.comments,
      Result.ok([
        { id: 1, body: 'first', createdAt: '2026-11-03T00:00:00Z' },
        { id: 3, body: 'second', createdAt: '2026-11-03T00:00:00Z' },
      ]),
    );

    assert.deepStrictEqual(issue?.blockedBy, Result.ok([2]));
  });

  test('reads a connection GraphQL cut short over REST, for that issue alone', async () => {
    const { context, sent } = contextOf({
      'graphql:query NamedNumbers(': ok({
        data: {
          repository: {
            n0: issueNode(5, {
              comments: { totalCount: 101, nodes: [comment(1, 'me', 'x')] },
              blockedBy: { totalCount: 101, nodes: [] },
            }),
          },
        },
      }),
      '/repos/o/n/issues/5/comments?per_page=100': ok([
        {
          id: 9,
          body: 'all',
          user: { login: 'me' },
          created_at: '2026-11-04T00:00:00Z',
        },
      ]),
      '/repos/o/n/issues/5/dependencies/blocked_by?per_page=100': ok([
        { number: 4, repository_url: 'https://api.github.com/repos/o/n' },
      ]),
    });

    const issue = Result.unwrapThrow(
      await readNumbersGraphql(context, [5], Result.ok('me')),
    ).issues.get(5);

    assert.deepStrictEqual(
      issue?.comments,
      Result.ok([{ id: 9, body: 'all', createdAt: '2026-11-04T00:00:00Z' }]),
    );

    assert.deepStrictEqual(issue?.blockedBy, Result.ok([4]));

    assert.strictEqual(sent.length, 3);
  });

  test(`asks ${CHUNK} numbers a query`, async () => {
    const numbers = Arr.seq(asUint32(CHUNK + 1)).map((index) => index + 1);

    const { context, sent } = contextOf({
      'graphql:query NamedNumbers(': [
        answerOf(numbers.slice(0, CHUNK)),
        answerOf(numbers.slice(CHUNK)),
      ],
    });

    const read = await readNumbersGraphql(context, numbers, Result.ok('me'));

    assert.strictEqual(sent.length, 2);

    assert.strictEqual(Result.unwrapThrow(read).issues.size, CHUNK + 1);
  });

  test.each([
    [
      'a NOT_FOUND that names no number',
      ok({
        data: { repository: { n0: null } },
        errors: [{ type: 'NOT_FOUND', path: ['repository'], message: 'x' }],
      }),
    ],
    [
      'another error on a number',
      ok({
        data: { repository: { n0: null } },
        errors: [
          { type: 'FORBIDDEN', path: ['repository', 'n0'], message: 'x' },
        ],
      }),
    ],
    ['a failed request', status(502, 'Bad Gateway')],
  ] as const)('%s fails the whole', async (_name, answer) => {
    const { context } = contextOf({ 'graphql:query NamedNumbers(': answer });

    assert.isTrue(
      Result.isErr(await readNumbersGraphql(context, [5], Result.ok('me'))),
    );
  });

  test('reads an issue over REST when its labels run past what a query reads', async () => {
    const { context, sent } = contextOf({
      'graphql:query NamedNumbers(': ok({
        data: {
          repository: {
            n0: issueNode(5, { labels: { totalCount: 101, nodes: [] } }),
          },
        },
      }),
      '/repos/o/n/issues/5': ok({
        number: 5,
        title: 'issue 5',
        body: null,
        state: 'open',
        state_reason: null,
        user: { login: 'author' },
        html_url: 'https://github.com/o/n/issues/5',
        repository_url: 'https://api.github.com/repos/o/n',
        labels: [{ name: 'many', color: '000000', description: null }],
        created_at: '2026-11-01T00:00:00Z',
        updated_at: '2026-11-02T00:00:00Z',
        comments: 0,
        issue_dependencies_summary: { total_blocked_by: 0 },
      }),
    });

    const issue = Result.unwrapThrow(
      await readNumbersGraphql(context, [5], Result.ok('me')),
    ).issues.get(5);

    assert.deepStrictEqual(issue?.labels, [
      { name: 'many', color: '000000', description: '' },
    ]);

    assert.strictEqual(sent.length, 2);
  });

  test('a pull request another repository answers for names nothing here', async () => {
    const { context } = contextOf({
      'graphql:query NamedNumbers(': ok({
        data: {
          repository: {
            n0: pullNode(6, {
              title: 'x',
              prState: 'OPEN',
              merged: false,
              repository: { nameWithOwner: 'other/repo' },
            }),
          },
        },
      }),
    });

    assert.deepStrictEqual(
      Array.from(
        Result.unwrapThrow(
          await readNumbersGraphql(context, [6], Result.ok('me')),
        ).references.values(),
      ),
      [{ kind: 'unknown', number: 6 }],
    );
  });

  test('an answer of another shape fails the whole', async () => {
    const { context } = contextOf({
      'graphql:query NamedNumbers(': ok({
        data: { repository: { n0: { __typename: 'Issue', number: 5 } } },
      }),
    });

    assert.isTrue(
      Result.isErr(await readNumbersGraphql(context, [5], Result.ok('me'))),
    );
  });

  test('reads nothing for no numbers', async () => {
    const { context, sent } = contextOf({});

    const read = await readNumbersGraphql(context, [], Result.ok('me'));

    assert.isTrue(Result.isOk(read));

    assert.strictEqual(sent.length, 0);
  });

  test('an unread viewer leaves the comments unread', async () => {
    const { context } = contextOf({
      'graphql:query NamedNumbers(': ok({
        data: {
          repository: {
            n0: issueNode(5, { comments: connection([comment(1, 'me', 'x')]) }),
          },
        },
      }),
    });

    const viewer = Result.err({
      kind: 'refused',
      what: 'the viewer',
      message: 'x',
    } as const);

    const issue = Result.unwrapThrow(
      await readNumbersGraphql(context, [5], viewer),
    ).issues.get(5);

    assert.deepStrictEqual(issue?.comments, viewer);
  });
});

describe(readIssueExtrasGraphql, () => {
  test('reads, in one query, only the issues that have comments or blockers', async () => {
    const { context, sent } = contextOf({
      'graphql:query IssueExtras(': ok({
        data: {
          repository: {
            n0: issueNode(5, {
              comments: connection([comment(1, 'me', 'mine')]),
            }),
            n1: issueNode(6, {
              blockedBy: connection([
                { number: 2, repository: { nameWithOwner: 'o/n' } },
              ]),
            }),
          },
        },
      }),
    });

    const extras = await readIssueExtrasGraphql(
      context,
      [
        { number: 5, commentCount: 1, dependencies: { total_blocked_by: 0 } },
        { number: 6, commentCount: 0, dependencies: undefined },
        { number: 7, commentCount: 0, dependencies: { total_blocked_by: 0 } },
      ],
      Result.ok('me'),
    );

    assert.strictEqual(sent.length, 1);

    assert.deepStrictEqual(extras, [
      {
        blockedBy: Result.ok([]),
        comments: Result.ok([
          { id: 1, body: 'mine', createdAt: '2026-11-03T00:00:00Z' },
        ]),
      },
      { blockedBy: Result.ok([2]), comments: Result.ok([]) },
      { blockedBy: Result.ok([]), comments: Result.ok([]) },
    ]);
  });

  test('an answer it cannot read leaves that issue alone unread', async () => {
    const { context } = contextOf({
      'graphql:query IssueExtras(': ok({
        data: {
          repository: {
            n0: { repository: { nameWithOwner: 'o/n' } },
            n1: issueNode(6, { comments: connection([comment(1, 'me', 'x')]) }),
          },
        },
      }),
    });

    const [broken, read] = await readIssueExtrasGraphql(
      context,
      [
        { number: 5, commentCount: 1, dependencies: { total_blocked_by: 0 } },
        { number: 6, commentCount: 1, dependencies: { total_blocked_by: 0 } },
      ],
      Result.ok('me'),
    );

    assert.isTrue(Result.isErr(broken?.comments ?? Result.ok([])));

    assert.deepStrictEqual(
      read?.comments,
      Result.ok([{ id: 1, body: 'x', createdAt: '2026-11-03T00:00:00Z' }]),
    );
  });

  test('a failed query leaves the issues it asked for unread, and the rest read', async () => {
    const { context } = contextOf({
      'graphql:query IssueExtras(': status(502, 'Bad Gateway'),
    });

    const [asked, skipped] = await readIssueExtrasGraphql(
      context,
      [
        { number: 5, commentCount: 1, dependencies: { total_blocked_by: 0 } },
        { number: 7, commentCount: 0, dependencies: { total_blocked_by: 0 } },
      ],
      Result.ok('me'),
    );

    assert.isTrue(Result.isErr(asked?.comments ?? Result.ok([])));

    assert.deepStrictEqual(asked?.blockedBy, Result.ok([]));

    assert.deepStrictEqual(skipped, {
      blockedBy: Result.ok([]),
      comments: Result.ok([]),
    });
  });
});

/** The numbers a query asks for. */
const CHUNK = 50;

const connection = (
  nodes: readonly UnknownRecord[],
): Readonly<{ totalCount: number; nodes: readonly UnknownRecord[] }> =>
  ({ totalCount: nodes.length, nodes }) as const;

const issueNode = (number: number, extra: UnknownRecord = {}): UnknownRecord =>
  ({
    __typename: 'Issue',
    number,
    title: `issue ${number}`,
    body: '',
    state: 'OPEN',
    stateReason: null,
    url: `https://github.com/o/n/issues/${number}`,
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-02T00:00:00Z',
    author: { login: 'author' },
    repository: { nameWithOwner: 'o/n' },
    labels: connection([{ name: 'bug', color: 'd73a4a', description: null }]),
    blockedBy: connection([]),
    comments: connection([]),
    ...extra,
  }) as const;

/** An answer naming each of `chunk` an issue. */
const answerOf = (chunk: readonly number[]): ReturnType<typeof ok> =>
  ok({
    data: {
      repository: Object.fromEntries(
        chunk.map((number, index) => [`n${index}`, issueNode(number)]),
      ),
    },
  });

const contextOf = (
  routes: Parameters<typeof recordedTransport>[0],
): Readonly<{
  context: ReadContext;
  sent: ReturnType<typeof recordedTransport>['sent'];
}> => {
  const { transport, sent } = recordedTransport(routes);

  return {
    context: { transport, owner: 'o', name: 'n', token: 'token' },
    sent,
  };
};

const notFound = (alias: string): UnknownRecord =>
  ({
    type: 'NOT_FOUND',
    path: ['repository', alias],
    message: 'Could not resolve to an issue or pull request.',
  }) as const;

/** A comment, the token's account's when `login` is `me`. */
const comment = (id: number, login: string, body: string): UnknownRecord =>
  ({
    databaseId: id,
    body,
    createdAt: '2026-11-03T00:00:00Z',
    viewerDidAuthor: login === 'me',
  }) as const;

const pullNode = (number: number, extra: UnknownRecord): UnknownRecord =>
  ({
    __typename: 'PullRequest',
    number,
    repository: { nameWithOwner: 'o/n' },
    ...extra,
  }) as const;
