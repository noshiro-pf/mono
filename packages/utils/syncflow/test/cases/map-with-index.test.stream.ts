import { testStream } from '../test-stream';
import { mapWithIndexTestCases } from './map-with-index';

for (const c of mapWithIndexTestCases) {
  testStream(c);
}
