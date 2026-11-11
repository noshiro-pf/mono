import {
  ok,
  recordedTransport,
  status,
  writePullRequestClaimComment,
  writeReleasedPullRequestClaimComment,
  writeSetAsideComment,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
import {
  HEAD,
  PULL_7,
  routes,
  TIP,
  type Routes,
} from '../../../test/index.mjs';
import type { ClaimWorld } from '../../github/index.mjs';
import { claimPr } from './main.mjs';
import type { ClaimPrOptions } from './options.mjs';

const NOW = Date.parse('2026-11-10T00:00:00Z');

const COMMENTS = '/repos/o/n/issues/7/comments?per_page=100';

const OPTIONS: ClaimPrOptions = {
  number: 7,
  by: 'session-a',
  release: false,
  repo: 'o/n',
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

const claimOf = (id: number, by: string): UnknownRecord =>
  commentOf(
    id,
    writePullRequestClaimComment(
      { headSha: HEAD, by, at: '2026-11-10T00:00:00Z' },
      'Being fixed.',
    ),
  );

const run = async (
  overrides: Routes,
  options: ClaimPrOptions = OPTIONS,
): Promise<
  Readonly<{
    result: Result<string, string>;
    sent: readonly string[];
    /**
     * The reads under the repository, the session's own (the repository itself,
     * `/user`) aside.
     */
    repoReads: readonly string[];
  }>
> => {
  const { transport, sent } = recordedTransport({ ...routes, ...overrides });

  const world: ClaimWorld = {
    transport,
    env: { GH_TOKEN: 'token' },
    originUrl: () => Promise.resolve(undefined),
    manifestUrl: () => Promise.resolve(undefined),
    ghAuthToken: () => Promise.resolve(Result.err('no gh')),
    nowEpochMs: () => NOW,
    sleep: () => Promise.resolve(),
  } as const;

  const result = await claimPr(options, world);

  const requests = sent.map(({ method, url }) => ({
    method,
    path: url.replace('https://api.github.com', ''),
  }));

  return {
    result,
    sent: requests
      .filter(({ method }) => method !== 'GET')
      .map(({ method, path }) => `${method} ${path}`),
    repoReads: requests
      .filter(
        ({ method, path }) =>
          method === 'GET' && path.startsWith(`/repos/${options.repo}/`),
      )
      .map(({ path }) => path),
  };
};

describe(claimPr, () => {
  test('claims one set aside for the skill, and reads the claim back', async () => {
    const { result, sent } = await run({
      [COMMENTS]: [
        ok([SET_ASIDE]),
        ok([SET_ASIDE]),
        ok([SET_ASIDE, claimOf(2, 'session-a')]),
      ],
      'POST /repos/o/n/issues/7/comments': ok({ id: 2 }),
    });

    assert.deepStrictEqual(
      result,
      Result.ok(
        `#7 claimed by session-a at ${HEAD}, until it is pushed or 2026-11-10T02:00:00Z.`,
      ),
    );

    assert.deepStrictEqual(sent, ['POST /repos/o/n/issues/7/comments']);
  });

  test('refuses one the worker owns, writing nothing', async () => {
    const { result, sent } = await run({ [COMMENTS]: ok([]) });

    assert.deepStrictEqual(
      result,
      Result.err(
        "#7 not claimed: it is the worker's (in the queue; the worker picks it in its turn), not a skill's.",
      ),
    );

    assert.deepStrictEqual(sent, []);
  });

  test('refuses one that is not open, or no pull request, reading it alone', async () => {
    const runs = await Promise.all(
      [
        ok({ state: 'closed', head: { sha: HEAD } }),
        status(404, 'Not Found'),
      ].map(async (answer) =>
        run({ '/repos/o/n/pulls/8': answer }, { ...OPTIONS, number: 8 }),
      ),
    );

    assert.deepStrictEqual(
      runs.map(({ result }) => result),
      [
        Result.err('#8 is not an open pull request.'),
        Result.err('#8 is not a pull request.'),
      ],
    );

    for (const { sent, repoReads } of runs) {
      assert.deepStrictEqual(sent, []);

      assert.deepStrictEqual(repoReads, ['/repos/o/n/pulls/8']);
    }
  });

  test('says a failed read of the pull request, and reads no more', async () => {
    const { result, repoReads } = await run({
      '/repos/o/n/pulls/7': status(502, 'down'),
    });

    assert.isTrue(Result.isErr(result));

    assert.match(result.value, /^cannot read #7 \(unavailable\): 502/u);

    assert.deepStrictEqual(repoReads, ['/repos/o/n/pulls/7']);
  });

  test('loses to an older claim written at the same time, deleting nothing', async () => {
    const { result, sent } = await run({
      [COMMENTS]: [
        ok([SET_ASIDE]),
        ok([SET_ASIDE]),
        ok([SET_ASIDE, claimOf(2, 'session-b'), claimOf(3, 'session-a')]),
      ],
      'POST /repos/o/n/issues/7/comments': ok({ id: 3 }),
    });

    assert.deepStrictEqual(
      result,
      Result.err(
        '#7 not claimed: session-b claimed it at 2026-11-10T00:00:00Z.',
      ),
    );

    assert.deepStrictEqual(sent, ['POST /repos/o/n/issues/7/comments']);
  });

  test('refuses a claim written while the queue was read, writing nothing', async () => {
    const { result, sent } = await run({
      [COMMENTS]: [ok([SET_ASIDE]), ok([SET_ASIDE, claimOf(2, 'session-b')])],
    });

    assert.deepStrictEqual(
      result,
      Result.err(
        '#7 not claimed: session-b claimed it at 2026-11-10T00:00:00Z.',
      ),
    );

    assert.deepStrictEqual(sent, []);
  });

  test('says how to settle a claim whose read-back failed', async () => {
    const { result, sent } = await run({
      [COMMENTS]: [ok([SET_ASIDE]), ok([SET_ASIDE]), status(502, 'down')],
      'POST /repos/o/n/issues/7/comments': ok({ id: 2 }),
    });

    assert.isTrue(Result.isErr(result));

    assert.match(
      result.value,
      /^#7: the claim did not read back \(.+\); nothing more was done\. Comment 2, if it is still there, may hold the claim: a rerun with the same claimant settles it once the comment shows, and so does --release\.$/u,
    );

    assert.deepStrictEqual(sent, ['POST /repos/o/n/issues/7/comments']);
  });

  test('takes a read-back that names no record, or a newer one, as unsettled', async () => {
    const runs = await Promise.all(
      [[SET_ASIDE], [SET_ASIDE, claimOf(3, 'session-b')]].map(async (read) =>
        run({
          [COMMENTS]: [
            ok([SET_ASIDE]),
            ok([SET_ASIDE]),
            ok([SET_ASIDE]),
            ok(read),
          ],
          'POST /repos/o/n/issues/7/comments': ok({ id: 2 }),
        }),
      ),
    );

    for (const { result } of runs) {
      assert.deepStrictEqual(
        result,
        Result.err(
          '#7: the claim did not read back (the comments read did not show it); nothing more was done. Comment 2, if it is still there, may hold the claim: a rerun with the same claimant settles it once the comment shows, and so does --release.',
        ),
      );
    }
  });

  test('says the pull request moved even when the comments read lag', async () => {
    const moved = 'd'.repeat(40);

    const runs = await Promise.all(
      [
        ok({ state: 'open', head: { sha: moved } }),
        ok({ state: 'closed', head: { sha: HEAD } }),
      ].map(async (answer) =>
        run({
          [COMMENTS]: ok([SET_ASIDE]),
          '/repos/o/n/pulls/7': [ok(PULL_7), ok(PULL_7), ok(PULL_7), answer],
          'POST /repos/o/n/issues/7/comments': ok({ id: 2 }),
        }),
      ),
    );

    assert.deepStrictEqual(
      runs.map(({ result }) => result),
      [
        Result.err(`#7 not claimed: its head moved to ${moved} meanwhile.`),
        Result.err('#7 not claimed: it is no longer open.'),
      ],
    );
  });

  test('says a claim released meanwhile is no refusal', async () => {
    const { result } = await run({
      [COMMENTS]: [
        ok([SET_ASIDE]),
        ok([SET_ASIDE]),
        ok([
          SET_ASIDE,
          commentOf(2, writeReleasedPullRequestClaimComment('Given up.')),
        ]),
      ],
      'POST /repos/o/n/issues/7/comments': ok({ id: 2 }),
    });

    assert.deepStrictEqual(
      result,
      Result.err(
        '#7: the claim was released meanwhile; nothing more was done, and a rerun claims it again.',
      ),
    );
  });

  test('names the time the record lapses, when an older one of its own is it', async () => {
    const { result } = await run({
      [COMMENTS]: [
        ok([SET_ASIDE]),
        ok([SET_ASIDE]),
        ok([
          SET_ASIDE,
          commentOf(
            2,
            writePullRequestClaimComment(
              { headSha: HEAD, by: 'session-a', at: '2026-11-09T23:30:00Z' },
              'Being fixed.',
            ),
          ),
          claimOf(3, 'session-a'),
        ]),
      ],
      'POST /repos/o/n/issues/7/comments': ok({ id: 3 }),
    });

    assert.deepStrictEqual(
      result,
      Result.ok(
        `#7 claimed by session-a at ${HEAD}, until it is pushed or 2026-11-10T01:30:00Z.`,
      ),
    );
  });

  test('releases its own claim in place, open or closed', async () => {
    const runs = await Promise.all(
      [ok(PULL_7), ok({ state: 'closed', head: { sha: HEAD } })].map(
        async (pull) =>
          run(
            {
              '/repos/o/n/pulls/7': pull,
              [COMMENTS]: ok([SET_ASIDE, claimOf(2, 'session-a')]),
              'PATCH /repos/o/n/issues/comments/2': ok({ id: 2 }),
            },
            { ...OPTIONS, release: true },
          ),
      ),
    );

    for (const { result, sent } of runs) {
      assert.deepStrictEqual(result, Result.ok('#7: claim released.'));

      assert.deepStrictEqual(sent, ['PATCH /repos/o/n/issues/comments/2']);
    }
  });

  // Which answers mean no pull request (404, 410) is `readPullRequestState`'s
  // test in pr-report-core-v2; the commands branch on its `none` alone.
  test('releases nothing on a number that names no pull request, reading no comments', async () => {
    const { result, sent, repoReads } = await run(
      {
        '/repos/o/n/pulls/8': status(404, 'Not Found'),
        // Tripwires: its own claim comment on the issue, and the write that
        // would release it, answer should a regression read or write them.
        '/repos/o/n/issues/8/comments?per_page=100': ok([
          claimOf(2, 'session-a'),
        ]),
        'PATCH /repos/o/n/issues/comments/2': ok({ id: 2 }),
      },
      { ...OPTIONS, number: 8, release: true },
    );

    assert.deepStrictEqual(result, Result.err('#8 is not a pull request.'));

    assert.deepStrictEqual(sent, []);

    assert.deepStrictEqual(repoReads, ['/repos/o/n/pulls/8']);
  });

  test('has nothing to release of someone else’s', async () => {
    const { result, sent } = await run(
      { [COMMENTS]: ok([SET_ASIDE, claimOf(2, 'session-b')]) },
      { ...OPTIONS, release: true },
    );

    assert.deepStrictEqual(
      result,
      Result.ok('#7: session-a holds no claim on it.'),
    );

    assert.deepStrictEqual(sent, []);
  });
});
