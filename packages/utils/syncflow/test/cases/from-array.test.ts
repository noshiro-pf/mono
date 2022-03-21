import { testStream } from '../test-stream';
import { fromArrayTestCases } from './from-array';

for (const c of fromArrayTestCases) {
  testStream(c);
}
