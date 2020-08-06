import { testStream } from '../utils';
import { zipTestCases } from './zip';

testStream(zipTestCases[0], [
  [0, 0],
  [2, 3],
  [4, 6],
  [6, 9],
  [8, 12],
  [10, 15],
  [12, 18],
  [14, 21],
  [16, 24],
  [18, 27],
  [20, 30],
  [22, 33],
]);
