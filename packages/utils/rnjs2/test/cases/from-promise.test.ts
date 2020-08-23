import { testStream } from '../utils';
import { fromPromiseTestCases } from './from-promise';

testStream(fromPromiseTestCases[0], [1]);
