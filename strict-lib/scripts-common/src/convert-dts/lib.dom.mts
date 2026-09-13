import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions } from './common.mjs';
import { convertLibDomCommon } from './dom-common.mjs';

export const convertLibDom =
  (options: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        convertLibDomCommon(options),

        // fix type errors in lib.dom.d.ts
        replaceWithinInterface({
          name: 'BeforeUnloadEvent',
          mapFn: replaceWithNoMatchCheck(
            //
            'extends Event',
            'extends Omit<Event, "returnValue">',
          ),
        }),
        replaceWithinInterface({
          name: 'SVGElement',
          mapFn: replaceWithNoMatchCheck(
            'readonly className: unknown;',
            '// readonly className: unknown;',
          ),
        }),
      ),
    ).value;
