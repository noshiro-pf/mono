import { expectType } from '@noshiro/ts-utils';
import { expect, test } from 'vitest';
import { fromArray } from '../create/index.mjs';
import { withInitialValue } from '../operators/index.mjs';
import {
  type InitializedSyncChildObservable,
  type SyncChildObservable,
} from '../types/index.mjs';
import { combineLatest, combineLatestI } from './combine-latest.mjs';

// type tests

const r1 = fromArray([1, 2, 3]);
const r2 = fromArray(['a', 'b', 'c']);

const cm = combineLatest([r1, r2] as const);

const cmi = combineLatestI([
  r1.chain(withInitialValue(0)),
  r2.chain(withInitialValue(0)),
] as const);

expectType<
  typeof cm,
  SyncChildObservable<readonly [number, string], 'combineLatest'>
>('<=');

expectType<
  typeof cmi,
  InitializedSyncChildObservable<
    readonly [number, number | string],
    'combineLatest'
  >
>('<=');

test('dummy', () => {
  expect(1).toBe(1);
});
