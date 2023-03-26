import { expectType } from '@noshiro/ts-utils';
import { fromArray } from '../create';
import { withInitialValue } from '../operators';
import {
  type InitializedSyncChildObservable,
  type SyncChildObservable,
} from '../types';
import { zip, zipI } from './zip';

// type tests

const r1 = fromArray([1, 2, 3]);
const r2 = fromArray(['a', 'b', 'c']);

const z = zip([r1, r2] as const);

const zi = zipI([
  r1.chain(withInitialValue(0)),
  r2.chain(withInitialValue('0')),
] as const);

expectType<typeof z, SyncChildObservable<readonly [number, string], 'zip'>>(
  '<='
);

expectType<
  typeof zi,
  InitializedSyncChildObservable<readonly [number, string], 'zip'>
>('<=');

test('dummy', () => {
  expect(1).toBe(1);
});
