import { testStream } from '../test-stream';
import { pluckTestCases } from './pluck';

pluckTestCases.forEach(testStream);
