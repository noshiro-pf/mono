---
title: 'ESLint を使い倒す（おすすめルール紹介）'
emoji: '🐈'
type: 'tech'
topics: ['typescript', 'eslint']
published: true
---

# 前書き

ESLint は JavaScript, TypeScript のための静的検証ツールです。

ESLint を活用することで、コーディング規約やベストプラクティスを機械的に強制することによりコードレビューの手間を省き、本番環境でのエラーやパフォーマンスの悪化を抑制することができます。 TypeScript を使っているプロジェクトでは、パーサーを適切に設定すれば型情報を用いたより精密な静的検証を行うこともできます。

eslint を使う際、 `eslint:recommended`, `plugin:@typescript-eslint/eslint-recommended` などの各 eslint plugin の推奨 config のみを使って済ませたり、 [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb) などの config のみに頼ることも多い印象ですが、 recommended config に含まれないルールやオプションにも非常に有用なものが数多く存在するので、それらを一つでも多く活用した方が良いと私は考えています。

推奨設定を使っているだけだと、もしかしたら ESLint はコードのフォーマットや `eval` などのグローバル変数の使用を禁止する程度の素朴なチェックしかできないように思ってしまうかもしれませんが、ESLint は JavaScript コードをパースしてできた AST（抽象構文木）を検証するツールであるため、強力な静的検証を行うポテンシャルがあります。
例えば、パーサー等を適切に指定することで TypeScript の型情報を使ったチェックや、循環依存の検出[^no-cycle]、どこからも参照されていない export の検出[^no-unused-modules]なども行うことができます。

今回は、私が特に有用だと思っているルールをいくつか紹介します。サンプルコードは各ルールのリンク先を見た方が分かりやすいので、記事の長さの都合上一部省きました。

[^no-cycle]: https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-cycle.md
[^no-unused-modules]: https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-unused-modules.md

## （余談）筆者の個人開発環境の場合

:::message
※ この章に書いていることはほぼ筆者の個人開発環境に限った趣味の話なので、本記事の次章以降のルール説明で想定している設定とは異なります。おすすめルール紹介だけを読む上ではこの章はスキップしても問題ありません。
:::

私が普段個人で開発している mono repo における ESLint 共通設定では、 `eslint:recommended` 等の既存 config は一切 extend して使わず、ルール等の設定をすべて自分で明示的に書いています。

基本的に使用している plugin のほぼすべてのルールが有効（`error`）な設定にしており、より優先したい ESLint ルールと競合するものや、 TypeScript ・ prettier（フォーマッター）と機能が重複していて冗長なもの、その他自分のコーディングスタイルでは邪魔になる安全性やパフォーマンスをほぼ損なわないルール（TypeScript の `namespace` 禁止など）だけ無効化するという強めの設定をしています。ルールのオプションもなるべく厳格な設定にしています。

https://github.com/noshiro-pf/mono/blob/main/config/eslint

以前私が eslint 設定を recommended config よりもう少し強化したいと考え始めた時、config を組み合わせる eslint config 記述スタイルでは、設定が増えるにつれ

- eslintrc の `extends` に並べる config の順序によって、後ろの config が前の config を上書きすることによりルールが意図しない設定になってしまっていた
- 同じルールを自分で 2 回書いてしまっていて本来適用したい設定が無視されてしまった
- ルールのオプション設定が間違っていて無視されてしまっていた

などのミスが生じてしまっていました。

設定ファイル記述上の曖昧性をなるべく排除して、これらを解決するために

- eslintrc を JavaScript で記述し TypeScript で型チェックする[^eslintrc.ts]
- なるべく詳細な型チェックができるような型定義を用意する
- 各ルールをちょうど 1 回ずつ記述する（実際に実行されるルール設定を exact に書ける）

とするのが最も明快であるという結論に達しました。
plugin ごとに全ルールを逐一設定していく作業が mono repo なので 1 回で済むのでその手間を呑むことができたというのももちろん大きいです。

[^eslintrc.ts]: TypeScript で記述してトランスパイルして `.eslintrc.js` を生成するという手もありそうで、実際私も初期はそのようにしていましたが、設定をいじって都度確かめたいというときにトランスパイルの 1 ステップが挟まり面倒なのがネックでした。 JSDoc で型を記述した JavaScript コードを tsconfig の `checkJs` オプションを有効にしてチェックすることによりまずまずの型チェックができるということに気づき、それ以降は js で記述するようになりました。 [Vite](https://ja.vitejs.dev/) の config がそうなっているように、将来直接 TypeScript で書いた .eslintrc.ts を eslint が読めるようになれば事情が変わる可能性があります。

特に、

> なるべく詳細な型チェックができるような型定義を用意する

については、各ルールのオプションにまで個別に型が付いた config の型を各 plugin の json schema から自動生成することまでやっています。自動生成スクリプトも上のリンクに置いてあります [^generate-rules-type]。これをやってみて副産物として得られたメリットではありますが、 plugin のバージョンを上げたときに追加されたルールやオプション、あるルールが deprecated になったことなどにも気づきやすくなったのは良い点でした。

[^generate-rules-type]: `generate-rules-type` ディレクトリの [`main.mjs`](https://github.com/noshiro-pf/mono/blob/main/config/eslint/generate-rules-type/main.mjs) 中をよく読めば分かりますが、一部 `json-schema-to-typescript` による型生成が上手くいっていない箇所を後でアドホックに修正しているところがあったりもします。

これらの実装についてもどこかで紹介しようと思っているのですが、今回は詳細は省きます。

### （2023/11/22 追記）

最近 eslint のより新しい config スタイルである [Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new) を採用した上で、 config ファイル記述にも TypeScript を使用する状態に移行しつつあります。

https://github.com/noshiro-pf/mono/blob/develop/packages/utils/eslint-utils

mono repo から CommonJS スタイルを完全に排除して ES Module に統一する（共通ユーティリティ群を esm と cjs 向けにコンパイルしていてビルド時間の無駄が多かった）作業を行う上で、 旧 eslint config 形式である `.eslintrc.js` だけは CommonJS 形式でしか書けないという問題が生じたため、 ESModule 形式でも記述可能な Flat Config の導入に至りました。

TypeScript による記述に関しては、 mono repo で [wireit](https://github.com/google/wireit) というツールを使っており、 eslint 実行前に TypeScript コードに変更があれば自動でトランスパイルを実行させる、という依存関係も記述できるので、

> 設定をいじって都度確かめたいというときにトランスパイルの 1 ステップが挟まり面倒なのがネック[^eslintrc.ts]

という問題がある程度緩和できます。 TypeScript の方がやはり JavaScript + JSDoc 型注釈より型の記述がしやすく安全性も高いので便利なのは間違いありません。将来的に `vite.config.ts` のように TypeScript で直接 `eslint.config.ts` が記述できるようになってくれればより良いのですが…。

Flat Config は config の拡張を行う際に eslint 独自の `extend` による継承ではなく JavaScript のモジュール解決に乗っかる形なので、 元から `extend` 使用を避けていた config 実装からは移行が比較的しやすく、何でも可能な限り JavaScript の世界に寄せたい自分の思想にも合っていたので、好ましい進化を遂げてくれたな、という印象です。

[ここ](https://zenn.dev/noshiro_piko/scraps/80ca8faafe72cd)に導入時にハマったポイントを簡単にメモ書きもしています。

# 全体設定

ESLint にはコードフォーマットに関するルールも含まれていますが、フォーマッティングに関するエラーがエディタに表示されるのは邪魔ですし [prettier](https://prettier.io/) で行った方が速いので [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) でオフにします。

prettier でフォーマットしたときに差分が出る部分に eslint で警告を出せる [eslint-plugin-prettier]() という plugin も存在しますが、これは現在公式で非推奨[^eslint-plugin-prettier]になっているので使いません。

[^eslint-plugin-prettier]: https://prettier.io/docs/en/integrating-with-linters.html#notes

eslint config （Flat Config 以前の形式）の記述には JavaScript, YAML, JSON, package.json の `eslintConfig` プロパティという選択肢があります[^eslintrc-file-formats]が、 YAML が使われているケースは比較的少なく、他所から設定をコピーペーストするときに書き換える手間が多いのでそれ以外を使うのが無難そうです。
私のおすすめは `.eslintrc.js` または `.eslintrc.cjs` です。 JSON で書ける内容はすべて JavaScript でも書けるので敢えて `.eslintrc.json` を選ぶメリットはほぼ無く、 JavaScript ならコメントを書いたり、共通定義を関数・定数化したり、 `extends` に頼らずに JavaScript のモジュールシステムを活用してシンプルに設定ファイル分割ができたり、頑張れば（「[（余談）筆者の個人開発環境の場合](#（余談）筆者の個人開発環境の場合)」に書いたように）型チェックをより細かく行えるポテンシャルもあるので優れています。

新しい config のフォーマットである [Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new) では `eslint.config.js` というファイル名・形式が強制され、また旧 config 形式は v9.0.0 から deprecated になる[^old-eslintrc-is-deprecated] ようですので、その意味でも JavaScript による記述が公式に推奨されていると言えます。
私も個人開発環境では Flat Config 対応を2023年11月現在まさに進めているところですが、一旦今回はまだ本記事執筆時点で使用している＆慣れている人が多いと思われる旧形式での設定例を紹介します。

[^eslintrc-file-formats]: https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file-formats
[^old-eslintrc-is-deprecated]: https://eslint.org/docs/latest/use/configure/configuration-files

:::details .eslintrc.cjs

```js
/** @typedef { import("eslint").Linter.Config } LinterConfig */

/** @type {LinterConfig} */
const config = {
  root: true,
  plugins: [
    '@typescript-eslint',
    'unicorn',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'jest',
    'prefer-arrow-functions',
    'security',
    'functional',
    'strict-dependencies',
  ],
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
    tsconfigRootDir: path.join(__dirname, 'dir/to/tsconfig.json'),
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json'],
      },
      node: true,
    },
    react: {
      version: 'detect',
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended',
    'plugin:react/recommended',

    // tsconfig で "jsx": "react-jsx" を設定しているので一部ルールを無効化するために使用
    'plugin:react/jsx-runtime',

    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'plugin:jest/recommended',
    'prettier',
  ],
  rules: {
    // ...
  },
};
```

:::

本記事に出てくる eslint plugin 等の確認バージョンは以下の通りです。

:::details package.json の一部

```json
{
  "scripts": {
    "format": "prettier --cache --write .",
    "lint": "eslint --ext .ts,.tsx src",
    "lint:fix": "yarn lint --fix --quiet"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.57.1",
    "@typescript-eslint/parser": "^5.52.0",
    "cypress": "^12.10.0",
    "eslint": "^8.34.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-import-resolver-typescript": "^3.5.4",
    "eslint-plugin-cypress": "^2.13.3",
    "eslint-plugin-functional": "^5.0.7",
    "eslint-plugin-import": "^2.27.5",
    "eslint-plugin-jest": "^27.2.1",
    "eslint-plugin-jsx-a11y": "^6.7.1",
    "eslint-plugin-prefer-arrow-functions": "^3.1.4",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-security": "^1.7.1",
    "eslint-plugin-strict-dependencies": "^1.1.0",
    "eslint-plugin-unicorn": "^46.0.0",
    "jest": "^29.5.0",
    "prettier": "^2.8.8",
    "prettier-plugin-organize-imports": "^3.1.1",
    "typescript": "^4.9.3"
  }
}
```

:::

# ルールの紹介

本題に戻り、以降はおすすめの eslint ルールをピックアップして紹介していきます。
私個人の有用度評価を ★ の数（5 段階）で付けています。

## 型安全性に関わるルール

### boolean への型強制を禁止する

- [`@typescript-eslint/strict-boolean-expressions`](https://typescript-eslint.io/rules/strict-boolean-expressions/)（★★★★★）

暗黙の型強制を禁止し安全性を高めるルールです。
素の TypeScript では、 `boolean` 型でない変数を `if` や `while` 等の条件文の条件部や論理演算子のオペランドに使用しても型エラーにはならず、暗黙の型強制が行われます。これにより、 `number | undefined` 型の変数 `x` の `undefined` の場合を `if (x) { ... }` で除外したつもりが数値 `0`, `NaN` の場合まで意図せず除外されてしまったり（文字列 `""` も同様）、プロパティアクセス忘れなどによりオブジェクトを誤ってそのまま条件部に書いてしまい常に `true` に評価される、などのミスが発生しやすいです。

```ts
const obj: Readonly<{
  value: { ok: boolean };
}> = {
  value: { ok: true },
};

if (obj.value) {
  //~~~~~~~~~
  // Unexpected object value in conditional. The condition is always true.
  console.log('ok');
}
```

`strict-boolean-expressions` を有効にするとこれらの boolean が要求される文脈で boolean 型でない変数が使用されていたらエラーとして検出されるようになります。

```json
{
  "@typescript-eslint/strict-boolean-expressions": [
    "warn",
    { "allowString": false, "allowNumber": false, "allowNullableObject": false }
  ]
}
```

私の経験上、このルールは後から有効化すると、 boolean が要求される文脈で boolean が使われていないコードに警告が山のように出る傾向があり、また、一度緩く書かれてしまったコードで `0`, `NaN`, `""` 等が falsy value として評価される動作が意図的に使われているのかどうかは後から判別しづらいため、リファクタが困難になりがちです。その意味で、**このルールはプロジェクトに初期から導入して厳密にコードを書くようにすることを強くお勧めします**。

残念ながら、このルールの `eslint --fix` による自動修正は同等の結果になるコードへ変換してくれないことが多くあり、既存の動作を変えてしまうリスクがあるので、手動修正がおすすめです。エラーをすべて潰せていないうちはこのルールを `warn` で設定した上で自動修正コマンドには `--quiet` を付けてスキップさせておく（`eslint --fix --quiet`）という対応が無難です。

- [`react/jsx-no-leaked-render`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-leaked-render.md)（★★★）

React 等で JSX を記述する際、 `0 && <Something />` が短絡評価で `<Something />` が描画される動作ではなく `0` が描画される、などのミスを防ぐために、条件部に `!!` を付けて boolean へ変換したり三項演算子 `cond ? <Something /> : undefined` を使うことを強制します。

`strict-boolean-expressions` を使っていれば `cond` 部の non boolean 値はチェックできるので `0 && <Something />` などはエラーとして検出できますが、短絡評価構文自体は許容されるので、 `jsx-no-leaked-render` も併せて以下のように設定にしておくのがおすすめです。

```json
{
  "react/jsx-no-leaked-render": [
    "error",
    {
      "validStrategies": ["ternary"]
    }
  ]
}
```

### `+`, `+=` 演算子が数値以外に使われないようにする

JavaScript では単項 `+` 演算子が数値へのキャストの動作をしたり、2 項 `+` 演算子が引数の型によっては文字列連結の動作もするので、曖昧性回避のため数値にしか使えないようにしておくとより安全です。有名な例として、 `"2" + 3` が `5` などではなく `"23"` になる、という仕様があります（一方のオペランドが文字列の場合にもう一方も文字列へ変換され連結される）。

- [`no-implicit-coercion`](https://eslint.org/docs/latest/rules/no-implicit-coercion)（★★★★★） を使うことで `+foo` （数値への型強制）や `"" + foo`（文字列への型強制）などを禁止します。
- [`@typescript-eslint/restrict-plus-operands`](https://typescript-eslint.io/rules/restrict-plus-operands/)（★★★★★） を（オプションを厳しく設定して）使うことで `"1" + 2` のような異なる型同士の加算を禁止します。
- さらに [`prefer-template`](https://eslint.org/docs/latest/rules/prefer-template)（★★★★） により文字列同士の `+` による連結も禁止します。

```json
{
  "no-implicit-coercion": "error",
  "@typescript-eslint/restrict-plus-operands": [
    "error",
    {
      "checkCompoundAssignments": true,
      "allowBoolean": false,
      "allowNullish": false,
      "allowNumberAndString": false,
      "allowRegExp": false,
      "allowAny": false
    }
  ],
  "prefer-template": "error"
}
```

文字列を連結したいときは template literal を使えば `+` を使用しなくて済みます。

```diff
- a + b
+ `${a}${b}`
```

複数個、特に可変個の文字列の連結には、 `String#concat()` または `Array#join()` を使う方法がおすすめです。

```ts
const ss = ['A1', 'A2', /*...,*/ 'An'];

// 🙁
let s = '';
for (let i = 0; i < n; ++i) {
  s += ss[i];
}

// 🙁
const s = ss.reduce((acc, curr) => `${acc}${curr}`, '');

// 😊
const s = ss.join('');

// 😊
const s = ''.concat(...ss);
```

こうすることで可読性が向上するだけでなく、 大きな `n` に対してパフォーマンスが低下することも避けられる可能性があります（JavaScript の文字列連結のエンジン実装やパフォーマンス評価は結構複雑な話のようなのでここでは詳細は省きますが、 `+`,`+=` や template literal で2個の文字列連結を繰り返す一つ目・二つ目のようなやり方は、連続するメモリ領域の再確保が何度も走りパフォーマンスが低下する場合があります[^perf-string-concat1][^perf-string-concat2][^perf-string-concat3]。ただ、ウェブフロントエンド実装では `n` が巨大になることが稀であったり、 JavaScript エンジン実装の工夫のおかげであまり気にしなくて良い可能性もありそうです。JSのパフォーマンスについては C/C++ などの経験で単純に類推すると間違えることが多々あるので、適度にパフォーマンスは気にしつつ可読性を重視しておくのが程良いバランスかなと思っています）。

[^perf-string-concat1]: https://stackoverflow.com/questions/16696632/most-efficient-way-to-concatenate-strings-in-javascript
[^perf-string-concat2]: https://medium.com/@zhongdongy/the-performance-of-javascript-string-concat-e52466ca2b3a
[^perf-string-concat3]: https://docs.google.com/document/d/1o-MJPAddpfBfDZCkIHNKbMiM86iDFld7idGbNQLuKIQ/preview#heading=h.6kknmf22ixwc

このパターンは長いメッセージを書くときも可読性向上に役に立ちます。

```ts
// 🙁
console.log(
  `looooooooooooooooooooooooong message 1\nlooooooooooooooooooooooooong message 2`,
);

// 🙁
console.log(
  `looooooooooooooooooooooooong message 1\n` +
    'looooooooooooooooooooooooong message 2',
);

// 😊
console.log(
  [
    'looooooooooooooooooooooooong message 1',
    'looooooooooooooooooooooooong message 2',
  ].join('\n'),
);
```

また、これに関連するルールとして [`@typescript-eslint/restrict-template-expressions`](https://typescript-eslint.io/rules/restrict-template-expressions/) により template literal に使用できる型も制限することができます。 `allow*` オプションをすべて無効にして文字列のみを許容する最も厳しい設定が自分は好みですが、 `.toString()` などによって文字列化を明示的に書く必要があり面倒ではあるので、プロジェクトによっては `allowNumber`, `allowBoolean` あたりは `true` にしても良いかもしれません。

```json
{
  "@typescript-eslint/restrict-template-expressions": [
    "error",
    {
      "allowNumber": true,
      "allowBoolean": true,
      "allowNullable": false,
      "allowAny": false,
      "allowNever": false,
      "allowNullish": false,
      "allowRegExp": false
    }
  ]
}
```

### Switch 文

- [`@typescript-eslint/switch-exhaustiveness-check`](https://typescript-eslint.io/rules/switch-exhaustiveness-check/)（★★★★★）

union 型の全ケースを Switch 文で網羅できているかどうかをチェックするルールです。
単純にチェックが強化されるので有用ですが、このチェックができるということを知っているだけで型設計が変わり得る（機能追加時の実装漏れがあったときに switch 文の網羅チェックで検出できるケースが増えるので、switch 文を使うことを念頭に置いて union 型を使った型設計を行うようになる）点でも重要です。

`default` ケースがあると `case` 列挙漏れがあっても吸収されてしまうので、なるべく `default` ケースを書かないのがこのルールを有効にしたときのコツになります。

- [`unicorn/prefer-switch`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-switch.md)（★★★★★）

`switch-exhaustiveness-check` の効用はもちろん switch 文で union 型を場合分けする際に発揮されるので、本来 switch 文が適している場面で if-else の羅列による実装は避ける必要があります。 `unicorn/prefer-switch` を有効にすればそのような if 文の羅列を禁止すると共に switch 文への自動修正もできます。

if 文の羅列は switch 文と比べて余計な条件式の評価の繰り返しが起きる可能性があるため、パフォーマンスの面でも switch 文より若干不利になり得ます。

- tsconfig で `noFallthroughCasesInSwitch` オプションを有効化（★★★★★）
- または ESLint で [`no-fallthrough`](https://eslint.org/docs/latest/rules/no-fallthrough) を有効化

`break` の書き忘れを検出できます。可能なら tsconfig で `noFallthroughCasesInSwitch` を有効にする方が良いと思います。その場合は lint 高速化のため ESLint の `no-fallthrough` はオフにします。

### 一部のグローバル変数の使用を禁止

- [`no-restricted-globals`](https://eslint.org/docs/latest/rules/no-restricted-globals)（★★★★）

以下の設定例のようにすれば、安全性が低い `isFinite`, `isNaN` （引数を数値に強制的に変換してしまう）の使用を禁止し、暗黙の型強制を行わないより堅牢な `Number.isFinite`, `Number.isNaN` を使うよう促すことができます。
ランタイム動作は異なりますが、 TypeScript の標準ライブラリでは `isFinite`, `isNaN` の引数の型は `any` や `unknown` ではなく `number` になっています（この issue にその理由が説明されています： https://github.com/microsoft/TypeScript/issues/34609 ）。このため、この二つの関数に限っては禁止ルールを追加する必要性が TypeScript 環境では低くなっています。

```json
{
  "no-restricted-globals": [
    "eval",
    "Boolean",
    "Function",
    "globalThis",
    { "name": "isFinite", "message": "use Number.isFinite instead." },
    { "name": "isNaN", "message": "use Number.isNaN instead." }
  ]
}
```

### Mutationを禁止するルール

- [`functional/no-let`](https://github.com/eslint-functional/eslint-plugin-functional/blob/main/docs/rules/no-let.md)（★★★★）
- [`functional/immutable-data`](https://github.com/eslint-functional/eslint-plugin-functional/blob/main/docs/rules/immutable-data.md)（★★★★）

[eslint-plugin-functional](https://github.com/eslint-functional/eslint-plugin-functional/tree/main) という opinionated な eslint plugin に含まれるルールです。この plugin には TypeScript において関数型プログラミングスタイルを推奨するためのルールが含まれています。

現代のウェブフロントエンド開発においてはデータを immutable に扱うのが主流であり、このような ESLint ルールによって immutability を機械的に担保できればより堅牢な実装がしやすくなります。
`functional/no-let` は変数宣言における `let` キーワードの使用を禁止するもので、 `const` を使うことを強制します。
`functional/immutable-data` は、オブジェクトのプロパティの破壊的代入や配列に対する `.push(x)` などの破壊的操作を禁止します。

以下の設定例では名前が `mut_` や `_mut_` で始まる変数は mutable として許容するように例外設定をしています。
[`immer.js`](https://immerjs.github.io/immer/) を使っているときに `draft` オブジェクトに対する破壊的更新は実質問題にならないため無視するようにしています（変数名として `"draft"` を使うことが前提にはなっているので、それ以外の名前を使いたければ適宜変更が必要）。 [`immer.js`](https://immerjs.github.io/immer/) の `produce` 関数外で `draft` という変数名を使用してしまった場合が意図しない抜け穴になってしまいますが、これは注意して使わないようにするか、後述する `no-restricted-syntax` などで機械的に封じるしか無いでしょう（追記：[no-restricted-syntax のルール紹介](#その他)で簡易的な設定例を載せてみました。）。
その他 `React.useRef`の`current`プロパティや、 React component の`displayName`なども破壊的更新で記述するのが普通なので許容するようにしています。

`ignoreClasses`については、 class は使わないで済むならそもそも使用しないという暗黙の了解がある上で、 class を使う以上はステートフルなものとして実装するはずなので mutation は避けられない、という想定で `true` にしています。むしろ採用する可能性があるのは class をそもそも禁止する [no-classes](https://github.com/eslint-functional/eslint-plugin-functional/blob/main/docs/rules/no-classes.md) というルールだと思いますが、このルールを有効化できてかつそれが有用であるようなプロジェクトは限られそうな気がします（たまに JavaScript/TypeScript では class を使って実装するのが最も素直な場合もありますし、つい class を使って実装してしまったが eslint で禁止されていれば使わなかった、という状況が自分はあまり想像できないので…。）。

```json
{
  "functional/no-let": [
    "error",
    {
      "allowInForLoopInit": true,
      "allowInFunctions": false,
      "ignorePattern": ["^mut_", "^_mut_", "^#mut_"]
    }
  ],
  "functional/immutable-data": [
    "error",
    {
      "assumeTypes": true,
      "ignoreClasses": true,
      "ignoreImmediateMutation": true,
      "ignorePattern": [
        "^draft", // allow immer.js draft object
        "^mut_",
        "^_mut_",
        "^#mut_", // private class field
        "window.location.href"
      ],
      "ignoreAccessorPattern": [
        "**.current.**", // allow React Ref object
        "**.displayName", // allow React component displayName
        "**.scrollTop" // allow modifying scrollTop
      ]
    }
  ]
}
```

```ts
// error
let v = 1;
v = 2;
const arr = [1, 2, 3];
arr.push(4);

// no error
let mut_var = 1;
mut_var = 2;
const mut_arr = [1, 2, 3];
mut_arr.push(4);
```

---

`eslint-plugin-functional` には他にも `readonly` の使用を強制したり、 `throw` や `try-catch` などの構文を禁止するなど様々なルールが含まれています。
設定オプションがやや複雑だったり、有効にするとエラーが出過ぎてしまったり、そもそも明らかな偽陽性があり使いづらいものもあったので、特にコスパが良さそうな数個のルールだけを使う設定に自分は落ち着きました。

もっと追加でルールを有効化してアグレッシブに純粋関数型プログラミングスタイルを強制する手もありますが、それなら React TypeScript で頑張るのではなくて最初から Elm などを使う方が良いのでは…？とも思ってしまいます（Elmなどを導入しやすいかは状況によるとは思いますが）。TypeScript を使う以上、他の関数型言語のアイデアは適度に取り入れつつも、あんまりやりすぎないくらいの方がトータルのメンテナビリティを上げられると思っています。

### Method Signature を禁止し Property Signature を使うよう促すルール

- tsconfig で `strictFunctionTypes` を有効化
- [`@typescript-eslint/method-signature-style`](https://typescript-eslint.io/rules/method-signature-style/) （★★★★★）

メソッド記法を禁止するルールです。

TypeScript において、 メソッドは双変であるのに対し、関数プロパティは `strictFunctionTypes` を有効にしていれば反変となり、より安全になります。

関連記事

- https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-function-parameters-bivariant
- https://zenn.dev/pixiv/articles/what-is-bivariance-hack

ちなみに、詳しく比較していませんが [`functional/prefer-property-signatures`](https://github.com/eslint-functional/eslint-plugin-functional/blob/main/docs/rules/prefer-property-signatures.md) を使っても同じチェックができそうです。

## import 文周りのルール

### 循環 import の検出

- [`import/no-cycle`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-cycle.md)（★★★★★）

JavaScript では循環 import を行っているファイルがあると、定義したはずのオブジェクトが未定義であるというランタイムエラーが出ることがあります。このルールを入れ循環 import を検出することでそのようなエラーが起きる可能性を未然に防ぐことができます（bundler を使って 1 ファイルに固めている場合は問題にならないのかもしれませんが…）。

### import パターンを制限

以下のルールを使うことができます。

- [`@typescript-eslint/no-restricted-imports`](https://typescript-eslint.io/rules/no-restricted-imports/)（★★★）
- [`import/no-restricted-paths`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-restricted-paths.md)（★★★）
- [`strict-dependencies/strict-dependencies`](https://github.com/knowledge-work/eslint-plugin-strict-dependencies)（★★★）

`@typescript-eslint/no-restricted-imports` は単にすべてのファイルに対して禁止する import path のパターンを記述するもので、あとの二つは「どのパスからどのパスへの import を許容／禁止するか」というもう少し複雑な設定ができます。
`import/no-restricted-paths` は禁止する import 方向のパターン、 `strict-dependencies/strict-dependencies` はあるモジュールを import してよいファイル・パスを指定するもので、それぞれ block list, allow list として使い分けることができます。

設定例

```json
{
  "@typescript-eslint/no-restricted-imports": [
    "error",
    {
      "patterns": [
        {
          "group": ["constants/**", "**/../constants/**"],
          "message": "import from '~/constants' instead."
        }
      ]
    }
  ],
  "import/no-restricted-paths": [
    "error",
    {
      "zones": [
        {
          /**
           * make utils independent of other modules
           */
          "from": "./src/!(utils)/**/*",
          "target": "./src/utils/**/*"
        }
      ]
    }
  ],
  "strict-dependencies/strict-dependencies": [
    "error",
    [
      {
        /**
         * allow only `hooks --> components` dependency
         */
        "module": "~/hooks",
        "allowReferenceFrom": ["src/index.tsx", "src/components"],
        "allowSameModule": false
      }
    ]
  ]
}
```

コーディング規約としては意味がありますが、 `import/no-cycle` のように直接ランタイムエラーを防ぐ効果があるというわけではないので ★★★ の評価にしました。

### import 文のフォーマット

- [`prettier-plugin-organize-imports`](https://github.com/simonhaenisch/prettier-plugin-organize-imports)（★★★★）

  `prettier-plugin-organize-imports`は prettier の plugin で、 npm install するだけで prettier の挙動が拡張されます。 TypeScript の言語サービスの `organizeImport` API を呼び import 文のソートや使われていない import の削除を自動でしてくれます。 VSCode の "Organize Imports" アクションを実行したときと同じ結果になります。
  `eslint-plugin-import` にも似たルールがありますが、 prettier でフォーマットしてしまえる方が動作も速く config も無いのでおすすめです。

  不要な import 文を削除することでバンドルサイズ削減に有効である可能性もあると考えたため ★★★★ の評価にしました。

- [`import/newline-after-import`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/newline-after-import.md) (auto fixable)（★）
  import ブロックの直後の空白行を強制するルールです。2 行以上あるときは prettier が 1 行にまとめてくれますが、 0 行のときに 1 行空白を作ってくれるわけではないので、空白が欲しい場合はこのルールが使えます。
  可読性向上のためでしかないので使いたいかどうかは単に気持ちの問題ですが、使うデメリットもほぼ無いので関連するルールとして挙げました。

- [`import/no-useless-path-segments`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-useless-path-segments.md)（★★）
  例えば `..` で祖先ディレクトリへ遡るパスを書いたときに、余計に遡りすぎていたらこのルールで検出し正規化することができます。

### TypeScript の Type only import/export スタイル指定

- [`@typescript-eslint/consistent-type-imports`](https://typescript-eslint.io/rules/consistent-type-imports/)（★★★）
- [`import/consistent-type-specifier-style`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/consistent-type-specifier-style.md)（★★★）
- [`@typescript-eslint/consistent-type-exports`](https://typescript-eslint.io/rules/consistent-type-exports/)（★★★）

TypeScript では型定義のみの import を行う構文が存在します。
この `type` modifier は無しでも大抵は問題ありませんが、コンパイラーにこのヒントを与えることでトランスパイル時に import 文を丸ごと削除できることでバンドルサイズ削減に効く可能性があったり、循環依存によるエラーを回避したり tsconfig の `isolatedModules` オプションに関連して発生しうるエラーの回避に有効である場合があります。
重要度が特に高いわけではありませんが、`type` modifier は付けられるときに付けておいて損は無く、 auto fix で簡単に統一できるのでおすすめです。

top-level style が以下の書き方で

```ts
import type { BarType, FooType } from './foo';
import { foo } from './foo';

const a: FooType = 0;
const b: BarType = 1;
foo('aaa');
```

inline スタイルが以下の書き方です。

```ts
import { foo, type BarType, type FooType } from './foo';

const a: FooType = 0;
const b: BarType = 1;
foo('aaa');
```

前者は `type` を import する型一つ一つに書く必要があるのに対し、後者は type only import とそうでない import で同じ import path を 2 回書く必要が生じます。
後者の方が不便であることが多い（ファイル移動時のパス文字列修正とか）ので、後者の inline スタイルを採用し以下の設定を使うのが個人的にはおすすめです。

```json
{
  "@typescript-eslint/consistent-type-imports": [
    "error",
    {
      "prefer": "type-imports",
      "fixStyle": "inline-type-imports",
      "disallowTypeAnnotations": true
    }
  ],
  "import/consistent-type-specifier-style": ["error", "prefer-inline"],
  "@typescript-eslint/consistent-type-exports": "error"
}
```

## その他

### [`no-restricted-syntax`](https://eslint.org/docs/latest/rules/no-restricted-syntax)（★★★★★）

既存ルールに求めているものが見つからなかったら、このルールを使えば（自分で ESLint plugin を自作するよりは）比較的簡単に特定の構文を禁止する設定ができる場合があります。
禁止したい構文にマッチする selector を調べるには [AST checker](https://typescript-eslint.io/play/#ts=4.7.2&sourceType=module&showAST=es) が便利です。

- `as` の禁止設定例
  例えば TypeScript の（`as const` や import alias 以外の） `as` を禁止するルールは以下のように書くことができます（※これまでこの設定で経験上問題無さそうであることは確認していますが、完璧な設定である保証はありません）。

  ```json
  {
    "no-restricted-syntax": [
      "warn",
      {
        // ban "as"
        "selector": "VariableDeclarator[init.type='TSAsExpression'][init.typeAnnotation.typeName.name!='const']",
        "message": "Don't use `as`."
      }
    ]
  }
  ```

- `immer.js` の `produce` 関数外での `draft` の使用禁止設定例
  以下は [`immer.js`](https://immerjs.github.io/immer/) の `produce` 関数外で `draft` という変数名を使用してしまわないようにする設定例です。

  [Mutationを禁止するルール](#Mutationを禁止するルール) の設定で 変数名 `draft` に対する破壊的更新は無視する設定をしているので、その設定で余計に無視されることが起きないようにする抜け穴潰しの設定です。

  ```json
  {
    "selector": "Identifier[name='draft'][parent.parent.callee.name!='produce'][parent.parent.parent.parent.parent.parent.callee.name!='produce']",
    "message": "Don't use the identifier name `draft` except in immer produce function."
  }
  ```

  ```ts
  const draft: number = 1;
  // Don't use the identifier name `draft` except in immer produce function. 1:7 - 1:20
  ```

  偽陽性が多々ありそうなのですが、ユースケースに応じて都度設定を見直して使う想定です。

- `io-ts` の型定義を readonly にするよう強制する設定例
  [io-ts](https://github.com/gcanti/io-ts) を使っている場合、配列を `readonly` で定義することを強制する以下のルールを有効にすると便利です。（`import * as t from "io-ts";` と import している慣例を前提にしているので、ちゃんとやるならその部分にも別途チェックが必要です。）

  ```json
  {
    "no-restricted-syntax": [
      "warn",
      {
        // ban t.array of "io-ts"
        "selector": "MemberExpression[object.name='t'][property.name='array']",
        "message": "use 't.readonlyArray' instead."
      }
    ]
  }
  ```

### 配列の `sort` メソッドをより安全に使う

- [`@typescript-eslint/require-array-sort-compare`](https://typescript-eslint.io/rules/require-array-sort-compare/)（★★★★★）

JavaScript の `Array.prototype.sort` はデフォルトで文字列比較によるソートを行うので、特に数値配列に対して使った場合に意図しない結果になるリスクがあります。

```ts
[1, 2, 3, 10, 20, 30].sort(); // → [1, 10, 2, 20, 3, 30]
```

この ESLint ルールを有効にすると `.sort()` の引数を省略できないようになります。
文字列の配列に関しては比較関数を省略しても意図通りに動くので、 `ignoreStringArrays` option も有効にしておくと省略しても lint エラーにならず便利です。

```json
{
  "@typescript-eslint/require-array-sort-compare": [
    "error",
    {
      "ignoreStringArrays": true
    }
  ]
}
```

### React / React hooks

- [eslint-plugin-react-hooks](https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/README.md)（★★★★★）

React hooks を使う上で依存リストの過不足が無いかや、そもそも React hooks を使用できない場所で使っていないかを静的検査するルールです。 recommended なので入れていることが多いかもしれませんが重要なので書きました。

```json
{
  "react-hooks/exhaustive-deps": "error",
  "react-hooks/rules-of-hooks": "error"
}
```

- [jsx-no-bind](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md)（★★★）

JSX に直接コールバック関数を書くのを禁止します。 render ごとに毎回新たな関数実体が生成され子孫の re-render を引き起こすためパフォーマンスの低下につながります。
エラーは `React.useCallback` を使うように修正すれば解決します。

```json
{
  "react/jsx-no-bind": "error"
}
```

### アロー関数スタイルに統一

以下の設定で関数の記述方法をアロー関数に統一し、 `return` 文も自動修正で可能な限り無くすことができます。

- [`func-style`](https://eslint.org/docs/latest/rules/func-style)（★★★）
- [`prefer-arrow-functions`](https://www.npmjs.com/package/eslint-plugin-prefer-arrow-functions)（★★★）
- [`arrow-body-style`](https://eslint.org/docs/latest/rules/arrow-body-style)（★）

従来の `function` キーワードを用いた関数定義とアロー関数では下にも軽くまとめた通りいくつか動作が異なる[^function_style]点は注意が必要です。いずれも適切に現代的なコードを書いていれば遭遇しないものなので、主にスタイルの統一という意味で自分は用いています。アロー関数の方が後発の構文であり、余計な機能が無く安全でシンプルである上に、慣例的にも配列の `map`, `filter` やイベントリスナーのコールバックなどでどのみち使われることが多いので、統一するならアロー関数の方が良いかなと思います。

`function` キーワードを用いた関数定義とアロー関数の差異

- 関数定義の巻き上げ（hoisting）： 従来の `function` による関数は、それらが定義されるスコープのトップに巻き上げられ、関数定義前にその関数を呼び出すことが許容されます。アロー関数の場合は定義前に使用するとエラーになります。
  - 稀に循環 import が原因で関数が定義前に使用されるコードとして解決されてしまい、 `function` で定義していないとエラーになるというケースに遭遇したことがありますが、 `import/no-cycle` でこれを解決していればこの問題は起きないはずなので基本的にアロー関数で問題無さそうです。
- `this` の指すもの： 従来の `function` による関数は実行の文脈で `this` の内容が動的に決まりますが、アロー関数のthisはレキシカルスコープで静的です。 `this` を関数内で使うのはclass が無かった時代の hack [^javascript_class_in_google] であり現代においてはほとんど関係ありません。
- `arguments` 変数の有無： 従来の `function` による関数には `arguments` という特殊な変数が自動的に定義され、可変長引数を実現するのに使用できますが、アロー関数でも残余引数 `...` を用いれば同じことが実現できるので特に必要な機能という訳ではありません。
- 名前の重複： 従来の `function` による関数では strictモードがオフの場合に引数名や関数名の重複がチェックされませんが、アロー関数ではこうした危険性は排除されています。 TypeScript ではいずれもエラーとして検出されるため特に問題にはなりません。

設定例

```json
{
  "arrow-body-style": ["error", "as-needed"],
  "func-style": "error",
  "prefer-arrow-functions/prefer-arrow-functions": [
    "error",
    {
      "classPropertiesAllowed": false,
      "disallowPrototype": false,
      "returnStyle": "unchanged",
      "singleReturnOnly": false
    }
  ]
}
```

[^javascript_class_in_google]: https://www.yunabe.jp/docs/javascript_class_in_google.html
[^function_style]: https://typescriptbook.jp/reference/functions/function-expression-vs-arrow-functions
