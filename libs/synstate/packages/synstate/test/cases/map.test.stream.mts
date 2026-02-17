import { testStream } from '../test-stream.mjs';
import { mapTestCases } from './map.mjs';

for (const c of mapTestCases) {
  testStream(c);
}
