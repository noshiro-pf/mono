# lint ルールを書くときの注意

リポジトリの自作 lint ルールに共通する落とし穴と、その避け方。対象は構文木を見て
報告・修正するものすべてである。

- ESLint ルール: `libs/eslint-config-typed/src/plugins/*/rules/`、
  `libs/eslint-plugin-ts-*/src/rules/`
- Sumi の oxlint JS plugin: `languages/sumi/oxlint-config/src/plugin/rules/`
  （ESTree なので ESLint と同じ形で当てはまる）
- TypeScript の AST を直接見るもの: Sumi の checker
  （`languages/sumi/checker/src/rules/`）、`libs/ts-codemod-lib` の変換

どれも**すり抜けても何も失敗しない**種類の誤りである。報告されるべきコードが黙って
通るか、修正がコードの意味を黙って変える。テストが通っていても、そのケースを
書いていなければ見つからない。

## 型ラッパー: `as`・`satisfies`・`!`・`<T>`

型だけを変えて値を変えない式が 4 つある。ESTree では `TSAsExpression`・
`TSSatisfiesExpression`・`TSNonNullExpression`・`TSTypeAssertion`、TypeScript の AST
では `AsExpression`・`SatisfiesExpression`・`NonNullExpression`・
`TypeAssertionExpression` である。これらを考えずにルールを書くと、2 通りに破れる。

**構文をすり抜ける。** `node.type === AST_NODE_TYPES.Literal` で `false` を探すと、
`a ? (false satisfies boolean) : b` は通る。比べる対象が包まれている場合も同じで、
`(x satisfies T | undefined) == null ? undefined : x.b` の `x` は、そのままでは
`x.b` の `x` と同じ参照に見えない。

**型を偽れる。** `checker.getTypeAtLocation` に包まれたノードを渡すと、返るのは
キャスト後の型である。`(n as unknown as boolean) ? true : b` の条件は `boolean` と
答えるが、値は数値のままである。修正が型に依存するルールでは、これで修正が挙動を
変える。この例を `n || b` に書き換えると、結果は `true` ではなく `n` になる。

避け方:

- **構文を見る前、型を聞く前に剥がす。** ESLint のルールでは
  `libs/eslint-config-typed/src/plugins/ts-restrictions/rules/type-wrapper-utils.mts`
  の `skipTypeWrappers` を使う。同じ参照かどうかは、同じ場所の
  `reference-utils.mts` の `isSameReference` がラッパー越しに比べる。
- **位置を判定するときも剥がす。** 「JSX の中か」「呼び出しの callee か」のように
  親をたどる判定では、親がラッパーならさらにその上を見る（`jsx-utils.mts` の
  `jsxValuePositionOf`）。
- **修正の文字列は元のノードから作る。** 判定には剥がしたノードを使い、書き換えには
  ラッパーを残す。`x == null ? undefined : (x.b satisfies number)` は
  `x?.b satisfies number` にする。
- **包まれたオペランドを別の演算子の下に置くときは括弧で囲む。** `a as T ? b : c`
  は `?` が型の一部と読まれうるので、`(a as T) ? b : c` と書く。
- ラッパーそのものが対象のルール（`no-unsafe-type-assertion` など）は、当然剥がさない。

## 括弧

ESTree には括弧のノードがない。`sourceCode.getText(node)` は、ソースでそのノードを
囲んでいた括弧を**含まない**。そのため、「ソースで括弧に囲まれているから、差し込む
文字列に括弧は要らない」という判定は誤りである。`(a || b) ? false : c` を
`!${getText(test)} && c` と組み立てると、`!a || b && c` になって意味が変わる。
差し込む先の優先順位で括弧が要るなら、ソースに括弧があったかどうかにかかわらず付ける。
ソースの括弧ごと扱いたいときは、`ASTUtils.isParenthesized` と
`getTokenBefore` / `getTokenAfter` でその範囲を求める。

TypeScript の AST は逆で、括弧が `ParenthesizedExpression` というノードとして残る。
構文を判定する前に、型ラッパーと一緒に剥がす（Sumi の checker の
`src/ast/node-helpers.mts` の `unwrap`）。

## テストに入れるケース

ルールが探す構文要素と、型を聞くオペランドのそれぞれについて、次のケースを書く。
既存のルールでは、`… through type wrappers` という名前の `describe` にまとめている。

- `satisfies` で包んだもの: リテラル、比べる値、式全体。報告され、修正でラッパーが残ること。
- `as` で型を偽ったもの: 修正が型に依存するなら、報告しない（または修正しない）ことを
  `valid` で固定する。
- `!` を付けたもの。
- 親の位置で判定するなら、式全体をラッパーで包んだもの。
- ソースで括弧に囲まれたオペランド: 修正の出力で、必要な括弧が残ること。

テストは実装より先に書き、失敗することを確かめてから直す。すでに通ってしまうケースは、
その穴が最初から無いことの記録として残す。
