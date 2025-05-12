---
title: 'TypeScript の codemod ツール開発時の失敗談と得た知見メモ'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['typescript', 'codemod', 'tsmorph', 'ast', 'compiler']
published: false
---

## Codemod とは

Codemod（コードモッド）とは、**"Code Modification"（コード修正）の略語で、プログラムを使ってコードベース全体にわたる変更やリファクタリングを自動的に行うプロセスや、そのためのツール**を指します。

手作業で一つ一つコードを修正する代わりに、スクリプト（codemodスクリプトやトランスフォームと呼ばれる）を実行することで、大規模なコードベースに対しても一貫性のある変更を効率的かつ正確に適用することを目的としています。

**主な目的と用途:**

- **APIの変更への追従:** ライブラリやフレームワークがバージョンアップし、古いAPIが非推奨になったり、使い方が変わったりした場合に、コードベース全体の該当箇所を新しいAPIの呼び出し方に自動で書き換える。
- **非推奨機能の置き換え:** 言語仕様やフレームワークで非推奨となった古い構文や機能を、推奨される新しいものに一括で置換する（例: JavaScriptの`var`を`let`/`const`に置き換える）。
- **大規模リファクタリング:** コード全体の構造改善や、特定のパターンに基づくコードの書き換えを自動で行う。
- **コードスタイルの一括修正:** LinterやFormatterだけでは対応しきれない、より複雑なコードスタイルの変更や規約の適用。
- **フレームワーク移行の支援:** あるフレームワークから別のフレームワークへ移行する際に、定型的なコードの書き換え作業を自動化する。
- **コードの品質向上:** 特定のアンチパターンを検出して修正したり、より効率的なコードに書き換えたりする。

**仕組み:**

多くのcodemodツールは、コードを単なるテキストとして扱うのではなく、**AST (Abstract Syntax Tree - 抽象構文木)** を利用します。

![AST](https://github.com/noshiro-pf/mono/blob/develop/articles/typescript-codemod-development.png?raw=true)

1.  **パース (Parse):** 対象のコードを解析し、その構造を表現するツリー構造（AST）に変換します。
2.  **変換 (Transform):** 作成したcodemodスクリプトがASTを走査し、目的のパターンに一致するノードを探し出して、ノードの置換、追加、削除などの操作を行います。
3.  **再生成 (Generate):** 変更されたASTから、再びコードを生成します。

ASTを使うことで、単純なテキスト検索や正規表現による置換よりも、コードの構文構造を正確に理解した上で安全に変更を加えることができます（例えば、変数名の一部だけが偶然一致してしまう、といった問題を避けられます）。

**メリット:**

- **効率性:** 大規模なコード変更を迅速に行える。
- **正確性:** 手作業によるミスを減らせる。
- **一貫性:** コードベース全体に同じ変更ルールを適用できる。
- **メンテナンス性:** ライブラリ等の追従コストを削減できる。

## TypeScript の Codemod 周辺環境

### 既存の Codemod 実装の例

- https://github.com/reactjs/react-codemod
  - React 19 へのアップデート対応を行う
- https://codemod.com/registry/typescript-use-template-literals
  - 文字列連結を `+` ではなく template literal で行う
- auto fix 実装を持つ eslint ルールすべて

とか

### TypeScript の codemod を行うためのツールサーベイ

- [Recast](https://github.com/benjamn/recast)
  - 元のコードスタイル（フォーマット、コメント、括弧など）を可能な限り保持したままコードを再生成するのが得意。
- [jscodeshift](https://jscodeshift.com/)
  - JavaScript や TypeScript の codemod のためのツール
  - recast のラッパー
  - Meta (旧Facebook) 製。
- [ast-grep](https://ast-grep.github.io/)
  - コード片のような直感的なパターン (`console.log($MATCH)`) を使ってASTノードを検索・置換する。`$MATCH` はキャプチャ変数。
  - 精密さに欠けるテキストベースの置換ではなく、ASTベースでの置換を行いたいが、ASTでの記述は非常に面倒になりがちという側面があるため、 grep のような手軽さで AST ベースのコード置換を行うことができるのが強み。
  - Rust 製で高速
  - 紹介記事： [大規模コードベース向けASTツールのast-grepについて](https://zenn.dev/makotot/articles/ea823805582e5c)
- [eslint](https://eslint.org/)
  - `eslint --fix` でコードの自動修正が可能
  - eslint ルールの一つとして導入することで永続的に lint にも使えそう。
- [ts-morph](https://github.com/dsherret/ts-morph)
  - TypeScript Compiler APIをラップし、より使いやすくオブジェクト指向的なインターフェースを提供するライブラリ。
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
  - TypeScript の API を直接使う方法

### codemod を登録できるプラットフォーム

- 紹介記事： [Codemod PlatformでCodemodがより身近になる日が来るかもしれない](https://zenn.dev/osushioichii/articles/cb6246203380b4?redirected=1)
- 実装した Codemod 関数を登録できるところ： https://codemod.com/registry
- ドキュメント： https://docs.codemod.com/introduction
- VSCode 拡張： https://github.com/codemod-com/codemod/tree/main/apps/vsce
  - これを使えば codemod の適用を VSCode 拡張経由でできそう？
  - しかし現在 https://marketplace.visualstudio.com/vscode を検索しても見つからない…

## 今回私が作ろうとしたもの

今回私が TypeScript の codemod について調べたのは、以下のような、TypeScript コード中の型定義をすべて再帰的に readonly なものに置き換える codemod ツールを作りたいと思ったのがきっかけでした。

```typescript
// Before
type User = {
  id: number;
  description: string;
  preferences: Map<string, string>;
  friendIds: number[];
  mut_items: string[]; // With ignorePrefixes: ['mut_']
};

type T = [string, ...number[]];

// After
type User = Readonly<{
  id: number;
  description: string;
  preferences: ReadonlyMap<string, string>;
  friendIds: readonly number[];
  mut_items: string[]; // Not made readonly due to 'mut_' prefix
}>;

type T = readonly [string, ...number[]]; // not readonly [string, ...(readonly number[])]
```

### モチベーション

なぜ Readonly にしたいのかというと、 mutable には以下のような危険があるからです。

```ts
const t: [string, number] = ['a', 1];

function f(x: number) {
  if (typeof x !== 'number') throw new Error('Error!!');
}

t.reverse(); // [1, 'a']

f(t[1]); // "Error!!" (but no type errors)
```

この例では `t` という mutable なタプルを `reverse` で反転させて `f` に渡しています。 `reverse` は破壊的メソッドであり、適用後は `t` の中身は `[1, 'a']` という値になっていますが、 **`t` の型は `[string, number]` のまま**になってしまうという TypeScript の仕様があります[^TS-issue]。 `t[1]` は TypeScript 上は `number` 型であるにもかかわらずランタイムの値は `string` 型という不整合が生じ、 `f` を呼び出した時点でランタイムエラーになってしまいます。

[^TS-issue]: https://github.com/microsoft/TypeScript/issues/52375

もしこれを以下のように readonly な型注釈をしていれば、破壊的メソッド `reverse` を readonly tuple である `t` に対して呼び出すことはできず、代わりに非破壊メソッド `toReversed` を呼び出すことになりますが、この結果は `(string | number)[]` という型に推論されるようになっているため、 「`string | number` は `number` に代入することができない」という型エラーが出てくれます。

```ts
const t: readonly [string, number] = ['a', 1];

function f(x: number) {
  if (typeof x !== 'number') throw new Error('Error!!');
}

const r = t.toReversed(); // (string | number)[]

f(r[1]);
// Argument of type 'string | number' is not assignable to parameter of type 'number'.
```

これ以外にも、コード中の変数の大部分を immutable として扱うことができると見通しが良くなったり、 React のレンダリングにおいてオブジェクトの参照を変えずに内部を破壊的に変更してしまい描画されないなどの問題を防げたりなど、堅牢性の観点で様々なメリットがあります。

ただ、 TypeScript で型をいちいち Readonly にしていく作業は結構書くのが面倒であり見逃しも発生しやすいため、 codemod で自動化したいと考えました。

### ツール選定

前述の通り、 codemod 実装にはいくつかの選択肢があります。

- [jscodeshift](https://jscodeshift.com/)
- [Recast](https://github.com/benjamn/recast)
- [ts-morph](https://github.com/dsherret/ts-morph)
- [ast-grep](https://ast-grep.github.io/)
- [eslint](https://eslint.org/)

調べて見つけられたこれらのツールをとりあえず試してみたのですが、結論から言うとこれらの中で `ts-morph` 以外の選択肢は断念しました。

まず最初に jscodeshift を試しました。 jscodeshift は React や Storybook のような著名ライブラリのアップデート作業のための codemod 実装に用いられており、利用実績があるため、 Meta 社製であることもあり信頼度が高いですが、今回の Readonly 化変換には不向きであると感じました。

Readonly 化実装では、

- （先ほど示した変換例のように）`mut_` prefix を付けたノード配下はすべて無視させたい
- `Readonly<Readonly<{ x: number }>>` のように多重に Readonly 適用することは避けたい（できれば既存コードの正規化までやりたい）
- `...T[]` などの `RestTypeNode` の直下の `T[]` は readonly 化する意味が無いため無視させたい
- 再帰的に Readonly 型にする `DeepReadonly` 型ユーティリティなどを用いている場合子孫の readonly 化はスキップしたい

など、**文脈に応じて**変換を行っていくようにしたかったのですが、 jscodeshift は少し使ってみた感じだとこのような AST の **traverse 順序を細かく制御したり、文脈情報を受け渡しながら変換していく**複雑な実装ができる API ではなさそうでした（やり方があったらすみません）。

```ts
// jscodeshift で any 型を unknown 型に置き換えるコード例

// any-to-unknown.transform.js
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // TSAnyKeyword ノードを見つけて TSUnknownKeyword ノードに置き換える
  root.find(j.TSAnyKeyword).replaceWith(() => j.tsUnknownKeyword());

  return root.toSource({ quote: 'single' }); // 必要に応じて出力スタイルを指定
}
```

同様の理由で `recast` や `eslint`、 `ast-grep` も使用を断念しました。

recast は、デフォルトで Esprima という parser を使用するのですが、これが JavaScript 用のものであるため、 TypeScript の変換を行うためには parser を指定する必要があるのですが、これを行ったときに AST の構造・変数名などが recast の定義と微妙に異なることによる実装しづらさも感じました。

```ts
// recast-any-to-unknown.js
import * as recast from 'recast';
import * as babelParser from '@babel/parser';
import fs from 'fs';

const filePath = './target.ts'; // 対象のファイルパス
const code = fs.readFileSync(filePath, 'utf-8');

const ast = recast.parse(code, {
  parser: {
    parse: (source) =>
      babelParser.parse(source, {
        sourceType: 'module',
        plugins: ['typescript'], // TypeScriptプラグインを有効化
      }),
  },
});

recast.visit(ast, {
  visitTSAnyKeyword(path) {
    // TSAnyKeywordノードをTSUnknownKeywordノードで置き換える
    const b = recast.types.builders;
    path.replace(b.tsUnknownKeyword());
    return false; // このノードの更なる探索は不要
  },
});

const outputCode = recast.print(ast, { quote: 'single' }).code;
fs.writeFileSync(filePath, outputCode, 'utf-8');
console.log(`Recast: Transformed ${filePath}`);
```

eslint を使った実装も同様の問題がありそうです。 eslint で実装できれば様々なプロジェクトへの導入がしやすそうで魅力的だなとも思ったのですが…。

```ts
// eslint ルール実装例

// rules/any-to-unknown-rule.js

export default createRule<Options, MessageIds>({
  meta: {
    type: 'suggestion',
    docs: {
      description: "Replace 'any' type annotations with 'unknown'",
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      // typescript-eslint/parser が生成するASTのノードタイプを指定
      // 'TSAnyKeyword' ノードが見つかるたびにこの関数が呼ばれる
      TSAnyKeyword(node) {
        context.report({
          node: node,
          message: "Use 'unknown' instead of 'any'.",
          fix(fixer) {
            return fixer.replaceText(node, 'unknown');
          },
        });
      },
    };
  },
});
```

ast-grep は、grepのような容易さでコードを置換する、というのが売りのツールであり、今回のような複雑な要件だとあまりその利点を活かせなさそうでした。

```yaml
# ast-grep ルールファイル

# any-to-unknown.yml
id: any-to-unknown-typescript
language: TypeScript
rule:
  # 'any' という名前の predefined_type (any, number, string など) を見つける
  # tree-sitter-typescript の文法では 'any' は predefined_type として扱われる
  pattern: $TYPE
  constraints:
    TYPE:
      kind: predefined_type
      regex: ^any$ # 厳密に 'any' であることを確認
  fix: 'unknown' # 置換後のテキスト
```

消去法で ts-morph が選択肢として残ったのでこの使い方を詳しく調べていくことにしました。

ts-morph は以下のコード例のように AST を `sourceFile.getDescendants()` や `sourceFile.getChildren()` を使って traverse し、 マッチしたノードを `node.replaceWithText(*)` を呼び出して置換します。 `getDescendants` だと子孫のノードすべてを辿りますが、 `getChildren` のみを使い AST の掘り方を自分で制御すれば実際に今回やりたいことが実現しやすそうでした。

```ts
// tsmorph-any-to-unknown.ts
import { Project, SyntaxKind, Node } from 'ts-morph';
import path from 'path';

async function transformAnyToUnknown(filePath: string) {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(path.resolve(filePath));

  sourceFile.getDescendants().forEach((node) => {
    // SyntaxKind.AnyKeyword を持つ TypeNode を見つける
    if (Node.isTypeNode(node) && node.getKind() === SyntaxKind.AnyKeyword) {
      // console.log(`Found 'any' type at: <span class="math-inline">\{sourceFile\.getFilePath\(\)\}\:</span>{node.getStartLineNumber()}`);
      node.replaceWithText('unknown');
    }
  });

  await sourceFile.save();
  console.log(`ts-morph: Transformed and saved ${sourceFile.getFilePath()}`);
}

// 実行
const targetFile = './target.ts';
transformAnyToUnknown(targetFile).catch(console.error);
```

### TypeScript Compiler API か ts-morph か

ts-morph のコードを正しく動作させるためには、置換は AST の葉ノードの方から親に向かって置換していく必要があります（親側で `replaceWithText` を呼ぶとその子孫ノードの情報が古くなってしまい効率が悪いため）。
しかし、実装している途中で、 `replaceWithText` のような破壊的メソッドにより部分的に文字列置換を行うような方法で実装するからそういう問題が起きるのであり、完全に AST から AST に変換する immutable な関数で書ける方が、複雑な置換処理は実装しやすいのではないか、という考えがよぎりました。

そして、そのような実装をしたいと考えた場合、もはや ts-morph を使う必要は無く、 TypeScript Compiler API を直接使えば良さそうでした。

TypeScript Compiler API を使った実装は以下のようなコードになります。

```ts
// compiler-api-any-to-unknown.ts

export const replaceAnyWithUnknownTransformer: ts.TransformerFactory<ts.SourceFile> =
  createTransformerFactory((context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> =>
      transformNode(node, visitor, context);

    return visitor;
  });

type TransformNodeFn = (
  node: ts.Node,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
) => ts.Node;

/** Convert all nodes to readonly type (recursively) */
const transformNode: TransformNodeFn = (node, visitor, context) => {
  if (ts.isTypeNode(node) && node.kind === ts.SyntaxKind.AnyKeyword) {
    return context.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
  }

  return ts.visitEachChild(node, visitor, context);
};

const createTransformerFactory =
  (
    genVisitor: (context: ts.TransformationContext) => ts.Visitor,
  ): ts.TransformerFactory<ts.SourceFile> =>
  (context) =>
  // return a transformer
  (rootNode) =>
    rootNode.getFullText().includes(IGNORE_FILE_COMMENT_TEXT)
      ? rootNode
      : ts.visitNode(rootNode, genVisitor(context), ts.isSourceFile)!;
```

```ts
const sourceFile = ts.createSourceFile(
  resolvedPath,
  sourceCode,
  ts.ScriptTarget.Latest,
  true,
);
const transformationResult = ts.transform(sourceFile, [
  replaceAnyWithUnknownTransformer,
]);

const transformedSourceFile = transformationResult.transformed[0];

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

const resultCode = printer.printFile(transformedSourceFile);
```

ここで、 `transformNode` という関数は `ts.Node -> ts.Node` という変換を行う immutable な関数で実装できていることで transformer 実装の見通しが良くなると考えていました。

しかし、 TypeScript Compiler API を使った方法にはある重大な欠点があることにかなり実装を進めた後に気づくことになります…。

### Trivia との戦い

元のソースコードを忘れて AST から AST への置換を行った結果を print する方針には、 AST のノードとして表現できないコードの詳細情報、具体的には改行やスペース、コメントなどの情報（Trivia）が保持されるとは限らない、という問題があることに、具体的なアプリケーションコード上での本格的なテストを行う段階で気づきました。

まず最初に気づいたのが、コード中の空行が消えてしまう問題で、

```ts
const f = (arg1: number, arg2: number): void => [];

const g = (arg1: number, arg2: number): void => [];
```

のようなコードは `f` と `g` の間の空行が無くなった結果に print されてしまいます。

元のコードのスタイルをなるべく維持するために空行を `'//--empty-line--4c6654a3-456f-49b8-b1ca-720d17638f04'` のような他と被らなさそうなコメント文字列に置換して後で戻す（[`emptyLineEncoder`](https://github.com/noshiro-pf/mono/blob/develop/experimental/ts-codemod-lib/src/utils/empty-line-encoder.mts) ）、という実装でこれを解決しました（複数行コメント `/* ... */` の中の空行をこれで置換しても line comment なので無害）。

コードの細かいスタイルは prettier などのフォーマッターで正規化してあることを前提としても良いと考えていましたが、空行が無いところに空行を生やすことまではやってくれなかったりと、 prettier はソースコード文字列の一意な形式を決めてくれる決定論的な動作をする関数ではないため、元コードのスタイルを維持する実装はどうしても自前である程度行う必要があります。

そして、一番厄介で最後まで完全に解決できなかったのがソースコメントでした。
例えば以下のようなコードを `ts.createSourceFile` でパースし何もせず `printer.printFile` で print すると `// line-comment-2` や `/* params-end */` などのコメントが欠落した結果となってしまいます。

```ts
/** f */
const f = (
  /* description1 */
  arg1: number, // line-comment-1
  /* description2 */
  arg2: number, // line-comment-2
  /* params-end */
): /* ret-before */ number[] /* ret-after */ => [];
```

`/* description1 */` などは `arg1: number` というノードに紐づけられ保持されるため printer が出力してくれるのですが、`// line-comment-2` や `/* params-end */` のような仮引数の最後の閉じ括弧の手前にあるコメントなどは欠落しやすいようです。

これを解決するために、一度 transformer を適用する前に parse & re-print 前後で欠落したコメントを洗い出し、適当なノードに強制的に紐づける、という解決策を試しました（ https://github.com/noshiro-pf/mono/blob/develop/experimental/ts-codemod-lib/src/functions/transform-source-code.mts ）。
しかし、欠落したコメント文字列をどのノードに紐づけるべきかはヒューリスティックにしか決められず、相当頑張って実装してみたのですが、試していくと次から次へと例外が見つかり元のコードを維持することは困難でした。

ここに来て、最初に調査していた `recast` などのツールが「元のコードスタイル（フォーマット、コメント、括弧など）を可能な限り保持したままコードを再生成する」ことを謳っていた理由がより身に染みて分かってきます。 prettier などでフォーマットする前提ならコードの細かいスタイルの変化は無視できる問題だと思っていましたがそうでもなかったのです。

### 結局 ts-morph に戻る

結局、 TypeScript Compiler API を使い AST to AST の変換で codemod を実装する方法は Trivia の扱いが困難を極めたため断念することになりました。
そうなると、次の方針としては、元のソースコード文字列情報を忘れずに保持しつつ、 AST としてパースした結果のノードにマッチする部分だけ文字列置換する、という方法が考えられます。

これを TypeScript Compiler API を使って自分で実装することも視野に入れつつ、その後もやはり recast を使った方が早いか…？、など色々悩みつつ調査していましたが、結局 ts-morph を使う方針に戻るのが良さそう、という結論になりました。
当初はよく理解していなかったのですが、そもそも ts-morph は、置換を行ったノード以外は元のソースコードの文字列を使った結果を返すように上手く処理してくれる、まさにやろうとしていたことをやってくれるツールであることがその後調べていて分かったためです。置換したノードの中のコメントなどでは同様の問題が起きる可能性がありますが、置換と無関係な箇所のスタイルは維持してくれそうです。

元のソースコードのスタイルを維持したいという codemod における普遍的な要件を満たすことを考えた場合、 AST として traverse しマッチしたノードの箇所のみ文字列として置換する、というのが現実的に良さそうな解決策ですが、 ts-morph の `node.replaceWithText(*)` という API はまさにそれを行っているものでした。 ts-morph が、ノードの置換処理だけは文字列置換で実装する API になっているのがなぜなのか不思議に思い、最初はこれを気持ち悪く思い Compiler API の使用を検討しましたが、ちゃんとこのような理由があってこの API になっていることが理解できました。

### 実装コード

まだ公開のための準備中の段階のためテストが十分できていませんが、実装した codemod ツールです。

TypeScript Compiler API で作りかけていたもの：
https://github.com/noshiro-pf/mono/blob/develop/experimental/ts-codemod-lib

ts-morph で実装し直したもの
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-codemod-lib

この実装コードを見れば、このような context 情報を引数に含む相互再帰関数により実装された transformer 実装は ts-morph でないとやりづらいと感じた理由が分かってもらえるかもしれません。
Readonly 化 codemod ツールの実装詳細についての説明はほぼ省きましたが、機会があれば別記事で紹介しようかなと思っています。

完成したら https://codemod.com/registry にも登録しようと考えています。 codemod.com の VSCode 拡張が機能しているのか怪しいためこれも自作するかもしれません。

## おわりに

今回はそこまで必要にはなりませんでしたが、 ts-morph を使うと TypeScript 型情報にもアクセスできるため、より高度な codemod 実装ができる可能性もあります。

本記事が今後 TypeScript の codemod 実装を行う人のツール選定の助けになれば幸いです。
