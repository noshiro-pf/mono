import { isProduction } from '../env.mjs';

export const clog = (...args: readonly unknown[]): void => {
  if (isProduction) return;

  console.log(...args);
};
