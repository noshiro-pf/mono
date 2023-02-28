import { testStream } from '../test-stream';
import { distinctUntilChangedTestCases } from './distinct-until-changed';

for (const c of distinctUntilChangedTestCases) {
  testStream(c);
}
