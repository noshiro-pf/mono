import { testStream } from '../test-stream.mjs';
import { mergeMapTestCases } from './merge-map.mjs';

for (const c of mergeMapTestCases) {
  testStream(c);
}
