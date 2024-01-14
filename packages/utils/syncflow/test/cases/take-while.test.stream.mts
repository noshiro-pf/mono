import { testStream } from '../test-stream.mjs';
import { takeWhileTestCases } from './take-while.mjs';

for (const c of takeWhileTestCases) {
  testStream(c);
}
