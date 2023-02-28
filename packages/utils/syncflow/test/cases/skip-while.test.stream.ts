import { testStream } from '../test-stream';
import { skipWhileTestCases } from './skip-while';

for (const c of skipWhileTestCases) {
  testStream(c);
}
