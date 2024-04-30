import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';

export const convertTemplate = (source: string): string =>
  pipe(source).chain(replaceWithNoMatchCheck('@@@', '@@@')).value;
