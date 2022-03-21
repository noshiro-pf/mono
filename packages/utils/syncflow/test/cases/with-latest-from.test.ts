import { testStream } from '../test-stream';
import { withLatestFromTestCases } from './with-latest-from';

for (const c of withLatestFromTestCases) {
  testStream(c);
}
