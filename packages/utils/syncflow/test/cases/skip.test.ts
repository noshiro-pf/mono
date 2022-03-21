import { testStream } from '../test-stream';
import { skipTestCases } from './skip';

for (const c of skipTestCases) {
  testStream(c);
}
