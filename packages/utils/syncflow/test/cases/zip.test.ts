import { testStream } from '../test-stream';
import { zipTestCases } from './zip';

for (const c of zipTestCases) {
  testStream(c);
}
