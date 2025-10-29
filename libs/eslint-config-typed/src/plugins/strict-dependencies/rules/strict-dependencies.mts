import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import isGlob from 'is-glob';
import mm from 'micromatch';
import * as path from 'node:path';
import { Arr, castDeepMutable, hasKey, isNotUndefined } from 'ts-data-forge';
import { resolveImportPath } from './resolve-import-path.mjs';

// Forked from https://github.com/knowledge-work/eslint-plugin-strict-dependencies/blob/v1.3.27/strict-dependencies/index.js

// Fork 時の変更点メモ
// - normalize は path.normalize に変更（厳密には挙動が異なるが、この eslint ルールの用途的には問題ないはず）
// - MessageId を使ってレポートするように変更（context.report に 2引数渡していた形式を object を渡すように変更）

type RuleOptions = readonly [Dependencies] | readonly [Dependencies, Options];

type Dependencies = readonly Readonly<{
  module: string;
  allowReferenceFrom: readonly string[];
  allowSameModule?: boolean;
  targetMembers?: readonly string[];
  excludeTypeImportChecks?: boolean;
}>[];

type Options = Readonly<{
  resolveRelativeImport?: boolean;
  pathIndexMap?: ReadonlyRecord<string, number>;
}>;

type MessageId = 'forbidden-import-specifier' | 'forbidden-import';

export const strictDependenciesRule: TSESLint.RuleModule<
  MessageId,
  RuleOptions
> = {
  meta: {
    type: 'suggestion',
    messages: {
      'forbidden-import-specifier':
        "import specifier '{{specifiers}}' is not allowed from {{from}}.",
      'forbidden-import':
        "import '{{importPath}}' is not allowed from {{from}}.",
    },
    schema: [
      {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['module', 'allowReferenceFrom'],
          properties: {
            module: {
              type: 'string',
            },
            allowReferenceFrom: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            allowSameModule: {
              type: 'boolean',
            },
            targetMembers: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            excludeTypeImportChecks: {
              type: 'boolean',
            },
          },
        },
      },
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          resolveRelativeImport: {
            type: 'boolean',
          },
          pathIndexMap: {
            type: 'object',
            additionalProperties: {
              type: 'number',
            },
          },
        },
      },
    ],
  },

  create: (context) => {
    const ruleOptions: RuleOptions = context.options;

    const dependencies: Dependencies = ruleOptions[0];

    const options: Options = Arr.isArrayAtLeastLength(ruleOptions, 2)
      ? ruleOptions[1]
      : {};

    const resolveRelativeImport = options.resolveRelativeImport;
    const pathIndexMap = options.pathIndexMap ?? {};

    return {
      ImportDeclaration: (node: DeepReadonly<TSESTree.ImportDeclaration>) => {
        const fileFullPath = context.filename;
        const relativeFilePath = path.normalize(
          path.relative(process.cwd(), fileFullPath),
        );
        const importPath = resolveImportPath(
          node.source.value,
          resolveRelativeImport === true ? relativeFilePath : undefined,
          pathIndexMap,
        );

        const importedModules: readonly string[] = (
          node.specifiers satisfies DeepReadonly<
            (
              | TSESTree.ImportDefaultSpecifier
              | TSESTree.ImportNamespaceSpecifier
              | TSESTree.ImportSpecifier
            )[]
          >
        )
          .filter((spec) => hasKey(spec, 'imported')) // NOTE: ImportSpecifierの場合はimportedが存在する
          .map((spec: DeepReadonly<TSESTree.ImportSpecifier>) =>
            hasKey(spec.imported, 'name') ? spec.imported.name : undefined,
          )
          .filter(isNotUndefined);

        for (const dependency of dependencies) {
          // そもそもmoduleがimportPathと一致していない場合は必ず報告しない
          if (!isMatch(importPath, dependency.module)) continue;

          /**
           * 1. 参照元チェックをしてAllowであればそこで処理を終了する
           * 2. targetMembersが指定されていれば、targetMembersと実際にimportしているモジュールを比較して含まれていればエラーレポートして処理を終了する
           * 3. targetMembersが指定されていない場合は、エラー扱いなのでエラーレポートして処理を終了する
           */
          const isAllowedByPath =
            // 参照元が許可されている
            dependency.allowReferenceFrom.some((allowPath) =>
              isMatch(relativeFilePath, allowPath),
            ) || // または同一モジュール間の参照が許可されている場合
            (dependency.allowSameModule === true &&
              isMatch(relativeFilePath, dependency.module)) ||
            // または明示的に対象外としたtype importである場合
            // FIXME: importKind という key は node に存在しないため修正が必要
            (dependency.excludeTypeImportChecks === true &&
              node.importKind === 'type');

          if (isAllowedByPath) continue;

          if (dependency.targetMembers !== undefined) {
            const commonImportedList = getCommonElements<string>(
              dependency.targetMembers,
              importedModules,
            );
            if (commonImportedList.length > 0) {
              context.report({
                node: castDeepMutable(node),
                messageId: 'forbidden-import-specifier',
                data: {
                  specifiers: commonImportedList.join(', '),
                  from: relativeFilePath,
                },
              });
            }
            continue;
          }

          context.report({
            node: castDeepMutable(node),
            messageId: 'forbidden-import',
            data: {
              importPath,
              from: relativeFilePath,
            },
          });
        }
      },
    };
  },
  defaultOptions: [[]],
};

/**
 * pathのmatcher。
 * eslintrcで設定できる値は以下のケースを扱う
 * - globパターン指定
 * - globパターン以外の場合 => 前方部分一致
 */
const isMatch = (str: string, pattern: string): boolean =>
  isGlob(pattern) ? mm.isMatch(str, pattern) : str.startsWith(pattern);

// importedされた値・型名もLintのターゲットに入っている場合の検出処理
const getCommonElements = <T,>(
  arrA: readonly T[],
  arrB: readonly T[],
): readonly T[] => arrA.filter((element) => arrB.includes(element));
