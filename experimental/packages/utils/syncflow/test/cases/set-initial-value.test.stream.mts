import { expectType } from '@noshiro/ts-utils';
import {
  interval,
  map,
  setInitialValue,
  take,
  type InitializedObservable,
} from '../../src/index.mjs';
import { testStream } from '../test-stream.mjs';
import { setInitialValueTestCases } from './set-initial-value.mjs';

for (const c of setInitialValueTestCases) {
  testStream(c);
}

const s0 = interval(1000).chain(take(1));
const s1 = s0.chain(setInitialValue(0));
const s2 = s1.chain(map((x) => x * 2));
const s3 = s0.chain(setInitialValue(0)).chain(map((x) => x * 2));

if (import.meta.vitest !== undefined) {
  test('type-check', () => {
    expectType<typeof s2, InitializedObservable<number>>('=');
    expectType<typeof s3, InitializedObservable<number>>('=');

    expect(s2).toBe(s2);
    expect(s3).toBe(s3);
  });
}
