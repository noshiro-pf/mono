import { testStream } from '../test-stream';
import { intervalTestCases } from './interval';

for (const c of intervalTestCases) {
  testStream(c);
}
