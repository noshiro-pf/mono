/* eslint-disable functional/no-let */
/* eslint-disable total-functions/no-unsafe-type-assertion */

import { noop } from './noop.mjs';

{
  const u = {} as unknown;

  // eslint-disable-next-line ts-data-forge/prefer-is-non-null-object
  if (typeof u === 'object' && u !== null) {
    noop(u);
  }

  // eslint-disable-next-line ts-data-forge/prefer-is-non-null-object
  if (typeof u === 'object' && u !== null) {
    noop(u);
  }
}

{
  const n = 1 as number;

  // eslint-disable-next-line ts-data-forge/prefer-as-int
  noop(n as Int);

  // eslint-disable-next-line ts-data-forge/prefer-as-int
  noop((n + 1) as Int);
}

{
  const u = {} as unknown;

  // eslint-disable-next-line ts-data-forge/prefer-arr-is-array
  noop(Array.isArray(u));
}

{
  // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
  for (let i = 0; i < 10; ++i) {
    noop(i);
  }

  const begin = 5;

  const end = 15;

  // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
  for (let i = begin; i < end; ++i) {
    noop(i);
  }
}

{
  const xs = [1, 2, 3] as readonly number[];

  // eslint-disable-next-line ts-data-forge/prefer-arr-sum
  const sum = xs.reduce((a, b) => a + b, 0);

  noop(sum);
}

{
  const xs = [0, 0, 0] as readonly number[];

  // eslint-disable-next-line ts-data-forge/prefer-arr-is-array-of-length
  if (xs.length === 3) {
    noop(xs);
  }
}

{
  const xs = [0, 0, 0] as readonly number[];

  // eslint-disable-next-line ts-data-forge/prefer-arr-is-array-at-least-length
  if (xs.length >= 3) {
    noop(xs);
  }
}

{
  // eslint-disable-next-line @typescript-eslint/no-restricted-types
  const u: object = {} as const;

  // eslint-disable-next-line ts-data-forge/prefer-is-record-and-has-key
  if (Object.hasOwn(u, 'key')) {
    noop(u);
  }
}
