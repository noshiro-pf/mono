import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '../functions/utils/node-utils.mjs';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';
import { convertLibDomCommon } from './dom-common.mjs';

export const convertLibDom =
  (options: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        convertLibDomCommon(options),

        // fix type errors in lib.dom.d.ts
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface BeforeUnloadEvent',
          endRegexp: closeBraceRegexp,
          mapFn: replaceWithNoMatchCheck(
            //
            'extends Event',
            'extends Omit<Event, "returnValue">',
          ),
        }),
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface SVGElement',
          endRegexp: closeBraceRegexp,
          mapFn: replaceWithNoMatchCheck(
            'readonly className: unknown;',
            '// readonly className: unknown;',
          ),
        }),
        replaceWithNoMatchCheck(
          'Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>',
          'RelaxedExclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>',
        ),
      ),
    ).value;
