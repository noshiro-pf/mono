/** json-schema-to-typescript が patternProperty から型を起こしたときに付ける定型文 */
const boilerplateMarker = 'This interface was referenced by';

/** `[k: string]: T;` のような index signature の行 */
const indexSignaturePattern =
  /^\s*\[[A-Za-z_$][\w$]*: (?:string|number|symbol)\]\??:/u;

/** JSDoc の開始行・終了行 */
const commentStartPattern = /^\s*\/\*\*\s*$/u;

const commentEndPattern = /^\s*\*\/\s*$/u;

/**
 * 生成された型定義から、index signature に付随するコメントを取り除く。
 *
 * `@typescript-eslint/consistent-indexed-object-style` の autofix は、修正によって
 * コメントが失われる場合に修正を諦める実装になっている。生成コードでは index
 * signature の直前に必ずコメントが付くため、そのままでは `Record<K, V>`
 * への変換が一切適用されず、生成物に lint エラーが残ってしまう。
 *
 * 取り除かれるのは
 *
 * - json-schema-to-typescript の定型コメント（参照元が常に `undefined`
 *   と表示され、情報として意味を持たない）
 * - index signature 自体に対する説明（親プロパティ側の説明は残るため、失われる情報は小さい）
 *
 * の 2 種類のみで、通常のプロパティに付いた説明はそのまま残る。
 */
export const stripGeneratorBoilerplateComments = (code: string): string => {
  const lines = code.split('\n');

  const mut_result: string[] = [];

  let mut_index = 0;

  while (mut_index < lines.length) {
    const line = lines[mut_index] ?? '';

    const commentEnd = commentStartPattern.test(line)
      ? findCommentEnd(lines, mut_index)
      : undefined;

    if (commentEnd === undefined) {
      mut_result.push(line);

      mut_index += 1;

      continue;
    }

    const comment = lines.slice(mut_index, commentEnd + 1);

    const nextLine = lines[commentEnd + 1] ?? '';

    const shouldDrop =
      comment.some((l) => l.includes(boilerplateMarker)) ||
      indexSignaturePattern.test(nextLine);

    if (!shouldDrop) {
      mut_result.push(...comment);
    }

    mut_index = commentEnd + 1;
  }

  return mut_result.join('\n');
};

/**
 * `startIndex` から始まる JSDoc の終了行の位置を返す。閉じられていない場合は
 * `undefined`
 */
const findCommentEnd = (
  lines: readonly string[],
  startIndex: number,
): number | undefined => {
  const endIndex = lines.findIndex(
    (line, index) => index > startIndex && commentEndPattern.test(line),
  );

  return endIndex === -1 ? undefined : endIndex;
};
