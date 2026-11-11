import type { QueueComments, QueueOwner } from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import type { ClaudeOutcome, ResultEvent } from '../../agent/index.mjs';
import {
  MAX_SESSIONS_PER_PR,
  runUnblockPrsSkill,
  type RoundPullRequest,
  type RunUnblockPrsSkillWorld,
} from './main.mjs';
import type { RunUnblockPrsSkillOptions } from './options.mjs';

const HEAD = 'c'.repeat(40);

const BASE = 'b'.repeat(40);

const SKILL: QueueOwner = {
  owner: 'skill',
  reason: 'set aside `checks-failed` at its head; the skill fixes it',
} as const;

const NONE: QueueOwner = {
  owner: 'none',
  reason: 'set aside for `mystery`',
} as const;

const setAside = (reason: string): QueueComments =>
  ({
    setAside: {
      commentId: 1,
      says: {
        kind: 'standing',
        record: { reason, headSha: HEAD, baseSha: BASE },
        retry: false,
      },
      applies: true,
    },
    claim: undefined,
  }) as const;

const claimedBy = (by: string): QueueComments =>
  ({
    ...setAside('checks-failed'),
    claim: {
      commentId: 2,
      says: {
        kind: 'standing',
        claim: { headSha: HEAD, by, at: '2026-11-11T00:00:00Z' },
      },
      applies: true,
    },
  }) as const;

const pr = (
  number: number,
  owner: QueueOwner,
  comments: QueueComments = setAside('checks-failed'),
): RoundPullRequest =>
  ({
    facts: {
      number,
      headSha: HEAD,
      headRef: `fix/${number}`,
      baseRef: 'main',
      labels: [{ name: 'merge-queued', color: '', description: '' }],
    },
    owner: Result.ok(owner),
    comments: Result.ok(comments),
    stackedOn: undefined,
  }) as const;

const ended = (overrides: Partial<ResultEvent> = {}): ClaudeOutcome =>
  ({
    kind: 'ran',
    exitCode: 0,
    sessionId: 'abc',
    result: {
      kind: 'result',
      subtype: 'success',
      isError: false,
      costUsd: 1.5,
      turns: 20,
      text: undefined,
      ...overrides,
    },
  }) as const;

/** #10 at a head of its own, as a fix pushed and failing again leaves it. */
const moved = (n: number): RoundPullRequest =>
  ({
    ...pr(10, SKILL),
    facts: { ...pr(10, SKILL).facts, headSha: n.toString().repeat(40) },
  }) as const;

const OPTIONS: RunUnblockPrsSkillOptions = {
  once: false,
  dryRun: false,
  intervalMin: 10,
  maxBudgetUsd: 5,
  model: undefined,
  skill: 'unblock-prs',
} as const;

/**
 * A world whose queue reads `queues` in turn (the last one again once they run
 * out), whose sessions come to `outcomes` in turn, and which stops after
 * `rounds` sleeps or sessions, whichever comes first.
 */
const worldOf = (
  setup: Readonly<{
    queues: readonly (readonly RoundPullRequest[])[];
    outcomes?: readonly ClaudeOutcome[];
    rounds: number;
    env?: Readonly<NodeJS.ProcessEnv>;
  }>,
): Readonly<{
  world: RunUnblockPrsSkillWorld;
  acts: readonly string[];
  lines: readonly string[];
}> => {
  const mut_acts: string[] = [];

  const mut_lines: string[] = [];

  let mut_reads = 0;

  let mut_sessions = 0;

  let mut_steps = 0;

  return {
    world: {
      env: setup.env ?? { ANTHROPIC_API_KEY: 'sk-test', PATH: '/bin' },
      root: '/repo',
      log: (line) => {
        mut_lines.push(line);
      },
      stopRequested: () => mut_steps >= setup.rounds,
      sleep: () => {
        mut_steps += 1;

        return Promise.resolve();
      },
      skillLinked: () => Promise.resolve(true),
      readQueue: () => {
        const queue =
          setup.queues[Math.min(mut_reads, setup.queues.length - 1)] ?? [];

        mut_reads += 1;

        return Promise.resolve(Result.ok(queue));
      },
      reportUnowned: (pullRequests, dryRun) => {
        mut_acts.push(
          `report ${pullRequests.map(({ facts }) => facts.number).join(',')}${dryRun ? ' (dry run)' : ''}`,
        );

        return Promise.resolve({ ok: true, lines: ['#9: filed #100.'] });
      },
      releaseClaim: (number, claimant) => {
        mut_acts.push(`release #${number} as ${claimant}`);

        return Promise.resolve(Result.ok(`#${number}: released.`));
      },
      newClaimant: () => `claimant-${mut_sessions + 1}`,
      makeSessionDir: () => Promise.resolve('/state/run-unblock-prs-skill-1'),
      sessionDirPattern: '/state/run-unblock-prs-skill-XXXXXX',
      removeDir: (dir) => {
        mut_acts.push(`remove ${dir}`);

        return Promise.resolve();
      },
      runClaude: (_cwd, args) => {
        const index = args.indexOf('--append-system-prompt');

        const told = args[index + 1] ?? '';

        const number = /Work only on #(?<n>\d+)/u.exec(told)?.groups?.['n'];

        mut_acts.push(`claude #${number ?? '?'}`);

        const outcome = setup.outcomes?.[mut_sessions] ?? ended();

        mut_sessions += 1;

        mut_steps += 1;

        return Promise.resolve(outcome);
      },
      pruneWorktrees: () => Promise.resolve(Result.ok(undefined)),
    },
    acts: mut_acts,
    lines: mut_lines,
  };
};

describe(runUnblockPrsSkill, () => {
  test('refuses to run without an API key, but dry-runs without one', async () => {
    const made = worldOf({ queues: [[]], rounds: 1, env: {} });

    assert.isTrue(Result.isErr(await runUnblockPrsSkill(OPTIONS, made.world)));

    assert.deepStrictEqual(
      await runUnblockPrsSkill(
        { ...OPTIONS, dryRun: true, once: true },
        made.world,
      ),
      Result.ok(undefined),
    );
  });

  test('says what it would run on a dry run, and runs and files nothing', async () => {
    const made = worldOf({
      queues: [[pr(10, SKILL), pr(9, NONE)]],
      rounds: 1,
    });

    assert.deepStrictEqual(
      await runUnblockPrsSkill({ ...OPTIONS, dryRun: true }, made.world),
      Result.ok(undefined),
    );

    assert.deepStrictEqual(made.acts, ['report 10,9 (dry run)']);

    assert.isTrue(
      made.lines.some((line) =>
        line.startsWith('Would run, in /repo: claude '),
      ),
    );
  });

  test('runs one session per round, and does not pay twice for a pull request as it stands', async () => {
    const made = worldOf({
      queues: [[pr(11, SKILL), pr(10, SKILL)]],
      rounds: 3,
    });

    assert.deepStrictEqual(
      await runUnblockPrsSkill(OPTIONS, made.world),
      Result.ok(undefined),
    );

    assert.deepStrictEqual(made.acts, [
      'claude #10',
      'remove /state/run-unblock-prs-skill-1',
      'claude #11',
      'remove /state/run-unblock-prs-skill-1',
    ]);

    assert.include(
      made.lines,
      [
        '#11: an earlier round left it as it stands; waiting for its head or its set-aside to move.',
        '#10: an earlier round left it as it stands; waiting for its head or its set-aside to move.',
        'Nothing for the skill.',
      ].join('\n'),
    );
  });

  test('releases the claim a session left standing', async () => {
    const made = worldOf({
      queues: [[pr(10, SKILL)], [pr(10, SKILL, claimedBy('claimant-1'))]],
      rounds: 1,
    });

    await runUnblockPrsSkill(OPTIONS, made.world);

    assert.include(made.acts, 'release #10 as claimant-1');
  });

  test('hands a pull request someone else claimed first on again', async () => {
    const made = worldOf({
      queues: [
        [pr(10, SKILL)],
        [pr(10, SKILL, claimedBy('someone-else'))],
        [pr(10, SKILL)],
      ],
      rounds: 2,
    });

    await runUnblockPrsSkill(OPTIONS, made.world);

    assert.deepStrictEqual(
      made.acts.filter((act) => act.startsWith('claude')),
      ['claude #10', 'claude #10'],
    );
  });

  test(`stops handing a pull request on after ${MAX_SESSIONS_PER_PR} sessions`, async () => {
    const made = worldOf({
      // Its head moves after each session.
      queues: [
        [moved(1)],
        [moved(1)],
        [moved(2)],
        [moved(2)],
        [moved(3)],
        [moved(3)],
        [moved(4)],
      ],
      rounds: 4,
    });

    await runUnblockPrsSkill(OPTIONS, made.world);

    assert.strictEqual(
      made.acts.filter((act) => act.startsWith('claude')).length,
      MAX_SESSIONS_PER_PR,
    );

    assert.isTrue(
      made.lines.some((line) =>
        line.includes(
          `#10: ${MAX_SESSIONS_PER_PR} sessions have run on it since this started`,
        ),
      ),
    );
  });

  test('stops for good when the first session fails before spending anything', async () => {
    const made = worldOf({
      queues: [[pr(10, SKILL)]],
      outcomes: [ended({ isError: true, costUsd: 0, subtype: 'error' })],
      rounds: 5,
    });

    const result = await runUnblockPrsSkill(OPTIONS, made.world);

    assert.isTrue(Result.isErr(result));

    assert.include(
      Result.unwrapErrOr(result, ''),
      'failed before spending anything',
    );
  });

  test('stops for good when Claude Code refuses the session', async () => {
    const made = worldOf({
      queues: [[pr(10, SKILL)]],
      outcomes: [
        { kind: 'refused', cause: 'init', message: 'no skill named x' },
      ],
      rounds: 5,
    });

    assert.deepStrictEqual(
      await runUnblockPrsSkill(OPTIONS, made.world),
      Result.err('no skill named x'),
    );
  });

  test('reports what nobody owns once while it stays unowned', async () => {
    const made = worldOf({ queues: [[pr(9, NONE)]], rounds: 2 });

    await runUnblockPrsSkill(OPTIONS, made.world);

    assert.deepStrictEqual(made.acts, ['report 9']);
  });
});
