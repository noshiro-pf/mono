import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';

export const convertTemplate: MonoTypeFunction<string> = (src) =>
  pipe(src).chainMonoTypeFns(replaceWithNoMatchCheck('@@@', '@@@')).value;
