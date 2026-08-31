import { type ReadonlyRecord } from 'ts-type-forge';

export const toClassName = (flags: ReadonlyRecord<string, boolean>): string =>
  Object.entries(flags)
    .filter(([_k, v]) => v)
    .map(([k, _v]) => k)
    .join(' ');
