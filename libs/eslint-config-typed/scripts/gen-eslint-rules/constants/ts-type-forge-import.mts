/**
 * codemod（convertToReadonly, replaceRecordWithUnknownRecord）と `eslint --fix`
 * が生成コードに差し込みうる ts-type-forge の型。
 *
 * 生成直後には未使用のものも含めて全部 import しておき、最終フォーマットの
 * prettier-plugin-organize-imports に不要な行を刈らせる。`eslint --fix`
 * が新しく使用箇所を足すこともあるため、刈り取りは必ず `eslint --fix`
 * の後に行う必要がある（organize-imports は import の削除はできるが追加はできない）。
 */
export const tsTypeForgeImportedTypes = [
  'DeepReadonly',
  'UnknownRecord',
  'FixedLengthTuple',
  'NonEmptyTuple',
  'MinLengthTuple',
] as const;

/** 上記の型をすべて import する文 */
export const tsTypeForgeImportStatement = `import { ${tsTypeForgeImportedTypes
  .map((t) => `type ${t}`)
  .join(', ')} } from 'ts-type-forge';` as const;
