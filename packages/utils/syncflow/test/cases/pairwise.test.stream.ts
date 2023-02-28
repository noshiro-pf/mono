import { testStream } from '../test-stream';
import { pairwiseTestCases } from './pairwise';

for (const c of pairwiseTestCases) {
  testStream(c);
}
