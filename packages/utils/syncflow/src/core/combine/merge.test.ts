import { assertType } from '@noshiro/ts-utils';
import { fromArray } from '../create';
import { type SyncChildObservable } from '../types';
import { merge } from './merge';

// type tests

const r1 = fromArray([1, 2, 3]);
const r2 = fromArray(['a', 'b', 'c']);

// eslint-disable-next-line deprecation/deprecation
const m = merge([r1, r2] as const);

assertType<
  TypeExtends<typeof m, SyncChildObservable<number | string, 'merge'>>
>();

test('dummy', () => {
  expect(1).toBe(1);
});
