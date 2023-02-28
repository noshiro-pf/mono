import { testStream } from '../test-stream';
import { mergeMapTestCases } from './merge-map';

for (const c of mergeMapTestCases) {
  testStream(c);
}
