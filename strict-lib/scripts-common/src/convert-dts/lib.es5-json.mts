import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs5_Json =
  ({ config: { returnType } }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithinInterface({
          name: 'JSON',
          mapFn: composeMonoTypeFns(
            replaceWithNoMatchCheck(
              //
              '): unknown;',
              `): ${returnType === 'readonly' ? 'JsonValue' : 'MutableJsonValue'};`,
            ),
            replaceWithNoMatchCheck(
              'space?: string | number',
              'space?: string | UintRangeInclusive<1, 10>',
            ),
          ),
        }),
      ),
    ).value;
