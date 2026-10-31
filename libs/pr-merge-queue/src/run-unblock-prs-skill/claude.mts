/** Starting `claude -p` on one round of the skill, and reading what it says. */

import { spawn } from 'node:child_process';
import * as readline from 'node:readline';
import {
  Arr,
  isRecord,
  Json,
  Obj,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { log } from '../lib/index.mjs';

/**
 * The arguments for `claude`. The prompt comes straight after `-p`, because
 * `--allowedTools`, `--disallowedTools` and `--add-dir` each take every word up
 * to the next flag.
 */
export const claudeArgs = (round: Round): readonly string[] =>
  [
    '-p',
    `/${round.skill}`,
    '--output-format',
    'stream-json',
    '--verbose',
    '--permission-mode',
    'dontAsk',
    '--allowedTools',
    ...ALLOWED_TOOLS,
    '--disallowedTools',
    ...DISALLOWED_TOOLS,
    '--add-dir',
    round.workDir,
    '--max-budget-usd',
    round.maxBudgetUsd.toString(),
    // A settings file's `env` can set them too, and this comes after it.
    '--settings',
    JSON.stringify({
      env: Object.fromEntries(OTHER_CREDENTIALS.map((name) => [name, ''])),
    }),
    '--append-system-prompt',
    roundInstructions(round),
    ...(round.model === undefined
      ? ([] as const)
      : (['--model', round.model] as const)),
  ] as const;

/**
 * What the session is told besides the skill: what `/loop` and a person would
 * otherwise have settled, and what this command has done already.
 */
export const roundInstructions = (round: Round): string =>
  [
    `This session was started by \`run-unblock-prs-skill\` for one round of the \`${round.skill}\` skill, and nobody is watching it: a question you ask will not be answered.`,
    '',
    `- Work only on #${round.number}. Leave every other pull request, even one the survey shows as the skill's: the next round takes the next one, or an earlier round left it as it is.`,
    '- Leave `report-unowned-prs` to the command that started this session: it runs it.',
    `- The claimant is \`${round.claimant}\`: pass \`--by ${round.claimant}\` to \`claim-pr\` and \`push-fixed-pr\`.`,
    `- Make every worktree under \`${round.workDir}\`. The directory is removed when the round ends.`,
    '- Run one round and stop. Do not start `/loop`, schedule anything, or wait for checks: the worker watches them.',
    '- Where the skill says to leave a decision to a person, leave the comment it describes, release the claim, and end the round.',
  ].join('\n');

/** One line of the stream, or `undefined` for one this command does not read. */
export const parseStreamLine = (line: string): StreamEvent | undefined => {
  const parsed = Json.parse(line);

  if (Result.isErr(parsed) || !isRecord(parsed.value)) {
    return undefined;
  }

  const event = parsed.value;

  const type = event['type'];

  if (type === 'system') {
    return event['subtype'] === 'init'
      ? {
          kind: 'init',
          sessionId: stringOf(event['session_id']),
          apiKeySource: stringOf(event['apiKeySource']),
          // A skill is listed under both.
          commands: Arr.uniq(
            stringsOf(event['skills']).concat(
              stringsOf(event['slash_commands']),
            ),
          ),
        }
      : undefined;
  }

  if (type === 'assistant') {
    const message = event['message'];

    const content =
      isRecord(message) && Arr.isArray(message['content'])
        ? message['content']
        : ([] as const);

    const text = Arr.generate(function* () {
      for (const block of content) {
        if (
          isRecord(block) &&
          block['type'] === 'text' &&
          typeof block['text'] === 'string'
        ) {
          yield block['text'].trim();
        }
      }
    })
      .filter((t) => t !== '')
      .join('\n');

    return text === '' ? undefined : { kind: 'text', text };
  }

  if (type === 'result') {
    return {
      kind: 'result',
      subtype: stringOf(event['subtype']),
      isError: event['is_error'] === true,
      costUsd: numberOf(event['total_cost_usd']),
      turns: numberOf(event['num_turns']),
      text: stringOf(event['result']),
    };
  }

  return undefined;
};

/**
 * Whether the session may go on: billed to the API key, and running the skill
 * it was asked to. Claude Code reports `ANTHROPIC_API_KEY` whenever that
 * variable is set, even where something that comes before it is what
 * authenticates, so this is the second line: {@link sessionEnv} is the first.
 */
export const checkInit = (
  init: InitEvent,
  skill: string,
): Result<undefined, string> => {
  if (init.apiKeySource !== 'ANTHROPIC_API_KEY') {
    return Result.err(
      `the Claude Code session authenticated with ${init.apiKeySource ?? 'a credential it did not name'}, not ANTHROPIC_API_KEY; stopped it so that nothing is billed elsewhere`,
    );
  }

  // `includes` would narrow `skill` to `never` where it is false.
  if (init.commands.every((s) => s !== skill)) {
    const others = init.commands.filter(
      (s) => s === 'unblock-prs' || s.endsWith(':unblock-prs'),
    );

    const hint = Arr.isNonEmpty(others)
      ? (`pass ${others.map((s) => `--skill ${s}`).join(' or ')}` as const)
      : 'install the pr-merge-queue plugin, or link the skill into .claude/skills/';

    return Result.err(
      `the Claude Code session has no skill named ${skill}; ${hint}`,
    );
  }

  return Result.ok(undefined);
};

/**
 * `env` for the session, without {@link OTHER_CREDENTIALS}, and which of them
 * it dropped.
 */
export const sessionEnv = (
  env: Readonly<NodeJS.ProcessEnv>,
): Readonly<{
  env: Readonly<NodeJS.ProcessEnv>;
  dropped: readonly string[];
}> => {
  const dropped = OTHER_CREDENTIALS.filter((name) => (env[name] ?? '') !== '');

  return {
    env: Obj.filter(env, (_value, name) =>
      OTHER_CREDENTIALS.every((other) => other !== name),
    ),
    dropped,
  };
};

/**
 * Runs `claude` with `args` in `cwd` and `env`, logging what the model writes,
 * and stopping it as soon as its first event fails {@link checkInit}. One that
 * exits before that event is refused too: it cannot run with these arguments
 * (an older Claude Code, say), and will not next time either. Its stderr is
 * passed through.
 *
 * A SIGTERM this command receives is passed on, since one sent to this process
 * alone (`kill`, a container's stop) would otherwise leave the session running
 * to the end of its budget. So is a SIGINT when there is no terminal; with one,
 * Ctrl+C reaches the session from the terminal already.
 *
 * It ends on `close`, once the output has been read to the end, or soon after
 * `exit` when something the session started still holds that output open.
 */
export const runClaude = async (
  cwd: string,
  args: readonly string[],
  env: Readonly<NodeJS.ProcessEnv>,
  skill: string,
): Promise<ClaudeOutcome> =>
  new Promise((resolve) => {
    const spawned = Result.fromThrowable(() =>
      spawn('claude', args, { cwd, env, stdio: ['ignore', 'pipe', 'inherit'] }),
    );

    if (Result.isErr(spawned)) {
      resolve({
        kind: 'refused',
        cause: 'start',
        message: `cannot run claude: ${unknownToString(spawned.value)}`,
      });

      return;
    }

    const child = spawned.value;

    let mut_refused: string | undefined = undefined;

    let mut_started = false;

    let mut_sessionId: string | undefined = undefined;

    let mut_result: ResultEvent | undefined = undefined;

    const forwarded: readonly NodeJS.Signals[] = process.stdin.isTTY
      ? (['SIGTERM'] as const)
      : (['SIGTERM', 'SIGINT'] as const);

    const forward = (signal: NodeJS.Signals): void => {
      child.kill(signal);
    };

    for (const signal of forwarded) {
      process.on(signal, forward);
    }

    let mut_finished = false;

    // `error` alone when it cannot start, `close` when it ran; the first wins.
    const finish = (outcome: ClaudeOutcome): void => {
      if (mut_finished) {
        return;
      }

      mut_finished = true;

      for (const signal of forwarded) {
        process.off(signal, forward);
      }

      resolve(outcome);
    };

    // Without a pid it could not be started. With one, `error` is a signal that
    // could not be sent, and `close` still comes.
    child.on('error', (error) => {
      if (child.pid !== undefined) {
        log(`claude: ${unknownToString(error)}`);

        return;
      }

      finish({
        kind: 'refused',
        cause: 'start',
        message: `cannot run claude: ${unknownToString(error)}`,
      });
    });

    readline.createInterface({ input: child.stdout }).on('line', (line) => {
      const event = parseStreamLine(line);

      if (event === undefined || mut_refused !== undefined) {
        return;
      }

      // The check below is the gate, so a stream that does not open with what
      // it reads is not run at all.
      if (!mut_started && event.kind !== 'init') {
        mut_refused =
          'the Claude Code session did not open with its init event, so how it authenticated cannot be checked; stopped it';

        child.kill('SIGTERM');

        return;
      }

      switch (event.kind) {
        case 'init': {
          mut_started = true;

          mut_sessionId = event.sessionId;

          const checked = checkInit(event, skill);

          if (Result.isErr(checked)) {
            mut_refused = checked.value;

            child.kill('SIGTERM');

            return;
          }

          log(`Claude Code session ${event.sessionId ?? '(no id)'} started.`);

          return;
        }

        case 'text':
          log(event.text);

          return;

        case 'result':
          mut_result = event;
      }
    });

    const closed = (exitCode: number | null): void => {
      if (mut_refused !== undefined) {
        finish({ kind: 'refused', cause: 'init', message: mut_refused });
      } else if (!mut_started) {
        finish({
          kind: 'refused',
          cause: 'start',
          message: `claude exited ${exitCode ?? 'on a signal'} before it started a session; its stderr above says why`,
        });
      } else {
        finish({
          kind: 'ran',
          exitCode,
          sessionId: mut_sessionId,
          result: mut_result,
        });
      }
    };

    child.once('close', closed);

    child.once('exit', (exitCode) => {
      setTimeout(() => {
        child.stdout.destroy();

        closed(exitCode);
      }, CLOSE_GRACE_MS).unref();
    });
  });

/** What one round is started with. */
export type Round = Readonly<{
  skill: string;
  /** The pull request it is handed, and the only one it may touch. */
  number: number;
  /** What it passes to `claim-pr --by` and `push-fixed-pr --by`. */
  claimant: string;
  /** Where its worktrees go, removed when it ends. */
  workDir: string;
  maxBudgetUsd: number;
  model: string | undefined;
}>;

/** What this command reads from `claude --output-format stream-json`. */
export type StreamEvent = InitEvent | AssistantTextEvent | ResultEvent;

/** The first event: how the session authenticated, and what it can run. */
export type InitEvent = Readonly<{
  kind: 'init';
  sessionId: string | undefined;
  apiKeySource: string | undefined;
  /** The skills and the other slash commands it can run, by name. */
  commands: readonly string[];
}>;

/** What the model wrote in one message, its tool calls left out. */
export type AssistantTextEvent = Readonly<{ kind: 'text'; text: string }>;

/** The last event: how the session ended, and what it cost. */
export type ResultEvent = Readonly<{
  kind: 'result';
  subtype: string | undefined;
  isError: boolean;
  costUsd: number | undefined;
  turns: number | undefined;
  text: string | undefined;
}>;

export type ClaudeOutcome = RefusedOutcome | RanOutcome;

/**
 * No session ran: `checkInit` stopped it (`init`), or it could not be started
 * or exited before its first event (`start`).
 */
export type RefusedOutcome = Readonly<{
  kind: 'refused';
  cause: 'init' | 'start';
  message: string;
}>;

export type RanOutcome = Readonly<{
  kind: 'ran';
  exitCode: number | null;
  sessionId: string | undefined;
  result: ResultEvent | undefined;
}>;

/**
 * What the session may do without asking, which with `--permission-mode
 * dontAsk` is everything it may do at all: nobody is there to be asked.
 *
 * `Bash` is whole, because reproducing a check is running the repository's own
 * commands, and those run whatever the repository says; a narrower list would
 * refuse the fix without keeping anything out. A `deny` in the repository's
 * `.claude/settings.json` wins over these, once Claude Code reads that file:
 * only after the folder has been trusted in an interactive session.
 */
const ALLOWED_TOOLS = [
  'Read',
  'Edit',
  'Write',
  'Glob',
  'Grep',
  'Bash',
] as const;

/**
 * The skill's "Never" list, where a rule can say it: `gh` acts as whoever
 * logged it in, and the only push is `push-fixed-pr`'s. These are prefix rules
 * against a slip, not a boundary: `git -C <dir> push` or `curl` with the token
 * passes them. What bounds the session is the token's permissions and the
 * machine it runs on.
 */
const DISALLOWED_TOOLS = [
  'Bash(gh)',
  'Bash(gh *)',
  'Bash(git push)',
  'Bash(git push *)',
] as const;

/**
 * What Claude Code reads before `ANTHROPIC_API_KEY`, or instead of it:
 * another token, and the switches to a cloud provider's own credentials.
 * Each would bill something other than the key the budget is set against.
 */
const OTHER_CREDENTIALS = [
  'ANTHROPIC_AUTH_TOKEN',
  'CLAUDE_CODE_OAUTH_TOKEN',
  'CLAUDE_CODE_USE_BEDROCK',
  'CLAUDE_CODE_USE_VERTEX',
  'CLAUDE_CODE_USE_FOUNDRY',
] as const;

/** How long after `exit` it waits for the output to close. */
const CLOSE_GRACE_MS = 10_000;

const stringsOf = (value: unknown): readonly string[] =>
  Arr.isArray(value)
    ? value.filter((s) => typeof s === 'string')
    : ([] as const);

const stringOf = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const numberOf = (value: unknown): number | undefined =>
  typeof value === 'number' ? value : undefined;
