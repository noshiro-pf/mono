import type { ExpectTrue, TypeEq } from '../src';
import { assertType } from './assert-type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
assertType<ExpectTrue<TypeEq<keyof never, keyof any>>>();

assertType<ExpectTrue<TypeEq<never, keyof unknown>>>();

assertType<ExpectTrue<TypeEq<keyof never, PropertyKey>>>();
