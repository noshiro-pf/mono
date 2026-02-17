import { testStream } from '../test-stream.mjs';
import { switchMapTestCases } from './switch-map.mjs';

for (const c of switchMapTestCases) {
  testStream(c);
}
