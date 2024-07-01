import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-scripts';
import { typeUtilsName } from './common.mjs';

export const convertLibEs2022Object = (): MonoTypeFunction<string> =>
  composeMonoTypeFns(
    replaceWithNoMatchCheck(
      `/// <reference types="${typeUtilsName}" />`,
      [
        `/// <reference types="${typeUtilsName}" />`,
        '/// <reference lib="es5" />',
      ].join('\n'),
    ),
    replaceWithNoMatchCheck(
      'interface ObjectConstructor {',
      [
        '/**',
        ' * @internal',
        ' * R が union 型（要素数1の場合も含む）のとき、 union の要素の中に K をキーとして含むものが一つでもあれば、',
        ' * union 型を K をキーとして含むもののみに絞った型を返す。',
        ' * union の要素の中に K をキーとして含むものが一つも無ければ、`MutableRecord<K, unknown>` を返す。',
        ' * 結果には Readonly を付ける。',
        ' */',
        'declare namespace StrictLibInternals {',
        '  export type HasOwnReturnType<',
        '    R extends RecordBase,',
        '    K extends PropertyKey',
        '  > = R extends R // union distribution',
        '    ? K extends keyof R',
        '      ? string extends keyof R',
        '        ? MutableRecord<K, R[keyof R]> & R',
        '        : number extends keyof R',
        '        ? MutableRecord<K, R[keyof R]> & R',
        '        : symbol extends keyof R',
        '        ? MutableRecord<K, R[keyof R]> & R',
        '        : R',
        '      : never // omit union member that does not have key K',
        '    : never; // dummy case for union distribution',
        '}',
        '',
        'interface ObjectConstructor {',
      ].join('\n'),
    ),
    replaceWithNoMatchCheck('@param o', '@param obj'),
    replaceWithNoMatchCheck('@param v', '@param key'),
    replaceWithNoMatchCheck(
      'hasOwn(o: object, v: PropertyKey): boolean;',
      [
        'hasOwn<R extends RecordBase, K extends PropertyKey>(',
        '  obj: R,',
        '  key: K',
        '): obj is StrictLibInternals.HasOwnReturnType<R, K>;',
      ].join('\n'),
    ),
  );
