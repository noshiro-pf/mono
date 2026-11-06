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

    e.next(1);

    e.next(1);

    e.next(2);

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

    e.next(1);

    e.next(2);

    e.next(3);

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

    stop.next(undefined);

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

      stop.next(undefined);
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

    go.next(undefined);

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

      go.next(undefined);
    });

    assert.deepStrictEqual(seen, [1]);
  });
});

describe(withCurrentValueFrom, () => {
  test('pairs each value of the source with the current value of the other', () => {
    const clicks = source<string>();

    const count = state(0);

    const seen = collect(clicks.pipe(withCurrentValueFrom(count)));

    clicks.next('a');

    count.set(1);

    count.set(2);

    clicks.next('b');

    assert.deepStrictEqual(seen, [
      ['a', 0],
      ['b', 2],
    ]);
  });

  test('reads the value the other has settled on in the same update', () => {
    const a = state(1);

    const doubled = a.pipe(
      withCurrentValueFrom(a),
      withCurrentValueFrom(state(0)),
    );

    const deep = state(10);

    const deeper = deep.pipe(skipIfNoChange(), skipIfNoChange());

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

    assert.deepStrictEqual(doubled.peek(), [[2, 2], 0]);
  });

  test('emits nothing while the other holds no value', () => {
    const a = state(1);

    const other = source<number>();

    const paired = a.pipe(withCurrentValueFrom(other));

    assert.isFalse(paired.hasValue);

    other.next(5);

    assert.isFalse(paired.hasValue);

    a.set(2);

    assert.deepStrictEqual(paired.peek(), [2, 5]);
  });
});

describe(withBufferedFrom, () => {
  test('gives each value of the source the values the other emitted since the previous one', () => {
    const save = source<'save'>();

    const edits = source<string>();

    const seen = collect(save.pipe(withBufferedFrom(edits)));

    edits.next('a');

    edits.next('b');

    save.next('save');

    save.next('save');

    edits.next('c');

    save.next('save');

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
      edits.next('a');

      save.next('save');
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

    e.next(1);

    e.next(1);

    e.next(2);

    assert.deepStrictEqual(seen, [1, 2]);
  });

  test('compares with the given equality', () => {
    const e = source<Readonly<{ id: number; label: string }>>();

    const seen = collect(e.pipe(skipIfNoChange((p, q) => p.id === q.id)));

    e.next({ id: 1, label: 'a' });

    e.next({ id: 1, label: 'b' });

    e.next({ id: 2, label: 'c' });

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

    a.next(1);

    a.next(2);

    b.next('x');

    b.next('y');

    b.next('z');

    a.next(3);

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
      a.next(1);

      b.next(10);
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
      a.next(1);

      b.next(2);

      zip([a, b]).subscribe((v) => {
        mut_seen.push(v);
      });
    });

    a.next(3);

    b.next(4);

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
      n.next(1);

      other.next(7);

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

describe('a finished operator', () => {
  test('leaves its parents', () => {
    const a = state(0);

    const stop = source<undefined>();

    a.pipe(take(2)).subscribe(() => {});

    a.pipe(takeWhile((x) => x < 1)).subscribe(() => {});

    a.pipe(takeUntil(stop)).subscribe(() => {});

    assert.isTrue(toNode(a).hasObserver);

    a.set(1);

    stop.next(undefined);

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

    a.next(0);

    for (const i of Array.from({ length: 200 }, (_, k) => k)) {
      batch(() => {
        a.next(i + 1);

        b.next(i);
      });
    }

    assert.deepStrictEqual(zipped.peek(), [199, 199]);
  });
});
