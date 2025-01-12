import { pipe, replaceWithNoMatchCheck } from '@noshiro/node-utils';

export const convertTemplate: MonoTypeFunction<string> = (src) =>
  pipe(src).chainMonoTypeFns(replaceWithNoMatchCheck('@@@', '@@@')).value;
