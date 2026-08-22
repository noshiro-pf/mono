import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '../functions/utils/node-utils.mjs';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs5_Json =
  ({ config: { returnType } }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface JSON {',
          endRegexp: closeBraceRegexp,
          mapFn: composeMonoTypeFns(
            replaceWithNoMatchCheck(
              //
              `): unknown;`,
              `): ${returnType === 'readonly' ? 'JsonValue' : 'MutableJsonValue'};`,
            ),
            replaceWithNoMatchCheck(
              'space?: string | number',
              'space?: string | UintRange<1, 11>',
            ),
          ),
        }),
      ),
    ).value;
