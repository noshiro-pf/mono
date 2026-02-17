import { testStream } from '../test-stream.mjs';
import { withIndexTestCases } from './with-index.mjs';

for (const c of withIndexTestCases) {
  testStream(c);
}
