import { Result } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import { createState } from '../../utils/index.mjs';
import { combine } from '../combine/index.mjs';
import { fromSubscribable, source } from '../create/index.mjs';
import { map, switchMap } from '../operators/index.mjs';
import { writeDuringPropagationWarning } from './create-root-observable.mjs';

describe('a write to a root observable while an update is propagating (#2336)', () => {
  test('warns when a subscriber writes to another state, and still propagates the write immediately', async () => {
    const [a$, setA] = createState(0);

    const [b$, setB] = createState(0);

    const doubled$ = a$.pipe(map((a) => a * 10));

    a$.subscribe((a) => {
      setB(a * 2);
    });

    const mut_history: FixedLengthTuple<2, number>[] = [];

    combine([doubled$, b$]).subscribe((v) => {
      mut_history.push(v);
    });

    const warn = await captureWarnings(() => {
      setA(1);
    });

    assert.deepStrictEqual(warn, [writeDuringPropagationWarning]);

    // The behavior is unchanged: b$ propagates before doubled$ is updated, so
    // the intermediate state [0, 2] is observed.
    assert.deepStrictEqual(mut_history, [
      [0, 0],
      [0, 2],
      [10, 2],
    ]);

    assert.strictEqual(b$.getSnapshot().value, 2);
  });

  test('warns when a projection writes to a state', async () => {
    const a$ = source<number>(0);

    const [, setB] = createState(0);

    a$.pipe(
      map((a) => {
        setB(a);

        return a;
      }),
    ).subscribe(() => {});

    const warn = await captureWarnings(() => {
      a$.next(1);
    });

    assert.deepStrictEqual(warn, [writeDuringPropagationWarning]);
  });

  test('warns when a subscriber of an asynchronous child writes to a state', async () => {
    const outer$ = source<number>(0);

    const inner$ = source<number>(0);

    const [, setB] = createState(0);

    outer$.pipe(switchMap(() => inner$)).subscribe((v) => {
      if (v > 0) {
        setB(v);
      }
    });

    const warnOnSwitch = await captureWarnings(() => {
      outer$.next(1);
    });

    assert.deepStrictEqual(warnOnSwitch, []);

    const warn = await captureWarnings(() => {
      inner$.next(1);
    });

    assert.deepStrictEqual(warn, [writeDuringPropagationWarning]);
  });

  test('warns once per observable', async () => {
    const a$ = source<number>(0);

    const [, setB] = createState(0);

    const [, setC] = createState(0);

    a$.subscribe((a) => {
      if (a <= 0) {
        return;
      }

      setB(a);

      setB(a + 1);

      setC(a);
    });

    const warn = await captureWarnings(() => {
      a$.next(1);

      a$.next(2);
    });

    assert.deepStrictEqual(warn, [
      writeDuringPropagationWarning,
      writeDuringPropagationWarning,
    ]);
  });

  test('does not warn for writes outside propagation', async () => {
    const [a$, setA] = createState(0);

    const [b$, setB] = createState(0);

    a$.subscribe((a) => {
      queueMicrotask(() => {
        setB(a);
      });
    });

    const warn = await captureWarnings(async () => {
      setA(1);

      await Promise.resolve();
    });

    assert.deepStrictEqual(warn, []);

    assert.strictEqual(b$.getSnapshot().value, 1);
  });

  test('does not warn when an operator emits an inner observable synchronously', async () => {
    const outer$ = source<number>(0);

    const mut_history: number[] = [];

    outer$.pipe(switchMap((x) => source(x * 10))).subscribe((v) => {
      mut_history.push(v);
    });

    const warn = await captureWarnings(() => {
      outer$.next(1);
    });

    assert.deepStrictEqual(warn, []);

    assert.deepStrictEqual(mut_history, [10]);
  });

  test('does not warn when a root created during propagation emits while it is created', async () => {
    const outer$ = source<number>(0);

    const mut_history: number[] = [];

    outer$
      .pipe(
        switchMap((x) =>
          fromSubscribable<number>({
            subscribe: (onNext) => {
              onNext(x * 10);

              return { unsubscribe: () => {} };
            },
          }),
        ),
      )
      .subscribe((r) => {
        if (Result.isOk(r)) {
          mut_history.push(r.value);
        }
      });

    const warn = await captureWarnings(() => {
      outer$.next(1);
    });

    assert.deepStrictEqual(warn, []);

    assert.deepStrictEqual(mut_history, [10]);
  });

  test('a subscriber that throws does not leave the propagation flag set', async () => {
    const a$ = source<number>(0);

    const [, setB] = createState(0);

    a$.subscribe((a) => {
      if (a > 0) {
        panic('boom');
      }
    });

    const warn = await captureWarnings(() => {
      expect(() => {
        a$.next(1);
      }).toThrow('boom');

      setB(1);
    });

    assert.deepStrictEqual(warn, []);
  });
});

/**
 * Runs `run` with `console.warn` replaced by a mock, and returns the messages
 * it was called with.
 */
const captureWarnings = async (
  run: () => Promise<void> | void,
): Promise<readonly unknown[]> => {
  const warn = vi.fn();

  vi.stubGlobal('console', { ...console, warn });

  await run();

  // cspell:disable-next-line
  vi.unstubAllGlobals();

  return warn.mock.calls.map((args: readonly unknown[]) => args[0]);
};
