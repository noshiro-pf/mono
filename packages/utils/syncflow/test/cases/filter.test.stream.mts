import { expectType, isNumber } from '@noshiro/ts-utils';
import { filter, fromArray, type Observable } from '../../src/index.mjs';
import { testStream } from '../test-stream.mjs';
import { filterTestCases } from './filter.mjs';

for (const c of filterTestCases) {
  testStream(c);
}

// type tests
const obs$ = fromArray([1, '2', 3]).chain(filter(isNumber));

if (import.meta.vitest !== undefined) {
  test('type-check', () => {
    expectType<typeof obs$, Observable<number>>('=');

    expect(obs$).toBe(obs$);
  });
}
