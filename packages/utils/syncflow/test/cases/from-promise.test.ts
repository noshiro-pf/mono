import { testStream } from '../test-stream';
import { fromPromiseTestCases } from './from-promise';

for (const c of fromPromiseTestCases) {
  testStream(c);
}
