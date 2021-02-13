import { testStream } from '../test-stream';
import { distinctUntilChangedTestCases } from './distinct-until-changed';

distinctUntilChangedTestCases.forEach(testStream);
