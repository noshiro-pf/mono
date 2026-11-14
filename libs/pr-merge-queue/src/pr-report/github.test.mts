import type { LinkedIssue } from 'pr-report-core';
import { Arr, asUint32, Num, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  FAKE_BASE_TIP,
  FAKE_HEAD_SHA,
  FAKE_REPO,
  fakeGitHub,
  fakePullRequest,
  type FakeRoutes,
} from '../../test/index.mjs';
import { parseJson } from '../lib/index.mjs';
import { createClient } from './github.mjs';

describe(createClient, () => {
  describe('the open pull requests', () => {
    test('reads every page of them, past the first hundred', async () => {
      const github = await fakeGitHub(openPages([100, 3]));

      const facts = await createClient(undefined, github.baseUrl).facts(repo, {
        checks: false,
      });

      await github.close();

      assert.isTrue(Result.isOk(facts));

      assert.deepStrictEqual(
        facts.value.map(({ number }) => number),
        Array.from(Arr.range(asUint32(1), asUint32(104))),
      );
    });

    test('stops at the page that comes back short, asking no further', async () => {
      const github = await fakeGitHub(openPages([100, 3]));

      await createClient(undefined, github.baseUrl).facts(repo, {
        checks: false,
      });

      await github.close();

      assert.deepStrictEqual(
        github.requested
          .filter((url) => url.includes('/pulls?state=open'))
          .map(pageOf),
        [1, 2],
      );
    });

    test('lists one moved onto the next page while they are read once', async () => {
      // Pull request 100 appears at the end of the first page and again at the
      // top of the second, as when an older one is reopened in between.
      const github = await fakeGitHub(({ url }) =>
        url.includes('/pulls?state=open')
          ? {
              body: (pageOf(url) === 1
                ? Arr.range(asUint32(1), asUint32(101))
                : [100, 101]
              ).map((number) => fakePullRequest({ number })),
            }
          : undefined,
      );

      const facts = await createClient(undefined, github.baseUrl).facts(repo, {
        checks: false,
      });

      await github.close();

      assert.isTrue(Result.isOk(facts));

      assert.deepStrictEqual(
        facts.value.map(({ number }) => number),
        Array.from(Arr.range(asUint32(1), asUint32(102))),
      );
    });

    test('reads the empty page after exactly a hundred, and stops there', async () => {
      const github = await fakeGitHub(openPages([100]));

      const facts = await createClient(undefined, github.baseUrl).facts(repo, {
        checks: false,
      });

      await github.close();

      assert.isTrue(Result.isOk(facts));

      assert.lengthOf(facts.value, 100);

      assert.deepStrictEqual(
        github.requested
          .filter((url) => url.includes('/pulls?state=open'))
          .map(pageOf),
        [1, 2],
      );
    });

    test('refuses when a page after the first cannot be read, rather than report part of them', async () => {
      const github = await fakeGitHub(({ url }) =>
        url.includes('/pulls?state=open')
          ? pageOf(url) === 1
            ? {
                body: Arr.range(asUint32(1), asUint32(101)).map((number) =>
                  fakePullRequest({ number }),
                ),
              }
            : { status: 500, body: { message: 'Server Error' } }
          : undefined,
      );

      const facts = await createClient(undefined, github.baseUrl).facts(repo, {
        checks: false,
      });

      await github.close();

      assert.isTrue(Result.isErr(facts));

      assert.include(facts.value, 'the open pull requests');
    });

    test('keeps the links of the GraphQL pages read before one that fails', async () => {
      const github = await fakeGitHub((request) => {
        if (request.url === '/graphql') {
          return cursorOf(request.body) === undefined
            ? {
                body: closingIssuesPage({
                  numbers: [1],
                  linkedTo: [12],
                  endCursor: 'c1',
                }),
              }
            : { status: 502, body: { message: 'Bad Gateway' } };
        }

        return request.url.includes('/pulls?state=open')
          ? { body: [fakePullRequest({ number: 1 })] }
          : undefined;
      });

      const facts = await createClient('token', github.baseUrl).facts(repo, {
        checks: false,
      });

      await github.close();

      assert.isTrue(Result.isOk(facts));

      assert.deepStrictEqual(facts.value[0]?.linkedIssues, [byGraphQl(12)]);
    });

    test('reads the links GraphQL holds for one past its first hundred, by the cursor it gave', async () => {
      const github = await fakeGitHub((request) => {
        if (request.url === '/graphql') {
          const after = cursorOf(request.body);

          return {
            body: closingIssuesPage(
              after === undefined
                ? { numbers: [1], linkedTo: [], endCursor: 'c1' }
                : { numbers: [101], linkedTo: [12], endCursor: undefined },
            ),
          };
        }

        return openPages([100, 1])(request);
      });

      const facts = await createClient('token', github.baseUrl).facts(repo, {
        checks: false,
      });

      await github.close();

      assert.isTrue(Result.isOk(facts));

      assert.deepStrictEqual(
        facts.value.find(({ number }) => number === 101)?.linkedIssues,
        [byGraphQl(12)],
      );
    });
  });

  describe('the queue comments', () => {
    test('reads one on a later page, past a hundred others', async () => {
      const setAside =
        `<!-- unblock-prs:set-aside reason=checks-failed head=${FAKE_HEAD_SHA} base=${FAKE_BASE_TIP} -->` as const;

      const github = await fakeGitHub(({ url }) =>
        url.startsWith(`/repos/${repo.owner}/${repo.name}/issues/1/comments`)
          ? {
              body: url.endsWith('&page=1')
                ? Arr.seq(asUint32(100)).map((index) => ({
                    id: index + 1,
                    body: 'Another comment.',
                    user: { login: 'me' },
                  }))
                : url.endsWith('&page=2')
                  ? [{ id: 101, body: setAside, user: { login: 'me' } }]
                  : [],
            }
          : undefined,
      );

      const client = createClient('token', github.baseUrl);

      const facts = await client.facts(repo, { checks: false });

      assert.isTrue(Result.isOk(facts));

      const read = await client.queueComments(repo, 'main', facts.value);

      await github.close();

      assert.strictEqual(read.get(1)?.setAside?.commentId, 101);
    });
  });

  describe('the issues an open pull request closes', () => {
    test('reads a keyword GitHub marked where GraphQL links nothing, as on a stacked pull request', async () => {
      assert.deepStrictEqual(
        await linkedIssuesFrom({ html: closes(12), linked: [] }, 'token'),
        [byKeyword(12)],
      );
    });

    test('lists an issue GraphQL links once, with the title and state it gave', async () => {
      assert.deepStrictEqual(
        await linkedIssuesFrom(
          { html: closes(12, 'linked'), linked: [12] },
          'token',
        ),
        [byGraphQl(12)],
      );
    });

    test('puts the issues GraphQL links before the ones only a keyword closes', async () => {
      assert.deepStrictEqual(
        await linkedIssuesFrom(
          { html: `${closes(13)}${closes(12, 'linked')}`, linked: [12] },
          'token',
        ),
        [byGraphQl(12), byKeyword(13)],
      );
    });

    test('reads the keywords alone when GraphQL is refused', async () => {
      assert.deepStrictEqual(
        await linkedIssuesFrom(
          { html: closes(12), linked: 'refused' },
          'token',
        ),
        [byKeyword(12)],
      );
    });

    test('reads the keywords alone without a token, asking GraphQL nothing', async () => {
      const read = await readThrough(
        { html: closes(12), linked: [] },
        undefined,
      );

      assert.deepStrictEqual(read.linkedIssues, [byKeyword(12)]);

      assert.notInclude(read.requested, '/graphql');
    });

    // The control for the test above, so that its `notInclude` cannot pass for
    // a path the client never asks; that the answer is used is what the tests
    // expecting `byGraphQl` show.
    test('asks GraphQL with a token', async () => {
      const read = await readThrough({ html: closes(12), linked: [] }, 'token');

      assert.include(read.requested, '/graphql');
    });

    test('reads the keywords from the text of an answer without the rendering', async () => {
      assert.deepStrictEqual(
        await linkedIssuesFrom(
          { html: undefined, text: 'Closes #12', linked: [] },
          'token',
        ),
        [byKeyword(12)],
      );
    });

    // The text would read `Closes #99`; GitHub, rendering it inside a code
    // span, marks no keyword.
    test('takes the rendering over the text where both are answered', async () => {
      assert.deepStrictEqual(
        await linkedIssuesFrom(
          {
            html: '<p dir="auto"><code>Closes #99</code></p>',
            text: 'Closes #99',
            linked: [],
          },
          'token',
        ),
        [],
      );
    });
  });
});

const repo = FAKE_REPO;

/** What the fake GitHub answers for its one open pull request. */
type Answers = Readonly<{
  /**
   * `body_html`, sent only to a request that asks for the `full` media type, as
   * GitHub does; `undefined` for a server that never sends it.
   */
  html: string | undefined;
  /** `body`; the keyword-free default leaves the text nothing to say. */
  text?: string;
  /**
   * The issue numbers `closingIssuesReferences` holds, or GraphQL refusing to
   * answer.
   */
  linked: readonly number[] | 'refused';
}>;

const byGraphQl = (number: number): LinkedIssue =>
  ({
    number,
    title: `Issue ${number}`,
    url: `https://github.com/o/r/issues/${number}`,
    state: 'open',
  }) as const;

/** A fake GitHub answering `answers` for its one open pull request. */
const answering =
  (answers: Answers): FakeRoutes =>
  (request) => {
    if (request.url === '/graphql') {
      return answers.linked === 'refused'
        ? { status: 403, body: { message: 'Forbidden' } }
        : {
            body: {
              data: {
                repository: {
                  pullRequests: {
                    pageInfo: { hasNextPage: false, endCursor: null },
                    nodes: [
                      {
                        number: 1,
                        closingIssuesReferences: {
                          nodes: answers.linked.map((number) => ({
                            ...byGraphQl(number),
                            state: 'OPEN',
                            repository: {
                              nameWithOwner: `${repo.owner}/${repo.name}`,
                            },
                          })),
                        },
                      },
                    ],
                  },
                },
              },
            },
          };
    }

    if (!request.url.includes('/pulls?state=open')) {
      return undefined;
    }

    const full =
      request.accept === 'application/vnd.github.full+json' &&
      answers.html !== undefined;

    return {
      body: [
        fakePullRequest({
          title: 'A stacked pull request',
          body: answers.text ?? 'No keyword here.',
          ...(full ? { body_html: answers.html } : {}),
          base: { ref: 'a' },
        }),
      ],
    };
  };

/**
 * The `linkedIssues` of the one open pull request, read through a client from a
 * fake GitHub that answers `answers`, and the path of every request the client
 * sent it.
 */
const readThrough = async (
  answers: Answers,
  token: string | undefined,
): Promise<
  Readonly<{
    linkedIssues: readonly LinkedIssue[];
    requested: readonly string[];
  }>
> => {
  const github = await fakeGitHub(answering(answers));

  const facts = await createClient(token, github.baseUrl).facts(repo, {
    checks: false,
  });

  await github.close();

  assert.isTrue(Result.isOk(facts));

  return {
    linkedIssues: facts.value.flatMap(({ linkedIssues }) => linkedIssues),
    requested: github.requested,
  };
};

/** {@link readThrough}'s `linkedIssues` alone. */
const linkedIssuesFrom = async (
  answers: Answers,
  token: string | undefined,
): Promise<readonly LinkedIssue[]> => {
  const { linkedIssues } = await readThrough(answers, token);

  return linkedIssues;
};

/**
 * A closing keyword and its reference, as GitHub renders them. It marks the
 * keyword whatever the base branch, and adds the tooltip only where it will act
 * on it — where `closingIssuesReferences` holds the issue too. The default is
 * the bare mark of a stacked pull request.
 */
const closes = (number: number, how: 'linked' | 'marked' = 'marked'): string =>
  `<p dir="auto"><span class="issue-keyword${how === 'linked' ? ` tooltipped tooltipped-se" aria-label="This pull request closes issue #${number}.` : ''}">Closes</span> <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="1" data-permission-text="Title is private" data-url="https://github.com/o/r/issues/${number}" data-hovercard-type="issue" data-hovercard-url="/o/r/issues/${number}/hovercard" href="https://github.com/o/r/issues/${number}">#${number}</a></p>` as const;

const byKeyword = (number: number): LinkedIssue =>
  ({
    number,
    title: '',
    url: `https://github.com/o/r/issues/${number}`,
    state: 'unknown',
  }) as const;

/** Which page of a paged list `url` asks for, 1 when it names none. */
const pageOf = (url: string): number => {
  const { searchParams } = new URL(url, 'http://localhost');

  return Result.unwrapOkOr(
    Num.safeParseFloat(searchParams.get('page') ?? '1'),
    Number.NaN,
  );
};

/**
 * A fake GitHub's open list, `sizes[i]` pull requests on page `i + 1`, numbered
 * from 1 in the order listed; an empty page past the last.
 */
const openPages =
  (sizes: readonly number[]): FakeRoutes =>
  ({ url }) => {
    if (!url.includes('/pulls?state=open')) {
      return undefined;
    }

    const page = pageOf(url);

    const before = Arr.sum(sizes.slice(0, page - 1));

    return {
      body: Arr.range(
        asUint32(before + 1),
        asUint32(before + 1 + (sizes[page - 1] ?? 0)),
      ).map((number) => fakePullRequest({ number })),
    };
  };

/** The `after` variable a GraphQL request sent, `undefined` for none. */
const cursorOf = (body: string | undefined): string | undefined => {
  const parsed = parseJson(
    body ?? '',
    t.record({
      variables: t.record({
        after: t.union([t.string(), t.nullType]),
      }),
    }),
    '/graphql',
  );

  return Result.isOk(parsed)
    ? (parsed.value.variables.after ?? undefined)
    : undefined;
};

/**
 * One page of `ClosingIssues`: each of `numbers`, every one linking `linkedTo`,
 * and `endCursor` for a page with another after it.
 */
const closingIssuesPage = ({
  numbers,
  linkedTo,
  endCursor,
}: Readonly<{
  numbers: readonly number[];
  linkedTo: readonly number[];
  endCursor: string | undefined;
}>): unknown =>
  ({
    data: {
      repository: {
        pullRequests: {
          pageInfo: {
            hasNextPage: endCursor !== undefined,
            endCursor: endCursor ?? null,
          },
          nodes: numbers.map((number) => ({
            number,
            closingIssuesReferences: {
              nodes: linkedTo.map((linked) => ({
                ...byGraphQl(linked),
                state: 'OPEN',
                repository: { nameWithOwner: `${repo.owner}/${repo.name}` },
              })),
            },
          })),
        },
      },
    },
  }) as const;
