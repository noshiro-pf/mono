import { testStream } from '../test-stream.mjs';
import { fromArrayTestCases } from './from-array.mjs';

for (const c of fromArrayTestCases) {
  testStream(c);
}
