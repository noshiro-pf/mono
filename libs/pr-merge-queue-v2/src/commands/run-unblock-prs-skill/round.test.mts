import { Arr } from 'ts-data-forge';
import { claudeArgs, roundInstructions } from './round.mjs';

const round = {
  skill: 'unblock-prs',
  number: 2301,
  claimant: 'run-unblock-prs-skill-1a2b3c4d',
  workDir: '/tmp/run-unblock-prs-skill-x',
  maxBudgetUsd: 3,
  model: undefined,
} as const;

/** The word after `flag`, as `claude` reads a flag with one value. */
const flagValue = (args: readonly string[], flag: string): string | undefined =>
  args[args.indexOf(flag) + 1];

describe(claudeArgs, () => {
  test('runs the skill in print mode, before every variadic flag', () => {
    const args = claudeArgs(round);

    // `--allowedTools` takes every word up to the next flag, so the prompt has
    // to come before it.
    assert.deepStrictEqual(Arr.take(args, 2), ['-p', '/unblock-prs']);

    assert.strictEqual(flagValue(args, '--output-format'), 'stream-json');

    assert.include(Array.from(args), '--verbose');

    assert.strictEqual(flagValue(args, '--permission-mode'), 'dontAsk');

    assert.strictEqual(flagValue(args, '--max-budget-usd'), '3');

    assert.strictEqual(
      flagValue(args, '--add-dir'),
      '/tmp/run-unblock-prs-skill-x',
    );

    assert.notInclude(Array.from(args), '--model');
  });

  test('denies what the skill says only the worker or a person does', () => {
    const args = Array.from(claudeArgs(round));

    const denied = args.indexOf('--disallowedTools');

    assert.isAbove(denied, 0);

    assert.includeMembers(args.slice(denied + 1), [
      'Bash(gh)',
      'Bash(gh *)',
      'Bash(git push)',
      'Bash(git push *)',
    ]);
  });

  test('blanks every other credential a settings file could set', () => {
    assert.deepStrictEqual(
      JSON.parse(flagValue(claudeArgs(round), '--settings') ?? '{}'),
      {
        env: {
          ANTHROPIC_AUTH_TOKEN: '',
          CLAUDE_CODE_OAUTH_TOKEN: '',
          CLAUDE_CODE_USE_BEDROCK: '',
          CLAUDE_CODE_USE_VERTEX: '',
          CLAUDE_CODE_USE_FOUNDRY: '',
        },
      },
    );
  });

  test('passes a model on when one is given', () => {
    assert.strictEqual(
      flagValue(claudeArgs({ ...round, model: 'sonnet' }), '--model'),
      'sonnet',
    );
  });
});

describe(roundInstructions, () => {
  test('keeps it to the one pull request', () => {
    const text = roundInstructions(round);

    assert.notInclude(text, 'go on to the next');

    assert.include(text, 'end the round');
  });

  test('names the pull request, the claimant and the worktree directory', () => {
    const text = roundInstructions(round);

    assert.include(text, 'Work only on #2301.');

    assert.include(text, '--by run-unblock-prs-skill-1a2b3c4d');

    assert.include(text, '/tmp/run-unblock-prs-skill-x');

    assert.include(text, '/loop');
  });
});
