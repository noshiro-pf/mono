import { testStream } from '../test-stream.mjs';
import { takeUntilTestCases } from './take-until.mjs';

for (const c of takeUntilTestCases) {
  testStream(c);
}
