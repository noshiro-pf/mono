import { assertType } from '@noshiro/ts-utils';
import { filter, fromArray, type Observable } from '../../src';
import { testStream } from '../test-stream';
import { filterTestCases } from './filter';

for (const c of filterTestCases) {
  testStream(c);
}

// type tests
const obs$ = fromArray([1, '2', 3]).chain(
  filter((v): v is number => typeof v === 'number')
);
assertType<TypeEq<typeof obs$, Observable<number>>>();
