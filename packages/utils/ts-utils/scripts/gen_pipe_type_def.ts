import fs from 'fs';

const funcTypeName = 'FunctionType';

const header = `
import { FunctionType } from '../types';
`;

const range = (start: number, end: number): number[] =>
  new Array(end - start).fill(0).map((_, i) => start + i);

const genPipeMethod = (length: number): string => {
  if (length < 2) return '';
  // length === 3 =>
  // ```
  // export function pipe<T0, T1, T2>(x: T0, f1: FunctionType<T0, T1>, f2: FunctionType<T1, T2>): T2;
  // ```
  const typeVars = range(0, length).map((i) => `T${i}`);
  let result = `export function pipe<${typeVars.join(',')}>(x: ${
    typeVars[0] ?? ''
  }, `;
  for (let i = 1; i < length; i += 1) {
    result += `f${i}: ${funcTypeName}<${typeVars[i - 1] ?? ''}, ${
      typeVars[i] ?? ''
    }>, `;
  }
  result += `): ${typeVars[length - 1] ?? ''};`;

  return result;
};

const footer = `
export function pipe(x: unknown, ...fns: FunctionType<unknown, unknown>[]): unknown {
  return fns.reduce((curr, f) => f(curr), x);
}
`;

const createPipeTypeDef = (length: number): string =>
  [
    header,
    range(2, length + 1)
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
  const path: string | undefined = args[1];

  if (Number.isNaN(length)) {
    throw new Error('The first argument must be integer.');
  }

  const MIN_LENGTH = 6;
  if (length < MIN_LENGTH) {
    throw new Error(`Length must be greater than or equal to ${MIN_LENGTH}.`);
  }

  if (path === undefined) {
    throw new Error('Path is required.');
  }

  return [length, path];
};

const main = (): void => {
  const [length, path] = input();
  const result = createPipeTypeDef(length);
  fs.writeFile(path, result, { flag: 'w' }, () => undefined);
};

main();
