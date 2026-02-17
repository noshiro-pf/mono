import { testStream } from '../test-stream.mjs';
import { withCurrentValueFromTestCases } from './with-current-value-from.mjs';

for (const c of withCurrentValueFromTestCases) {
  testStream(c);
}
