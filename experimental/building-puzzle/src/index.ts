// http://pzv.jp/p.html?building/6/6/2g3g4h4g3g2g2g5g44g4g3g

import { Arr } from '@tier4/ts-utils';
import { printCandidates, printTable } from './printer.js';
import { type Hint, type MutCandidates, type Table } from './types.js';

type N = 4;
const n: N = 4;

// const hint: Hint<6> = {
//   n: [2, 0, 3, 0, 4, 0],
//   w: [0, 2, 0, 5, 0, 4],
//   s: [0, 4, 0, 3, 0, 2],
//   e: [4, 0, 4, 0, 3, 0],
// };
const hint: Hint<4> = {
  n: [0, 0, 0, 0],
  w: [0, 4, 0, 0],
  s: [0, 1, 3, 0],
  e: [0, 0, 3, 0],
};

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const mut_candidates: MutCandidates<N> = Arr.seq(n).map(() =>
  Arr.seq(n).map(() => new Set(Arr.seq(n).map((i) => i + 1))),
) as unknown as MutCandidates<N>;

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const mut_table: Table<N> = Arr.zeros(n).map(
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  () => Arr.zeros(n) as MutableArrayOfLength<N, 0>,
) as MutableArrayOfLength<N, MutableArrayOfLength<N, 0>>;

printTable<N>(mut_table, hint);

for (const [rowIdx, h] of hint.w.entries()) {
  if (h > 0) {
    for (let mut_colIdx = 0; mut_colIdx < h - 1; ++mut_colIdx) {
      mut_candidates[rowIdx]?.[mut_colIdx]?.delete(n);
    }
  }
}

for (const [rowIdx, h] of hint.e.entries()) {
  if (h > 0) {
    for (let mut_colIdxRev = 0; mut_colIdxRev < h - 1; ++mut_colIdxRev) {
      mut_candidates[rowIdx]?.[n - 1 - mut_colIdxRev]?.delete(n);
    }
  }
}

for (const [colIdx, h] of hint.n.entries()) {
  if (h > 0) {
    for (let mut_rowIdx = 0; mut_rowIdx < h - 1; ++mut_rowIdx) {
      mut_candidates[mut_rowIdx]?.[colIdx]?.delete(n);
    }
  }
}

for (const [colIdx, h] of hint.s.entries()) {
  if (h > 0) {
    for (let mut_rowIdxRev = 0; mut_rowIdxRev < h - 1; ++mut_rowIdxRev) {
      mut_candidates[n - 1 - mut_rowIdxRev]?.[colIdx]?.delete(n);
    }
  }
}

printCandidates<N>(mut_candidates);
