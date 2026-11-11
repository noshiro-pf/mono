import { Result } from 'ts-data-forge';
import { checkInit, parseStreamLine, sessionEnv } from './claude.mjs';

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
