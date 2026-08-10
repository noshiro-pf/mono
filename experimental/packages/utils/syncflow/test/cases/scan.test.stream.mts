import { testStream } from '../test-stream.mjs';
import { scanTestCases } from './scan.mjs';

for (const c of scanTestCases) {
  testStream(c);
}
