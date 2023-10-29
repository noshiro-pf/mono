---
title: 'ESLint を使い倒す方法まとめ'
emoji: '🐈'
type: 'tech'
topics: ['typescript', 'eslint']
published: true
---

# 前書き

ESLint は JavaScript, TypeScript のための静的検証ツールです。

ESLint を活用することで、コーディング規約やベストプラクティスを機械的に強制することによりコードレビューの手間を省き、本番環境でのエラーやパフォーマンスの悪化を抑制することができます。 TypeScript を使っているプロジェクトでは、パーサーを適切に設定すれば型情報を用いたより精密な静的検証を行うこともできます。

eslint を使う際、 `eslint:recommended`, `plugin:@typescript-eslint/eslint-recommended` などの各 eslint plugin の推奨 config をそのまま使って済ませたり、 [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb) などの config に頼ることも多そうですが、 recommended config に含まれないルールやオプションにも非常に有用なものが数多く存在するので、それらを一つでも多く活用した方が良いと私は考えています。

推奨設定を使っているだけだと、 ESLint はコードのフォーマットや簡単なグローバル変数（ `eval` とか）の使用を禁止する程度の素朴なチェックしかできないように思ってしまうかもしれません（少なくとも昔の自分はそうでした）が、ESLint は JavaScript コードをパースしてできた AST（抽象構文木）を検証するツールであるため、非常に強力な静的検証ができます。
パーサー等を適切に指定することで TypeScript の型情報も使ったチェックや、循環依存の検出、どこからも参照されていない export の検出などまですることができます。

今回は、私が特に有用だと思っているルールをいくつか紹介します。サンプルコードは各ルールのリンク先を見た方が分かりやすいので、記事の長さの都合上省きました。

## （余談）筆者の個人開発の場合

※ この章に書いていることは本記事の以降の章のルール説明で想定している設定とは異なります。

私が普段個人で開発している mono repo における ESLint 共通設定では、既存 config は一切 extend して使わずに各ルールの設定などをすべて明示的に書くようにしています。

基本的に全ルールを有効化する設定にしており、他のより優先したいルールとコンフリクトするものや、他の ESLint ルール ・ TypeScript ・ prettier（フォーマッター）と機能として重複していて冗長なもの、その他自分のコーディングスタイルでは邪魔になるルール（TypeScript の `namespace` 禁止など）だけ無効化するという強めの設定をしています。機械チェックできてはいないので完全ではない可能性がありますが、ルールのオプションもなるべく厳しい設定にしています。

https://github.com/noshiro-pf/mono/blob/main/config/eslintrc

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

については、各ルールのオプションにまで個別に型が付いた config の型を各 plugin の json schema から自動生成することまでやっています。自動生成スクリプトも上のリンクに置いてあります [^generate-rules-type]。これをやってみて副産物として得られたメリットではありますが、 plugin のバージョンを上げたときに追加されたルールやオプションにも気づきやすくなったのは良い点でした。

[^generate-rules-type]: `generate-rules-type` ディレクトリの [`main.mjs`](https://github.com/noshiro-pf/mono/blob/main/config/eslintrc/generate-rules-type/main.mjs) 中をよく読めば分かりますが、一部 `json-schema-to-typescript` による型生成が上手くいっていない箇所を後でアドホックに修正しているところがあったりもします。

これらの設計についてもどこかで紹介しようと思っているのですが、今回は詳細は省きます。

# 全体設定

ESLint にはコードフォーマットに関するルールも含まれていますが、フォーマッティングに関するエラーがエディタに表示されるのは邪魔ですし [prettier](https://prettier.io/) で行った方が速いので [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) でオフにします。

eslint config の記述には JavaScript, YAML, JSON, package.json の `eslintConfig` プロパティという選択肢があります[^eslintrc-file-formats]が、 YAML が使われているケースは比較的少なく、他所から設定をコピーペーストするときに書き換える手間が多いのでそれ以外を使うのが無難そうです。
私のおすすめは `.eslintrc.cjs` です（`.js` でも良いですが `.cjs` の方がモジュールシステムが明示的なので若干優れています）。 `.json` でも良いのですが、 JSON で書ける内容はすべて JavaScript でも書けるので敢えて json を選ぶ必要は特に無く、 JavaScript なら共通定義を関数・定数化したり、 JavaScript のモジュールシステムを活用して柔軟にファイル分割ができたり（一応 `.eslintrc.json` でも `extends` を使えばファイル分割はできますが `extends` の仕様には縛られてしまいます）、頑張れば型チェックをより細かく行ったりもできるポテンシャルがあるので使い勝手が良いです（余談の節に書いた通り、私の環境ではこれが必須でした）。

[^eslintrc-file-formats]: https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file-formats

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

:::details package.json の一部

```json
{
  "scripts": {
    "format": "prettier --cache --write .",
    "lint": "eslint --ext .ts,.tsx src"
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

本題に戻り、以降は筆者おすすめの eslint ルールをピックアップして紹介していきます。
私個人の有用度評価を ★ の数（5 段階）で付けています。

## 型安全性に関わるルール

### boolean への型強制を禁止する

- [`@typescript-eslint/strict-boolean-expressions`](https://typescript-eslint.io/rules/strict-boolean-expressions/)（★★★★★）

これも暗黙の型強制を禁止し安全性を高めるルールです。
素の TypeScript では、 `boolean` 型でない変数を `if` や `while` 等の条件文の条件部や論理演算子のオペランドに使用しても型エラーにはならず、暗黙の型強制が行われます。これにより、 `number | undefined` 型の変数 `x` の `undefined` を `if (x) { ... }` で除外したつもりが数値 `0`, `NaN` の場合まで意図せず除外されてしまったり（文字列 `""` も同様）、プロパティアクセス忘れなどによりオブジェクトを誤ってそのまま条件部に書いてしまい常に `true` に評価される、などのミスが発生しやすいです。
`strict-boolean-expressions` を有効にするとこれらの boolean が要求される文脈で boolean 型でない変数を使用していたらエラーとして検出できるようになります。

```json
{
  "@typescript-eslint/strict-boolean-expressions": [
    "warn",
    { "allowString": false, "allowNumber": false, "allowNullableObject": false }
  ]
}
```

残念ながらこのルールの autofix は同値な変換をしてくれないことがあってコードが壊れうるので、エラーをすべて潰せていないうちはこのルールを `warn` で設定した上で `eslint --fix --quiet` でスキップさせる、という運用にするのが無難です。

- [`react/jsx-no-leaked-render`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-leaked-render.md)

JSX で `0 && <Something />` が短絡評価で `<Something />` が描画される動作ではなく `0` が描画される、などのミスを防ぐために条件部に `!!` を付けて boolean へ変換したり三項演算子 `cond ? <Something /> : undefined` を使うことを強制します。

`strict-boolean-expressions` を使っていれば `cond` 部の non boolean 値はチェックできるので `0 && <Something />` などはエラーとして検出できますが、短絡評価構文自体は許容されるので、 `jsx-no-leaked-render` も併せて以下のように設定にしておくのが個人的にはおすすめです。

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

### `+`, `+=` 演算子を数値にのみ使われるように強制する

JavaScript では単項 `+` 演算子が数値へのキャストの動作をしたり、2 項 `+` 演算子が引数の型によっては文字列連結の動作もするので、曖昧性回避のため数値にしか使えないようにしておくとより安全です。

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

文字列を連結したいときは template literal を使うか、配列の `join` を使えば `+` を使わずに済みます。複数個の文字列の連結は前者を繰り返すより後者の方がコードも読みやすく高速です。

- `a + b` → `${a}${b}`
- `s_1 + s_2 + ... + s_n` → `[s_1, ..., s_n].join("")`

また、これに関連するルールとして [`@typescript-eslint/restrict-template-expressions`](https://typescript-eslint.io/rules/restrict-template-expressions/) により template literal に使用できる型も制限することができます。 `allow*` オプションをすべて無効にして文字列のみを許容するのが最も厳しい設定で自分は好みですが、結構不便なのでプロジェクトによっては `allowNumber`, `allowBoolean` あたりだけ `true` にしておくのがちょうどよいかもしれません。

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

- [`@typescript-eslint/switch-exhaustiveness-check': 'error`](https://typescript-eslint.io/rules/switch-exhaustiveness-check/)（★★★★★）

union 型の全ケースを Switch 文で網羅できているかどうかをチェックするルールです。単純にチェックが強化されるので有用ですが、このチェックができるということを知っているだけで型設計が変わり得る（機能追加時の実装漏れを switch 文で検出できるので、union 型を使って仕様をなるべく記述し if 文の羅列を避け switch 文を使うよう工夫するようになる）のでかなり重要です。 `default` ケースを使っていると吸収されてしまうので、なるべく `default` ケースを書かないのがこのルールを有効にしたときのコツになります。

- [`no-fallthrough`](https://eslint.org/docs/latest/rules/no-fallthrough) or `noFallthroughCasesInSwitch` option in tsconfig（★★★★★）

`break` の書き忘れを検出できます。代わりに tsconfig で `noFallthroughCasesInSwitch` を有効にするのでも（多分）良いと思います。その場合は ESLint の `no-fallthrough` はオフにします（lint 高速化のため）。

### 一部のグローバル変数の使用を禁止

`isFinite`, `isNaN` は引数を数値に強制的に変換してしまい安全性が低いので、[`no-restricted-globals`](https://eslint.org/docs/latest/rules/no-restricted-globals)（★★★★） ルールでそれらを禁止し、暗黙の型強制を行わないより堅牢な `Number.isFinite`, `Number.isNaN` を使うよう促すことができます。
ランタイム動作の違いがあるにもかかわらず、 TypeScript の標準ライブラリでは `isFinite`, `isNaN` の引数の型は `any` や `unknown` ではなく `number` になっています（関連： https://github.com/microsoft/TypeScript/issues/34609 ）。このため、この二つの関数のみに関しては TypeScript 環境ではそれほど重要ではなくなっています。

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

## mutation を禁止するルール

[eslint-plugin-functional](https://github.com/eslint-functional/eslint-plugin-functional/tree/main) という opinionated な eslint plugin に含まれるルールです。この plugin には TypeScript において関数型プログラミングスタイルを推奨するためのルールが含まれています。

現代のウェブフロントエンド開発においてはデータを immutable に扱うのが主流であり、このような ESLint ルールによって immutability を機械的に担保できればより堅牢な実装がしやすくなります。

その中で、私が特に実用性が高いと思っているのが以下のルールです。

- [`functional/no-let`](https://github.com/eslint-functional/eslint-plugin-functional/blob/main/docs/rules/no-let.md)（★★★★）
- [`functional/immutable-data`](https://github.com/eslint-functional/eslint-plugin-functional/blob/main/docs/rules/immutable-data.md)（★★★★）

`functional/no-let` は変数宣言における `let` キーワードの使用を禁止するもので、 `const` を使うことを強制します。
`functional/immutable-data` は、オブジェクトのプロパティの破壊的代入や配列に対する `.push(x)` などの破壊的操作を禁止します。

以下の設定例では名前が `mut_` や `_mut_` で始まる変数は mutable として許容するように例外設定をしています。
[`immer.js`](https://immerjs.github.io/immer/) を使っているときに `draft` オブジェクトに対する破壊的更新は実質問題にならないため無視するようにしています（変数名として "draft" を使うことが前提にはなっているが、そうでないときはエラーが出て厳しくなる方向なので問題無い）。
その他 `React.useRef` の `current` プロパティや、 React component の `displayName` なども破壊的更新で記述するのが普通なので許容するようにしています。
`ignoreClasses` については、 class は使わないで済むならそもそも使用しないという暗黙の了解がある上で、 class を使う以上はステートフルなものとして実装するはずなので mutation は避けられない、という想定で `true` にしています。 class をそもそも禁止するのであれば [no-classes](https://github.com/eslint-functional/eslint-plugin-functional/blob/main/docs/rules/no-classes.md) というルールもあるようですが、わざわざ機械チェックしなくても問題無い気もします。

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

eslint-plugin-functional には他にも `readonly` の使用を強制したり、 `throw` 文・ class を禁止するなど様々なルールが含まれているのですが、設定オプションがやや複雑だったり、有効にするとエラーが出過ぎて使いづらくなりやすいもの・そもそも明らかな偽陽性があり使いづらいものもあったので、この設定に自分は落ち着きました。

## import 文周りのルール

### 循環 import の検出

- [`import/no-cycle`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-cycle.md)（★★★★★）

JavaScript では循環 import を行っているファイルがあるときに関数などが未定義であるというランタイムエラーが出ることがあります。このルールを入れ循環 import を検出することでそのようなバグを未然に防ぎやすくなります（bundler を使って 1 ファイルに固めている場合は問題にならない可能性もありますが…）。

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

ディレクトリ構成が整然とするのでコーディング規約としては意味がありますが、 `import/no-cycle` のように直接ランタイムエラーを防ぐ効果があるというわけではないので ★★★ の評価にしました。

### import 文のフォーマット

- [`prettier-plugin-organize-imports`](https://github.com/simonhaenisch/prettier-plugin-organize-imports)（★★★★）

  `prettier-plugin-organize-imports`は prettier の plugin で、 npm install するだけで prettier の挙動が拡張されます。 TypeScript の言語サービスの `organizeImport` API を呼び import 文のソートや使われていない import の削除を自動でしてくれます。 VSCode の "Organize Imports" アクションを実行したときと同じ結果になります。
  `eslint-plugin-import` にも似たルールがありますが、 prettier でフォーマットしてしまえる方が動作も速く config も無いのでおすすめです。

  不要な import 文を削除することでバンドルサイズ削減に有効である可能性があるため ★★★★ の評価にしました。

- [`import/newline-after-import`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/newline-after-import.md) (auto fixable)（★）
  import ブロックの直後の空白行を強制するルールです。2 行以上あるときは prettier が 1 行にまとめてくれますが、 0 行のときに 1 行空白を作ってくれるわけではないので、空白が欲しい場合はこのルールが使えます。
  使いたいかどうかは単に気持ちの問題ですが、使うデメリットもほぼ無いので関連するルールとして挙げました。

- [`import/no-useless-path-segments`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-useless-path-segments.md)（★★）
  `../` で祖先ディレクトリへ遡るパスを書いたときに、余計に遡りすぎていたらこのルールで検出・修正できます。

### TypeScript の Type only import/export スタイル指定

- [`@typescript-eslint/consistent-type-imports`](https://typescript-eslint.io/rules/consistent-type-imports/)（★★★）
- [`import/consistent-type-specifier-style`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/consistent-type-specifier-style.md)（★★★）
- [`@typescript-eslint/consistent-type-exports`](https://typescript-eslint.io/rules/consistent-type-exports/)（★★★）

TypeScript では型定義のみの import を行う構文が存在します。
この `type` modifier は無しでも大抵は問題ありませんが、コンパイラーにこのヒントを与えることでトランスパイル時に import 文を丸ごと削除できることでバンドルサイズ削減に効く可能性があったり、循環依存によるエラーを回避したり tsconfig の `isolatedModules` オプションに関連して発生しうるエラーの回避に有効である場合があります。
重要度が特に高いわけではありませんが、`type` modifier は付けられるときに付けておいて損は無く、 auto fix で簡単に統一できるのでおすすめです。

top-level style が以下の書き方で

```ts

```

inline スタイルが以下の書き方です。

```ts

```

同じ import path を 2 回書く方が不便であることが多い（ファイル移動時のパス文字列修正とか）ので、後者の inline スタイルを採用し以下の設定を使うのが個人的にはおすすめです。

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

### 配列の `sort` メソッドをより安全に使う

- [`@typescript-eslint/require-array-sort-compare`](https://typescript-eslint.io/rules/require-array-sort-compare/)（★★★★★）

JavaScript の `Array.prototype.sort` はデフォルトで文字列比較によるソートを行うので、特に数値配列に対して使った場合に意図しない結果になるリスクがあります。

```ts
[1, 2, 3, 10, 20, 30].sort(); // → [1, 10, 2, 20, 3, 30]
```

この ESLint ルールを有効にすると `.sort()` の引数を省略できないようになります。 `ignoreStringArrays` option により文字列の配列に関しては比較関数を省略しても問題無いのでこのオプションも有効にしておくと便利です。

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

### [`no-restricted-syntax`](https://eslint.org/docs/latest/rules/no-restricted-syntax)（★★★★★）

既存ルールに求めているものが見つからず困ったら、このルールを使えば（自分で ESLint plugin を自作するよりは）比較的簡単に禁止したい構文を記述することができることがあります。
[AST checker](https://typescript-eslint.io/play/#ts=4.7.2&sourceType=module&showAST=es)を使ってどのように指定すれば良いか調べると便利です。

例えば TypeScript の（`as const` や import rename 以外の） `as` を禁止するルールは以下のように書くことができます（※これまでこの設定で経験上問題無さそうであることは確認していますが、完璧な設定である保証はありません）。

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

`io-ts` を使っている場合、配列を `readonly` で定義することを強制する以下のルールを有効にすると便利です。（`import * as t from "io-ts";` と import している慣例を前提にしているので、ちゃんとやるならその部分にも別途チェックが必要です。あるいは `no-restricted-syntax` だけでももっと良い書き方があるかもしれません。）

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
  "react/jsx-no-bind": "warn"
}
```

### アロー関数スタイルに統一

以下の設定で関数の記述方法をアロー関数に統一し、 `return` 文も自動修正で可能な限り無くすことができます。

- [`arrow-body-style`](https://eslint.org/docs/latest/rules/arrow-body-style)（★）
- [`func-style`](https://eslint.org/docs/latest/rules/func-style)（★）
- [`prefer-arrow-functions`](https://www.npmjs.com/package/eslint-plugin-prefer-arrow-functions)（★）

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
