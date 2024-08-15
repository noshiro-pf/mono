import { expectType } from '@noshiro/ts-utils';
import { fromArray } from '../create/index.mjs';
import { type SyncChildObservable } from '../types/index.mjs';
import { merge } from './merge.mjs';

// type tests

const r1 = fromArray([1, 2, 3]);
const r2 = fromArray(['a', 'b', 'c']);

// eslint-disable-next-line deprecation/deprecation
const m = merge([r1, r2] as const);

if (import.meta.vitest !== undefined) {
  test('type-check', () => {
    expectType<typeof m, SyncChildObservable<number | string, 'merge'>>('<=');

    expect(m).toBe(m);
  });
}
