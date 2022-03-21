import { testStream } from '../test-stream';
import { skipUntilTestCases } from './skip-until';

for (const c of skipUntilTestCases) {
  testStream(c);
}
