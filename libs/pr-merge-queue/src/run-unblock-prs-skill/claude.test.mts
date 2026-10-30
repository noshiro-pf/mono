import { Arr, Result } from 'ts-data-forge';
import {
  checkInit,
  claudeArgs,
  parseStreamLine,
  roundInstructions,
  sessionEnv,
} from './claude.mjs';

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

    // `--allowedTools` takes every word up to the next flag, so the prompt
    // has to come before it.
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

describe(parseStreamLine, () => {
  test('reads the init event', () => {
    const event = parseStreamLine(
      JSON.stringify({
        type: 'system',
        subtype: 'init',
        session_id: 'abc',
        apiKeySource: 'ANTHROPIC_API_KEY',
        skills: ['unblock-prs', 'loop'],
        slash_commands: ['unblock-prs', 'fix-queue', 'clear'],
      }),
    );

    assert.deepStrictEqual(event, {
      kind: 'init',
      sessionId: 'abc',
      apiKeySource: 'ANTHROPIC_API_KEY',
      commands: ['unblock-prs', 'loop', 'fix-queue', 'clear'],
    });
  });

  test('reads the text of an assistant message, and nothing else of it', () => {
    const event = parseStreamLine(
      JSON.stringify({
        type: 'assistant',
        message: {
          content: [
            { type: 'text', text: 'Claiming #2301.' },
            { type: 'tool_use', name: 'Bash', input: {} },
            { type: 'text', text: 'Rebasing it.' },
          ],
        },
      }),
    );

    assert.deepStrictEqual(event, {
      kind: 'text',
      text: 'Claiming #2301.\nRebasing it.',
    });

    assert.isUndefined(
      parseStreamLine(
        JSON.stringify({
          type: 'assistant',
          message: { content: [{ type: 'tool_use', name: 'Bash' }] },
        }),
      ),
    );
  });

  test('reads the result', () => {
    const event = parseStreamLine(
      JSON.stringify({
        type: 'result',
        subtype: 'error_max_budget_usd',
        is_error: true,
        total_cost_usd: 3.02,
        num_turns: 41,
      }),
    );

    assert.deepStrictEqual(event, {
      kind: 'result',
      subtype: 'error_max_budget_usd',
      isError: true,
      costUsd: 3.02,
      turns: 41,
      text: undefined,
    });
  });

  test('passes over what it does not read', () => {
    assert.isUndefined(parseStreamLine('not json'));

    assert.isUndefined(parseStreamLine(JSON.stringify({ type: 'user' })));

    assert.isUndefined(
      parseStreamLine(JSON.stringify({ type: 'system', subtype: 'status' })),
    );
  });
});

describe(checkInit, () => {
  const init = {
    kind: 'init',
    sessionId: 'abc',
    apiKeySource: 'ANTHROPIC_API_KEY',
    commands: ['unblock-prs'],
  } as const;

  test('accepts an API key and the skill', () => {
    assert.isTrue(Result.isOk(checkInit(init, 'unblock-prs')));
  });

  test('refuses any other credential, so a subscription is never billed by mistake', () => {
    const checked = checkInit({ ...init, apiKeySource: 'none' }, 'unblock-prs');

    assert.isTrue(Result.isErr(checked));

    assert.include(Result.unwrapErrOr(checked, ''), 'ANTHROPIC_API_KEY');
  });

  test('refuses a skill the session does not have, naming the ones it has', () => {
    const checked = checkInit(
      { ...init, commands: ['pr-merge-queue:unblock-prs'] },
      'unblock-prs',
    );

    assert.isTrue(Result.isErr(checked));

    assert.include(
      Result.unwrapErrOr(checked, ''),
      '--skill pr-merge-queue:unblock-prs',
    );
  });
});

describe(sessionEnv, () => {
  test('drops every credential Claude Code would read before the key', () => {
    const { env, dropped } = sessionEnv({
      ANTHROPIC_API_KEY: 'sk-ant-api03-x',
      ANTHROPIC_AUTH_TOKEN: 'other',
      CLAUDE_CODE_USE_BEDROCK: '1',
      CLAUDE_CODE_OAUTH_TOKEN: '',
      GH_TOKEN: 'ghp_x',
      PATH: '/usr/bin',
    });

    assert.deepStrictEqual(env, {
      ANTHROPIC_API_KEY: 'sk-ant-api03-x',
      GH_TOKEN: 'ghp_x',
      PATH: '/usr/bin',
    });

    assert.deepStrictEqual(dropped, [
      'ANTHROPIC_AUTH_TOKEN',
      'CLAUDE_CODE_USE_BEDROCK',
    ]);
  });
});
