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
逆に、剥がした中身の型だけを聞くと、作者が書いた `as` を無視することになる。
`isNull(x as string | null)` は、`x` が `string` でも `false` に畳んではいけない。

境界は次のとおりである。

- **A. 構文（値・参照・リテラル）は、常にラッパー越しに見る。** ラッパーは値を
  変えない。`xs.length > (0 as number)` は `0` との比較である。
  `xs.length > (n as 0)` のように型だけが `0` と言っているものは、値とはみなさない。
- **B. 型による結論は、ラッパーのすべての層の型で成り立つときだけ出す。**
  `x as unknown as T` なら `x as unknown as T`・`x as unknown`・`x` の 3 層で、
  途中の `unknown` も数える。アサーションは判定を慎重な側にしか動かさない。
    - 広げる `as`（`x as string | null`）は、作者の主張として尊重する。
    - 狭めるアサーション（`x!`、`unknown` からのキャスト）は値を保証しないので、
      値そのものの型が決める。
    - 層によって結論が分かれるなら、報告しない（修正しない）。「〜に置き換える」
      という結論は、ある層で出したものがすべての層で成り立つなら使ってよい。
    - 危険を報告するルール（`total-functions` の `no-partial-*` など）では、
      慎重な側は逆になる。どれかの層で危険なら報告する。

このリポジトリでは `!` と狭める `as` は lint エラー
（`@typescript-eslint/no-non-null-assertion`、`total-functions/no-unsafe-type-assertion`）
なので、B と「外側の型だけで判定する」案の違いは、それらを disable した箇所にしか
出ない。

避け方:

- **構文を見る前に剥がし、型は層ごとに聞く。** ESLint のルールと Sumi の oxlint JS
  plugin では `eslint-rule-forge`（`libs/eslint-rule-forge`）の
  `skipTypeWrappers` で剥がし、`typeWrapperLayers` で各層を得て型を聞く。
  公開しているプラグインもこれを `dependencies` に持つので、ヘルパーを
  パッケージへコピーせず、足りないものはこのパッケージに足す。同じ参照かどうかは、
  `ts-restrictions/rules/reference-utils.mts` の `isSameReference` がラッパー越しに比べる。
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
ソースの括弧ごと扱いたいときは、`eslint-rule-forge` の `parenthesesDepth` と
`getRangeWithParens` で深さと範囲を求める。呼び出しの引数に差し込む文字列は
`getArgumentText` で作る。カンマ式 `(a, b)` が 2 つの引数にならないよう括弧を付ける。

TypeScript の AST は逆で、括弧が `ParenthesizedExpression` というノードとして残る。
構文を判定する前に、型ラッパーと一緒に剥がす（Sumi の checker の
`src/ast/node-helpers.mts` の `unwrap`）。

## テストに入れるケース

ルールが探す構文要素と、型を聞くオペランドのそれぞれについて、次のケースを書く。
既存のルールでは、`… through type wrappers` という名前の `describe` にまとめている。

- `satisfies` で包んだもの: リテラル、比べる値、式全体。報告され、修正でラッパーが残ること。
- `as` で型を偽ったもの: 修正が型に依存するなら、報告しない（または修正しない）ことを
  `valid` で固定する。
- `as` で型を広げたもの（`b as boolean | number`、`x as string | null`）: 結論が
  変わるなら報告しないことを `valid` で、すべての層で結論が同じなら報告することを
  `invalid` で固定する。
- `!` を付けたもの。
- 親の位置で判定するなら、式全体をラッパーで包んだもの。
- ソースで括弧に囲まれたオペランド: 修正の出力で、必要な括弧が残ること。

テストは実装より先に書き、失敗することを確かめてから直す。すでに通ってしまうケースは、
その穴が最初から無いことの記録として残す。
