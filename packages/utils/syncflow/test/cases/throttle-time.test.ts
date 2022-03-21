import { testStream } from '../test-stream';
import { throttleTimeTestCases } from './throttle-time';

for (const c of throttleTimeTestCases) {
  testStream(c);
}
