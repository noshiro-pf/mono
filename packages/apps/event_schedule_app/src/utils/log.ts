import { isProduction } from '../env';

export const clog = (...args: any[]): void => {
  if (isProduction) return;
  console.log(...args);
};
