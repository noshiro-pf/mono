import { testStream } from '../test-stream.mjs';
import { throttleTimeTestCases } from './throttle-time.mjs';

for (const c of throttleTimeTestCases) {
  testStream(c);
}
