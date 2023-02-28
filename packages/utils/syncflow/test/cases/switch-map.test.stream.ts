import { testStream } from '../test-stream';
import { switchMapTestCases } from './switch-map';

for (const c of switchMapTestCases) {
  testStream(c);
}
