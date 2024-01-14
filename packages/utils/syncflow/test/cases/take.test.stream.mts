import { testStream } from '../test-stream.mjs';
import { takeTestCases } from './take.mjs';

for (const c of takeTestCases) {
  testStream(c);
}
