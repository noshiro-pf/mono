import { testStream } from '../test-stream';
import { pluckTestCases } from './pluck';

for (const c of pluckTestCases) {
  testStream(c);
}
