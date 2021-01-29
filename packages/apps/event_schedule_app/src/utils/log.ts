import { isProduction } from '../env';

export const clog = (...args: unknown[]): void => {
  if (isProduction) return;
  console.log(...args);
};
