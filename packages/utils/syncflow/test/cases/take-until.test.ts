import { testStream } from '../test-stream';
import { takeUntilTestCases } from './take-until';

takeUntilTestCases.forEach(testStream);
