import { expectType } from '@noshiro/ts-utils';
import { expect, test } from 'vitest';
import { fromArray } from '../create/index.mjs';
import { type SyncChildObservable } from '../types/index.mjs';
import { merge } from './merge.mjs';

// type tests

const r1 = fromArray([1, 2, 3]);
const r2 = fromArray(['a', 'b', 'c']);

// eslint-disable-next-line deprecation/deprecation
const m = merge([r1, r2] as const);

expectType<typeof m, SyncChildObservable<number | string, 'merge'>>('<=');

test('dummy', () => {
  expect(1).toBe(1);
});
