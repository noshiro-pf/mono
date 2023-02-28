import { testStream } from '../test-stream';
import { scanTestCases } from './scan';

for (const c of scanTestCases) {
  testStream(c);
}
