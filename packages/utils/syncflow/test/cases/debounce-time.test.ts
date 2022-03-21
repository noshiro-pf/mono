import { testStream } from '../test-stream';
import { debounceTimeTestCases } from './debounce-time';

for (const c of debounceTimeTestCases) {
  testStream(c);
}
