/**
 * `readonly [string, ...number[]]` の内側の `number[]` からは readonly を省いた形に統一するために、
 * 変換の再帰呼び出し時にその階層をmutable にするかどうかを制御する。
 *
 * - `"DeepReadonly"` : `node` が再帰的に readonly を適用する `DeepReadonly`
 *   などの型ユーティリティの内部のノードであることを表す。
 * - `"Readonly"` : `node` が `Readonly` の直下のノードであることを表す。
 * - `"readonly"` : `node` が `readonly` operator の直下のノードであることを表す。
 * - `"none"` : それ以外
 */
export type ReadonlyContext = 'DeepReadonly' | 'Readonly' | 'readonly' | 'none';

export const nextReadonlyContext = <C extends ReadonlyContext>(
  currentReadonlyContext: ReadonlyContext,
  readonlyContext: C,
): 'DeepReadonly' | C =>
  currentReadonlyContext === 'DeepReadonly' ? 'DeepReadonly' : readonlyContext;
