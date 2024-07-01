import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs5_Json = ({
  config: { returnType },
}: ConverterOptions): MonoTypeFunction<string> =>
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
  });
