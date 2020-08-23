import { testStream } from '../utils';
import { auditTimeTestCases } from './audit-time';

testStream(auditTimeTestCases[0], [3, 4, 10, 13, 18, 20]);
testStream(auditTimeTestCases[1], [
  1,
  3,
  3,
  4,
  4,
  10,
  10,
  13,
  13,
  16,
  17,
  18,
  18,
  19,
  20,
  20,
]);
