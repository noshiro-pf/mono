import { expectType } from './expect-type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<keyof never, keyof any>('=');

expectType<never, keyof unknown>('=');

expectType<keyof never, PropertyKey>('=');
