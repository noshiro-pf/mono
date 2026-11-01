import { Optional } from 'ts-data-forge';
import { createState } from '../../utils/index.mjs';
import { just } from '../create/index.mjs';
import { skipWhile } from './skip-while.mjs';

describe(skipWhile, () => {
  // Widened so the predicate is not statically decidable.
  const seed: number = 1;

  test('keeps an initialized parent value the predicate does not skip', () => {
    const kept$ = just(seed).pipe(skipWhile((x) => x > 10));

    expect(Optional.unwrapOr(kept$.getSnapshot(), -1)).toBe(1);
  });

  test('drops an initialized parent value the predicate skips', () => {
    const dropped$ = just(seed).pipe(skipWhile((x) => x < 10));

    assert.isTrue(Optional.isNone(dropped$.getSnapshot()));
  });

  test('passes every later value once the initial value has ended the skipping', () => {
    const [s$, setS] = createState(5);

    const passed$ = s$.pipe(skipWhile((x) => x < 3));

    const mut_history: number[] = [];

    passed$.subscribe((x) => {
      mut_history.push(x);
    });

    setS(1);

    setS(2);

    assert.deepStrictEqual(mut_history, [5, 1, 2]);
  });

  test('keeps skipping after an initial value the predicate skips', () => {
    const [s$, setS] = createState(1);

    const passed$ = s$.pipe(skipWhile((x) => x < 3));

    const mut_history: number[] = [];

    passed$.subscribe((x) => {
      mut_history.push(x);
    });

    setS(2);

    setS(5);

    setS(1);

    assert.deepStrictEqual(mut_history, [5, 1]);
  });

  test('asks the predicate no more once the initial value has ended the skipping', () => {
    const [s$, setS] = createState(5);

    let mut_calls = 0;

    s$.pipe(
      skipWhile((x) => {
        mut_calls += 1;

        return x < 3;
      }),
    ).subscribe(() => {});

    setS(1);

    setS(2);

    assert.strictEqual(mut_calls, 1);
  });
});
