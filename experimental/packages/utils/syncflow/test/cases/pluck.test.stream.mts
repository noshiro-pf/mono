import { testStream } from '../test-stream.mjs';
import { pluckTestCases } from './pluck.mjs';

for (const c of pluckTestCases) {
  testStream(c);
}
