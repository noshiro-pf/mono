import {
  ok,
  recordedTransport,
  status,
  writePullRequestClaimComment,
  writeSetAsideComment,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
import {
  checksOf,
  HEAD,
  PULL_7,
  routes,
  TIP,
  type Routes,
} from '../../../test/index.mjs';
import type { Config } from '../../config/index.mjs';
import { pushFixedPr, type PushFixedPrWorld } from './main.mjs';
import type { PushFixedPrOptions } from './options.mjs';

const NOW = Date.parse('2026-11-10T00:30:00Z');

const FIX = 'a'.repeat(40);

const HEAD_8 = '8'.repeat(40);

const COMMENTS = '/repos/o/n/issues/7/comments?per_page=100';

const OPTIONS: PushFixedPrOptions = {
  number: 7,
  by: 'session-a',
  head: 'aaaaaaa',
} as const;

const commentOf = (id: number, body: string): UnknownRecord =>
  ({ id, body, user: { login: 'me' }, created_at: '' }) as const;

const SET_ASIDE = commentOf(
  1,
  writeSetAsideComment(
    { reason: 'checks-failed', headSha: HEAD, baseSha: TIP },
    'Set aside.',
  ),
);

const claimOf = (id: number, by: string, headSha = HEAD): UnknownRecord =>
  commentOf(
    id,
    writePullRequestClaimComment(
      { headSha, by, at: '2026-11-10T00:00:00Z' },
      'Being fixed.',
    ),
  );

/** #7 set aside and claimed by session-a, unless `overrides` says otherwise. */
const CLAIMED: Routes = {
  [COMMENTS]: ok([SET_ASIDE, claimOf(2, 'session-a')]),
} as const;

const HEAD_9 = '9'.repeat(40);

/** Pull request `number` at `headSha`, on `baseRef`, claimed by `by` when given. */
const layerRoutes = (
  number: number,
  baseRef: string,
  headSha: string,
  by?: string,
): Routes =>
  ({
    [`/repos/o/n/pulls/${number}`]: ok({
      ...PULL_7,
      number,
      body: '',
      body_html: '',
      html_url: `https://github.com/o/n/pull/${number}`,
      head: {
        ref: `feature-${number}`,
        sha: headSha,
        repo: { full_name: 'o/n' },
      },
      base: { ref: baseRef },
    }),
    ...checksOf(headSha),
    [`/repos/o/n/commits/${headSha}`]: ok({
      commit: { committer: { date: '2026-11-02T00:00:00Z' } },
    }),
    [`/repos/o/n/compare/main...${headSha}`]: ok({ ahead_by: 2, behind_by: 2 }),
    [`/repos/o/n/pulls/${number}/reviews?per_page=100`]: ok([]),
    [`/repos/o/n/pulls/${number}/files?per_page=100`]: ok([]),
    [`/repos/o/n/activity?ref=refs%2Fheads%2Ffeature-${number}&activity_type=push&direction=asc&per_page=100`]:
      ok([]),
    [`/repos/o/n/issues/${number}/comments?per_page=100`]: ok(
      by === undefined ? [] : [claimOf(number * 10, by, headSha)],
    ),
  }) as const;

/** The open pull requests: #7 and those given. */
const openPulls = (...numbers: readonly number[]): Routes =>
  ({
    '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100': ok(
      Arr.toUnshifted(7)(numbers).map((number) => ({ number })),
    ),
  }) as const;

/** #8, stacked on #7's branch and claimed by `by` when given. */
const stackedOn7 = (by?: string): Routes =>
  ({
    ...openPulls(8),
    ...layerRoutes(8, 'feature', HEAD_8, by),
  }) as const;

const run = async (
  overrides: Routes,
  world: Partial<PushFixedPrWorld> = {},
  options: PushFixedPrOptions = OPTIONS,
): Promise<
  Readonly<{
    result: Result<string, string>;
    sent: readonly string[];
    git: readonly string[];
  }>
> => {
  const { transport, sent } = recordedTransport({
    ...routes,
    ...CLAIMED,
    ...overrides,
  });

  const mut_git: string[] = [];

  const result = await pushFixedPr(options, {
    transport,
    env: { GH_TOKEN: 'token' },
    originUrl: () => Promise.resolve('https://github.com/o/n.git'),
    manifestUrl: () => Promise.resolve(undefined),
    ghAuthToken: () => Promise.resolve(Result.err('no gh')),
    nowEpochMs: () => NOW,
    readConfig: () => Promise.resolve(Result.ok(undefined)),
    git: {
      resolveCommit: (revision) =>
        Promise.resolve(FIX.startsWith(revision) ? FIX : undefined),
      pushLeased: ({ branch, sha, lease }) => {
        mut_git.push(
          `push ${branch} ${sha.slice(0, 1)} lease ${lease.slice(0, 1)}`,
        );

        return Promise.resolve(Result.ok('pushed'));
      },
      restack: ({ branch, to }, layers) => {
        mut_git.push(
          `restack ${layers.map(({ number }) => `#${number}`).join(',')} onto ${branch} ${to.slice(0, 1)}`,
        );

        return Promise.resolve(
          layers.map(({ number }) => ({
            number,
            kind: 'restacked',
            head: 'e'.repeat(40),
          })),
        );
      },
    },
    ...world,
  });

  return {
    result,
    sent: sent
      .filter(({ method }) => method !== 'GET')
      .map(
        ({ method, url }) =>
          `${method} ${url.replace('https://api.github.com', '')}`,
      ),
    git: mut_git,
  };
};

describe(pushFixedPr, () => {
  test('puts skip-ci on, pushes the fix leased against the claimed head, and restacks', async () => {
    const { result, sent, git } = await run({
      ...stackedOn7(),
      '/repos/o/n/issues/7/labels': ok([]),
      'POST /repos/o/n/issues/7/labels': ok([]),
    });

    assert.deepStrictEqual(
      result,
      Result.ok(
        [
          `#7: pushed ${FIX.slice(0, 10)} under skip-ci; it is the worker's again.`,
          '#8: restacked at eeeeeeeeee.',
        ].join('\n'),
      ),
    );

    assert.deepStrictEqual(sent, ['POST /repos/o/n/issues/7/labels']);

    assert.deepStrictEqual(git, [
      'push feature a lease b',
      'restack #8 onto feature a',
    ]);
  });

  test('leaves a layer its own claim holds on, saying what to do', async () => {
    const { result, git } = await run({
      ...stackedOn7('session-a'),
      'POST /repos/o/n/issues/7/labels': ok([]),
    });

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain(
      `#8: not restacked — session-a's own claim holds on it; move it before fixing it: git rebase --onto ${FIX} ${HEAD} ${HEAD_8}`,
    );

    assert.deepStrictEqual(git, [
      'push feature a lease b',
      'restack  onto feature a',
    ]);
  });

  test('gives a layer of its own claim two levels up the rebase onto the restacked layer below', async () => {
    const { result, git } = await run({
      ...openPulls(8, 9),
      ...layerRoutes(8, 'feature', HEAD_8),
      ...layerRoutes(9, 'feature-8', HEAD_9, 'session-a'),
      'POST /repos/o/n/issues/7/labels': ok([]),
    });

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain(
      `#9: not restacked — session-a's own claim holds on it; move it before fixing it: git rebase --onto ${'e'.repeat(40)} ${HEAD_8} ${HEAD_9}`,
    );

    assert.deepStrictEqual(git, [
      'push feature a lease b',
      'restack #8 onto feature a',
    ]);
  });

  test('tells a layer of its own claim on a layer not moved to follow it', async () => {
    const { result } = await run({
      ...openPulls(8, 9),
      ...layerRoutes(8, 'feature', HEAD_8, 'session-b'),
      ...layerRoutes(9, 'feature-8', HEAD_9, 'session-a'),
      'POST /repos/o/n/issues/7/labels': ok([]),
    });

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain(
      `#9: not restacked — session-a's own claim holds on it, and this push did not move the layer it is on, feature-8; before pushing a fix, move it onto where that is by then (main, once it has merged): git rebase --onto TARGET ${HEAD_8} ${HEAD_9}`,
    );
  });

  test('gives each of two stacked layers of its own claim its rebase', async () => {
    const { result } = await run({
      ...openPulls(8, 9),
      ...layerRoutes(8, 'feature', HEAD_8, 'session-a'),
      ...layerRoutes(9, 'feature-8', HEAD_9, 'session-a'),
      'POST /repos/o/n/issues/7/labels': ok([]),
    });

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value.split('\n'), [
      `#7: pushed ${FIX.slice(0, 10)} under skip-ci; it is the worker's again.`,
      `#8: not restacked — session-a's own claim holds on it; move it before fixing it: git rebase --onto ${FIX} ${HEAD} ${HEAD_8}`,
      "#9: not restacked — session-a's own claim holds on it, and on feature-8, which session-a's claim holds too; pushing that one's fix prints this one's exact rebase.",
    ]);
  });

  test('says why the layer below a layer of its own claim was left', async () => {
    const { result } = await run(
      {
        ...openPulls(8, 9),
        ...layerRoutes(8, 'feature', HEAD_8),
        ...layerRoutes(9, 'feature-8', HEAD_9, 'session-a'),
        'POST /repos/o/n/issues/7/labels': ok([]),
      },
      {
        git: {
          resolveCommit: () => Promise.resolve(FIX),
          pushLeased: () => Promise.resolve(Result.ok('pushed')),
          restack: () =>
            Promise.resolve([
              { number: 8, kind: 'left', reason: 'the rebase conflicted' },
            ]),
        },
      },
    );

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain(
      `#9: not restacked — session-a's own claim holds on it, and this push did not move the layer it is on, feature-8 (not restacked: the rebase conflicted); before pushing a fix, move it onto where that is by then (main, once it has merged): git rebase --onto TARGET ${HEAD_8} ${HEAD_9}`,
    );
  });

  test('leaves a layer whose comments are unread, and gives one of its own claim on it its head as read', async () => {
    const { result, git } = await run({
      ...openPulls(8, 9),
      ...layerRoutes(8, 'feature', HEAD_8),
      '/repos/o/n/issues/8/comments?per_page=100': status(500, 'Server Error'),
      ...layerRoutes(9, 'feature-8', HEAD_9, 'session-a'),
      'POST /repos/o/n/issues/7/labels': ok([]),
    });

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(
      result.value.split('\n').filter((line) => !line.startsWith('#7')),
      [
        `#9: not restacked — session-a's own claim holds on it, and this push did not move the layer it is on, feature-8; before pushing a fix, move it onto where that is by then (main, once it has merged): git rebase --onto TARGET ${HEAD_8} ${HEAD_9}`,
        '#8: not restacked — its comments could not be read, so whether someone claimed it is not known.',
      ],
    );

    assert.deepStrictEqual(git, [
      'push feature a lease b',
      'restack  onto feature a',
    ]);
  });

  test('leaves a layer someone else claimed', async () => {
    const { result, git } = await run({
      ...stackedOn7('session-b'),
      'POST /repos/o/n/issues/7/labels': ok([]),
    });

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain('#8: not restacked — session-b claimed it.');

    assert.deepStrictEqual(git, [
      'push feature a lease b',
      'restack  onto feature a',
    ]);
  });

  test.each([
    [
      'a commit not here',
      {},
      { ...OPTIONS, head: 'bbbbbbb' },
      'bbbbbbb is not a commit here.',
    ],
    [
      'one claimed by someone else',
      { [COMMENTS]: ok([SET_ASIDE, claimOf(2, 'session-b')]) },
      OPTIONS,
      '#7 not pushed: session-a holds no claim on it at its head; claim it first (claim-pr).',
    ],
    [
      "the worker's",
      { [COMMENTS]: ok([]) },
      OPTIONS,
      "#7 not pushed: it is the worker's (in the queue; the worker picks it in its turn), not a skill's.",
    ],
  ] as const)(
    'refuses %s, writing nothing',
    async (_, overrides, options, message) => {
      const { result, sent, git } = await run(overrides, {}, options);

      assert.deepStrictEqual(result, Result.err(message));

      assert.deepStrictEqual([sent, git], [[], []]);
    },
  );

  test('refuses a hand-resolved conflict on a generated branch, naming its rebuild', async () => {
    const config: Config = {
      autoFix: undefined,
      generatedBranches: [{ branch: 'feature', rebuild: 'pnpm run rebuild' }],
      translation: undefined,
      openingHeading: undefined,
      regenerate: undefined,
      speculate: undefined,
    } as const;

    const { result, git } = await run(
      {
        [COMMENTS]: ok([
          commentOf(
            1,
            writeSetAsideComment(
              { reason: 'rebase-failed', headSha: HEAD, baseSha: TIP },
              'Set aside.',
            ),
          ),
          claimOf(2, 'session-a'),
        ]),
      },
      { readConfig: () => Promise.resolve(Result.ok(config)) },
    );

    assert.deepStrictEqual(
      result,
      Result.err(
        '#7 not pushed: feature is generated, so a conflict on it is resolved by building it again: pnpm run rebuild.',
      ),
    );

    assert.deepStrictEqual(git, []);
  });

  test('pushes nothing when skip-ci cannot go on first', async () => {
    const { result, git } = await run({
      'POST /repos/o/n/issues/7/labels': status(403, 'Forbidden'),
    });

    assert.isTrue(Result.isErr(result));

    expect(result.value).toMatch(
      /^#7 not pushed: cannot put skip-ci on it first, and without it the push runs the matrix: /u,
    );

    assert.deepStrictEqual(git, []);
  });

  test('says when someone pushed since the claim, restacking nothing', async () => {
    const { result, git } = await run(
      { 'POST /repos/o/n/issues/7/labels': ok([]) },
      {
        git: {
          resolveCommit: () => Promise.resolve(FIX),
          pushLeased: () => Promise.resolve(Result.ok('moved')),
          restack: () => {
            throw new Error('not restacked');
          },
        },
      },
    );

    assert.deepStrictEqual(
      result,
      Result.err(
        '#7: someone pushed to feature since it was claimed; throw the work away and survey again.',
      ),
    );

    assert.deepStrictEqual(git, []);
  });
});
