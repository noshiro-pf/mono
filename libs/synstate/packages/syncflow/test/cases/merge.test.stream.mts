import { testStream } from '../test-stream.mjs';
import { mergeTestCases } from './merge.mjs';

for (const c of mergeTestCases) {
  testStream(c);
}
