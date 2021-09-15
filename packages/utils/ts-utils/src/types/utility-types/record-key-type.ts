import { assertType } from './test-type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
assertType<TypeEq<keyof never, keyof any>>();
assertType<TypeEq<keyof never, PropertyKey>>();
export type RecordKeyType = keyof never;
