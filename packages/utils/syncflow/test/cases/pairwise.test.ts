import { testStream } from '../test-stream';
import { pairwiseTestCases } from './pairwise';

pairwiseTestCases.forEach(testStream);
