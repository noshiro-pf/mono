import { noop } from './noop.mjs';

const foo = {
  bar: 42,
} as const;

type MyInt = Brand<number, 'MyInt'>;

// eslint-disable-next-line total-functions/no-unsafe-type-assertion, ts-restrictions/no-restricted-cast-name
const asMyInt = (value: unknown): MyInt => value as MyInt;

// eslint-disable-next-line total-functions/no-unsafe-type-assertion, ts-restrictions/no-restricted-cast-name
const result = foo.bar as MyInt;

const fixed = asMyInt(foo.bar);

noop(result, fixed);
