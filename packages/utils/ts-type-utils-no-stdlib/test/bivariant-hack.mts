import { expectType } from './expect-type.mjs';

expectType<BivariantHack<(a: number) => string>, (a: number) => string>('=');

expectType<
  BivariantHack<(a: number, b: string) => string>,
  (a: number, b: string) => string
>('=');
