import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs5_ObjectConstructor = ({
  config: { commentOutDeprecated },
  readonlyModifier,
}: ConverterOptions): MonoTypeFunction<string> =>
  replaceWithNoMatchCheckBetweenRegexp({
    startRegexp: 'interface ObjectConstructor {',
    endRegexp: closeBraceRegexp,
    mapFn: composeMonoTypeFns(
      ...[
        'new (value?: unknown): Object;',
        '(): unknown;',
        '(value: unknown): unknown;',
      ].map((line) =>
        replaceWithNoMatchCheck(
          line,
          [
            "  /** @deprecated Don't use Object constructor */",
            commentOutDeprecated ? `// ${line}` : line,
          ].join('\n'),
        ),
      ),
      replaceWithNoMatchCheck(
        [
          //
          '   */',
          '  keys(o: object): readonly string[];',
        ].join('\n'),
        [
          '   *',
          '   * @example',
          '   * ```ts',
          "   * const ks = Object.keys({ x: 1, y: 2, z: '3', 3: 4 }); // ('3' | 'x' | 'y' | 'z')[]",
          '   * ```',
          '   */',
          `  keys<R extends UnknownRecord>(object: R): ${readonlyModifier}StrictLibInternals.ToObjectKeysValue<keyof R>[];`,
        ].join('\n'),
      ),
    ),
  });
