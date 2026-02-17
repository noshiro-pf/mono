import { testStream } from '../test-stream.mjs';
import { skipTestCases } from './skip.mjs';

for (const c of skipTestCases) {
  testStream(c);
}
