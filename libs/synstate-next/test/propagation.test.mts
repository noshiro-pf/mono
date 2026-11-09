// cspell:ignore unstub
import {
  batch,
  createOwner,
  createRootOwner,
  derive,
  filter,
  getOwner,
  map,
  merge,
  onCleanup,
  scan,
  source,
  state,
} from 'synstate-next';
import { Arr } from 'ts-data-forge';

describe('propagation', () => {
  test('a diamond is computed once per update and never sees a mix of old and new', () => {
    const a = state(1);

    const b = a.pipe(map((x) => x * 2));

    const c = a.pipe(map((x) => x * 3));

    const mut_calls: number[] = [];

    const d = derive([b, c, a], (x, y, z) => {
      mut_calls.push(z);

      return x + y + z;
    });

    const mut_seen: number[] = [];

    d.subscribe((v) => {
      mut_seen.push(v);
    });

    a.set(2);

    assert.deepStrictEqual(mut_calls, [1, 2]);

    assert.deepStrictEqual(mut_seen, [6, 12]);
  });

  test('a result equal to the one held stops the update there', () => {
    const a = state(1);

    const sign = a.pipe(map((x) => x > 0));

    let mut_calls = 0;

    const below = sign.pipe(
      map((positive) => {
        mut_calls += 1;

        return positive;
      }),
    );

    below.subscribe(() => {});

    mut_calls = 0;

    a.set(5);

    a.set(9);

    assert.strictEqual(mut_calls, 0);

    a.set(-1);

    assert.strictEqual(mut_calls, 1);
  });

  test('a write equal to the held value does nothing', () => {
    const a = state(1);

    const mut_seen: number[] = [];

    a.subscribe((v) => {
      mut_seen.push(v);
    });

    a.set(1);

    a.update((x) => x);

    assert.deepStrictEqual(mut_seen, [1]);
  });

  test('a subscriber is called with no this, the first time and after', () => {
    const a = state(1);

    const mut_thisValues: unknown[] = [];

    // A function expression, since an arrow function has no `this` to record.
    const record = function record(this: unknown): void {
      mut_thisValues.push(this);
    };

    a.subscribe(record);

    a.set(2);

    assert.deepStrictEqual(mut_thisValues, [undefined, undefined]);
  });

  test('a subscriber sees a graph that has settled', () => {
    const a = state(1);

    const b = a.pipe(map((x) => x + 1));

    const mut_seen: string[] = [];

    a.subscribe((x) => {
      mut_seen.push(`${x}/${b.value}`);
    });

    a.set(5);

    assert.deepStrictEqual(mut_seen, ['1/2', '5/6']);
  });

  test('a write inside a projection is applied after the update, and one in a subscriber starts the next', () => {
    const a = state(0);

    const b = state(0);

    const mirrored = a.pipe(
      map((x) => {
        if (x > 0) {
          b.set(x * 10);
        }

        return x;
      }),
    );

    const mut_seen: string[] = [];

    derive([mirrored, b], (...values) => values).subscribe(([x, y]) => {
      mut_seen.push(`${x},${y}`);
    });

    a.set(1);

    assert.deepStrictEqual(mut_seen, ['0,0', '1,0', '1,10']);

    const c = state(0);

    const d = state(0);

    c.subscribe((x) => {
      d.set(x + 1);
    });

    const mut_pairs: string[] = [];

    derive([c, d], (...values) => values).subscribe(([x, y]) => {
      mut_pairs.push(`${x},${y}`);
    });

    c.set(5);

    assert.deepStrictEqual(mut_pairs, ['0,1', '5,1', '5,6']);
  });

  test('batch propagates several writes in one update', () => {
    const a = state(1);

    const b = state(1);

    const mut_seen: number[] = [];

    derive([a, b], (x, y) => x + y).subscribe((v) => {
      mut_seen.push(v);
    });

    const returned = batch(() => {
      a.set(2);

      b.set(3);

      return 'done';
    });

    assert.strictEqual(returned, 'done');

    assert.deepStrictEqual(mut_seen, [2, 5]);
  });

  test('a subscriber that keeps writing what reaches it is stopped, and the next update works', () => {
    const a = state(0);

    a.subscribe((x) => {
      if (x >= 100) {
        a.set(x + 1);
      }
    });

    assert.throws(() => {
      a.set(100);
    }, /more than 100 updates in a row/u);

    const c = state(0);

    const mut_seen: number[] = [];

    c.subscribe((x) => {
      mut_seen.push(x);
    });

    c.set(1);

    assert.deepStrictEqual(mut_seen, [0, 1]);
  });

  test('a map that keeps writing to its own source is stopped the same way', () => {
    const a = state(0);

    const written = a.pipe(
      map((x) => {
        if (x >= 100) {
          a.set(x + 1);
        }

        return x;
      }),
    );

    written.subscribe(() => {});

    assert.throws(() => {
      a.set(100);
    }, /more than 100 updates in a row/u);

    // No deferred write is left over: the next update works.
    const c = state(0);

    const mut_seen: number[] = [];

    c.subscribe((x) => {
      mut_seen.push(x);
    });

    c.set(1);

    assert.deepStrictEqual(mut_seen, [0, 1]);
  });

  test('what the other subscribers write still propagates when one throws', () => {
    const a = state(0);

    const b = state(0);

    a.subscribe((x) => {
      if (x === 1) {
        b.set(10);
      }
    });

    a.subscribe((x) => {
      if (x === 1) {
        throw new Error('boom');
      }
    });

    const mut_seen: number[] = [];

    b.subscribe((x) => {
      mut_seen.push(x);
    });

    assert.throws(() => {
      a.set(1);
    }, /boom/u);

    assert.deepStrictEqual(mut_seen, [0, 10]);
  });

  test('a subscriber that writes and throws runs twice, not until the round limit', () => {
    const a = state(0);

    const mut_runs = { current: 0 };

    a.subscribe((x) => {
      if (x === 0) {
        return;
      }

      mut_runs.current += 1;

      a.set(x + 1);

      throw new Error(`failure ${x.toString()}`);
    });

    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    assert.throws(() => {
      a.set(1);
    }, 'failure 1');

    assert.strictEqual(mut_runs.current, 2);

    expect(error).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ message: 'failure 2' }),
    );

    // The second run's write reached the state; its propagation was dropped
    // with the queues.
    assert.strictEqual(a.value, 3);
  });

  test("a node's exception after a subscriber's is reported, and the subscriber's thrown", () => {
    const a = state(0);

    const b = state(0);

    a.subscribe((x) => {
      if (x !== 1) {
        return;
      }

      b.set(1);

      throw new Error('subscriber');
    });

    b.pipe(
      map((x) => {
        if (x === 1) {
          throw new Error('node');
        }

        return x;
      }),
    ).subscribe(() => {});

    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    assert.throws(() => {
      a.set(1);
    }, 'subscriber');

    expect(error).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ message: 'node' }),
    );
  });

  test('a subscriber that throws does not stop the others of its round', () => {
    const a = state(0);

    const mut_seen: string[] = [];

    a.subscribe((x) => {
      mut_seen.push(`first ${x}`);
    });

    a.subscribe((x) => {
      if (x === 1) {
        throw new Error('first failure');
      }
    });

    a.subscribe((x) => {
      if (x === 1) {
        throw new Error('second failure');
      }
    });

    a.subscribe((x) => {
      mut_seen.push(`last ${x}`);
    });

    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    assert.throws(() => {
      a.set(1);
    }, /first failure/u);

    expect(error).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ message: 'second failure' }),
    );

    assert.deepStrictEqual(mut_seen, [
      'first 0',
      'last 0',
      'first 1',
      'last 1',
    ]);

    a.set(2);

    assert.deepStrictEqual(Arr.takeLast(mut_seen, 2), ['first 2', 'last 2']);
  });

  test('an exception in a projection leaves nothing queued', () => {
    const a = state(0);

    a.pipe(
      map((x) => {
        if (x === 1) {
          throw new Error('boom');
        }

        return x;
      }),
    ).subscribe(() => {});

    const mut_seen: number[] = [];

    a.pipe(map((x) => x)).subscribe((x) => {
      mut_seen.push(x);
    });

    assert.throws(() => {
      a.set(1);
    }, /boom/u);

    a.set(2);

    assert.strictEqual(mut_seen.at(-1), 2);
  });
});

describe('writes during propagation', () => {
  test('two updates made inside a map both apply', () => {
    const trigger = state(0);

    const counter = state(0);

    const watched = trigger.pipe(
      map((x) => {
        if (x > 0) {
          counter.update((c) => c + 1);

          counter.update((c) => c + 1);
        }

        return x;
      }),
    );

    watched.subscribe(() => {});

    trigger.set(1);

    assert.strictEqual(counter.value, 2);
  });

  test('effects and recomputes run with no owner current', () => {
    const a = state(0);

    const mut_owners: unknown[] = [];

    a.subscribe(() => {
      mut_owners.push(getOwner());
    });

    const owner = createRootOwner();

    owner.run(() => {
      a.set(1);
    });

    assert.deepStrictEqual(mut_owners, [undefined, undefined]);
  });
});

describe('ownership', () => {
  test('disposing an owner takes its nodes out of the graph and runs its cleanups', () => {
    const a = state(0);

    const owner = createRootOwner();

    let mut_runs = 0;

    let mut_cleaned = 0;

    const count = (): void => {
      mut_runs += 1;
    };

    owner.run(() => {
      for (const i of [1, 2, 3, 4, 5]) {
        a.pipe(map((x) => x + i)).subscribe(count);
      }

      onCleanup(() => {
        mut_cleaned += 1;
      });
    });

    mut_runs = 0;

    owner.dispose();

    a.set(1);

    assert.strictEqual(mut_runs, 0);

    assert.strictEqual(mut_cleaned, 1);

    owner.dispose();

    assert.strictEqual(mut_cleaned, 1);
  });

  test('a child owner is disposed with its parent', () => {
    const parent = createRootOwner();

    const child = parent.run(() => createOwner());

    parent.dispose();

    assert.isTrue(child.disposed);
  });

  test('children disposed one by one leave the others with the parent', () => {
    const parent = createRootOwner();

    const children = parent.run(() =>
      Array.from({ length: 10 }, () => createOwner()),
    );

    // Past half, so that the list is compacted on the way.
    for (const child of Arr.take(children, 7)) {
      child.dispose();
    }

    const mut_cleaned: number[] = [];

    for (const [i, child] of Arr.skip(children, 7).entries()) {
      child.onCleanup(() => {
        mut_cleaned.push(i);
      });
    }

    parent.dispose();

    assert.deepStrictEqual(mut_cleaned, [2, 1, 0]);
  });

  test('a node created after its owner was disposed during run is disposed', () => {
    const a = state(0);

    const owner = createRootOwner();

    const mut_seen: number[] = [];

    owner.run(() => {
      owner.dispose();

      a.subscribe((x) => {
        mut_seen.push(x);
      });
    });

    a.set(1);

    assert.deepStrictEqual(mut_seen, [0]);
  });

  test('a long-lived owner keeps working through many subscriptions', () => {
    const a = state(0);

    const owner = createRootOwner();

    const mut_seen: number[] = [];

    owner.run(() => {
      for (const i of Array.from({ length: 100 }, (_, k) => k)) {
        const unsubscribe = a.subscribe((x) => {
          mut_seen.push(i * 1000 + x);
        });

        if (i < 99) {
          unsubscribe();
        }
      }
    });

    a.set(1);

    owner.dispose();

    a.set(2);

    // The 100 initial calls, then the one that stayed.
    assert.strictEqual(mut_seen.length, 101);

    assert.strictEqual(mut_seen.at(-1), 99_001);
  });

  test('a node made after its owner was disposed in the same run is built, then disposed', () => {
    const a = state(1);

    const owner = createRootOwner();

    const doubled = owner.run(() => {
      owner.dispose();

      return a.pipe(map((x) => x * 2));
    });

    a.set(2);

    assert.strictEqual(doubled.value, 2);
  });

  test('an owner made after its parent was disposed in the same run lives until the run ends', () => {
    const a = state(1);

    const parent = createRootOwner();

    const mut_seen: number[] = [];

    parent.run(() => {
      parent.dispose();

      const child = createOwner();

      child.run(() => {
        a.subscribe((x) => {
          mut_seen.push(x);
        });
      });
    });

    a.set(2);

    assert.deepStrictEqual(mut_seen, [1]);
  });

  test('an unsubscribed subscriber is not called again', () => {
    const a = state(0);

    const mut_seen: number[] = [];

    const unsubscribe = a.subscribe((x) => {
      mut_seen.push(x);
    });

    unsubscribe();

    a.set(1);

    assert.deepStrictEqual(mut_seen, [0]);
  });
});

describe('events', () => {
  test('delivering many queued values does not trip the loop limit', () => {
    const events = source<number>();

    const count = state(0);

    count.subscribe(() => {});

    events.subscribe(() => {
      count.update((c) => c + 1);
    });

    batch(() => {
      for (const i of Array.from({ length: 150 }, (_, k) => k)) {
        events.emit(i);
      }
    });

    assert.strictEqual(count.value, 150);
  });

  test('values queued when a subscriber threw still arrive, and later ones too', () => {
    const events = source<number>();

    const mut_seen: number[] = [];

    events.subscribe((x) => {
      if (x === 1) {
        throw new Error('first');
      }

      mut_seen.push(x);
    });

    expect(() => {
      batch(() => {
        events.emit(1);

        events.emit(2);

        events.emit(3);
      });
    }).toThrow('first');

    events.emit(4);

    events.emit(5);

    assert.deepStrictEqual(mut_seen, [2, 3, 4, 5]);
  });

  test('every emit propagates, in order, however many arrive before a round', () => {
    const trigger = state(0);

    const events = source<number>();

    const mut_seen: number[] = [];

    events.subscribe((x) => {
      mut_seen.push(x);
    });

    const count = events.pipe(scan((n: number) => n + 1, 0));

    count.subscribe(() => {});

    // From an effect.
    trigger.subscribe((x) => {
      if (x !== 1) {
        return;
      }

      events.emit(10);

      events.emit(20);
    });

    trigger.set(1);

    // In a batch.
    batch(() => {
      events.emit(30);

      events.emit(40);

      events.emit(50);
    });

    // During the drain.
    const watched = trigger.pipe(
      map((x) => {
        if (x === 2) {
          events.emit(60);

          events.emit(70);
        }

        return x;
      }),
    );

    watched.subscribe(() => {});

    trigger.set(2);

    assert.deepStrictEqual(mut_seen, [10, 20, 30, 40, 50, 60, 70]);

    assert.strictEqual(count.value, 7);
  });

  test('source, merge, filter and scan', () => {
    const e1 = source<number>();

    const e2 = source<number>();

    const sum = merge([e1, e2])
      .pipe(filter((x) => x > 0))
      .pipe(scan((acc: number, x) => acc + x, 0));

    const mut_seen: number[] = [];

    sum.subscribe((v) => {
      mut_seen.push(v);
    });

    e1.emit(1);

    e2.emit(-1);

    e2.emit(5);

    e1.emit(5);

    e1.emit(5);

    assert.deepStrictEqual(mut_seen, [0, 1, 6, 11, 16]);
  });

  test('a source passes on equal values', () => {
    const e = source<string>();

    const mut_seen: string[] = [];

    e.subscribe((v) => {
      mut_seen.push(v);
    });

    e.emit('a');

    e.emit('a');

    assert.deepStrictEqual(mut_seen, ['a', 'a']);
  });
});
