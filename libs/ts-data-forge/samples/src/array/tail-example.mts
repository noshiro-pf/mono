// Example: src/array/array-utils.mts (tail, rest)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
{
  const scientists = ['Ada', 'Grace', 'Katherine'] as const;

  const remainder = Arr.tail(scientists);

  assert.deepStrictEqual(remainder, ['Grace', 'Katherine']);

  assert(remainder.length === 2);
}

{
  const values = [1, 2, 3] as const;

  const remainder = Arr.rest(values);

  const emptyRemainder = Arr.rest([1] as const);

  assert.deepStrictEqual(remainder, [2, 3] as const);

  assert.deepStrictEqual(emptyRemainder, [] as const);
}
