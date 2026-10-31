# 有効にしているルールの根拠と違反時の直し方

`eslint-config-typed` のプリセット `eslintConfigForTypeScript` が有効または無効にしているルールのうち、設定だけでは意図が伝わりにくいものについて、その理由と、報告されたときの直し方をまとめる。

下の表の「設定」列と、本文が頼る設定（`functional/no-let` のオプションなど）は、`src/rules/rule-rationale-doc.test.mts` がプリセットの実際の設定と照らし合わせる。設定を変えたら、この文書も合わせて直すこと。

## ループ

| ルール                             | 設定    |
| ---------------------------------- | ------- |
| `@typescript-eslint/prefer-for-of` | `error` |
| `unicorn/no-for-loop`              | `error` |
| `functional/no-loop-statements`    | `off`   |

### 根拠

配列の要素を順に読むだけのループは `for (const x of xs)` で書く。添字ループ `for (let i = 0; i < xs.length; i++)` には次の問題がある。

- 添字の範囲を自分で書くので、`<=` と `<` の取り違えや、別の配列の `length` を書く誤りが起きる。
- `noUncheckedIndexedAccess` の下では `xs[i]` が `T | undefined` になり、`!` や余計な判定が要る。`for-of` の要素は `T` のまま得られる。
- ループ変数 `i` が `let` になる。`functional/no-let` は `allowInForLoopInit: false` なので、`mut_i` のような名前にしない限り報告される。

ループ文そのものは禁止しない（`functional/no-loop-statements` は `off`）。早期 `return` や `break` を含む処理は、`reduce` や再帰で書くより読みやすいことが多いからである。

### 直し方

- 要素だけを使うなら `for (const x of xs)`。
- 添字も要るなら `for (const [i, x] of xs.entries())`。
- 数値の範囲を回すだけなら ts-data-forge の `range` を使い、`for (const i of range(0, n))` と書く。`range` は安全な整数しか受け取らないので、`n` がただの `number` なら `asSafeUint(n)` で変換して渡す。この書き換えは `ts-data-forge/prefer-range-for-loop` が自動修正するが、このルールはプリセットに含まれない。`eslint-plugin-ts-data-forge` を入れて `ts-data-forge` の名前で登録し、`eslintTsDataForgeRules` を加えたときにだけ働く（README の「ts-data-forge」の節を参照）。

### 性能についての注記

大きな配列を hot path で回す場合、添字ループの方が `for-of` より速いというベンチマーク報告がある。これは反復子プロトコルの分のコストで、どれだけ差が出るかは JavaScript エンジンとそのバージョンで変わる。計測して差が問題になると分かった箇所に限り、理由を書いて外す。添字ループは `unicorn/no-for-loop` に報告され、添字を `xs[i]` の読み出しにしか使わないなら `@typescript-eslint/prefer-for-of` にも報告される。`// eslint-disable-next-line unicorn/no-for-loop -- <計測結果>` のように、実際に報告されたルールだけを書く（使われない disable はプリセットの `reportUnusedDisableDirectives` が報告する）。ループ変数は `functional/no-let` に報告されないよう `mut_i` と名付ける。`xs[mut_i]` は `T | undefined` なので、`!` ではなく（`@typescript-eslint/no-non-null-assertion` に報告される）`undefined` の判定か `??` で既定値を与えて扱う。推測で外さない。

## `reduce`

| ルール                                            | 設定    |
| ------------------------------------------------- | ------- |
| `unicorn/no-array-reduce`                         | `off`   |
| `total-functions/no-partial-array-reduce`         | `error` |
| `@typescript-eslint/prefer-reduce-type-parameter` | `error` |

### 根拠

`reduce` そのものは禁止しない（`unicorn/no-array-reduce` は `off`）。合計や畳み込みのように、一つの値へ集約する処理は `reduce` で書くのが自然だからである。ただし次の二点は誤りやすいので禁止する。

- **初期値のない `reduce`**（`total-functions/no-partial-array-reduce`）。空配列では `TypeError` を投げ、型の上でもそれが見えない。
- **初期値の型注釈を `as` で書くこと**（`@typescript-eslint/prefer-reduce-type-parameter`）。`[] as string[]` のような型アサーションは検査を弱める。型引数で書けば、コールバックの戻り値も同じ型で検査される。

### 直し方

- 初期値を必ず渡す。`xs.reduce((a, b) => a * b)` ではなく `xs.reduce((a, b) => a * b, 1)`。合計や最大値なら ts-data-forge の `Arr.sum(xs)` や `Arr.max(xs)` を使う。`Arr.max` は空配列の場合を戻り値の型（`Optional`）で表す。
- 初期値の型は型引数で書く。`xs.reduce((acc, x) => …, [] as string[])` ではなく `xs.reduce<readonly string[]>((acc, x) => …, [])`。
- 蓄積する配列を毎回作り直す `reduce`（`[...acc, x]`）は、途中経過が要るなら ts-data-forge の `Arr.scan`、要らないなら `map` / `filter` か `for-of` で書く。
