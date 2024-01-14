import { expectType } from '@noshiro/ts-utils';
import {
  interval,
  mapI,
  take,
  withInitialValue,
  type InitializedObservable,
} from '../../src/index.mjs';
import { testStream } from '../test-stream.mjs';
import { withInitialValueTestCases } from './with-initial-value.mjs';

for (const c of withInitialValueTestCases) {
  testStream(c);
}

const s0 = interval(1000).chain(take(1));
const s1 = s0.chain(withInitialValue(0));
const s2 = s1.chain(mapI((x) => x * 2));
const s3 = s0.chain(withInitialValue(0)).chain(mapI((x) => x * 2));
expectType<typeof s2, InitializedObservable<number>>('=');
expectType<typeof s3, InitializedObservable<number>>('=');
