import equal from 'fast-deep-equal';

export const deepEqual = <T>(a: T, b: T): boolean => equal(a, b);
