import { type BivariantHack } from '../src';
import { expectType } from './expect-type';

expectType<BivariantHack<(a: number) => string>, (a: number) => string>('=');

expectType<
  BivariantHack<(a: number, b: string) => string>,
  (a: number, b: string) => string
>('=');
