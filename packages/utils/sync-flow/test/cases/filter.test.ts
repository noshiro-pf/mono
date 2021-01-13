import { testStream } from '../utils';
import { filterTestCases } from './filter';

testStream(filterTestCases[0], [0, 1, 2, 3, 4, 10, 11, 12, 13, 14]);
