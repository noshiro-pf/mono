import { createOwner, createState, map } from 'synstate-next';
import { Arr } from 'ts-data-forge';

// synstate's `subscribe-first-write` (#3642, issue #3280). The cases about
// `complete()` are not ported: completion is gone.
describe('a write the first call of subscribe makes to the observable', () => {
  test('is passed to the subscriber, after the first call has returned', () => {
    const [count$, setCount] = createState(-1);

    const mut_log: string[] = [];

    count$.subscribe((value) => {
      mut_log.push(`enter ${value.toString()}`);

      if (value < 0) {
        setCount(0);
      }

      mut_log.push(`exit ${value.toString()}`);
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

  test('reaches a subscription made in an owner, which still ends with the owner', () => {
    const owner = createOwner();

    const [count$, setCount] = createState(-1);

    const mut_received: number[] = [];

    owner.run(() => {
      count$.subscribe((value) => {
        mut_received.push(value);

        if (value < 0) {
          setCount(0);
        }
      });
    });

    assert.deepStrictEqual(mut_received, [-1, 0]);

    setCount(1);

    owner.dispose();

    setCount(2);

    assert.deepStrictEqual(mut_received, [-1, 0, 1]);
  });

  test('is not passed on once the first call has disposed the owner it subscribes in', () => {
    const owner = createOwner();

    const [count$, setCount] = createState(-1);

    const mut_received: number[] = [];

    owner.run(() => {
      count$.subscribe((value) => {
        mut_received.push(value);

        if (value >= 0) {
          return;
        }

        setCount(0);

        owner.dispose();
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

        throw new Error('rejected');
      });
    }).toThrow('rejected');

    setCount(1);

    assert.deepStrictEqual(mut_received, [-1, 0]);
  });

  test('leaves no subscription behind when the first call throws', () => {
    const [count$, setCount] = createState(-1);

    const mut_received: number[] = [];

    expect(() => {
      count$.subscribe((value) => {
        mut_received.push(value);

        throw new Error('rejected');
      });
    }).toThrow('rejected');

    setCount(1);

    assert.deepStrictEqual(mut_received, [-1]);
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

  test('leaves no owned subscription behind when the call passing it on throws', () => {
    const owner = createOwner();

    const [count$, setCount] = createState(-1);

    const mut_received: number[] = [];

    owner.run(() => {
      expect(() => {
        count$.subscribe((value) => {
          mut_received.push(value);

          if (value < 0) {
            setCount(0);

            return;
          }

          throw new Error('rejected');
        });
      }).toThrow('rejected');
    });

    setCount(1);

    owner.dispose();

    assert.deepStrictEqual(mut_received, [-1, 0]);
  });
});
