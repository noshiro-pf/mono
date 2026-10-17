import { createState, source, zip } from '../src/index.mjs';

describe('zip completion (#2343)', () => {
  test('completes when a source completes with nothing queued', () => {
    const a = source<number>();

    const b = source<string>();

    const zipped$ = zip([a, b]);

    const mut_completed: boolean[] = [];

    zipped$.subscribe(
      () => {},
      () => {
        mut_completed.push(true);
      },
    );

    a.complete();

    assert.isTrue(zipped$.isCompleted);

    assert.deepStrictEqual(mut_completed, [true]);
  });

  test('emits the values a completed source queued, then completes', () => {
    const a = source<number>();

    const b = source<string>();

    const zipped$ = zip([a, b]);

    const mut_history: (readonly [number, string])[] = [];

    zipped$.subscribe((v) => {
      mut_history.push(v);
    });

    a.next(1);

    a.next(2);

    a.complete();

    assert.isFalse(zipped$.isCompleted);

    b.next('x');

    assert.isFalse(zipped$.isCompleted);

    b.next('y');

    assert.isTrue(zipped$.isCompleted);

    b.next('z');

    assert.deepStrictEqual(mut_history, [
      [1, 'x'],
      [2, 'y'],
    ]);
  });

  test('completes on the last value of a later completed source that runs out first', () => {
    const a = source<number>();

    const b = source<string>();

    const c = source<boolean>();

    const zipped$ = zip([a, b, c]);

    const mut_history: (readonly [number, string, boolean])[] = [];

    zipped$.subscribe((v) => {
      mut_history.push(v);
    });

    a.next(1);

    a.next(2);

    a.next(3);

    a.complete();

    c.next(true);

    c.next(false);

    b.next('x');

    c.complete();

    assert.isFalse(zipped$.isCompleted);

    b.next('y');

    assert.isTrue(zipped$.isCompleted);

    b.next('z');

    assert.deepStrictEqual(mut_history, [
      [1, 'x', true],
      [2, 'y', false],
    ]);
  });

  test('completes when a later completed source has nothing queued', () => {
    const a = source<number>();

    const b = source<string>();

    const zipped$ = zip([a, b]);

    const mut_history: (readonly [number, string])[] = [];

    zipped$.subscribe((v) => {
      mut_history.push(v);
    });

    a.next(1);

    a.next(2);

    a.next(3);

    a.complete();

    b.next('x');

    assert.isFalse(zipped$.isCompleted);

    b.complete();

    assert.isTrue(zipped$.isCompleted);

    assert.deepStrictEqual(mut_history, [[1, 'x']]);
  });

  test('completes when a source completes while another still has a queue', () => {
    const a = source<number>();

    const b = source<string>();

    const zipped$ = zip([a, b]);

    a.next(1);

    a.next(2);

    b.complete();

    assert.isTrue(zipped$.isCompleted);
  });

  test('completes once the initial tuple consumed what a completed source held', () => {
    const [letters$] = createState('A');

    const [numbers$, setNumber] = createState(1);

    const zipped$ = zip([letters$, numbers$]);

    letters$.complete();

    assert.isTrue(zipped$.isCompleted);

    setNumber(2);

    assert.deepStrictEqual(zipped$.getSnapshot().value, ['A', 1]);
  });
});
