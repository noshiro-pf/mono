/** 型・インターフェース宣言の名前を拾うためのパターン */
const declarationPattern =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*(?:export\s+)?(?:type|interface)\s+([A-Za-z_$][\w$]*)/gmu;

/** 識別子として解釈できるトークンを拾うためのパターン */
const identifierPattern = /[A-Za-z_$][\w$]*/gu;

/**
 * ルール名から作った namespace 名と、json-schema-to-typescript
 * が生成した型名が衝突すると `@typescript-eslint/no-shadow` に引っかかるため、
 * 衝突した型だけをリネームする。
 *
 * 例えば `name-replacements` ルールのスキーマには `nameReplacements`
 * プロパティがあるため、`namespace NameReplacements` の中に `export type
 * NameReplacements` が生成されてしまう。
 *
 * リネーム後の名前には json-schema-to-typescript
 * 自身が名前の重複を解消するときと同じ連番方式を使う（`Foo` -> `Foo1`）。
 *
 * @param namespaceName 生成先の namespace 名
 * @param compiledTypes 1 つのルールに対して生成された型定義。複数スキーマを持つ
 *   ルールでは `Options0`, `Options1`, ... が別々の要素として渡ってくるため、
 *   リネームは全要素に対して一括で行う
 */
export const renameShadowedDeclarations = (
  namespaceName: string,
  compiledTypes: readonly string[],
): readonly string[] => {
  const declaredNames: ReadonlySet<string> = new Set(
    Array.from(
      compiledTypes.join('\n').matchAll(declarationPattern),
      ([, name]) => name,
    ).filter((name) => name !== undefined),
  );

  if (!declaredNames.has(namespaceName)) {
    return compiledTypes;
  }

  const renamedTo = findUnusedName(namespaceName, declaredNames, 1);

  return compiledTypes.map((code) =>
    code.replaceAll(identifierPattern, (token) =>
      token === namespaceName ? renamedTo : token,
    ),
  );
};

/** `${base}${index}` のうち、まだ使われていない最初の名前を返す */
const findUnusedName = (
  base: string,
  usedNames: ReadonlySet<string>,
  index: number,
): string => {
  const candidate = `${base}${index}` as const;

  return usedNames.has(candidate)
    ? findUnusedName(base, usedNames, index + 1)
    : candidate;
};
