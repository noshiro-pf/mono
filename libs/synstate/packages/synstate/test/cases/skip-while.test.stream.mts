import { testStream } from '../test-stream.mjs';
import { skipWhileTestCases } from './skip-while.mjs';

for (const c of skipWhileTestCases) {
  testStream(c);
}
