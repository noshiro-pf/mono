import { Optional } from 'ts-data-forge';
import { counter, createState, debounce, map, source } from '../src/index.mjs';

describe('completing a derived observable', () => {
  test('does not complete an upstream state that holds no resource (#2133)', () => {
    const [count$, setCount] = createState(0);

    const doubled$ = count$.pipe(map((x) => x * 2));

    doubled$.complete();

    assert.isFalse(count$.isCompleted);

    setCount(5);

    assert.deepStrictEqual(count$.getSnapshot(), Optional.some(5));

    const mut_got: number[] = [];

    count$.subscribe((v) => {
      mut_got.push(v);
    });

    setCount(6);

    assert.deepStrictEqual(mut_got, [5, 6]);
  });

  test('does not complete a shared derived observable that holds no resource', () => {
    const s = source<number>(0);

    const shared$ = s.pipe(map((x) => x + 1));

    const local$ = shared$.pipe(map((x) => x * 2));

    local$.complete();

    assert.isFalse(shared$.isCompleted);

    assert.isFalse(s.isCompleted);

    const mut_got: number[] = [];

    shared$.subscribe((v) => {
      mut_got.push(v);
    });

    s.next(1);

    assert.deepStrictEqual(mut_got, [1, 2]);
  });

  test('still stops a root with a teardown once nothing uses it', () => {
    const counter$ = counter(10, { startManually: true });

    const derived$ = counter$.pipe(map((x) => x * 2));

    const leaf$ = derived$.pipe(map((x) => x + 1));

    leaf$.complete();

    assert.isTrue(derived$.isCompleted);

    assert.isTrue(counter$.isCompleted);
  });

  test('still stops an operator with a teardown once nothing uses it', () => {
    const s = source<number>(0);

    const debounced$ = s.pipe(debounce(10));

    const leaf$ = debounced$.pipe(map((x) => x));

    leaf$.complete();

    assert.isTrue(debounced$.isCompleted);

    assert.isFalse(s.isCompleted);
  });

  test('does not stop a root with a teardown that is still used', () => {
    const counter$ = counter(10, { startManually: true });

    counter$.subscribe(() => {});

    counter$.pipe(map((x) => x)).complete();

    assert.isFalse(counter$.isCompleted);

    counter$.complete();
  });
});

describe('dispose', () => {
  test('completes the observable without completing its parents', () => {
    const counter$ = counter(10, { startManually: true });

    const derived$ = counter$.pipe(map((x) => x * 2));

    derived$.dispose();

    assert.isTrue(derived$.isCompleted);

    assert.isFalse(counter$.isCompleted);

    counter$.complete();
  });

  test('takes the observable out of the propagation graph', () => {
    const s = source<number>(0);

    s.subscribe(() => {});

    let mut_calls = 0;

    const derived$ = s.pipe(
      map((x) => {
        mut_calls += 1;

        return x;
      }),
    );

    derived$.dispose();

    assert.isFalse(s.hasChild);

    mut_calls = 0;

    s.next(1);

    expect(mut_calls).toBe(0);
  });

  test('completes the descendants that have no other live parent', () => {
    const s = source<number>(0);

    const t = source<number>(0);

    const derived$ = s.pipe(map((x) => x));

    const onlyChild$ = derived$.pipe(map((x) => x));

    const s2 = t.pipe(map((x) => x));

    const mut_got: string[] = [];

    onlyChild$.subscribe(
      () => {},
      () => {
        mut_got.push('onlyChild completed');
      },
    );

    derived$.dispose();

    assert.isTrue(onlyChild$.isCompleted);

    assert.isFalse(s2.isCompleted);

    assert.deepStrictEqual(mut_got, ['onlyChild completed']);
  });

  test('runs the teardown of the observable it is called on', async () => {
    const s = source<number>(0);

    const debounced$ = s.pipe(debounce(10));

    const mut_got: number[] = [];

    debounced$.subscribe((v) => {
      mut_got.push(v);
    });

    s.next(1);

    debounced$.dispose();

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    // Only the initial value: the pending 1 was cancelled.
    assert.deepStrictEqual(mut_got, [0]);
  });
});
