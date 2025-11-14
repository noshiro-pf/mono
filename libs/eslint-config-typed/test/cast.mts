import { asInt } from 'ts-data-forge';
import { noop } from './noop.mjs';

const foo = {
  bar: 42,
} as const;

// eslint-disable-next-line total-functions/no-unsafe-type-assertion, ts-restrictions/no-restricted-cast-name
const result = foo.bar as Int;

const fixed = asInt(foo.bar);

noop(result, fixed);
