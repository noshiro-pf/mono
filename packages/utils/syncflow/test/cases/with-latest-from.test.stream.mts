import { testStream } from '../test-stream.mjs';
import { withLatestFromTestCases } from './with-latest-from.mjs';

for (const c of withLatestFromTestCases) {
  testStream(c);
}
