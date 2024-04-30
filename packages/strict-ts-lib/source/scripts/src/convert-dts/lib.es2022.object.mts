import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { typeUtilsName } from './common.mjs';

export const convertLibEs2022Object = (
  source: string,
  forNpmPackage: boolean,
): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheck(
        `/// <reference types="${typeUtilsName}" />`,
        [
          `/// <reference types="${typeUtilsName}" />`,
          forNpmPackage
            ? '/// <reference lib="es5" />'
            : '/// <reference path="./lib.es5.d.ts" />',
        ].join('\n'),
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'interface ObjectConstructor {',
        [
          '/**',
          ' * @internal',
          ' * R が union 型（要素数1の場合も含む）のとき、 union の要素の中に K をキーとして含むものが一つでもあれば、',
          ' * union 型を K をキーとして含むもののみに絞った型を返す。',
          ' * union の要素の中に K をキーとして含むものが一つも無ければ、`Record<K, unknown>` を返す。',
          ' * 結果には Readonly を付ける。',
          ' */',
          'type _HasOwnReturnType<',
          '  R extends RecordBase,',
          '  K extends PropertyKey',
          '> = R extends R // union distribution',
          '  ? K extends keyof R',
          '    ? string extends keyof R',
          '      ? Record<K, R[keyof R]> & R',
          '      : number extends keyof R',
          '      ? Record<K, R[keyof R]> & R',
          '      : symbol extends keyof R',
          '      ? Record<K, R[keyof R]> & R',
          '      : R',
          '    : never // omit union member that does not have key K',
          '  : never; // dummy case for union distribution',
          '',
          'interface ObjectConstructor {',
        ].join('\n'),
      ),
    )
    .chain(replaceWithNoMatchCheck('@param o', '@param obj'))
    .chain(replaceWithNoMatchCheck('@param v', '@param key'))
    .chain(
      replaceWithNoMatchCheck(
        'hasOwn(o: object, v: PropertyKey): boolean;',
        [
          'hasOwn<R extends RecordBase, K extends PropertyKey>(',
          '  obj: R,',
          '  key: K',
          '): obj is _HasOwnReturnType<R, K>;',
        ].join('\n'),
      ),
    ).value;
