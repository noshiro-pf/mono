import { testStream } from '../test-stream.mjs';
import { combineLatestTestCases } from './combine-latest.mjs';

testStream(combineLatestTestCases[0]);
testStream(combineLatestTestCases[1]);
