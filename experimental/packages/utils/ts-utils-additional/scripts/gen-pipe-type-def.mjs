import 'zx/globals';

const funcTypeName = 'FunctionType';
const functionName = 'pipeF';

const header = `
import { FunctionType } from '../types';
`;

/**
 * @param {number} start
 * @param {number} end
 * @returns {readonly number[]}
 */
const range = (start, end) =>
  Array.from({ length: end - start }, (_, i) => start + i);

/**
 * @param {number} len
 * @returns {string}
 */
const genPipeMethod = (len) => {
  if (len < 2) return '';
  // length === 3 =>
  // ```
  // export function pipeF<T0, T1, T2>(x: T0, f1: FunctionType<T0, T1>, f2: FunctionType<T1, T2>): T2;
  // ```
  const typeVars = range(0, len).map((i) => `T${i}`);
  let mut_result = `export function ${functionName}<${typeVars.join(',')}>(x: ${
    typeVars[0] ?? ''
  }, `;
  for (let mut_i = 1; mut_i < len; mut_i += 1) {
    mut_result += `f${mut_i}: ${funcTypeName}<${typeVars[mut_i - 1] ?? ''}, ${
      typeVars[mut_i] ?? ''
    }>, `;
  }
  mut_result += `): ${typeVars[len - 1] ?? ''};`;

  return mut_result;
};

const footer = `
export function ${functionName}(x: unknown, ...fns: FunctionType<unknown, unknown>[]): unknown {
  return fns.reduce((curr, f) => f(curr), x);
}
`;

/**
 * @param {number} len
 * @returns {string}
 */
const createPipeTypeDef = (len) =>
  [
    header,
    range(2, len + 1)
      .map(genPipeMethod)
      .join('\n'),
    footer,
  ].join('\n');

/** @returns {readonly [number, string]} */
const input = () => {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    throw new Error('Exactly 2 arguments are required.');
  }

  /** @type {number} */

  const len = Number(args[0]);

  /** @type {string | undefined} */
  const path = args[1];

  if (Number.isNaN(len)) {
    throw new TypeError('The first argument must be integer.');
  }

  const MIN_LENGTH = 6;
  if (len < MIN_LENGTH) {
    throw new Error(`Length must be greater than or equal to ${MIN_LENGTH}.`);
  }

  if (path === undefined) {
    throw new Error('Path is required.');
  }

  return [len, path];
};

const main = async () => {
  const [len, path] = input();
  const result = createPipeTypeDef(len);

  await fs.writeFile(path, result, { flag: 'w' });
};

main().catch(console.error);
