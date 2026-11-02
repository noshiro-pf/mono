import { Arr, Result } from 'ts-data-forge';
import {
  checkIssueInit,
  issueArgs,
  issueInstructions,
  issueWorktree,
} from './session.mjs';

const round = {
  number: 2701,
  url: 'https://github.com/o/r/issues/2701',
  authors: ['owner'],
  workDir: '/tmp/run-issue-resolver-x',
  maxBudgetUsd: 4,
  model: undefined,
} as const;

/** The word after `flag`, as `claude` reads a flag with one value. */
const flagValue = (args: readonly string[], flag: string): string | undefined =>
  args[args.indexOf(flag) + 1];

describe(issueArgs, () => {
  test('hands the session the issue, before every variadic flag', () => {
    const args = issueArgs(round);

    assert.deepStrictEqual(Arr.take(args, 2), [
      '-p',
      'Implement issue #2701 (https://github.com/o/r/issues/2701) and open its pull request.',
    ]);

    assert.strictEqual(flagValue(args, '--permission-mode'), 'dontAsk');

    assert.strictEqual(flagValue(args, '--max-budget-usd'), '4');

    assert.strictEqual(
      flagValue(args, '--add-dir'),
      '/tmp/run-issue-resolver-x',
    );
  });

  test('allows the review CLAUDE.md asks for, and still denies gh and git push', () => {
    const args = Array.from(issueArgs(round));

    const allowed = args.indexOf('--allowedTools');

    const denied = args.indexOf('--disallowedTools');

    assert.includeMembers(args.slice(allowed + 1, denied), [
      'Bash',
      'Skill',
      'Agent',
    ]);

    assert.includeMembers(args.slice(denied + 1), [
      'Bash(gh *)',
      'Bash(git push *)',
    ]);
  });
});

describe(issueInstructions, () => {
  test('names the issue, the authors and the worktree directory', () => {
    const text = issueInstructions(round);

    assert.include(text, 'Work only on #2701.');

    assert.include(text, 'Closes #2701');

    assert.include(text, 'Do not run `start-issue` on it.');

    assert.include(text, '`owner`');

    assert.include(text, '/tmp/run-issue-resolver-x');
  });

  test('works in the worktree the command made for it', () => {
    const text = issueInstructions(round);

    assert.include(text, '`/tmp/run-issue-resolver-x/repo`');

    assert.include(text, 'git switch -c');
  });

  test('closes an issue whose work is already on main, and only then', () => {
    const text = issueInstructions(round);

    assert.include(text, 'already on `origin/main`');

    assert.include(text, '`state_reason` `completed`');

    assert.include(text, 'Close it only when every part of it is done');

    assert.include(
      text,
      'Check each part in the tree and its history yourself',
    );

    // Before the bail-out for a checklist, which a done one would otherwise hit.
    assert.isBelow(
      text.indexOf('already on `origin/main`'),
      text.indexOf('decide whether it can be finished here'),
    );
  });

  test('keeps queueing the author’s', () => {
    const text = issueInstructions(round);

    assert.include(text, 'never add `merge-queued`');

    assert.include(text, 'Leave `skip-ci` on');
  });
});

describe(issueWorktree, () => {
  test('is a directory of its own inside the session’s', () => {
    assert.strictEqual(
      issueWorktree('/tmp/run-issue-resolver-x'),
      '/tmp/run-issue-resolver-x/repo',
    );
  });
});

describe(checkIssueInit, () => {
  const init = {
    kind: 'init',
    sessionId: 'abc',
    apiKeySource: 'ANTHROPIC_API_KEY',
    commands: ['code-review', 'init'],
  } as const;

  test('accepts an API key and a session that can review', () => {
    assert.isTrue(Result.isOk(checkIssueInit(init)));
  });

  test('refuses any other credential', () => {
    const checked = checkIssueInit({ ...init, apiKeySource: 'none' });

    assert.include(Result.unwrapErrOr(checked, ''), 'ANTHROPIC_API_KEY');
  });

  test('refuses a session with no /code-review', () => {
    const checked = checkIssueInit({ ...init, commands: ['init'] });

    assert.include(Result.unwrapErrOr(checked, ''), '/code-review');
  });
});
