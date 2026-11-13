import type { LinkedIssue } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import {
  FAKE_REPO,
  fakeGitHub,
  fakePullRequest,
  type FakeRoutes,
} from '../../test/index.mjs';
import { createClient } from './github.mjs';

describe(createClient, () => {
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
