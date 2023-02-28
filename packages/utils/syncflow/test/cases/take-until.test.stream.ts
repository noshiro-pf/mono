import { testStream } from '../test-stream';
import { takeUntilTestCases } from './take-until';

for (const c of takeUntilTestCases) {
  testStream(c);
}
