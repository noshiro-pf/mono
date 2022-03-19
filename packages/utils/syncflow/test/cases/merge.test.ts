import { testStream } from '../test-stream';
import { mergeTestCases } from './merge';

for (const c of mergeTestCases) {
  testStream(c);
}
