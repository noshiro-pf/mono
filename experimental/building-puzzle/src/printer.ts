import { Arr } from '@tier4/ts-utils';
import {
  type Candidates,
  type Hint,
  type MaxSize,
  type Table,
} from './types.js';

export const printCandidates = <N extends IndexInclusive<MaxSize>>(
  candidates: Candidates<N>,
): void => {
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const ii = Arr.seq(candidates.length).map(
    (i) => i + 1,
  ) as unknown as readonly UintRangeInclusive<1, N>[];

  console.log(
    [
      '[',
      candidates
        .map(
          (row) =>
            `  [${row.map((col) => `{${ii.map((i) => (col.has(i) ? i : '_')).join(',')}}`).join(', ')}]`,
        )
        .join(',\n'),
      ']',
    ].join('\n'),
  );
};

const toChar = (n: number): string => (n === 0 ? ' ' : n.toString());

export const printTable = <N extends IndexInclusive<MaxSize>>(
  table: Table<N>,
  hint: Hint<N>,
): void => {
  console.log(
    [
      '',

      [
        //
        '   ',
        ` ${hint.n.map((i) => toChar(i)).join(' ')} `,
        '   ',
      ].join(''),

      [
        //
        '   ',
        ` ${hint.n.map(() => 'v').join(' ')} `,
        '   ',
      ].join(''),

      ...Arr.seq(hint.n.length).map((rowIdx) =>
        [
          //
          `${toChar(hint.w[rowIdx] ?? 0)} >`,
          ` ${table[rowIdx]?.map(toChar).join(' ')} `,
          `< ${toChar(hint.e[rowIdx] ?? 0)}`,
        ].join(''),
      ),

      [
        //
        '   ',
        ` ${hint.n.map(() => '^').join(' ')} `,
        '   ',
      ].join(''),

      [
        //
        '   ',
        ` ${hint.s.map(toChar).join(' ')} `,
        '   ',
      ].join(''),

      '',
    ].join('\n'),
  );
};
