import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { runClaude } from './claude.mjs';

/**
 * A stand-in for `claude` on `PATH`: it writes the stream `FAKE_CLAUDE`
 * names, the way `claude -p --output-format stream-json` does, and echoes
 * its arguments in the result.
 */
const FAKE_CLAUDE = dedent`
  #!/usr/bin/env node
  const say = (event) => console.log(JSON.stringify(event));
  const init = (apiKeySource) =>
    say({ type: 'system', subtype: 'init', session_id: 's1', apiKeySource, skills: ['unblock-prs'] });
  switch (process.env.FAKE_CLAUDE) {
    case 'ok':
      init('ANTHROPIC_API_KEY');
      say({ type: 'assistant', message: { content: [{ type: 'text', text: 'Claiming #1.' }] } });
      say({ type: 'result', subtype: 'success', is_error: false, total_cost_usd: 0.5, num_turns: 3, result: JSON.stringify(process.argv.slice(2)) });
      break;
    case 'subscription':
      init('none');
      setTimeout(() => say({ type: 'result', subtype: 'success', is_error: false }), 30_000);
      break;
    case 'no-init':
      say({ type: 'assistant', message: { content: [{ type: 'text', text: 'Working.' }] } });
      setTimeout(() => say({ type: 'result', subtype: 'success', is_error: false }), 30_000);
      break;
    case 'early-exit':
      console.error("error: unknown option '--max-budget-usd'");
      process.exit(1);
  }
`;

/** Runs `run` with a directory holding the fake as `claude`, then removes it. */
const withFakeClaude = async (
  run: (fakeDir: string) => Promise<void>,
): Promise<void> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'fake-claude-'));

  const bin = path.join(dir, 'claude');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(bin, `${FAKE_CLAUDE}\n`);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.chmod(bin, 0o755);

  await run(dir).finally(() => fs.rm(dir, { recursive: true, force: true }));
};

const envFor = (dir: string, mode: string): NodeJS.ProcessEnv =>
  ({
    PATH: [dir, path.dirname(process.execPath)].join(path.delimiter),
    FAKE_CLAUDE: mode,
  }) as const;

describe(runClaude, () => {
  test('runs a session to its result', async () => {
    await withFakeClaude(async (dir) => {
      const outcome = await runClaude(
        dir,
        ['-p', '/unblock-prs'],
        envFor(dir, 'ok'),
        'unblock-prs',
      );

      assert.deepStrictEqual(outcome, {
        kind: 'ran',
        exitCode: 0,
        sessionId: 's1',
        result: {
          kind: 'result',
          subtype: 'success',
          isError: false,
          costUsd: 0.5,
          turns: 3,
          text: '["-p","/unblock-prs"]',
        },
      });
    });
  });

  test('stops a session that is not on the API key at its first event', async () => {
    await withFakeClaude(async (dir) => {
      const started = Date.now();

      const outcome = await runClaude(
        dir,
        [],
        envFor(dir, 'subscription'),
        'unblock-prs',
      );

      assert.deepStrictEqual(outcome, {
        kind: 'refused',
        cause: 'init',
        message:
          'the Claude Code session authenticated with none, not ANTHROPIC_API_KEY; stopped it so that nothing is billed elsewhere',
      });

      // Killed, not waited for.
      assert.isBelow(Date.now() - started, 20_000);
    });
  });

  test('stops a session whose stream does not open with its init event', async () => {
    await withFakeClaude(async (dir) => {
      const outcome = await runClaude(
        dir,
        [],
        envFor(dir, 'no-init'),
        'unblock-prs',
      );

      assert.deepStrictEqual(outcome, {
        kind: 'refused',
        cause: 'init',
        message:
          'the Claude Code session did not open with its init event, so how it authenticated cannot be checked; stopped it',
      });
    });
  });

  test('refuses one that exits before it starts a session', async () => {
    await withFakeClaude(async (dir) => {
      const outcome = await runClaude(
        dir,
        [],
        envFor(dir, 'early-exit'),
        'unblock-prs',
      );

      assert.deepStrictEqual(outcome, {
        kind: 'refused',
        cause: 'start',
        message:
          'claude exited 1 before it started a session; its stderr above says why',
      });
    });
  });

  test('refuses when there is no claude to run', async () => {
    await withFakeClaude(async (dir) => {
      const outcome = await runClaude(
        dir,
        [],
        { PATH: path.join(dir, 'nowhere') },
        'unblock-prs',
      );

      assert.strictEqual(outcome.kind, 'refused');

      assert.include(JSON.stringify(outcome), 'ENOENT');
    });
  });
});
