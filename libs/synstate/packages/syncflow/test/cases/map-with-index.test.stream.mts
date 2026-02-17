import { testStream } from '../test-stream.mjs';
import { mapWithIndexTestCases } from './map-with-index.mjs';

for (const c of mapWithIndexTestCases) {
  testStream(c);
}
