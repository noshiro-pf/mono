import { assertType, TypeEq } from '@noshiro/ts-utils';
import { filter, fromArray, Observable } from '../../src';
import { testStream } from '../test-stream';
import { filterTestCases } from './filter';

filterTestCases.forEach(testStream);

// type tests
const obs$ = fromArray([1, '2', 3]).chain(
  filter((v): v is number => typeof v === 'number')
);
assertType<TypeEq<typeof obs$, Observable<number>>>();
