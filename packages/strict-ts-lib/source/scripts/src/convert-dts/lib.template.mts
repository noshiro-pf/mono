import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-utils';

export const convertTemplate: MonoTypeFunction<string> = (src) =>
  pipe(src).chainMonoTypeFns(replaceWithNoMatchCheck('@@@', '@@@')).value;
