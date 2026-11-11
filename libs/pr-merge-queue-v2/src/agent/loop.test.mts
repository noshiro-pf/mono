import { Result } from 'ts-data-forge';
import {
  describeOutcome,
  mayHaveSpent,
  runRounds,
  type RoundResult,
} from './loop.mjs';

/** A loop world recording what it logged and slept, stopped after `rounds`. */
const worldOf = (
  rounds: readonly RoundResult[],
): Readonly<{
  world: Parameters<typeof runRounds>[2];
  round: () => Promise<RoundResult>;
  lines: readonly string[];
  sleeps: readonly number[];
}> => {
  const mut_lines: string[] = [];

  const mut_sleeps: number[] = [];

  let mut_index = 0;

  return {
    world: {
      log: (line) => {
        mut_lines.push(line);
      },
      stopRequested: () => mut_index >= rounds.length,
      sleep: (ms) => {
        mut_sleeps.push(ms);

        return Promise.resolve();
      },
    },
    round: () => {
      const next = rounds[mut_index] ?? Result.ok({ ran: false, notes: '' });

      mut_index += 1;

      return Promise.resolve(next);
    },
    lines: mut_lines,
    sleeps: mut_sleeps,
  };
};

const OPTIONS = { once: false, intervalMs: 10 * 60_000 } as const;

describe(runRounds, () => {
  test('logs what it waits on only when that changes, and waits only after a round that ran nothing', async () => {
    const made = worldOf([
      Result.ok({ ran: false, notes: '#1: claimed.' }),
      Result.ok({ ran: false, notes: '#1: claimed.' }),
      Result.ok({ ran: true, notes: '' }),
      Result.ok({ ran: false, notes: '#1: claimed.' }),
    ]);

    assert.deepStrictEqual(
      await runRounds(OPTIONS, made.round, made.world),
      Result.ok(undefined),
    );

    assert.deepStrictEqual(made.lines, [
      '#1: claimed.',
      'Checking again every 10 min.',
      '#1: claimed.',
    ]);

    assert.deepStrictEqual(made.sleeps, [600_000, 600_000]);
  });

  test('ends on a fatal error, and goes on past another', async () => {
    const made = worldOf([
      Result.err({ fatal: false, message: 'a passing fault' }),
      Result.err({ fatal: true, message: 'no such skill' }),
    ]);

    assert.deepStrictEqual(
      await runRounds(OPTIONS, made.round, made.world),
      Result.err('no such skill'),
    );

    assert.include(made.lines, 'a passing fault');
  });

  test('runs one round under once, failing on any error', async () => {
    const made = worldOf([
      Result.err({ fatal: false, message: 'a passing fault' }),
      Result.ok({ ran: true, notes: '' }),
    ]);

    assert.deepStrictEqual(
      await runRounds({ ...OPTIONS, once: true }, made.round, made.world),
      Result.err('a passing fault'),
    );
  });

  test('takes a round that throws for a passing fault', async () => {
    const made = worldOf([Result.ok({ ran: false, notes: '' })]);

    const thrown = await runRounds(
      { ...OPTIONS, once: true },
      () => Promise.reject(new Error('disk full')),
      made.world,
    );

    assert.isTrue(Result.isErr(thrown));
  });
});

describe(describeOutcome, () => {
  test('says how it ended, what it spent and how to reopen it', () => {
    assert.strictEqual(
      describeOutcome({
        kind: 'ran',
        exitCode: 0,
        sessionId: 's1',
        result: {
          kind: 'result',
          subtype: 'success',
          isError: false,
          costUsd: 1.5,
          turns: 4,
          text: undefined,
        },
      }),
      'The session ended success (4 turns, $1.50). `claude --resume s1` reopens it.',
    );
  });
});

describe(mayHaveSpent, () => {
  test('is false only for a failure that reports spending nothing', () => {
    assert.isFalse(
      mayHaveSpent({
        kind: 'result',
        subtype: 'error',
        isError: true,
        costUsd: 0,
        turns: 0,
        text: undefined,
      }),
    );

    assert.isTrue(mayHaveSpent(undefined));
  });
});
