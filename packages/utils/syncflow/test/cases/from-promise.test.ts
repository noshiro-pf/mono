import { testStream } from '../test-stream';
import { fromPromiseTestCases } from './from-promise';

fromPromiseTestCases.forEach(testStream);
