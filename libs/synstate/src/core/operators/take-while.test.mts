import { createState } from '../../utils/index.mjs';
import { takeWhile } from './take-while.mjs';

describe(takeWhile, () => {
  test('completes at once when the initial value fails the predicate', () => {
    const [s$, setS] = createState(5);

    const taken$ = s$.pipe(takeWhile((x) => x < 3));

    const mut_events: string[] = [];

    taken$.subscribe(
      (x) => {
        mut_events.push(`next ${x}`);
      },
      () => {
        mut_events.push('complete');
      },
    );

    assert.isTrue(taken$.isCompleted);

    setS(1);

    assert.deepStrictEqual(mut_events, ['complete']);
  });

  test('keeps taking after an initial value that passes the predicate', () => {
    const [s$, setS] = createState(1);

    const taken$ = s$.pipe(takeWhile((x) => x < 3));

    const mut_history: number[] = [];

    taken$.subscribe((x) => {
      mut_history.push(x);
    });

    setS(2);

    assert.isFalse(taken$.isCompleted);

    setS(5);

    assert.isTrue(taken$.isCompleted);

    setS(1);

    assert.deepStrictEqual(mut_history, [1, 2]);
  });
});
