import { assertType, TypeEq } from '@noshiro/ts-utils';
import {
  InitializedObservable,
  interval,
  mapI,
  withInitialValue,
} from '../../src';
import { testStream } from '../test-stream';
import { withInitialValueTestCases } from './with-initial-value';

withInitialValueTestCases.forEach(testStream);

const s0 = interval(1000);
const s1 = s0.chain(withInitialValue(0));
const s2 = s1.chain(mapI((x) => x * 2));
const s3 = s0.chain(withInitialValue(0)).chain(mapI((x) => x * 2));
assertType<TypeEq<typeof s2, InitializedObservable<number>>>();
assertType<TypeEq<typeof s3, InitializedObservable<number>>>();
