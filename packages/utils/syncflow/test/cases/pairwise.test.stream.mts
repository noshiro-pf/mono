import { testStream } from '../test-stream.mjs';
import { pairwiseTestCases } from './pairwise.mjs';

for (const c of pairwiseTestCases) {
  testStream(c);
}
