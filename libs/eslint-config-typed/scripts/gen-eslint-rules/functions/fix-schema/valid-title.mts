import { isTruthy } from '@sindresorhus/is';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import { type JSONSchema4 } from '../type.mjs';

/**
 * patternProperties の `^must(?:Not)?Match$` を明示的な `mustMatch` と `mustNotMatch` プロパティに変換する。
 * これにより index signature ではなく、具体的なプロパティ名を持つ型が生成される。
 * また、共通の型を definitions に抽出して $ref で参照するようにする
 */
export const expandMustMatchPatternProperties = (
  schema: JSONSchema4,
): JSONSchema4 => {
  if (
    schema.patternProperties !== undefined &&
    Object.hasOwn(schema.patternProperties, '^must(?:Not)?Match$')
  ) {
    const { patternProperties, properties, definitions, ...rest } = schema;

    const mustMatchSchema = patternProperties['^must(?:Not)?Match$'];

    // oneOf の中で繰り返される型を PatternOrPatternArray として定義
    let mut_patternTypeSchema: JSONSchema4 | undefined;

    // mustMatchSchema の oneOf 内の object 型を展開し、共通型を抽出
    const mut_expandedMustMatchSchema = { ...mustMatchSchema };

    if (
      mut_expandedMustMatchSchema.oneOf !== undefined &&
      Arr.isArray(mut_expandedMustMatchSchema.oneOf)
    ) {
      // 最初に PatternOrPatternArray の定義を抽出
      const mut_nonObjectOptions: JSONSchema4[] = [];

      let mut_objectOption: JSONSchema4 | undefined;

      for (const option of mut_expandedMustMatchSchema.oneOf) {
        if (
          option.type === 'object' &&
          hasKey(option, 'propertyNames') &&
          isTruthy(option.propertyNames) &&
          isRecord(option.propertyNames) &&
          hasKey(option.propertyNames, 'enum') &&
          Arr.isArray(option.propertyNames.enum)
        ) {
          mut_objectOption = option;

          if (
            mut_patternTypeSchema === undefined &&
            option.additionalProperties !== undefined
          ) {
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            mut_patternTypeSchema = option.additionalProperties as JSONSchema4;
          }
        } else {
          mut_nonObjectOptions.push(option);
        }
      }

      // PatternOrPatternArray が定義されている場合、oneOf を書き換え
      if (
        mut_patternTypeSchema !== undefined &&
        mut_objectOption !== undefined
      ) {
        // propertyNames.enum から具体的なプロパティを生成
        const mut_properties: Record<string, JSONSchema4> = {};

        const propertyNames =
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          mut_objectOption['propertyNames'] as { enum: readonly string[] };

        for (const propName of propertyNames.enum) {
          if (typeof propName === 'string') {
            mut_properties[propName] = {
              $ref: '#/definitions/PatternOrPatternArray',
            } as JSONSchema4;
          }
        }

        const {
          additionalProperties,
          propertyNames: _pn,
          ...optionRest
        } = mut_objectOption;

        // oneOf を PatternOrPatternArray の $ref と変換後の object に置き換え
        mut_expandedMustMatchSchema.oneOf = [
          { $ref: '#/definitions/PatternOrPatternArray' },
          {
            ...optionRest,
            properties: mut_properties,
            additionalProperties: false,
          },
        ];
      }
    }

    // 共通の型を definitions に追加
    const mut_newDefinitions = { ...definitions };

    // PatternOrPatternArray 型を追加
    if (mut_patternTypeSchema !== undefined) {
      mut_newDefinitions['PatternOrPatternArray'] = mut_patternTypeSchema;
    }

    mut_newDefinitions['MustMatchType'] =
      mut_expandedMustMatchSchema as JSONSchema4;

    return {
      ...rest,
      definitions: mut_newDefinitions,
      properties: {
        ...properties,
        mustMatch: {
          $ref: '#/definitions/MustMatchType',
        },
        mustNotMatch: {
          $ref: '#/definitions/MustMatchType',
        },
      },
    } as JSONSchema4;
  }

  return schema;
};
