import { testStream } from '../test-stream.mjs';
import { mapToTestCases } from './map-to.mjs';

for (const c of mapToTestCases) {
  testStream(c);
}
