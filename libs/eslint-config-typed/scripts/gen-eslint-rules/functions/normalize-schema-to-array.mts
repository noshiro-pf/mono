import { Arr, isNonNullObject } from 'ts-data-forge';
import type { JSONSchema4 } from './type.mjs';

/**
 * スキーマを配列形式に正規化する。プラグイン間の型不整合を吸収する
 */
export const normalizeSchemaToArray = (
  schema: JSONSchema4 | readonly JSONSchema4[] | undefined,
): readonly JSONSchema4[] =>
  // Some plugins violate the JSONSchema4 | JSONSchema4[] | undefined contract, so absorb that inconsistency here.
  typeof schema !== 'object'
    ? ([] as const)
    : Arr.isArray(schema)
      ? schema
      : ([schema] as const);

/**
 * `meta.schema` が単一のスキーマオブジェクト（オプション配列全体を検証する形式）か。
 *
 * 正規化後は `{ type: 'array' }` と `[{ type: 'array' }]` が同じ 1 要素配列になるが、
 * 前者はオプション配列全体、後者は第 1 オプション（それ自体が配列）を表すので、
 * `RuleEntry` にオプションを展開してよいのは前者だけ。正規化前の値で判定する。
 */
export const isObjectFormSchema = (
  schema: JSONSchema4 | readonly JSONSchema4[] | undefined,
): boolean =>
  // `typeof null` is 'object'; some plugins violate the declared contract.
  isNonNullObject(schema) && !Arr.isArray(schema);

if (import.meta.vitest !== undefined) {
  describe(isObjectFormSchema, () => {
    test('is true for a single schema, which validates the whole options array', () => {
      assert.isTrue(isObjectFormSchema({ type: 'array' }));
    });

    test('is false for an array of schemas, one per option', () => {
      assert.isFalse(isObjectFormSchema([{ type: 'array' }]));

      assert.isFalse(isObjectFormSchema([]));
    });

    test('is false for no schema', () => {
      assert.isFalse(isObjectFormSchema(undefined));
    });
  });
}
