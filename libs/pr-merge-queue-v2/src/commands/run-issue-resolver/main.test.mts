import type { IssueDecision } from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import type { ClaudeOutcome, ResultEvent } from '../../agent/index.mjs';
import { runIssueResolver, type RunIssueResolverWorld } from './main.mjs';
import type { RunIssueResolverOptions } from './options.mjs';
import type { IssueAfter } from './verdict.mjs';

const UPDATED = '2026-11-01T00:00:00Z';

const AFTER = '2026-11-11T00:00:00Z';

const issue = (
  number: number,
  title: string = `feat(lib-${number}): a thing`,
): IssueDecision =>
  ({
    facts: {
      number,
      state: 'open',
      stateReason: undefined,
      title,
      body: '',
      author: 'owner',
      url: `https://github.com/o/n/issues/${number}`,
      labels: [],
      createdAt: UPDATED,
      updatedAt: UPDATED,
      commentCount: 0,
      blockedBy: Result.ok([]),
      comments: Result.ok([]),
    },
    waitsFor: [],
    start: 'free',
    named: [],
    claim: undefined,
    unread: undefined,
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
      costUsd: 2,
      turns: 40,
      text: undefined,
      ...overrides,
    },
  }) as const;

const OPTIONS: RunIssueResolverOptions = {
  once: true,
  dryRun: false,
  intervalMin: 30,
  maxTotalUsd: 20,
  maxSessions: 10,
  concurrency: 3,
  model: undefined,
  authors: [],
} as const;

/**
 * A world whose issues are `issues`, whose sessions come to `outcome`, and
 * which reads each issue after its session as `after` says.
 */
const worldOf = (
  setup: Readonly<{
    issues: readonly IssueDecision[];
    outcome?: (number: number) => ClaudeOutcome;
    after?: (number: number) => IssueAfter;
    refuse?: ReadonlySet<number>;
    record?: ReadonlyMap<number, string | undefined>;
  }>,
): Readonly<{
  world: RunIssueResolverWorld;
  acts: readonly string[];
  lines: readonly string[];
  record: () => ReadonlyMap<number, string | undefined>;
}> => {
  const mut_acts: string[] = [];

  const mut_lines: string[] = [];

  let mut_record: ReadonlyMap<number, string | undefined> =
    setup.record ?? new Map<number, string | undefined>();

  let mut_dirs = 0;

  return {
    world: {
      env: { ANTHROPIC_API_KEY: 'sk-test', PATH: '/bin' },
      root: '/repo',
      viewer: 'owner',
      log: (line) => {
        mut_lines.push(line);
      },
      stopRequested: () => false,
      nowEpochMs: () => 0,
      pause: () => Promise.resolve(),
      readIssues: () => Promise.resolve(Result.ok(setup.issues)),
      readRecord: () => Promise.resolve(Result.ok(mut_record)),
      writeRecord: (record) => {
        mut_record = record;

        return Promise.resolve(Result.ok(undefined));
      },
      startIssue: (number, by, mode) => {
        mut_acts.push(`${mode} #${number}`);

        return Promise.resolve(
          mode === 'start' && setup.refuse?.has(number) === true
            ? Result.err(`#${number} not started: a pull request closes it.`)
            : Result.ok(`#${number}: ${mode} by ${by}.`),
        );
      },
      readIssueAfter: (number) =>
        Promise.resolve(
          Result.ok(setup.after?.(number) ?? { open: true, closedBy: [] }),
        ),
      readUpdatedAt: () => Promise.resolve(Result.ok(AFTER)),
      newClaimant: () => 'run-issue-resolver-test',
      makeSessionDir: () => {
        mut_dirs += 1;

        return Promise.resolve(`/state/run-issue-resolver-${mut_dirs}`);
      },
      sessionDirPattern: '/state/run-issue-resolver-XXXXXX',
      addWorktree: (worktree) => {
        mut_acts.push(`worktree ${worktree}`);

        return Promise.resolve(Result.ok(undefined));
      },
      pruneWorktrees: () => Promise.resolve(Result.ok(undefined)),
      removeDir: (dir) => {
        mut_acts.push(`remove ${dir}`);

        return Promise.resolve();
      },
      runClaude: (cwd, args) => {
        const number = /Implement issue #(?<n>\d+)/u.exec(args[1] ?? '')
          ?.groups?.['n'];

        mut_acts.push(`claude #${number ?? '?'} in ${cwd}`);

        return Promise.resolve(setup.outcome?.(Number(number)) ?? ended());
      },
    },
    acts: mut_acts,
    lines: mut_lines,
    record: () => mut_record,
  };
};

describe(runIssueResolver, () => {
  test('refuses to run without an API key', async () => {
    const made = worldOf({ issues: [] });

    assert.isTrue(
      Result.isErr(await runIssueResolver(OPTIONS, { ...made.world, env: {} })),
    );
  });

  test('starts one issue first, and keeps the label where a pull request closes it', async () => {
    const made = worldOf({
      issues: [issue(11), issue(10)],
      after: () => ({ open: true, closedBy: [20] }),
    });

    assert.deepStrictEqual(
      await runIssueResolver(OPTIONS, made.world),
      Result.ok(undefined),
    );

    assert.deepStrictEqual(made.acts, [
      'start #10',
      'worktree /state/run-issue-resolver-1/repo',
      'claude #10 in /state/run-issue-resolver-1/repo',
      'remove /state/run-issue-resolver-1',
    ]);

    assert.include(made.lines, '#10: #20 closes it now.');
  });

  test('releases and records one the session left', async () => {
    const made = worldOf({ issues: [issue(10)] });

    await runIssueResolver(OPTIONS, made.world);

    assert.include(made.acts, 'release #10');

    assert.deepStrictEqual(
      made.record(),
      new Map<number, string | undefined>([[10, AFTER]]),
    );
  });

  test('holds one its cap stopped for the run alone', async () => {
    const made = worldOf({
      issues: [issue(10)],
      outcome: () => ended({ subtype: 'error_max_budget_usd', costUsd: 5 }),
    });

    await runIssueResolver(OPTIONS, made.world);

    assert.include(made.acts, 'release #10');

    assert.strictEqual(made.record().size, 0);

    assert.isTrue(made.lines.some((line) => line.includes('stopped at its')));
  });

  test('records one start-issue refuses, and starts no session on it', async () => {
    const made = worldOf({
      issues: [issue(10)],
      refuse: new Set<number>([10]),
    });

    await runIssueResolver(OPTIONS, made.world);

    assert.deepStrictEqual(made.acts, ['start #10']);

    assert.deepStrictEqual(
      made.record(),
      new Map<number, string | undefined>([[10, UPDATED]]),
    );
  });

  test('passes over one the record holds as it stands', async () => {
    const made = worldOf({
      issues: [issue(10)],
      record: new Map<number, string | undefined>([[10, UPDATED]]),
    });

    await runIssueResolver(OPTIONS, made.world);

    assert.deepStrictEqual(made.acts, []);

    assert.include(
      made.lines,
      [
        '#10: an earlier run-issue-resolver session left them as they stand; waiting for someone to change them.',
        'No issue to start.',
      ].join('\n'),
    );
  });

  test('holds back one whose theme a started issue is on', async () => {
    const made = worldOf({
      issues: [
        { ...issue(9, 'feat(synstate): another thing'), start: 'in-progress' },
        issue(10, 'fix(synstate): a thing'),
      ],
    });

    await runIssueResolver(OPTIONS, made.world);

    assert.deepStrictEqual(made.acts, []);

    assert.isTrue(
      made.lines.some((line) =>
        line.startsWith(
          '#10: startable, but a started issue is on their theme (synstate)',
        ),
      ),
    );
  });

  test('stops for good when a session fails before spending anything', async () => {
    const made = worldOf({
      issues: [issue(10)],
      outcome: () => ended({ isError: true, costUsd: 0, subtype: 'error' }),
    });

    const result = await runIssueResolver(
      { ...OPTIONS, once: false },
      made.world,
    );

    assert.isTrue(Result.isErr(result));

    assert.include(made.acts, 'release #10');
  });

  test('says what it would run on a dry run, and starts nothing', async () => {
    const made = worldOf({ issues: [issue(10)] });

    await runIssueResolver({ ...OPTIONS, dryRun: true }, made.world);

    assert.deepStrictEqual(made.acts, []);

    assert.isTrue(
      made.lines.some((line) =>
        line.startsWith(
          'Would run start-issue 10, then make /state/run-issue-resolver-XXXXXX/repo from origin/main in /repo',
        ),
      ),
    );
  });
});
