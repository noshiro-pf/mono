// @ts-check

'use strict';

const fs = require('fs');

const funcTypeName = 'FunctionType';
const functionName = 'pipeF';

const header = `
import { FunctionType } from '../types';
`;

/**
 *
 * @param {number} start
 * @param {number} end
 * @returns {number[]}
 */
const range = (start, end) =>
  new Array(end - start).fill(0).map((_, i) => start + i);

/**
 *
 * @param {number} length
 * @returns {string}
 */
const genPipeMethod = (length) => {
  if (length < 2) return '';
  // length === 3 =>
  // ```
  // export function pipeF<T0, T1, T2>(x: T0, f1: FunctionType<T0, T1>, f2: FunctionType<T1, T2>): T2;
  // ```
  const typeVars = range(0, length).map((i) => `T${i}`);
  let result = `export function ${functionName}<${typeVars.join(',')}>(x: ${
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
export function ${functionName}(x: unknown, ...fns: FunctionType<unknown, unknown>[]): unknown {
  return fns.reduce((curr, f) => f(curr), x);
}
`;

/**
 *
 * @param {number} length
 * @returns {string}
 */
const createPipeTypeDef = (length) =>
  [
    header,
    range(2, length + 1)
      .map(genPipeMethod)
      .join('\n'),
    footer,
  ].join('\n');

/**
 *
 * @returns {[number, string]}
 */
const input = () => {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    throw new Error('Exactly 2 arguments are required.');
  }

  /** @type {number} */
  const length = Number(args[0]);

  /** @type {string | undefined} */
  const path = args[1];

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

const main = () => {
  const [length, path] = input();
  const result = createPipeTypeDef(length);
  fs.writeFile(path, result, { flag: 'w' }, () => undefined);
};

main();
