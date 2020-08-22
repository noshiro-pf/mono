import { testStream } from '../utils';
import { mapTestCases } from './map';

testStream(mapTestCases[0], [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
testStream(mapTestCases[1], [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40]);
testStream(mapTestCases[2], [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40]);
