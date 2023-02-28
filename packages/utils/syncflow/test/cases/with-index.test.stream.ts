import { testStream } from '../test-stream';
import { withIndexTestCases } from './with-index';

for (const c of withIndexTestCases) {
  testStream(c);
}
