import { assertType } from '@noshiro/ts-utils';
import { fromArray } from '../create';
import { withInitialValue } from '../operators';
import type {
  InitializedSyncChildObservable,
  SyncChildObservable,
} from '../types';
import { combineLatest, combineLatestI } from './combine-latest';

// type tests

const r1 = fromArray([1, 2, 3]);
const r2 = fromArray(['a', 'b', 'c']);

const cm = combineLatest([r1, r2] as const);

const cmi = combineLatestI([
  r1.chain(withInitialValue(0)),
  r2.chain(withInitialValue(0)),
] as const);

assertType<
  TypeExtends<
    typeof cm,
    SyncChildObservable<readonly [number, string], 'combineLatest'>
  >
>();

assertType<
  TypeExtends<
    typeof cmi,
    InitializedSyncChildObservable<
      readonly [number, number | string],
      'combineLatest'
    >
  >
>();

test('dummy', () => {
  expect(1).toBe(1);
});
