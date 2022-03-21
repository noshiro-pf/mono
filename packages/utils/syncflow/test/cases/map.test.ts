import { testStream } from '../test-stream';
import { mapTestCases } from './map';

for (const c of mapTestCases) {
  testStream(c);
}
