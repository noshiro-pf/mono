import { testStream } from '../test-stream.mjs';
import { skipIfNoChangeTestCases } from './skip-if-no-change.mjs';

for (const c of skipIfNoChangeTestCases) {
  testStream(c);
}
