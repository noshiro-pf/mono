import { testStream } from '../test-stream';
import { skipTestCases } from './skip';

skipTestCases.forEach(testStream);
