import { testStream } from '../test-stream';
import { takeWhileTestCases } from './take-while';

for (const c of takeWhileTestCases) {
  testStream(c);
}
