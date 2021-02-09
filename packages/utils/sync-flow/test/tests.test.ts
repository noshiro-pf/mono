import { assertType, TypeEq } from '@mono/ts-utils';
import { filter, fromArray, Observable } from '../src';
import {
  auditTimeTestCases,
  combineLatestTestCases,
  debounceTimeTestCases,
  filterTestCases,
  fromArrayTestCases,
  fromPromiseTestCases,
  intervalTestCases,
  mapTestCases,
  mapWithIndexTestCases,
  mergeMapTestCases,
  mergeTestCases,
  scanTestCases,
  skipTestCases,
  skipUntilTestCases,
  skipWhileTestCases,
  switchMapTestCases,
  takeTestCases,
  takeUntilTestCases,
  takeWhileTestCases,
  throttleTimeTestCases,
  timerTestCases,
  zipTestCases,
} from './cases';
import { testStream } from './utils';

auditTimeTestCases.forEach(testStream);
combineLatestTestCases.forEach(testStream);
debounceTimeTestCases.forEach(testStream);
filterTestCases.forEach(testStream);
fromArrayTestCases.forEach(testStream);
fromPromiseTestCases.forEach(testStream);
intervalTestCases.forEach(testStream);
mapTestCases.forEach(testStream);
mapWithIndexTestCases.forEach(testStream);
mergeMapTestCases.forEach(testStream);
mergeTestCases.forEach(testStream);
scanTestCases.forEach(testStream);
skipTestCases.forEach(testStream);
skipUntilTestCases.forEach(testStream);
skipWhileTestCases.forEach(testStream);
switchMapTestCases.forEach(testStream);
takeTestCases.forEach(testStream);
takeUntilTestCases.forEach(testStream);
takeWhileTestCases.forEach(testStream);
throttleTimeTestCases.forEach(testStream);
timerTestCases.forEach(testStream);
zipTestCases.forEach(testStream);

// type tests

const obs$ = fromArray([1, '2', 3]).chain(
  filter((v): v is number => typeof v === 'number')
);
assertType<TypeEq<typeof obs$, Observable<number>>>();
