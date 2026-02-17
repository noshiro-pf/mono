import { expectType } from 'ts-data-forge';
import {
  interval,
  map,
  take,
  withInitialValue,
  type InitializedObservable,
} from '../../src/index.mjs';
import { testStream } from '../test-stream.mjs';
import { withInitialValueTestCases } from './with-initial-value.mjs';

for (const c of withInitialValueTestCases) {
  testStream(c);
}

const s0 = interval(1000).pipe(take(1));

const s1 = s0.pipe(withInitialValue(0));

const s2 = s1.pipe(map((x) => x * 2));

const s3 = s0.pipe(withInitialValue(0)).pipe(map((x) => x * 2));

if (import.meta.vitest !== undefined) {
  test('type-check', () => {
    expectType<typeof s2, InitializedObservable<number>>('=');

    expectType<typeof s3, InitializedObservable<number>>('=');

    expect(s2).toBe(s2);

    expect(s3).toBe(s3);
  });
}
