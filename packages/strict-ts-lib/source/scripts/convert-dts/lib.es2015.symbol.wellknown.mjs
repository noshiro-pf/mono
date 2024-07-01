import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertEs2015SymbolWellknown = (from) =>
  pipe(from)
    .chain(
      replaceWithNoMatchCheck(
        [
          'interface Array<T> {',
          '  /**',
          "   * Is an object whose properties have the value 'true' when they will be",
          "   * absent when used in a 'with' statement.",
          '   */',
          '  readonly [Symbol.unscopables]: {',
          '    readonly [K in keyof (readonly unknown[])]?: boolean;',
          '  };',
          '}',
        ].join('\n'),
        [
          'interface Array<T> {',
          '  /**',
          "   * Is an object whose properties have the value 'true' when they will be",
          "   * absent when used in a 'with' statement.",
          '   */',
          '  readonly [Symbol.unscopables]: {',
          '    readonly [K in keyof (any[])]?: boolean;',
          '  };',
          '}',
        ].join('\n'),
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        [
          'interface ReadonlyArray<T> {',
          '  /**',
          "   * Is an object whose properties have the value 'true' when they will be",
          "   * absent when used in a 'with' statement.",
          '   */',
          '  readonly [Symbol.unscopables]: {',
          '    readonly [K in keyof (readonly unknown[])]?: boolean;',
          '  };',
          '}',
        ].join('\n'),
        [
          'interface ReadonlyArray<T> {',
          '  /**',
          "   * Is an object whose properties have the value 'true' when they will be",
          "   * absent when used in a 'with' statement.",
          '   */',
          '  readonly [Symbol.unscopables]: {',
          '    readonly [K in keyof (readonly any[])]?: boolean;',
          '  };',
          '}',
        ].join('\n'),
      ),
    ).value;
