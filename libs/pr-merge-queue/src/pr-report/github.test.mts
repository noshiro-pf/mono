import type { LinkedIssue } from 'pr-report-core';
import { Arr, asUint32, Num, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  FAKE_BASE_TIP,
  FAKE_HEAD_SHA,
  FAKE_REPO,
  fakeGitHub,
  fakeIssue,
  fakePullRequest,
  type FakeRoutes,
} from '../../test/index.mjs';
import { parseJson } from '../lib/index.mjs';
import { createClient, type Client, type HandLinks } from './github.mjs';
import { REQUESTS_PER_PULL_WITH_CHECKS } from './rate-limit.mjs';

describe(createClient, () => {
  describe('whether a pull request is from a fork', () => {
    test("is not, for a head in this repository named in another case than GitHub's", async () => {
      const github = await fakeGitHub();

      const facts = await createClient(undefined, github.baseUrl).facts(
        {
          owner: FAKE_REPO.owner.toUpperCase(),
          name: FAKE_REPO.name.toUpperCase(),
        },
        { checks: false },
      );

      await github.close();

      assert.isTrue(Result.isOk(facts));

      assert.deepStrictEqual(
        facts.value.pulls.map(({ fromFork }) => fromFork),
        [false],
      );
    });

    test("is, for a head in another repository's", async () => {
      const github = await fakeGitHub(({ url }) =>
        url.includes('/pulls?state=open')
          ? {
              body: [
                fakePullRequest({
                  head: {
                    ref: 'b',
                    sha: FAKE_HEAD_SHA,
                    repo: { full_name: 'someone/r' },
                  },
                }),
              ],
            }
          : undefined,
      );

      const facts = await createClient(undefined, github.baseUrl).facts(repo, {
        checks: false,
      });

      await github.close();

      assert.isTrue(Result.isOk(facts));

      assert.deepStrictEqual(
        facts.value.pulls.map(({ fromFork }) => fromFork),
        [true],
      );
    });
  });

  describe('the issues blocking an open issue', () => {
    test("keeps this repository's, named in another case than the run's", async () => {
      const github = await fakeGitHub(({ url }) => {
        if (url.includes('/issues?state=open')) {
          return {
            body: [
              {
                number: 5,
                title: 'An issue',
                body: null,
                issue_dependencies_summary: { total_blocked_by: 2 },
                html_url: `https://github.com/${FAKE_REPO.owner}/${FAKE_REPO.name}/issues/5`,
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
                comments: 0,
                user: { login: 'someone' },
                labels: [],
              },
            ],
          };
        }

        if (url.includes('/issues/5/dependencies/blocked_by')) {
          return {
            body: [
              {
                number: 3,
                repository_url: `${github.baseUrl}/repos/${FAKE_REPO.owner}/${FAKE_REPO.name}`,
              },
              {
                number: 4,
                repository_url: `${github.baseUrl}/repos/${FAKE_REPO.owner}/other`,
              },
            ],
          };
        }

        return undefined;
      });

      const issues = await createClient(undefined, github.baseUrl).issues(
        {
          owner: FAKE_REPO.owner.toUpperCase(),
          name: FAKE_REPO.name.toUpperCase(),
        },
        10,
      );

      await github.close();

      assert.isTrue(Result.isOk(issues));

      assert.deepStrictEqual(
        issues.value.map(({ startAfter }) => startAfter),
        [[3]],
      );
    });
  });

  describe('the open pull requests', () => {
    test('reads every page of them, past the first hundred', async () => {
      const github = await fakeGitHub(openPages([100, 3]));

      const facts = await createClient(undefined, github.baseUrl).facts(repo, {
        checks: false,
      });

      await github.close();

      assert.isTrue(Result.isOk(facts));

      assert.deepStrictEqual(
        facts.value.pulls.map(({ number }) => number),
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
        facts.value.pulls.map(({ number }) => number),
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

      assert.lengthOf(facts.value.pulls, 100);

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

      assert.deepStrictEqual(facts.value.pulls[0]?.linkedIssues, [
        byGraphQl(12),
      ]);
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
        facts.value.pulls.find(({ number }) => number === 101)?.linkedIssues,
        [byGraphQl(12)],
      );
    });
  });

  describe('how far the links GitHub holds were read', () => {
    test('says every list was read when GraphQL answered each whole', async () => {
      const read = await handLinksFrom(
        answering({ html: undefined, linked: [12] }),
        'token',
      );

      assert.deepStrictEqual(read, { unread: undefined, truncated: [] });
    });

    test('names every pull request as unread without a token', async () => {
      const read = await handLinksFrom(
        answering({ html: undefined, linked: [] }),
        undefined,
      );

      assert.deepStrictEqual(read.unread?.pulls, [1]);

      assert.include(read.unread?.because, 'without a token');
    });

    test('names every pull request as unread, and why, when GraphQL refuses', async () => {
      const read = await handLinksFrom(
        answering({ html: undefined, linked: 'refused' }),
        'token',
      );

      assert.deepStrictEqual(read.unread?.pulls, [1]);

      assert.include(read.unread?.because, '/graphql answered 403 Forbidden');
    });

    test('names as unread only the pull requests past the GraphQL page that failed', async () => {
      const read = await handLinksFrom((request) => {
        if (request.url === '/graphql') {
          return cursorOf(request.body) === undefined
            ? {
                body: closingIssuesPage({
                  numbers: [1],
                  linkedTo: [],
                  endCursor: 'c1',
                }),
              }
            : { status: 502, body: { message: 'Bad Gateway' } };
        }

        return openPages([3])(request);
      }, 'token');

      assert.deepStrictEqual(read.unread?.pulls, [2, 3]);

      assert.include(read.unread?.because, '502 Bad Gateway');
    });

    test('names every pull request as unread, with the messages GraphQL gave, when it answers errors for data', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql'
            ? {
                body: {
                  data: null,
                  errors: [
                    {
                      type: 'RATE_LIMITED',
                      message: 'API rate limit exceeded',
                    },
                  ],
                },
              }
            : undefined,
        'token',
      );

      assert.deepStrictEqual(read.unread, {
        pulls: [1],
        because: '/graphql answered errors: API rate limit exceeded',
      });
    });

    test('gives both the errors and the shape when GraphQL answers errors beside data it does not know', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql'
            ? {
                body: {
                  data: { repository: null },
                  errors: [{ message: 'Resource not accessible' }],
                },
              }
            : undefined,
        'token',
      );

      assert.include(
        read.unread?.because,
        '/graphql answered errors: Resource not accessible; /graphql has an unexpected shape: ',
      );

      assert.include(read.unread?.because, 'repository');
    });

    test('names every pull request as unread when GraphQL answers a shape it does not know', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql' ? { body: { data: null } } : undefined,
        'token',
      );

      assert.deepStrictEqual(read.unread?.pulls, [1]);

      assert.include(read.unread?.because, '/graphql');
    });

    test('names as unread the pull requests the GraphQL pages had not reached when their bound ran out', async () => {
      // Every page says there is another, and lists a pull request the open
      // list does not have.
      const read = await handLinksFrom((request) => {
        if (request.url === '/graphql') {
          return {
            body: closingIssuesPage({
              numbers: [999],
              linkedTo: [],
              endCursor: 'again',
            }),
          };
        }

        return openPages([2])(request);
      }, 'token');

      assert.deepStrictEqual(read.unread?.pulls, [1, 2]);

      assert.include(read.unread?.because, 'did not end within 2 pages');
    });

    test('names as unread the pull requests past a GraphQL page that says another follows without a cursor', async () => {
      const read = await handLinksFrom((request) => {
        if (request.url === '/graphql') {
          return {
            body: {
              data: {
                repository: {
                  pullRequests: {
                    pageInfo: { hasNextPage: true, endCursor: null },
                    nodes: [
                      {
                        number: 1,
                        closingIssuesReferences: { totalCount: 0, nodes: [] },
                      },
                    ],
                  },
                },
              },
            },
          };
        }

        return openPages([2])(request);
      }, 'token');

      assert.deepStrictEqual(read.unread?.pulls, [2]);

      assert.include(read.unread?.because, 'gave no cursor');
    });

    test('gives the reason as one line, its runs of space folded', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql'
            ? {
                status: 502,
                body: {
                  message: 'a \r\n\r\n  b\rc\u{2028}d\u{85}e\vf\tg  h\u{2029}',
                },
              }
            : undefined,
        'token',
      );

      assert.isTrue(
        (read.unread?.because ?? '').endsWith(': a; b; c; d; e; f g h'),
      );
    });

    test('cuts a long reason short by character, the ellipsis within the bound', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql'
            ? { status: 502, body: { message: '😀'.repeat(400) } }
            : undefined,
        'token',
      );

      const because = read.unread?.because ?? '';

      assert.isTrue(because.endsWith('😀…'));

      assert.lengthOf(Array.from(because), 300);
    });

    test('cuts before a space without leaving it before the ellipsis', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql'
            ? { status: 502, body: { message: 'x '.repeat(400) } }
            : undefined,
        'token',
      );

      assert.isTrue((read.unread?.because ?? '').endsWith('x…'));
    });

    test('cuts after a separator without leaving it before the ellipsis', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql'
            ? { status: 502, body: { message: 'x\n'.repeat(400) } }
            : undefined,
        'token',
      );

      assert.isTrue((read.unread?.because ?? '').endsWith('x…'));
    });

    test('keeps a joined emoji sequence whole, and folds a long run of spaces', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql'
            ? {
                status: 502,
                body: {
                  message: `👨\u{200D}👩\u{200D}👧${' '.repeat(200_000)}end`,
                },
              }
            : undefined,
        'token',
      );

      assert.isTrue(
        (read.unread?.because ?? '').endsWith('👨\u{200D}👩\u{200D}👧 end'),
      );
    });

    test('cuts a reason of many lines short', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql'
            ? { status: 502, body: { message: 'field\n'.repeat(200_000) } }
            : undefined,
        'token',
      );

      assert.isTrue((read.unread?.because ?? '').endsWith('field…'));
    });

    test('keeps a reason of exactly the bound whole, and cuts one past it', async () => {
      const opening = REFUSAL_OPENING;

      const whole = await reasonOf(300 - opening.length);

      assert.strictEqual(
        whole,
        `${opening}${'😀'.repeat(300 - opening.length)}`,
      );

      const cut = await reasonOf(301 - opening.length);

      assert.isTrue(cut.endsWith('😀…'));

      assert.lengthOf(Array.from(cut), 300);
    });

    test('keeps whole a reason of fewer characters than the bound, though more UTF-16 units', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql'
            ? { status: 502, body: { message: '😀'.repeat(200) } }
            : undefined,
        'token',
      );

      assert.isTrue((read.unread?.because ?? '').endsWith('😀'.repeat(200)));
    });

    test('names a pull request whose list GraphQL cut short', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql'
            ? {
                body: closingIssuesPage({
                  numbers: [1],
                  linkedTo: Array.from(Arr.range(asUint32(1), asUint32(101))),
                  endCursor: undefined,
                  totalCount: 101,
                }),
              }
            : undefined,
        'token',
      );

      assert.deepStrictEqual(read, { unread: undefined, truncated: [1] });
    });

    test('leaves out a pull request cut short that the open list does not have', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql'
            ? {
                body: closingIssuesPage({
                  numbers: [1, 2],
                  linkedTo: [],
                  endCursor: undefined,
                  totalCount: 101,
                }),
              }
            : undefined,
        'token',
      );

      assert.deepStrictEqual(read.truncated, [1]);
    });

    test('names the pull requests as unread, without a token hint, when the GraphQL rate limit is spent', async () => {
      const github = await fakeGitHub(rateLimitedAt('/graphql'));

      // With the checks, whose REST reads all succeed: the report stands.
      const facts = await createClient('token', github.baseUrl).facts(repo, {
        checks: true,
      });

      await github.close();

      assert.isTrue(Result.isOk(facts));

      assert.deepStrictEqual(facts.value.handLinks.unread?.pulls, [1]);

      assert.include(
        facts.value.handLinks.unread?.because,
        'The GraphQL rate limit',
      );

      assert.notInclude(facts.value.handLinks.unread?.because, 'GH_TOKEN');
    });

    test('names the pull requests as unread, and why, when a secondary rate limit refuses GraphQL', async () => {
      const read = await handLinksFrom(
        (request) =>
          request.url === '/graphql'
            ? {
                status: 403,
                headers: { 'retry-after': '60' },
                body: {
                  message: 'You have exceeded a secondary rate limit.',
                },
              }
            : undefined,
        'token',
      );

      assert.deepStrictEqual(read.unread?.pulls, [1]);

      assert.include(read.unread?.because, 'secondary rate limit');
    });

    test('asks as many requests for each open pull request as the help counts', async () => {
      const one = await requestsWithOpen([1]);

      const two = await requestsWithOpen([1, 2]);

      assert.strictEqual(two - one, REQUESTS_PER_PULL_WITH_CHECKS);
    });

    test.each([
      { token: undefined, advice: 'set GH_TOKEN or GITHUB_TOKEN' },
      { token: 'a-token', advice: 'resets within the hour' },
    ] as const)(
      'fails the report, advising $advice, when a check read spends the REST limit',
      async ({ token, advice }) => {
        const github = await fakeGitHub(rateLimitedAt('/check-runs'));

        const facts = await createClient(token, github.baseUrl).facts(repo, {
          checks: true,
        });

        await github.close();

        assert.isTrue(Result.isErr(facts));

        assert.include(facts.value, 'commit counts and check verdicts');

        assert.include(facts.value, 'The rate limit is spent');

        assert.include(facts.value, advice);

        assert.notInclude(
          facts.value,
          token === undefined ? 'resets within the hour' : 'GH_TOKEN',
        );
      },
    );

    test.each([
      { token: undefined, advice: 'set GH_TOKEN or GITHUB_TOKEN' },
      { token: 'a-token', advice: 'resets within the hour' },
    ] as const)(
      'names the open list, advising $advice, when it spends the limit with checks off',
      async ({ token, advice }) => {
        const github = await fakeGitHub(rateLimitedAt('/pulls?state=open'));

        const facts = await createClient(token, github.baseUrl).facts(repo, {
          checks: false,
        });

        await github.close();

        assert.isTrue(Result.isErr(facts));

        assert.include(facts.value, '/pulls?state=open');

        assert.include(facts.value, 'The rate limit is spent');

        assert.include(facts.value, advice);

        assert.notInclude(facts.value, 'check verdicts');

        assert.notInclude(
          facts.value,
          token === undefined ? 'resets within the hour' : 'GH_TOKEN',
        );
      },
    );
  });

  describe('a REST rate limit spent after the open pull requests are read', () => {
    test.each([
      {
        reader: 'issues',
        refused: '/issues/5/dependencies/blocked_by',
        read: async (client: Client) => {
          await client.issues(repo, 10);
        },
      },
      {
        reader: 'issueBodies',
        refused: '/issues/7/dependencies/blocked_by',
        read: async (client: Client) => {
          await client.issueBodies(repo, [7]);
        },
      },
      {
        reader: 'references',
        refused: '/issues/9',
        read: async (client: Client) => {
          await client.references(repo, [9]);
        },
      },
      {
        reader: 'queueComments',
        refused: '/issues/1/comments',
        read: async (client: Client) => {
          const facts = await client.facts(repo, { checks: false });

          assert.isTrue(Result.isOk(facts));

          await client.queueComments(repo, 'main', facts.value.pulls);
        },
      },
    ] as const)(
      'is reported after $reader is refused by it, not taken as nothing there',
      async ({ refused, read }) => {
        const github = await fakeGitHub(
          withBlockedIssues(rateLimitedAt(refused)),
        );

        const client = createClient('token', github.baseUrl);

        assert.isUndefined(client.restRateLimitSpent());

        await read(client);

        await github.close();

        const spent = client.restRateLimitSpent();

        assert.isDefined(spent);

        assert.include(spent, 'The rate limit is spent');

        assert.include(spent, 'resets within the hour');
      },
    );

    // The control for the test above: a refusal that is not the rate limit is
    // what each reader takes as nothing there.
    test('is not reported after a refusal that is not the rate limit', async () => {
      const github = await fakeGitHub(
        withBlockedIssues(({ url }) =>
          url.includes('/issues/9')
            ? { status: 404, body: { message: 'Not Found' } }
            : undefined,
        ),
      );

      const client = createClient('token', github.baseUrl);

      const references = await client.references(repo, [9]);

      await github.close();

      assert.strictEqual(references.size, 0);

      assert.isUndefined(client.restRateLimitSpent());
    });
  });

  describe('the queue comments', () => {
    test('are not asked for without a token, so a quota spent on them fails nothing', async () => {
      const github = await fakeGitHub(rateLimitedAt('/user'));

      const client = createClient(undefined, github.baseUrl);

      const facts = await client.facts(repo, { checks: false });

      assert.isTrue(Result.isOk(facts));

      const asked = github.requested.length;

      const read = await client.queueComments(repo, 'main', facts.value.pulls);

      await github.close();

      assert.strictEqual(read.size, 0);

      assert.strictEqual(github.requested.length, asked);

      assert.isUndefined(client.restRateLimitSpent());
    });

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

      const read = await client.queueComments(repo, 'main', facts.value.pulls);

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
                          totalCount: answers.linked.length,
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
    linkedIssues: facts.value.pulls.flatMap(({ linkedIssues }) => linkedIssues),
    requested: github.requested,
  };
};

/**
 * What `facts` says of the links GitHub holds, read with `{ checks: false }`
 * from a fake GitHub that answers `routes`.
 */
const handLinksFrom = async (
  routes: FakeRoutes,
  token: string | undefined,
): Promise<HandLinks> => {
  const github = await fakeGitHub(routes);

  const facts = await createClient(token, github.baseUrl).facts(repo, {
    checks: false,
  });

  await github.close();

  assert.isTrue(Result.isOk(facts));

  return facts.value.handLinks;
};

/** What a 502 from GraphQL opens its reason with, before the message. */
const REFUSAL_OPENING = '/graphql answered 502 Bad Gateway: ';

/** The reason `facts` gives when GraphQL answers 502 with `count` emoji. */
const reasonOf = async (count: number): Promise<string> => {
  const read = await handLinksFrom(
    (request) =>
      request.url === '/graphql'
        ? { status: 502, body: { message: '😀'.repeat(count) } }
        : undefined,
    'token',
  );

  return read.unread?.because ?? '';
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
  totalCount = linkedTo.length,
}: Readonly<{
  numbers: readonly number[];
  linkedTo: readonly number[];
  endCursor: string | undefined;
  /** How many each links in all, more than `linkedTo` for a list cut short. */
  totalCount?: number;
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
              totalCount,
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

/** Routes that refuse every request whose path holds `route`, as rate-limited. */
const rateLimitedAt =
  (route: string): FakeRoutes =>
  ({ url }) =>
    url.includes(route)
      ? ({
          status: 403,
          headers: { 'x-ratelimit-remaining': '0' },
          body: { message: 'API rate limit exceeded' },
        } as const)
      : undefined;

/**
 * `routes`, and then #5, the one open issue, and #7, an issue the open list
 * leaves out, each blocked by one issue that `routes` may refuse.
 */
const withBlockedIssues =
  (routes: FakeRoutes): FakeRoutes =>
  (request) => {
    const answered = routes(request);

    if (answered !== undefined) {
      return answered;
    }

    const blocked = {
      issue_dependencies_summary: { total_blocked_by: 1 },
    } as const;

    return request.url.includes('/issues?state=open')
      ? { body: [fakeIssue(blocked)] }
      : request.url.endsWith('/issues/7')
        ? { body: fakeIssue({ number: 7, ...blocked }) }
        : undefined;
  };

/**
 * How many requests `facts`, reading checks, asks with the open pull requests
 * `numbers`, each on a head of its own; the read must succeed.
 */
const requestsWithOpen = async (
  numbers: readonly (1 | 2)[],
): Promise<number> => {
  const github = await fakeGitHub(({ url }) =>
    url.includes('/pulls?state=open')
      ? {
          body: numbers.map((number) =>
            fakePullRequest({
              number,
              head: {
                ref: `b${number}`,
                sha: (number === 1 ? 'a' : 'b').repeat(40),
                repo: { full_name: `${FAKE_REPO.owner}/${FAKE_REPO.name}` },
              },
            }),
          ),
        }
      : undefined,
  );

  try {
    const facts = await createClient(undefined, github.baseUrl).facts(repo, {
      checks: true,
    });

    assert.isTrue(Result.isOk(facts));

    return github.requested.length;
  } finally {
    await github.close();
  }
};
