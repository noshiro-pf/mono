import { testStream } from '../test-stream.mjs';
import { zipTestCases } from './zip.mjs';

for (const c of zipTestCases) {
  testStream(c);
}
