import { expectType } from 'ts-data-forge';
import { type BivariantHack } from './bivariant-hack.mjs';

expectType<BivariantHack<(a: number) => string>, (a: number) => string>('=');

expectType<
  BivariantHack<(a: number, b: string) => string>,
  (a: number, b: string) => string
>('=');
