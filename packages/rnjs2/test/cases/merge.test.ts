import { testStream } from '../utils';
import { mergeTestCases } from './merge';

testStream(mergeTestCases[0], [0, '1', 2, '3', 4, '5']);
