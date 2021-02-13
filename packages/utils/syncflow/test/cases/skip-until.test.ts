import { testStream } from '../test-stream';
import { skipUntilTestCases } from './skip-until';

skipUntilTestCases.forEach(testStream);
