import { testStream } from '../test-stream.mjs';
import { skipUntilTestCases } from './skip-until.mjs';

for (const c of skipUntilTestCases) {
  testStream(c);
}
