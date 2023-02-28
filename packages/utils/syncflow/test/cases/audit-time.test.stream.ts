import { testStream } from '../test-stream';
import { auditTimeTestCases } from './audit-time';

for (const c of auditTimeTestCases) {
  testStream(c);
}
