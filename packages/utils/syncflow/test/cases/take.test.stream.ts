import { testStream } from '../test-stream';
import { takeTestCases } from './take';

for (const c of takeTestCases) {
  testStream(c);
}
