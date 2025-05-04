import { expectType } from '../expect-type.mjs';

expectType<keyof never, keyof any>('=');

expectType<keyof never, string | number | symbol>('=');

expectType<never, keyof unknown>('=');

expectType<keyof never, PropertyKey>('=');
