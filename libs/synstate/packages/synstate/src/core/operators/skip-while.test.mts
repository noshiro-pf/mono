import { Optional } from 'ts-data-forge';
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
});
