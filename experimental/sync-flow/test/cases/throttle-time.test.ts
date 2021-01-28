import { testStream } from '../utils';
import { throttleTimeTestCases } from './throttle-time';

testStream(throttleTimeTestCases[0], [1, 7, 10, 13, 16]);
// testStream(throttleTimeTestCases[1], [
//   1,
//   1,
//   2,
//   3,
//   7,
//   7,
//   9,
//   10,
//   10,
//   12,
//   13,
//   13,
//   16,
//   16,
//   17,
//   18,
//   19,
//   20,
// ]);
