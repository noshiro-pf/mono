import { testStream } from '../test-stream.mjs';
import { fromPromiseTestCases } from './from-promise.mjs';

for (const c of fromPromiseTestCases) {
  testStream(c);
}
