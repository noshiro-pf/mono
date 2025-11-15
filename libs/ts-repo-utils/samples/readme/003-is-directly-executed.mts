import { isDirectlyExecuted } from 'ts-repo-utils';

// or
// import "ts-repo-utils"; // isDirectlyExecuted is globally defined in ts-repo-utils

// calculator.mjs
export const add = (a: number, b: number): number => a + b;

export const multiply = (a: number, b: number): number => a * b;

// Only run main logic when executed directly: node calculator.mjs (or tsx calculator.mts)
// When imported elsewhere, only the functions are available
if (isDirectlyExecuted(import.meta.url)) {
  console.log('Calculator CLI');

  console.log('2 + 3 =', add(2, 3));

  console.log('4 × 5 =', multiply(4, 5));
}
