// cspell:ignore Afeature unlabel
import {
  ok,
  recordedTransport,
  status,
  writePullRequestClaimComment,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import type { StrictOmit, UnknownRecord } from 'ts-type-forge';
import { HEAD, PULL_7, routes, type Routes } from '../../../test/index.mjs';
import {
  readOwnDequeueEvent,
  reworkPr,
  type ReworkGit,
  type ReworkPrWorld,
} from './main.mjs';
import type { ReworkPrOptions } from './options.mjs';

const NOW = Date.parse('2026-11-10T00:30:00Z');

const AMENDED = 'a'.repeat(40);

const OPEN = '/repos/o/n/pulls?state=open&per_page=1&head=o%3Afeature';

const EVENTS = '/repos/o/n/issues/7/events?per_page=100';

/** #7 as the steps read it: `labels`, a draft or not, armed or not. */
const pull = (
  labels: readonly string[],
  fields: Readonly<{ draft?: boolean; armed?: boolean }> = {},
): UnknownRecord =>
  ({
    number: 7,
    node_id: 'PR_7',
    draft: fields.draft ?? false,
    labels: labels.map((name) => ({ name })),
    auto_merge:
      fields.armed === true ? ({ merge_method: 'squash' } as const) : null,
  }) as const;

const HELD = pull(['skip-ci'], { draft: true });

const START: ReworkPrOptions = { phase: 'start', dryRun: false } as const;

const done = (handBack: 'requeue' | 'review'): ReworkPrOptions =>
  ({ phase: 'done', handBack, dryRun: false }) as const;

const run = async (
  options: ReworkPrOptions,
  overrides: Routes,
  world: Partial<StrictOmit<ReworkPrWorld, 'git'>> &
    Readonly<{ git?: Partial<ReworkGit> }> = {},
  record?: string,
): Promise<
  Readonly<{
    result: Result<string, string>;
    sent: readonly string[];
    log: readonly string[];
    git: readonly string[];
    record: string | undefined;
  }>
> => {
  const { transport, sent } = recordedTransport({ ...routes, ...overrides });

  const mut_log: string[] = [];

  const mut_git: string[] = [];

  let mut_record = record;

  const result = await reworkPr(options, {
    transport,
    env: { GH_TOKEN: 'token' },
    originUrl: () => Promise.resolve('https://github.com/o/n.git'),
    manifestUrl: () => Promise.resolve(undefined),
    ghAuthToken: () => Promise.resolve(Result.err('no gh')),
    nowEpochMs: () => NOW,
    sleep: () => Promise.resolve(),
    log: (line) => {
      mut_log.push(line);
    },
    ...world,
    git: {
      branch: () => Promise.resolve(Result.ok('feature')),
      status: () => Promise.resolve(Result.ok('')),
      head: () => Promise.resolve(Result.ok(AMENDED)),
      branchHad: () => Promise.resolve(Result.ok(true)),
      pushLeased: ({ branch, sha, lease }) => {
        mut_git.push(
          `push ${branch} ${sha.slice(0, 1)} lease ${lease.slice(0, 1)}`,
        );

        return Promise.resolve(Result.ok('pushed'));
      },
      restack: ({ branch, from, to }, layers) => {
        mut_git.push(
          `restack ${layers.map(({ number }) => `#${number}`).join(',')} onto ${branch} ${from.slice(0, 1)}..${to.slice(0, 1)}`,
        );

        return Promise.resolve(
          layers.map(({ number }) => ({
            number,
            kind: 'restacked',
            head: 'e'.repeat(40),
          })),
        );
      },
      readRecord: () => Promise.resolve(Result.ok(mut_record)),
      writeRecord: (_, text) => {
        mut_record = text;

        return Promise.resolve(Result.ok(undefined));
      },
      removeRecord: () => {
        mut_record = undefined;

        return Promise.resolve(Result.ok(undefined));
      },
      ...world.git,
    },
  });

  return {
    result,
    sent: sent
      .filter(({ method }) => method !== 'GET')
      .map(({ method, url, body }) =>
        url.endsWith('/graphql')
          ? `GraphQL ${/\{ (?<mutation>\w+)\(/u.exec(body ?? '')?.groups?.['mutation'] ?? ''}`
          : `${method} ${url.replace('https://api.github.com', '')}`,
      ),
    log: mut_log,
    git: mut_git,
    record: mut_record,
  };
};

describe(reworkPr, () => {
  test('start holds it, takes it out of the queue writing the event down, disarms it and makes it a draft', async () => {
    const { result, sent, log, record } = await run(START, {
      [OPEN]: [
        ok([pull(['merge-queued'], { armed: true })]),
        ok([pull(['skip-ci'], { armed: true })]),
      ],
      'POST /repos/o/n/issues/7/labels': ok([]),
      'DELETE /repos/o/n/issues/7/labels/merge-queued': ok([]),
      // Before the label comes off, and after.
      [EVENTS]: [
        ok([{ id: 1, event: 'labeled', label: { name: 'merge-queued' } }]),
        ok([
          { id: 1, event: 'labeled', label: { name: 'merge-queued' } },
          { id: 2, event: 'unlabeled', label: { name: 'merge-queued' } },
        ]),
      ],
      'graphql:disablePullRequestAutoMerge': ok({ data: {} }),
      'graphql:convertPullRequestToDraft': ok({ data: {} }),
    });

    assert.deepStrictEqual(
      result,
      Result.ok(
        '#7: out of the queue for more work; run rework-pr done --requeue or --review once it is committed.',
      ),
    );

    assert.deepStrictEqual(sent, [
      'POST /repos/o/n/issues/7/labels',
      'DELETE /repos/o/n/issues/7/labels/merge-queued',
      'GraphQL disablePullRequestAutoMerge',
      'GraphQL convertPullRequestToDraft',
    ]);

    assert.deepStrictEqual(log, [
      '#7: put skip-ci on',
      '#7: take merge-queued off',
      '#7: disarm auto-merge',
      '#7: make it a draft',
    ]);

    assert.strictEqual(record, '2\n');
  });

  test('start takes a draft refused as held all the same, but not a draft that failed otherwise', async () => {
    const routesFor = (answer: ReturnType<typeof status>): Routes =>
      ({
        [OPEN]: ok([pull(['skip-ci'])]),
        'graphql:convertPullRequestToDraft': answer,
      }) as const;

    const [refused, failed] = await Promise.all([
      run(START, routesFor(status(403, 'Forbidden'))),
      run(START, routesFor(status(502, 'Bad Gateway'))),
    ]);

    assert.isTrue(Result.isOk(refused.result));

    expect(refused.log.join('\n')).toContain(
      'It is held all the same, so the work can go on; it is just not marked as a draft.',
    );

    assert.isTrue(Result.isErr(failed.result));

    expect(failed.result.value).toContain(
      'It is held all the same; run rework-pr start again to make it one.',
    );
  });

  test('done --requeue pushes, carries the layers along, marks it ready, and puts merge-queued back when its record is untouched', async () => {
    const { result, sent, git, record } = await run(
      done('requeue'),
      {
        [OPEN]: ok([HELD]),
        '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100':
          ok([{ number: 7 }, { number: 8 }]),
        '/repos/o/n/pulls/8': ok({
          ...PULL_7,
          number: 8,
          html_url: 'https://github.com/o/n/pull/8',
          head: { ref: 'feature-8', sha: HEAD, repo: { full_name: 'o/n' } },
          base: { ref: 'feature' },
        }),
        '/repos/o/n/pulls/8/reviews?per_page=100': ok([]),
        '/repos/o/n/pulls/8/files?per_page=100': ok([]),
        '/repos/o/n/activity?ref=refs%2Fheads%2Ffeature-8&activity_type=push&direction=asc&per_page=100':
          ok([]),
        '/repos/o/n/issues/8/comments?per_page=100': ok([]),
        [EVENTS]: ok([
          { id: 2, event: 'unlabeled', label: { name: 'merge-queued' } },
        ]),
        'graphql:markPullRequestReadyForReview': ok({ data: {} }),
        'POST /repos/o/n/issues/7/labels': ok([]),
      },
      {},
      '2\n',
    );

    assert.deepStrictEqual(
      result,
      Result.ok('#7: pushed, ready, and queued again.'),
    );

    assert.deepStrictEqual(git, [
      `push feature a lease ${HEAD.slice(0, 1)}`,
      `restack #8 onto feature ${HEAD.slice(0, 1)}..a`,
    ]);

    assert.deepStrictEqual(sent, [
      'GraphQL markPullRequestReadyForReview',
      'POST /repos/o/n/issues/7/labels',
    ]);

    assert.strictEqual(record, undefined);
  });

  test('done --requeue leaves merge-queued to the author once the label moved since', async () => {
    const { result, sent } = await run(
      done('requeue'),
      {
        [OPEN]: ok([pull(['skip-ci'])]),
        [EVENTS]: ok([
          { id: 2, event: 'unlabeled', label: { name: 'merge-queued' } },
          { id: 3, event: 'labeled', label: { name: 'merge-queued' } },
          { id: 4, event: 'unlabeled', label: { name: 'merge-queued' } },
        ]),
      },
      {},
      '2\n',
    );

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain('so queueing it stays the author');

    assert.deepStrictEqual(sent, []);
  });

  test.each([
    [
      'uncommitted work',
      { [OPEN]: ok([HELD]) },
      '?? a.txt\n',
      '#7: the working tree has uncommitted changes or untracked files; amend them into the commit, or remove them:\n?? a.txt',
    ],
    [
      'one not held',
      { [OPEN]: ok([pull(['merge-queued'])]) },
      '',
      '#7: a push now may go straight into the merge. skip-ci is off: run rework-pr start; merge-queued is on: if the author queued it again, ask them first; otherwise run rework-pr start.',
    ],
    [
      'one claimed',
      {
        [OPEN]: ok([HELD]),
        '/repos/o/n/issues/7/comments?per_page=100': ok([
          {
            id: 2,
            body: writePullRequestClaimComment(
              { headSha: HEAD, by: 'session-b', at: '2026-11-10T00:00:00Z' },
              'Being fixed.',
            ),
            user: { login: 'me' },
            created_at: '',
          },
        ]),
      },
      '',
      '#7: session-b claimed it at 2026-11-10T00:00:00Z. A fix under a claim goes through push-fixed-pr; otherwise wait for the claim to end.',
    ],
    [
      'a branch with no pull request',
      { [OPEN]: ok([]) },
      '',
      'the branch has no open pull request; open-pr opens one',
    ],
  ] as const)(
    'done refuses %s, pushing nothing',
    async (_, overrides, porcelain, message) => {
      const { result, sent, git } = await run(done('review'), overrides, {
        git: {
          status: () => Promise.resolve(Result.ok(porcelain)),
        },
      });

      assert.deepStrictEqual(result, Result.err(message));

      assert.deepStrictEqual([sent, git], [[], []]);
    },
  );

  test('done says so when the branch moved since the queue read it, and goes no further', async () => {
    const { result, sent } = await run(
      done('review'),
      { [OPEN]: ok([HELD]) },
      {
        git: {
          pushLeased: () => Promise.resolve(Result.ok('moved')),
        },
      },
    );

    assert.deepStrictEqual(
      result,
      Result.err(
        `#7: cannot push the branch, leased against the head the queue read: feature moved since the queue read it at ${HEAD.slice(0, 10)}: git fetch origin feature, put the amend on it, and run rework-pr done again.`,
      ),
    );

    assert.deepStrictEqual(sent, []);
  });

  test('done refuses to push over a head the local branch never had', async () => {
    const { result, git } = await run(
      done('review'),
      { [OPEN]: ok([HELD]) },
      {
        git: {
          branchHad: () => Promise.resolve(Result.ok(false)),
        },
      },
    );

    assert.deepStrictEqual(
      result,
      Result.err(
        `#7: cannot push the branch, leased against the head the queue read: feature is at ${HEAD.slice(0, 10)} on GitHub, which the local branch never had, or its reflog no longer has (someone else pushed it, or a restack carried it along): git fetch origin feature, put the amend on it, and run rework-pr done again.`,
      ),
    );

    assert.deepStrictEqual(git, []);
  });

  test('start refuses a pull request someone claimed, putting nothing on it', async () => {
    const { result, sent } = await run(START, {
      [OPEN]: ok([pull(['merge-queued'])]),
      '/repos/o/n/issues/7/comments?per_page=100': ok([
        {
          id: 2,
          body: writePullRequestClaimComment(
            { headSha: HEAD, by: 'session-b', at: '2026-11-10T00:00:00Z' },
            'Being fixed.',
          ),
          user: { login: 'me' },
          created_at: '',
        },
      ]),
    });

    assert.isTrue(Result.isErr(result));

    expect(result.value).toContain('session-b claimed it');

    assert.deepStrictEqual(sent, []);
  });

  test('a dry run of done says the push it would refuse', async () => {
    const { result, sent, git } = await run(
      { phase: 'done', handBack: 'review', dryRun: true },
      { [OPEN]: ok([HELD]) },
      {
        git: {
          branchHad: () => Promise.resolve(Result.ok(false)),
        },
      },
    );

    assert.isTrue(Result.isErr(result));

    expect(result.value).toMatch(/^#7: would not push: feature is at /u);

    assert.deepStrictEqual([sent, git], [[], []]);
  });

  test('says a git read that failed as not knowing, not as a refusal, in a dry run and a run', async () => {
    const unread = {
      git: {
        branchHad: () => Promise.resolve(Result.err('fatal: cannot lock ref')),
      },
    } as const;

    const [dry, real] = await Promise.all([
      run(
        { phase: 'done', handBack: 'review', dryRun: true },
        { [OPEN]: ok([HELD]) },
        unread,
      ),
      run(done('review'), { [OPEN]: ok([HELD]) }, unread),
    ]);

    assert.deepStrictEqual(
      [dry.result, real.result, dry.git, real.git, dry.sent, real.sent],
      [
        Result.err(
          "#7: cannot tell whether it may push: the local branch's history cannot be read: fatal: cannot lock ref",
        ),
        Result.err(
          "#7: cannot push the branch, leased against the head the queue read: cannot tell whether it may push: the local branch's history cannot be read: fatal: cannot lock ref",
        ),
        [],
        [],
        [],
        [],
      ],
    );
  });

  test('a dry run says what it would do, and does nothing', async () => {
    const { result, sent } = await run(
      { phase: 'start', dryRun: true },
      { [OPEN]: ok([pull(['merge-queued'])]) },
    );

    assert.deepStrictEqual(
      result,
      Result.ok(
        [
          '#7: would',
          '  - put skip-ci on',
          '  - take merge-queued off',
          '  - make it a draft',
        ].join('\n'),
      ),
    );

    assert.deepStrictEqual(sent, []);
  });
});

describe(readOwnDequeueEvent, () => {
  test('reads again until GitHub lists an unlabel newer than every event before, and gives up after the last read', async () => {
    const reads = [
      // An older unlabel, shown before the newer events are.
      [{ id: 2, event: 'unlabeled' }],
      [
        { id: 2, event: 'unlabeled' },
        { id: 3, event: 'labeled' },
        { id: 4, event: 'unlabeled' },
      ],
    ] as const;

    let mut_read = 0;

    const listed = await readOwnDequeueEvent(
      () => {
        const events = reads[mut_read] ?? [];

        mut_read += 1;

        return Promise.resolve(Result.ok(events));
      },
      () => Promise.resolve(),
      3,
    );

    const never = await readOwnDequeueEvent(
      () => Promise.resolve(Result.ok([{ id: 2, event: 'unlabeled' }])),
      () => Promise.resolve(),
      3,
      2,
    );

    assert.deepStrictEqual(
      [listed, never],
      [
        Result.ok(4),
        Result.err('GitHub does not list taking merge-queued off yet'),
      ],
    );
  });
});
