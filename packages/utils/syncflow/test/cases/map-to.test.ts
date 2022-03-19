import { testStream } from '../test-stream';
import { mapToTestCases } from './map-to';

for (const c of mapToTestCases) {
  testStream(c);
}
