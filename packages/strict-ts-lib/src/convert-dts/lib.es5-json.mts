import {
  composeMonoTypeFns,
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-utils';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs5_Json =
  ({ config: { returnType } }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
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
    ).value;
