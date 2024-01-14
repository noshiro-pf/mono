import { testStream } from '../test-stream.mjs';
import { auditTimeTestCases } from './audit-time.mjs';

for (const c of auditTimeTestCases) {
  testStream(c);
}
