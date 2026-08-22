import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';

export const convertTemplate: MonoTypeFunction<string> = (src) =>
  pipe(src).map(composeMonoTypeFns(replaceWithNoMatchCheck('@@@', '@@@')))
    .value;
