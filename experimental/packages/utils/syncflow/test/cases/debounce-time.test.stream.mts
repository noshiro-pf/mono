import { testStream } from '../test-stream.mjs';
import { debounceTimeTestCases } from './debounce-time.mjs';

for (const c of debounceTimeTestCases) {
  testStream(c);
}
