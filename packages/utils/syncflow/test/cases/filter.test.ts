import { assertType } from '@noshiro/ts-utils';
import type { Observable } from '../../src';
import { filter, fromArray } from '../../src';
import { testStream } from '../test-stream';
import { filterTestCases } from './filter';

filterTestCases.forEach(testStream);

// type tests
const obs$ = fromArray([1, '2', 3]).chain(
  filter((v): v is number => typeof v === 'number')
);
assertType<TypeEq<typeof obs$, Observable<number>>>();
