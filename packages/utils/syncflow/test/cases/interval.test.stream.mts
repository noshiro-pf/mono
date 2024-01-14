import { testStream } from '../test-stream.mjs';
import { intervalTestCases } from './interval.mjs';

for (const c of intervalTestCases) {
  testStream(c);
}
