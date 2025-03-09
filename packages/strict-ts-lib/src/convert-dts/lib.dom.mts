import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-utils';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';
import { convertLibDomCommon } from './dom-common.mjs';

export const convertLibDom =
  (options: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
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
    ).value;
