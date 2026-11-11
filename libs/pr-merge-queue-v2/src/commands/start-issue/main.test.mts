import {
  ok,
  recordedTransport,
  status,
  writeReleasedIssueClaimComment,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
import type { ClaimWorld } from '../../github/index.mjs';
import { startIssue } from './main.mjs';
import type { StartIssueOptions } from './options.mjs';

type Routes = Parameters<typeof recordedTransport>[0];

const NOW = Date.parse('2026-11-10T12:00:00Z');

const ISSUE = '/repos/o/n/issues/5';

const COMMENTS = '/repos/o/n/issues/5/comments?per_page=100';

const PULLS =
  '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100';

const OPTIONS: StartIssueOptions = {
  number: 5,
  by: 'me',
  mode: 'start',
  force: false,
  repo: 'o/n',
} as const;

const issue = (...labels: readonly string[]): ReturnType<typeof ok> =>
  ok({
    state: 'open',
    labels: labels.map((name) => ({ name, color: '', description: null })),
  });

const comment = (id: number, by: string, state = 'started'): UnknownRecord =>
  ({
    id,
    body: `<!-- start-issue:claim state=${state} by=${by} at=2026-11-10T12:00:00Z -->\n\nx`,
    user: { login: 'bot' },
    created_at: '',
  }) as const;

const run = async (
  routes: Routes,
  options: StartIssueOptions = OPTIONS,
): Promise<
  Readonly<{
    result: Result<string, string>;
    sent: readonly string[];
    slept: readonly number[];
  }>
> => {
  const { transport, sent } = recordedTransport({
    '/user': ok({ login: 'bot' }),
    '/repos/o/n': ok({ full_name: 'o/n', default_branch: 'main' }),
    ...routes,
  });

  const mut_slept: number[] = [];

  const world: ClaimWorld = {
    transport,
    env: { GH_TOKEN: 'token' },
    originUrl: () => Promise.resolve(undefined),
    manifestUrl: () => Promise.resolve(undefined),
    ghAuthToken: () => Promise.resolve(Result.err('no gh')),
    nowEpochMs: () => NOW,
    sleep: (ms) => {
      mut_slept.push(ms);

      return Promise.resolve();
    },
  } as const;

  const result = await startIssue(options, world);

  return {
    result,
    sent: sent
      .filter(({ method }) => method !== 'GET')
      .map(({ method, url, body }) =>
        `${method} ${url.replace('https://api.github.com', '')} ${body ?? ''}`.trim(),
      ),
    slept: mut_slept,
  };
};

describe(startIssue, () => {
  test('claims, reads the claim back after a pause, then labels it', async () => {
    const { result, sent, slept } = await run({
      [ISSUE]: issue('planned'),
      [PULLS]: ok([]),
      [COMMENTS]: [ok([]), ok([comment(7, 'me')])],
      'POST /repos/o/n/issues/5/comments': ok({ id: 7 }),
      'DELETE /repos/o/n/issues/5/labels/planned': ok([]),
      'POST /repos/o/n/issues/5/labels': ok([]),
    });

    assert.deepStrictEqual(
      result,
      Result.ok('#5 labelled in-progress, planned taken off, started by me.'),
    );

    assert.deepStrictEqual(slept, [3000]);

    assert.deepStrictEqual(sent, [
      `POST /repos/o/n/issues/5/comments ${JSON.stringify({
        body: '<!-- start-issue:claim state=started by=me at=2026-11-10T12:00:00Z -->\n\nStarted by me. `start-issue` refuses it to anyone else until it is released or a pull request closes it.',
      })}`,
      'DELETE /repos/o/n/issues/5/labels/planned',
      'POST /repos/o/n/issues/5/labels {"labels":["in-progress"]}',
    ]);
  });

  test('writes over its own claim comment when it plans again', async () => {
    const { result, sent } = await run(
      {
        [ISSUE]: issue('planned'),
        [PULLS]: ok([]),
        [COMMENTS]: [
          ok([comment(7, 'me', 'planned')]),
          ok([comment(7, 'me', 'planned')]),
        ],
        'PATCH /repos/o/n/issues/comments/7': ok({ id: 7 }),
        'POST /repos/o/n/issues/5/labels': ok([]),
      },
      { ...OPTIONS, mode: 'plan' },
    );

    assert.deepStrictEqual(
      result,
      Result.ok(
        '#5 labelled planned, planned by me until 2026-11-11T12:00:00Z.',
      ),
    );

    assert.match(sent[0] ?? '', /^PATCH \/repos\/o\/n\/issues\/comments\/7 /u);
  });

  test('loses to an older claim written at the same time, deleting nothing', async () => {
    const { result, sent } = await run({
      [ISSUE]: issue(),
      [PULLS]: ok([]),
      [COMMENTS]: [ok([]), ok([comment(6, 'them'), comment(7, 'me')])],
      'POST /repos/o/n/issues/5/comments': ok({ id: 7 }),
    });

    assert.deepStrictEqual(
      result,
      Result.err('#5 not started: them claimed it at the same time.'),
    );

    assert.deepStrictEqual(
      sent.map((line) => line.split(' ', 2).join(' ')),
      ['POST /repos/o/n/issues/5/comments'],
    );
  });

  test('goes on when an older claim of its own, run twice at once, is the record', async () => {
    const { result, sent } = await run({
      [ISSUE]: issue(),
      [PULLS]: ok([]),
      [COMMENTS]: [ok([]), ok([comment(6, 'me'), comment(8, 'me')])],
      'POST /repos/o/n/issues/5/comments': ok({ id: 8 }),
      'POST /repos/o/n/issues/5/labels': ok([]),
    });

    assert.deepStrictEqual(
      result,
      Result.ok('#5 labelled in-progress, started by me.'),
    );

    assert.deepStrictEqual(
      sent.map((line) => line.split(' ', 2).join(' ')),
      ['POST /repos/o/n/issues/5/comments', 'POST /repos/o/n/issues/5/labels'],
    );
  });

  test('names the time a plan lapses from the record, an older one of its own', async () => {
    const { result } = await run(
      {
        [ISSUE]: issue(),
        [PULLS]: ok([]),
        [COMMENTS]: [
          ok([]),
          ok([
            {
              id: 6,
              body: '<!-- start-issue:claim state=planned by=me at=2026-11-10T06:00:00Z -->\n\nx',
              user: { login: 'bot' },
              created_at: '',
            },
            comment(7, 'me', 'planned'),
          ]),
        ],
        'POST /repos/o/n/issues/5/comments': ok({ id: 7 }),
        'POST /repos/o/n/issues/5/labels': ok([]),
      },
      { ...OPTIONS, mode: 'plan' },
    );

    assert.deepStrictEqual(
      result,
      Result.ok(
        '#5 labelled planned, planned by me until 2026-11-11T06:00:00Z.',
      ),
    );
  });

  test('loses to its own claimant’s other run without calling it a refusal', async () => {
    const { result } = await run({
      [ISSUE]: issue(),
      [PULLS]: ok([]),
      [COMMENTS]: [ok([]), ok([comment(6, 'me', 'planned'), comment(7, 'me')])],
      'POST /repos/o/n/issues/5/comments': ok({ id: 7 }),
    });

    assert.deepStrictEqual(
      result,
      Result.err(
        '#5: another run by me wrote it planned at the same time; nothing was labelled, and a rerun settles it.',
      ),
    );
  });

  test('says how to settle a claim whose read-back failed', async () => {
    const { result, sent } = await run({
      [ISSUE]: issue(),
      [PULLS]: ok([]),
      [COMMENTS]: [ok([]), status(502, 'down')],
      'POST /repos/o/n/issues/5/comments': ok({ id: 7 }),
    });

    assert.isTrue(Result.isErr(result));

    assert.match(
      result.value,
      /^#5: the claim did not read back \(.+\); nothing more was done\. Comment 7, if it is still there, may hold the claim: a rerun with the same claimant settles it once the comment shows, and so does --release\.$/u,
    );

    assert.deepStrictEqual(
      sent.map((line) => line.split(' ', 2).join(' ')),
      ['POST /repos/o/n/issues/5/comments'],
    );
  });

  test('takes a read-back that names no record, or a newer one, as no refusal', async () => {
    const runs = await Promise.all(
      [[], [comment(8, 'them')]].map(async (read) =>
        run({
          [ISSUE]: issue(),
          [PULLS]: ok([]),
          [COMMENTS]: [ok([]), ok(read)],
          'POST /repos/o/n/issues/5/comments': ok({ id: 7 }),
        }),
      ),
    );

    // `not started:` is what `run-issue-resolver` holds an issue for.
    for (const { result } of runs) {
      assert.deepStrictEqual(
        result,
        Result.err(
          '#5: the claim did not read back (the comments read did not show it); nothing more was done. Comment 7, if it is still there, may hold the claim: a rerun with the same claimant settles it once the comment shows, and so does --release.',
        ),
      );
    }
  });

  test('says the claim holds when a label then fails', async () => {
    const { result } = await run({
      [ISSUE]: issue(),
      [PULLS]: ok([]),
      [COMMENTS]: [ok([]), ok([comment(7, 'me')])],
      'POST /repos/o/n/issues/5/comments': ok({ id: 7 }),
      'POST /repos/o/n/issues/5/labels': status(502, 'down'),
    });

    assert.include(
      Result.isErr(result) ? result.value : '',
      '; the claim holds, and a rerun of the same command by me goes on to label it.',
    );
  });

  test('reads an older record beside a comment it edited as the verdict', async () => {
    const { result, sent } = await run(
      {
        [ISSUE]: issue(),
        [PULLS]: ok([]),
        [COMMENTS]: [
          ok([comment(7, 'me', 'planned')]),
          ok([comment(6, 'them'), comment(7, 'me')]),
        ],
        'PATCH /repos/o/n/issues/comments/7': ok({ id: 7 }),
      },
      { ...OPTIONS, mode: 'start' },
    );

    assert.deepStrictEqual(
      result,
      Result.err('#5 not started: them claimed it at the same time.'),
    );

    assert.deepStrictEqual(
      sent.map((line) => line.split(' ', 2).join(' ')),
      ['PATCH /repos/o/n/issues/comments/7'],
    );
  });

  test('says a claim released meanwhile is no refusal', async () => {
    const { result } = await run({
      [ISSUE]: issue(),
      [PULLS]: ok([]),
      [COMMENTS]: [
        ok([]),
        ok([
          {
            id: 7,
            body: writeReleasedIssueClaimComment('Released.'),
            user: { login: 'bot' },
            created_at: '',
          },
        ]),
      ],
      'POST /repos/o/n/issues/5/comments': ok({ id: 7 }),
    });

    assert.deepStrictEqual(
      result,
      Result.err(
        '#5: the claim was released meanwhile; nothing was labelled, and a rerun tries again.',
      ),
    );
  });

  test('refuses one an open pull request closes, writing nothing', async () => {
    const { result, sent } = await run({
      [ISSUE]: issue(),
      [PULLS]: ok([
        {
          number: 9,
          body_html:
            '<p><span class="issue-keyword">Closes</span> <a data-hovercard-type="issue" data-url="https://github.com/o/n/issues/5">#5</a></p>',
        },
      ]),
      [COMMENTS]: ok([]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '#5 not started: open pull request #9 closes it. Someone may be working on it',
    );

    assert.deepStrictEqual(sent, []);
  });

  test('releases: the claim rewritten, the labels taken off', async () => {
    const { result, sent } = await run(
      {
        [ISSUE]: issue('in-progress', 'planned'),
        [COMMENTS]: ok([comment(7, 'me')]),
        'PATCH /repos/o/n/issues/comments/7': ok({ id: 7 }),
        'DELETE /repos/o/n/issues/5/labels/in-progress': ok([]),
        'DELETE /repos/o/n/issues/5/labels/planned': status(404, 'gone'),
      },
      { ...OPTIONS, mode: 'release' },
    );

    assert.deepStrictEqual(
      result,
      Result.ok(
        '#5: claim released, in-progress taken off, planned was off already.',
      ),
    );

    assert.deepStrictEqual(
      sent.map((line) => line.split(' ', 2).join(' ')),
      [
        'PATCH /repos/o/n/issues/comments/7',
        'DELETE /repos/o/n/issues/5/labels/in-progress',
        'DELETE /repos/o/n/issues/5/labels/planned',
      ],
    );
  });
});
