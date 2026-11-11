import { Result } from 'ts-data-forge';
import {
  EMPTY_MEMORY,
  parseWorkerMemory,
  serializeWorkerMemory,
  type WorkerMemory,
} from './memory.mjs';

describe(parseWorkerMemory, () => {
  test('reads back what was written', () => {
    const memory: WorkerMemory = {
      ...EMPTY_MEMORY,
      conditions: [
        {
          number: 1,
          head: 'a',
          kind: 'push-failed',
          firstEpochMs: 5,
          count: 2,
          refired: false,
        },
      ],
      demoted: [{ number: 3, head: 'c' }],
      inFlight: {
        number: 4,
        head: 'd',
        releasedEpochMs: 7,
        greenCount: 1,
        autoFixed: false,
      },
      fingerprint: 'f',
      idleCount: 2,
    } as const;

    assert.deepStrictEqual(
      parseWorkerMemory(serializeWorkerMemory(memory)),
      Result.ok(memory),
    );

    assert.deepStrictEqual(
      parseWorkerMemory(serializeWorkerMemory(EMPTY_MEMORY)),
      Result.ok(EMPTY_MEMORY),
    );
  });

  test('refuses what does not parse, or another version', () => {
    assert.isTrue(Result.isErr(parseWorkerMemory('{')));

    assert.isTrue(
      Result.isErr(
        parseWorkerMemory(
          serializeWorkerMemory(EMPTY_MEMORY).replace(
            '"version": 1',
            '"version": 2',
          ),
        ),
      ),
    );
  });
});
