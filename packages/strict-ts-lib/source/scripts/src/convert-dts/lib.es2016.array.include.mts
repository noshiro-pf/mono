import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import {
  closeBraceRegexp,
  enumType,
  type ConverterOptions,
} from './common.mjs';

export const convertLibEs2016ArrayInclude = ({
  brandedNumber,
}: ConverterOptions): MonoTypeFunction<string> =>
  composeMonoTypeFns(
    ...(['Array', 'ReadonlyArray'] as const).map((typeName) =>
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: `interface ${typeName}<T> {`,
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          // change Array.includes() to accept widen literal types
          'includes(searchElement: T, fromIndex?: number): boolean;',
          `includes(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: ${brandedNumber.ArraySizeArg}): searchElement is T;`,
        ),
      }),
    ),

    ...(
      [
        ['Int8Array', enumType.Int8],
        ['Uint8Array', enumType.Uint8],
        ['Uint8ClampedArray', enumType.Uint8],
        ['Int16Array', brandedNumber.Int16],
        ['Uint16Array', brandedNumber.Uint16],
        ['Int32Array', brandedNumber.Int32],
        ['Uint32Array', brandedNumber.Uint32],
        ['Float32Array', brandedNumber.Float32],
        ['Float64Array', brandedNumber.Float64],
      ] as const
    ).map(([typeName, elemType]) =>
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: `interface ${typeName} {`,
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'includes(searchElement: number, fromIndex?: number): boolean;',
          `includes(searchElement: ${elemType}, fromIndex?: ${brandedNumber.TypedArraySizeArg}): boolean;`,
        ),
      }),
    ),
  );
