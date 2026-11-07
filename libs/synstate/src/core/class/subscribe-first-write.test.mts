import { Arr } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import { createState } from '../../utils/index.mjs';
import { map } from '../operators/index.mjs';
import { createScope } from '../scope/index.mjs';

describe('a write the first call of subscribe makes to the observable (#3280)', () => {
  test('is passed to the subscriber, after the first call has returned', () => {
    const [count$, setCount] = createState(-1);

    const mut_log: string[] = [];

    count$.subscribe((value) => {
      mut_log.push(`enter ${value}`);

      if (value < 0) {
        setCount(0);
      }

      mut_log.push(`exit ${value}`);
    });

    assert.deepStrictEqual(mut_log, [
      'enter -1',
      'exit -1',
      'enter 0',
      'exit 0',
    ]);

    setCount(1);

    assert.deepStrictEqual(Arr.skip(mut_log, 4), ['enter 1', 'exit 1']);
  });

  test('is passed on once, as the last value, however many writes the first call makes', () => {
    const [count$, setCount] = createState(-1);

    const mut_received: number[] = [];

    count$.subscribe((value) => {
      mut_received.push(value);

      if (value !== -1) {
        return;
      }

      setCount(5);

      setCount(0);
    });

    assert.deepStrictEqual(mut_received, [-1, 0]);
  });

  test('reaches a subscriber of a derived observable', () => {
    const [count$, setCount] = createState(-1);

    const doubled$ = count$.pipe(map((n) => n * 2));

    const mut_received: number[] = [];

    doubled$.subscribe((value) => {
      mut_received.push(value);

      if (value < 0) {
        setCount(0);
      }
    });

    assert.deepStrictEqual(mut_received, [-2, 0]);
  });

  test('reaches a subscription made in a scope, which still ends with the scope', () => {
    const scope = createScope();

    const [count$, setCount] = createState(-1);

    const mut_received: number[] = [];

    scope.run(() => {
      count$.subscribe((value) => {
        mut_received.push(value);

        if (value < 0) {
          setCount(0);
        }
      });
    });

    assert.deepStrictEqual(mut_received, [-1, 0]);

    setCount(1);

    scope.dispose();

    setCount(2);

    assert.deepStrictEqual(mut_received, [-1, 0, 1]);
  });

  test('is passed on before a completion the first call makes after the write', () => {
    const [count$, setCount] = createState(-1);

    const mut_log: (number | 'complete')[] = [];

    count$.subscribe(
      (value) => {
        mut_log.push(value);

        if (value >= 0) {
          return;
        }

        setCount(0);

        count$.complete();
      },
      () => {
        mut_log.push('complete');
      },
    );

    assert.deepStrictEqual(mut_log, [-1, 0, 'complete']);
  });

  test('is not passed on once the first call has disposed the scope it subscribes in', () => {
    const scope = createScope();

    const [count$, setCount] = createState(-1);

    const mut_received: number[] = [];

    scope.run(() => {
      count$.subscribe((value) => {
        mut_received.push(value);

        if (value >= 0) {
          return;
        }

        setCount(0);

        scope.dispose();
      });
    });

    setCount(1);

    assert.deepStrictEqual(mut_received, [-1]);
  });

  test('leaves no subscription behind when the call passing it on throws', () => {
    const [count$, setCount] = createState(-1);

    const mut_received: number[] = [];

    expect(() => {
      count$.subscribe((value) => {
        mut_received.push(value);

        if (value < 0) {
          setCount(0);

          return;
        }

        panic('rejected');
      });
    }).toThrow('rejected');

    setCount(1);

    assert.deepStrictEqual(mut_received, [-1, 0]);
  });

  test('is not passed on once the first call has disposed the scope it subscribes in, which owns the observable', () => {
    const scope = createScope();

    const mut_log: (number | 'complete')[] = [];

    scope.run(() => {
      const [count$, setCount] = createState(-1);

      count$.subscribe(
        (value) => {
          mut_log.push(value);

          if (value >= 0) {
            return;
          }

          setCount(0);

          scope.dispose();
        },
        () => {
          mut_log.push('complete');
        },
      );
    });

    // Whether it hears the completion is #3550's to decide.
    assert.deepStrictEqual(
      mut_log.filter((entry) => entry !== 'complete'),
      [-1],
    );
  });

  test('leaves no scoped subscription behind when the call passing it on throws', () => {
    const scope = createScope();

    const [count$, setCount] = createState(-1);

    const mut_received: number[] = [];

    scope.run(() => {
      expect(() => {
        count$.subscribe((value) => {
          mut_received.push(value);

          if (value < 0) {
            setCount(0);

            return;
          }

          panic('rejected');
        });
      }).toThrow('rejected');
    });

    setCount(1);

    scope.dispose();

    assert.deepStrictEqual(mut_received, [-1, 0]);
  });

  test('is followed by a write the call passing it on makes, as any subscriber’s write is', () => {
    const [count$, setCount] = createState(-2);

    const mut_received: number[] = [];

    count$.subscribe((value) => {
      mut_received.push(value);

      if (value < 0) {
        setCount(value + 1);
      }
    });

    assert.deepStrictEqual(mut_received, [-2, -1, 0]);
  });

  test('calls the subscriber once when the first call writes nothing', () => {
    const [count$] = createState(3);

    const mut_received: number[] = [];

    count$.subscribe((value) => {
      mut_received.push(value);
    });

    assert.deepStrictEqual(mut_received, [3]);
  });
});
