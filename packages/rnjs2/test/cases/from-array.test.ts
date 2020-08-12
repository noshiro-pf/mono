import { testStream } from '../utils';
import { fromArrayTestCases } from './from-array';

testStream(fromArrayTestCases[0], [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
