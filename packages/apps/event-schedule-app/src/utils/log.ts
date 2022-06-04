import { isProduction } from '../env';

export const clog = (...args: readonly unknown[]): void => {
  if (isProduction) return;
  console.log(...args);
};
