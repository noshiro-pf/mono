import {
  batch,
  keepEqualParts,
  map,
  merge,
  pairwise,
  skip,
  skipIfNoChange,
  skipUntil,
  skipWhile,
  source,
  state,
  take,
  takeUntil,
  takeWhile,
  withBufferedFrom,
  withCurrentValueFrom,
  zip,
  type Observable,
  type State,
} from 'synstate-next';
import { toNode } from 'synstate-next/internal';

/** Every value `observable` gives a subscriber, the current one first. */
const collect = <A,>(observable: Observable<A>): readonly A[] => {
  const mut_seen: A[] = [];

  observable.subscribe((v) => {
    mut_seen.push(v);
  });

  return mut_seen;
};

describe(pairwise, () => {
  test('emits the previous and the current value, from the second value on', () => {
    const a = state(1);

    const pairs = a.pipe(pairwise());

    const seen = collect(pairs);

    assert.isFalse(pairs.hasValue);

    a.set(2);

    a.set(3);

    assert.deepStrictEqual(seen, [
      [1, 2],
      [2, 3],
    ]);
  });

  test('pairs the values of an event source that repeat', () => {
    const e = source<number>();

    const seen = collect(e.pipe(pairwise()));

    e.emit(1);

    e.emit(1);

    e.emit(2);

    assert.deepStrictEqual(seen, [
      [1, 1],
      [1, 2],
    ]);
  });
});

describe(take, () => {
  test('passes the first n values, the one held at the start included', () => {
    const a = state(0);

    const taken = a.pipe(take(3));

    const seen = collect(taken);

    a.set(1);

    a.set(2);

    a.set(3);

    assert.deepStrictEqual(seen, [0, 1, 2]);

    assert.strictEqual(taken.value, 2);
  });

  test('counts from the first value when the source holds none', () => {
    const e = source<number>();

    const seen = collect(e.pipe(take(2)));

    e.emit(1);

    e.emit(2);

    e.emit(3);

    assert.deepStrictEqual(seen, [1, 2]);
  });

  test('rejects a count that is not a positive integer', () => {
    assert.throws(() => take(0), RangeError);

    assert.throws(() => take(1.5), RangeError);
  });
});

describe(skip, () => {
  test('drops the first n values, the one held at the start included', () => {
    const a = state(0);

    const skipped = a.pipe(skip(2));

    const seen = collect(skipped);

    assert.isFalse(skipped.hasValue);

    a.set(1);

    a.set(2);

    a.set(3);

    assert.deepStrictEqual(seen, [2, 3]);
  });

  test('passes everything for zero', () => {
    const a = state(0);

    assert.deepStrictEqual(collect(a.pipe(skip(0))), [0]);
  });
});

describe(takeWhile, () => {
  test('passes values while the predicate holds, and none after it fails once', () => {
    const a = state(1);

    const seen = collect(a.pipe(takeWhile((x) => x < 3)));

    a.set(2);

    a.set(3);

    a.set(1);

    assert.deepStrictEqual(seen, [1, 2]);
  });

  test('holds no value when the first value fails', () => {
    const a = state(5);

    const taken = a.pipe(takeWhile((x) => x < 3));

    a.set(1);

    assert.isFalse(taken.hasValue);
  });

  test('is not settled at the last value it passes: only the next value ends it', () => {
    const a = state(1);

    const taken = a.pipe(takeWhile((x) => x < 3));

    const mut_seen: (readonly [number, boolean])[] = [];

    taken.subscribe((v) => {
      mut_seen.push([v, taken.settled]);
    });

    a.set(2);

    a.set(3);

    assert.deepStrictEqual(mut_seen, [
      [1, false],
      [2, false],
    ]);

    assert.isTrue(taken.settled);
  });

  describe('inclusive', () => {
    test('passes the first value the predicate fails for, and none after it', () => {
      const a = state(1);

      const seen = collect(
        a.pipe(takeWhile((x) => x < 3, { inclusive: true })),
      );

      a.set(2);

      a.set(3);

      assert.isFalse(toNode(a).hasObserver);

      a.set(1);

      assert.deepStrictEqual(seen, [1, 2, 3]);
    });

    test('is settled when its subscriber receives that value', () => {
      const a = state(1);

      const taken = a.pipe(takeWhile((x) => x < 3, { inclusive: true }));

      const mut_seen: (readonly [number, boolean])[] = [];

      taken.subscribe((v) => {
        mut_seen.push([v, taken.settled]);
      });

      a.set(2);

      a.set(3);

      assert.deepStrictEqual(mut_seen, [
        [1, false],
        [2, false],
        [3, true],
      ]);
    });

    test('holds the held value and is settled when that value already fails', () => {
      const a = state(5);

      const taken = a.pipe(takeWhile((x) => x < 3, { inclusive: true }));

      const seen = collect(taken);

      a.set(1);

      assert.deepStrictEqual(seen, [5]);

      assert.isTrue(taken.settled);

      assert.isFalse(toNode(a).hasObserver);
    });

    test('holds no value until the source emits, then counts that value', () => {
      const e = source<number>();

      const taken = e.pipe(takeWhile((x) => x < 3, { inclusive: true }));

      const seen = collect(taken);

      assert.isFalse(taken.hasValue);

      e.emit(4);

      e.emit(1);

      assert.deepStrictEqual(seen, [4]);

      assert.isTrue(taken.settled);
    });

    test('passes the same values as without it until the predicate fails', () => {
      const a = state(0);

      const plain = collect(a.pipe(takeWhile((x) => x < 3)));

      const inclusive = collect(
        a.pipe(takeWhile((x) => x < 3, { inclusive: true })),
      );

      a.set(1);

      a.set(2);

      assert.deepStrictEqual(inclusive, plain);

      assert.deepStrictEqual(inclusive, [0, 1, 2]);
    });
  });
});

describe(skipWhile, () => {
  test('drops values while the predicate holds, and passes all after it fails once', () => {
    const a = state(1);

    const seen = collect(a.pipe(skipWhile((x) => x < 3)));

    a.set(2);

    a.set(3);

    a.set(1);

    assert.deepStrictEqual(seen, [3, 1]);
  });
});

describe(takeUntil, () => {
  test('stops following the source once the notifier emits, keeping the last value', () => {
    const a = state(0);

    const stop = source<undefined>();

    const taken = a.pipe(takeUntil(stop));

    const seen = collect(taken);

    a.set(1);

    stop.emit(undefined);

    a.set(2);

    assert.deepStrictEqual(seen, [0, 1]);

    assert.strictEqual(taken.value, 1);
  });

  test('a value written in the update the notifier emits in does not pass', () => {
    const a = state(0);

    const stop = source<undefined>();

    const seen = collect(a.pipe(takeUntil(stop)));

    batch(() => {
      a.set(1);

      stop.emit(undefined);
    });

    assert.deepStrictEqual(seen, [0]);
  });

  test('a value the notifier holds at the start is not an emission', () => {
    const a = state(0);

    const notifier = state('held');

    const seen = collect(a.pipe(takeUntil(notifier)));

    a.set(1);

    notifier.set('changed');

    a.set(2);

    assert.deepStrictEqual(seen, [0, 1]);
  });
});

describe(skipUntil, () => {
  test('passes nothing until the notifier emits, then everything', () => {
    const a = state(0);

    const go = source<undefined>();

    const skipped = a.pipe(skipUntil(go));

    const seen = collect(skipped);

    a.set(1);

    assert.isFalse(skipped.hasValue);

    go.emit(undefined);

    a.set(2);

    a.set(3);

    assert.deepStrictEqual(seen, [2, 3]);
  });

  test('a value written in the update the notifier emits in passes', () => {
    const a = state(0);

    const go = source<undefined>();

    const seen = collect(a.pipe(skipUntil(go)));

    batch(() => {
      a.set(1);

      go.emit(undefined);
    });

    assert.deepStrictEqual(seen, [1]);
  });
});

describe(withCurrentValueFrom, () => {
  test('pairs each value of the source with the current value of the other', () => {
    const clicks = source<string>();

    const count = state(0);

    const seen = collect(clicks.pipe(withCurrentValueFrom(count)));

    clicks.emit('a');

    count.set(1);

    count.set(2);

    clicks.emit('b');

    assert.deepStrictEqual(seen, [
      ['a', 0],
      ['b', 2],
    ]);
  });

  test('reads the value the other has settled on in the same update', () => {
    const a = state(1);

    const doubled = a
      .pipe(withCurrentValueFrom(a))
      .pipe(withCurrentValueFrom(state(0)));

    const deep = state(10);

    const deeper = deep.pipe(skipIfNoChange()).pipe(skipIfNoChange());

    const paired = a.pipe(withCurrentValueFrom(deeper));

    const seen = collect(paired);

    batch(() => {
      a.set(2);

      deep.set(20);
    });

    assert.deepStrictEqual(seen, [
      [1, 10],
      [2, 20],
    ]);

    assert.deepStrictEqual(doubled.getSnapshot(), [[2, 2], 0]);
  });

  test('emits nothing while the other holds no value', () => {
    const a = state(1);

    const other = source<number>();

    const paired = a.pipe(withCurrentValueFrom(other));

    assert.isFalse(paired.hasValue);

    other.emit(5);

    assert.isFalse(paired.hasValue);

    a.set(2);

    assert.deepStrictEqual(paired.getSnapshot(), [2, 5]);
  });
});

describe(withBufferedFrom, () => {
  test('gives each value of the source the values the other emitted since the previous one', () => {
    const save = source<'save'>();

    const edits = source<string>();

    const seen = collect(save.pipe(withBufferedFrom(edits)));

    edits.emit('a');

    edits.emit('b');

    save.emit('save');

    save.emit('save');

    edits.emit('c');

    save.emit('save');

    assert.deepStrictEqual(seen, [
      ['save', ['a', 'b']],
      ['save', []],
      ['save', ['c']],
    ]);
  });

  test('includes a value the other emitted in the same update', () => {
    const save = source<'save'>();

    const edits = source<string>();

    const seen = collect(save.pipe(withBufferedFrom(edits)));

    batch(() => {
      edits.emit('a');

      save.emit('save');
    });

    assert.deepStrictEqual(seen, [['save', ['a']]]);
  });
});

describe(keepEqualParts, () => {
  test('keeps the references of the parts that did not change', () => {
    const a = state({ x: { n: 1 }, y: { n: 2 } });

    const kept = a.pipe(keepEqualParts());

    const first = kept.value;

    a.set({ x: { n: 1 }, y: { n: 3 } });

    assert.strictEqual(kept.value.x, first.x);

    assert.notStrictEqual(kept.value.y, first.y);
  });

  test('emits nothing for a value deeply equal to the one held', () => {
    const a = state({ x: [1, 2] });

    const seen = collect(a.pipe(keepEqualParts()));

    a.set({ x: [1, 2] });

    assert.strictEqual(seen.length, 1);
  });
});

describe(skipIfNoChange, () => {
  test('drops a value equal to the one held', () => {
    const e = source<number>();

    const seen = collect(e.pipe(skipIfNoChange()));

    e.emit(1);

    e.emit(1);

    e.emit(2);

    assert.deepStrictEqual(seen, [1, 2]);
  });

  test('compares with the given equality', () => {
    const e = source<Readonly<{ id: number; label: string }>>();

    const seen = collect(e.pipe(skipIfNoChange((p, q) => p.id === q.id)));

    e.emit({ id: 1, label: 'a' });

    e.emit({ id: 1, label: 'b' });

    e.emit({ id: 2, label: 'c' });

    assert.deepStrictEqual(
      seen.map((v) => v.label),
      ['a', 'c'],
    );
  });
});

describe(zip, () => {
  test('pairs the n-th values of every parent', () => {
    const a = source<number>();

    const b = source<string>();

    const seen = collect(zip([a, b]));

    a.emit(1);

    a.emit(2);

    b.emit('x');

    b.emit('y');

    b.emit('z');

    a.emit(3);

    assert.deepStrictEqual(seen, [
      [1, 'x'],
      [2, 'y'],
      [3, 'z'],
    ]);
  });

  test('takes the values the parents hold at the start as their first', () => {
    const a = state(1);

    const b = state('x');

    const zipped = zip([a, b]);

    const seen = collect(zipped);

    a.set(2);

    b.set('y');

    assert.deepStrictEqual(seen, [
      [1, 'x'],
      [2, 'y'],
    ]);
  });

  test('values written in one update are zipped once', () => {
    const a = source<number>();

    const b = source<number>();

    const seen = collect(zip([a, b]));

    batch(() => {
      a.emit(1);

      b.emit(10);
    });

    assert.deepStrictEqual(seen, [[1, 10]]);
  });
});

// The source has a subscriber, so the write waits for the batch to end.
const pendingState = (): State<number> => {
  const a = state(0);

  a.subscribe(() => {});

  return a;
};

describe('an operator created in the update its source was written in', () => {
  test('counts the written value once', () => {
    const a = pendingState();

    const mut_pairs: unknown[] = [];

    const mut_taken: number[] = [];

    batch(() => {
      a.set(1);

      a.pipe(pairwise()).subscribe((v) => {
        mut_pairs.push(v);
      });

      a.pipe(take(2)).subscribe((v) => {
        mut_taken.push(v);
      });
    });

    a.set(5);

    assert.deepStrictEqual(mut_pairs, [[1, 5]]);

    assert.deepStrictEqual(mut_taken, [1, 5]);
  });

  test('a subscriber made in the batch is called once with the written value', () => {
    const a = pendingState();

    const mut_seen: number[] = [];

    batch(() => {
      a.set(1);

      a.subscribe((v) => {
        mut_seen.push(v);
      });
    });

    assert.deepStrictEqual(mut_seen, [1]);
  });

  test('zip queues the written value once', () => {
    const a = source<number>();

    const b = source<number>();

    a.subscribe(() => {});

    b.subscribe(() => {});

    const mut_seen: unknown[] = [];

    batch(() => {
      a.emit(1);

      b.emit(2);

      zip([a, b]).subscribe((v) => {
        mut_seen.push(v);
      });
    });

    a.emit(3);

    b.emit(4);

    assert.deepStrictEqual(mut_seen, [
      [1, 2],
      [3, 4],
    ]);
  });

  test('a notifier written before is not an emission after', () => {
    const a = pendingState();

    const n = source<number>();

    n.subscribe(() => {});

    const other = source<number>();

    other.subscribe(() => {});

    const mut_taken: number[] = [];

    let mut_buffered: unknown = undefined;

    batch(() => {
      n.emit(1);

      other.emit(7);

      a.pipe(takeUntil(n)).subscribe((v) => {
        mut_taken.push(v);
      });

      a.pipe(withBufferedFrom(other)).subscribe((v) => {
        mut_buffered = v;
      });
    });

    a.set(9);

    assert.deepStrictEqual(mut_taken, [0, 9]);

    assert.deepStrictEqual(mut_buffered, [9, []]);
  });
});

describe('a node made in a batch after a write', () => {
  test('sees what one made after the batch sees', () => {
    const a = pendingState();

    const mut_inBatch: number[] = [];

    batch(() => {
      a.set(1);

      merge([a]).subscribe((v) => {
        mut_inBatch.push(v);
      });
    });

    const mut_after: number[] = [];

    merge([a]).subscribe((v) => {
      mut_after.push(v);
    });

    a.set(2);

    assert.deepStrictEqual(mut_inBatch, [2]);

    assert.deepStrictEqual(mut_after, [2]);
  });
});

describe('a node made in a batch below a derived node', () => {
  test('sees the derived node emit in the round, after it was made', () => {
    const a = pendingState();

    const m = a.pipe(map((x) => x * 10));

    m.subscribe(() => {});

    const mut_taken: number[] = [];

    batch(() => {
      a.set(1);

      m.pipe(take(2)).subscribe((v) => {
        mut_taken.push(v);
      });
    });

    // It read 0 when it was made: `m` emits 10 only when the round runs.
    assert.deepStrictEqual(mut_taken, [0, 10]);
  });
});

describe('settled', () => {
  test('a state is settled only once disposed', () => {
    const a = state(0);

    a.set(1);

    assert.isFalse(a.settled);

    a.dispose();

    assert.isTrue(a.settled);
  });

  test('take is settled when its subscriber receives its last value', () => {
    const e = source<number>();

    const taken = e.pipe(take(2));

    const mut_seen: (readonly [number, boolean])[] = [];

    taken.subscribe((v) => {
      mut_seen.push([v, taken.settled]);
    });

    e.emit(1);

    e.emit(2);

    e.emit(3);

    assert.deepStrictEqual(mut_seen, [
      [1, false],
      [2, true],
    ]);
  });

  test('below a map, the last value of a take arrives settled', () => {
    const e = source<number>();

    const doubled = e.pipe(take(2)).pipe(map((x) => x * 2));

    const mut_seen: (readonly [number, boolean])[] = [];

    doubled.subscribe((v) => {
      mut_seen.push([v, doubled.settled]);
    });

    e.emit(1);

    e.emit(2);

    assert.deepStrictEqual(mut_seen, [
      [2, false],
      [4, true],
    ]);
  });

  test('below a map, the value that ends an inclusive takeWhile arrives settled', () => {
    const e = source<number>();

    const doubled = e
      .pipe(takeWhile((x) => x < 2, { inclusive: true }))
      .pipe(map((x) => x * 2));

    const mut_seen: (readonly [number, boolean])[] = [];

    doubled.subscribe((v) => {
      mut_seen.push([v, doubled.settled]);
    });

    e.emit(1);

    e.emit(2);

    e.emit(3);

    assert.deepStrictEqual(mut_seen, [
      [2, false],
      [4, true],
    ]);
  });

  test('a takeWhile is settled once its source is, with no value failing', () => {
    const e = source<number>();

    const taken = e.pipe(takeWhile((x) => x < 10));

    e.emit(1);

    assert.isFalse(taken.settled);

    e.dispose();

    assert.isTrue(taken.settled);
  });

  test('a disposed observable is settled', () => {
    const a = state(0);

    const doubled = a.pipe(map((x) => x * 2));

    assert.isFalse(doubled.settled);

    doubled.dispose();

    assert.isTrue(doubled.settled);
  });
});

describe('a finished operator', () => {
  test('leaves its parents', () => {
    const a = state(0);

    const stop = source<undefined>();

    a.pipe(take(2)).subscribe(() => {});

    a.pipe(takeWhile((x) => x < 1)).subscribe(() => {});

    a.pipe(takeUntil(stop)).subscribe(() => {});

    assert.isTrue(toNode(a).hasObserver);

    a.set(1);

    stop.emit(undefined);

    assert.isFalse(toNode(a).hasObserver);

    assert.isFalse(toNode(stop).hasObserver);
  });

  test('leaves at creation when the held value already ends it', () => {
    const a = state(5);

    a.pipe(takeWhile((x) => x < 3)).subscribe(() => {});

    assert.isFalse(toNode(a).hasObserver);
  });

  test('leaves a parent it follows twice', () => {
    const a = state(0);

    a.pipe(takeUntil(a)).subscribe(() => {});

    const seen = collect(a);

    a.set(1);

    a.set(2);

    assert.deepStrictEqual(seen, [0, 1, 2]);

    assert.isTrue(toNode(a).hasObserver);
  });

  test('disposing it afterwards leaves its siblings observed', () => {
    const a = state(0);

    const taken = a.pipe(take(1));

    const seen = collect(a);

    taken.dispose();

    assert.isTrue(toNode(a).hasObserver);

    a.set(1);

    assert.deepStrictEqual(seen, [0, 1]);
  });
});

describe('zip with a parent ahead', () => {
  test('zips in order while one parent stays a value ahead', () => {
    const a = source<number>();

    const b = source<number>();

    const zipped = zip([a, b]);

    a.emit(0);

    for (const i of Array.from({ length: 200 }, (_, k) => k)) {
      batch(() => {
        a.emit(i + 1);

        b.emit(i);
      });
    }

    assert.deepStrictEqual(zipped.getSnapshot(), [199, 199]);
  });
});
