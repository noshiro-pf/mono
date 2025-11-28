// Example: src/functional/pipe.mts (pipe mapNullable)
import { pipe } from 'ts-data-forge';

// embed-sample-code-ignore-above
const result = pipe<string | undefined>('hello')
  .mapNullable((value) => value.toUpperCase())
  .mapNullable((value) => value.slice(0, 2));

assert.deepStrictEqual(result.value, 'HE');

const empty = pipe<string | undefined>(undefined).mapNullable((value) =>
  value.toUpperCase(),
);

assert.isTrue(empty.value === undefined);
