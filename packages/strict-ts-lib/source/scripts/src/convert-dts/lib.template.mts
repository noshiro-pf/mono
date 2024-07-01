import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-scripts';

export const convertTemplate = (): MonoTypeFunction<string> =>
  composeMonoTypeFns(replaceWithNoMatchCheck('@@@', '@@@'));
