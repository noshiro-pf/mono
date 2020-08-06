const fs = require('fs');

const header = `
import { Operator } from '../types';
import { RN } from './rn-interface';

export interface Pipable<A> {
`;

const seq = (start: number, end: number): number[] =>
  new Array(end - start).fill(0).map((_, i) => i + start);

const genPipeMethod = (length: number): string => {
  if (length < 1) return '';
  // length === 3 =>
  //    `
  //      pipe<T1, T2, T3>(
  //        op1: Operator<A, T1>,
  //        op2: Operator<T1, T2>,
  //        op3: Operator<T2, T3>
  //      ): RN<T3>;
  //    `
  const typeVarList = seq(1, length + 1).map((i) => `T${i}`);
  let result: string = '';
  result += `  pipe<${typeVarList.join(', ')}>(\n`;
  let currTypeVar = `A`;
  for (const [index, nextTypeVar] of typeVarList.entries()) {
    result += `    op${index + 1}: Operator<${currTypeVar}, ${nextTypeVar}>,\n`;
    currTypeVar = nextTypeVar;
  }
  result += `  ): RN<${currTypeVar}>;\n`;

  return result;
};

const footer = `
  pipe(
    ...operators: readonly [Operator<any, any>, ...Operator<any, any>[]]
  ): RN<any>;
}
`;

const createPipableTypeDef = (length: number): string =>
  [
    header,
    seq(1, length + 1)
      .map(genPipeMethod)
      .join('\n'),
    footer,
  ].join('\n');

const input = (): [number, string] => {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    throw new Error('Exactly 2 arguments are required.');
  }

  const length: number = Number(args[0]);
  const path: string = args[1];

  if (Number.isNaN(length)) {
    throw new Error('The first argument must be integer.');
  }

  const MIN_LENGTH = 6;
  if (length < MIN_LENGTH) {
    throw new Error(`Length must be greater than or equal to ${MIN_LENGTH}.`);
  }

  if (!path) {
    throw new Error(`Path is required.`);
  }

  return [length, path];
};

const main = () => {
  const [length, path] = input();
  const result = createPipableTypeDef(length);
  fs.writeFile(path, result, { flags: 'w' }, () => {});
};

main();
