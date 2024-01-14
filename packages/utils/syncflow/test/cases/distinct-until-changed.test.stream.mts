import { testStream } from '../test-stream.mjs';
import { distinctUntilChangedTestCases } from './distinct-until-changed.mjs';

for (const c of distinctUntilChangedTestCases) {
  testStream(c);
}
