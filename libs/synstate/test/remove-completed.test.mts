import { Optional } from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';
import {
  combine,
  createState,
  map,
  source,
  switchMap,
  takeWhile,
} from '../src/index.mjs';

describe('a completed observable leaves the propagation graph', () => {
  test('completed derived observables stop computing (#2134)', () => {
    const [count$, setCount] = createState(0);

    // A subscriber, so that the root has a reason to stay alive whatever the
    // completion rules for an unused root are.
    count$.subscribe(() => {});

    let mut_calls = 0;

    const countCall = (x: number): number => {
      mut_calls += 1;

      return x;
    };

    for (const _ of Array.from({ length: 1000 })) {
      const d = count$.pipe(map(countCall));

      d.complete();

      assert.isTrue(d.isCompleted);
    }

    mut_calls = 0;

    setCount(1);

    expect(mut_calls).toBe(0);
  });

  test('a completed descendant several levels down stops computing', () => {
    const [count$, setCount] = createState(0);

    count$.subscribe(() => {});

    let mut_calls = 0;

    const d1 = count$.pipe(map((x) => x + 1));

    const d2 = d1.pipe(
      map((x) => {
        mut_calls += 1;

        return x;
      }),
    );

    d1.subscribe(() => {});

    d2.complete();

    mut_calls = 0;

    setCount(1);

    expect(mut_calls).toBe(0);

    assert.deepStrictEqual(d1.getSnapshot(), Optional.some(2));
  });

  test('the parent no longer reports the completed child', () => {
    const s = source<number>(0);

    s.subscribe(() => {});

    const d = s.pipe(map((x) => x));

    assert.isTrue(s.hasChild);

    d.complete();

    assert.isFalse(s.hasChild);

    assert.isFalse(s.hasActiveChild());
  });

  test('a node with another live parent keeps updating', () => {
    const a = source<number>(0);

    const b = source<number>(0);

    const a2 = a.pipe(map((x) => x * 10));

    const c = combine([a2, b]);

    const mut_got: FixedLengthTuple<2, number>[] = [];

    c.subscribe((v) => {
      mut_got.push(v);
    });

    b.complete();

    a.next(1);

    assert.deepStrictEqual(mut_got, [
      [0, 0],
      [10, 0],
    ]);
  });

  test('a sibling completing during propagation does not disturb the others', () => {
    const s = source<number>(0);

    const stopper = s.pipe(takeWhile((x) => x < 1));

    stopper.subscribe(() => {});

    const mut_got: number[] = [];

    s.pipe(map((x) => x * 2)).subscribe((v) => {
      mut_got.push(v);
    });

    s.next(1);

    s.next(2);

    assert.isTrue(stopper.isCompleted);

    assert.deepStrictEqual(mut_got, [0, 2, 4]);
  });

  test('a node created during propagation is not updated by that same update', () => {
    const s = source<number>(0);

    let mut_calls = 0;

    const mut_got: number[] = [];

    // Subscribed on a child, so the node is created while `s` is already
    // walking its propagation order.
    s.pipe(map((x) => x)).subscribe((x) => {
      if (x === 1) {
        s.pipe(
          map((y) => {
            mut_calls += 1;

            return y;
          }),
        ).subscribe((y) => {
          mut_got.push(y);
        });
      }
    });

    s.next(1);

    // Only the initial value computed when the node was created.
    expect(mut_calls).toBe(1);

    assert.deepStrictEqual(mut_got, [1]);

    s.next(2);

    assert.deepStrictEqual(mut_got, [1, 2]);
  });

  test('inner observables switched away from stop computing', () => {
    const [outer$, setOuter] = createState(0);

    const [inner$, setInner] = createState(0);

    inner$.subscribe(() => {});

    let mut_calls = 0;

    const result$ = outer$.pipe(
      switchMap((o) =>
        inner$.pipe(
          map((i) => {
            mut_calls += 1;

            return o + i;
          }),
        ),
      ),
    );

    result$.subscribe(() => {});

    for (const o of [1, 2, 3, 4, 5]) {
      setOuter(o);
    }

    mut_calls = 0;

    setInner(1);

    expect(mut_calls).toBe(1);
  });
});
