import { noop } from './noop.mjs';

const flag = true as boolean;

type Elem =
  | Readonly<{ a: 'str0' }>
  | Readonly<{ b: 'str1' }>
  | Readonly<{ c: 'str2' }>;

const a = [
  { a: 'str0' },
  ...(flag ? ([{ b: 'str1' }, { c: 'str2' }] as const) : []),
] as const satisfies readonly Elem[];

const b = [
  { a: 'str0' },
  ...[{ b: 'str1' }, { c: 'str2' }],
] as const satisfies readonly Elem[];

noop(a, b);
