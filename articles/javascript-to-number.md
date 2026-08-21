---
title: 'JavaScript で文字列を数値に変換する方法まとめ（加筆予定）'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['javascript', 'frontend']
published: true
---

<!-- cspell:ignore mathrm -->

## JavaScript で文字列を数値に変換する方法の例

- `parseInt(x, 10)` = `Number.parseInt(x, 10)`
- `parseFloat(x)` = `Number.parseFloat(x)`
- `Number(x)`
- `+x`
- `~~x`
- `x >>> 0`
- `valueAsNumber` （input form の onChange コールバック関数のEventで）

## 実行結果のまとめ

![javascript-to-number-table](https://github.com/noshiro-pf/mono/blob/develop/articles/javascript-to-number-table.png?raw=true)

（["parseInt vs unary plus, when to use which? (Stackoverflow)"](https://stackoverflow.com/questions/17106681/parseint-vs-unary-plus-when-to-use-which/17106702#17106702?newreg=6a1d4706ff50425ca16bd5ec2f6e80e0) より）

## 仕様

### parseFloat

https://tc39.es/ecma262/multipage/global-object.html#sec-parsefloat-string

`parseFloat(x)` の（やや雑な）動作概略：

1. $x$ を $\mathrm{ToString}$ で文字列に変換する（$x$ は文字列の場合はそのまま）
2. $\mathrm{TrimString}( \cdot , \mathrm{START})$ [^TrimString] で先頭の空白文字を除去する。
3. [$\mathit{StrDecimalLiteral}$](https://tc39.es/ecma262/multipage/abstract-operations.html#prod-StrDecimalLiteral) の構文を満たす（"-Infinity", "123_456", "12e+3" などにマッチする）最長の prefix を $\mathit{trimmedPrefix}$ とする。もしそのような prefix が無ければ `NaN` を返す。
4. $\mathit{trimmedPrefix}$ の [$\mathit{StringNumericValue}$](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-runtime-semantics-stringnumericvalue) を返す。

[^TrimString]: 仕様書読み方メモ： `TrimString(inputString, START)` の `START` は変数や定数ではなく、 `"START"` というキーワードを表す。他に `END` や `START+END` を第2引数に呼ばれることがある。

まとめ

- `parseFloat` は入力文字列の空白を除く先頭部分のみを数値として解釈する（`"  123.45foo"` → `123.45`）
- `null`, `undefined`, `true`, `false` などはいずれも、文字列化した結果の先頭に $\mathit{StrDecimalLiteral}$ にマッチする部分が無いため `NaN` になる。
- `parseInt("0x100")` は 256 だが **`parseFloat("0x100")` は `0` になる**。

### parseInt

https://tc39.es/ecma262/multipage/global-object.html#sec-parseint-string-radix

`parseInt(x, radix)` の（やや雑な）動作概略：

1. $x$ を $\mathrm{ToString}$ で文字列に変換する（$x$ は文字列の場合はそのまま）
2. $\mathrm{TrimString}( \cdot , \mathrm{START})$ [^TrimString] で先頭の空白文字を除去する。
3. `"-"` 始まりなら $\mathit{sign} = -1$、そうでなければ$\mathit{sign} = 1$ とする。
4. 先頭の `"-"` や `"+"` 文字を除いた部分文字列を $S$ とする。
5. 基数 radix を $\mathrm{ToInt32}$ で 32bit 整数にマップする（`Infinity` や `NaN` は `0` にマップされ、小数は `0` 方向に丸められる）。これを $R$とする。
6. $R = 0$ のとき $R = 10$ とする。そうでないとき、 $R < 2$ または $36 < R$ のときは `NaN` を返す。
7. $R$ に「明示的に」値がセットされなかった場合や $R = 16$ の場合、 $S$ が `"0x"`または `"0X"` で始まる文字列だった場合は $R = 16$ とし、 $S$ から先頭2文字を取り除く。
8. （TODO: 余力があれば追記）
9. $Z$ を $S$ の最長の prefix であって "radix-$R$ digit" からなるものとする。
   - "radix-$R$ digit" ... `0-9a-z` のうち、 $R$ 番目までの文字のこと。例えば $R = 3$ なら `'0', '1', '2'`、 $R = 36$ なら `0-9a-z` となる。
10. $Z$ が空文字なら `NaN` を返す。
11. $\mathit{mathInt}$ を radix-$R$ 表記の $Z$ の整数値とする。
    - > (However, if R = 10 and Z contains more than 20 significant digits, every significant digit after the 20th may be replaced by a 0 digit, at the option of the implementation; and if R is not one of 2, 4, 8, 10, 16, or 32, then mathInt may be an implementation-approximated integer representing the integer value denoted by Z in radix-R notation.)
12. $\mathit{sign} \times \mathit{mathInt}$ を返す。

まとめ

- `parseFloat` と同様、入力文字列の空白を除く先頭部分のみを数値として解釈する（`"  123.45foo"` → `123`）
- 正負は先頭の `"-"` の有無だけで決まる。
- 0x, 0b など
  - `parseInt` は `"0x"`（`"0X"`）prefix を考慮する。
  - `parseInt("0x1")` は `1` に評価される。
  - `parseInt("0x1", 16)` は `1` に評価される。
  - **`parseInt("0x1", 36)` は 1189 に評価される。**（`'x'` = 33 という文字として解釈される）
  - `parseInt("0z", 36)` は `35` に評価される。
  - **`"0b111"` は2進法表記の `7` としては解釈されず、 radix が 11 以下の場合 0、 radix が 12 以上の場合 `'b'` = 12 という文字として解釈される。**
- `parseFloat` は `0x` 始まりの文字列を解釈せず `0` に評価するが、 `parseInt` は `0x` 始まりの文字列を解釈できるので、**`parseInt` は `parseFloat`の小数部無視バージョンではない。**
- 細かい仕様
  - radix に `36.9` などを入れても `36` と解釈されて動く。`1.9` などは 2 未満で不正な入力扱いとなり `NaN` が返される。

### Number

https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-number-constructor-number-value

`Number(x)` の（やや雑な）動作概略：

1. $\mathit{prim}$ を $\mathrm{ToNumeric}(x)$ とする。

加筆予定

### valueAsNumber

`type` に

- number
- range
- date
- month
- week
- time
- datetime-local

のいずれかを付与している `input` 要素で使用可能（ `type="text"` などの場合は数値を入力していても `NaN` になる）

```tsx
import * as React from 'react';

const NumericInputExample = () => {
  const [num, setNum] = React.useState(0);

  const onChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setNum(ev.target.valueAsNumber);
    },
    [],
  );

  return (
    <div>
      <input type="number" value={num} onChange={onChange} />
      <div>{num}</div>
    </div>
  );
};
```

https://html.spec.whatwg.org/multipage/input.html#dom-input-value

https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number)

（`type="date"` などのケースは本記事の調査対象外のため）`type="number"` の input 要素のイベントの場合を調べる。

parse アルゴリズムの仕様： https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-floating-point-number-values

`valueAsNumber` を計算する parse 処理の（やや雑な）動作概略：

1. $\mathit{value} \gets 1$
1. $\mathit{divisor} \gets 1$
1. $\mathit{exponent} \gets 1$
1. 先頭の空白文字を無視する
1. `'-'` 文字始まりなら $\mathit{divisor}$ を $-1$ に
1. 先頭の `"-"` や `"+"` 文字を除いた部分文字列を $S$ とする。
1. 以降加筆予定です 🙇‍♂️

## 使い分け方の考察

- 以下は [`no-implicit-coercion`](https://eslint.org/docs/latest/rules/no-implicit-coercion) や [`@typescript-eslint/restrict-plus-operands`](https://typescript-eslint.io/rules/restrict-plus-operands/) で禁止して良さそう。
  - `+x`（これは特に大体 `Number(x)` と似た結果っぽいので、文字列連結構文との曖昧性回避のためにそちらを使う方が安全そう）
  - `~~x`
  - `x >>> 0`
- `parseInt(x)` ： 基数を設定したいときに使用できる。 `"11.9999999"` とかは $11$ に評価されてしまうことなどに注意が必要そう。
- 以下の三つはどれを使っても普通の浮動小数点数のパースには大体同じように使用できそうだが、若干 `Number` か（使えるときは） `valueAsNumber` を使うのが無難そう？
  - `parseFloat(x)`
    - **実用上は、`"123.foo"` などの全体としては数値ではない文字列も prefix だけパースできてしまうことがある点に一番注意が必要かも。** うっかり渡すものを間違えてそのまま動いてしまうので気づかないという状況に注意したい。
    - `"0x"` 始まりの文字列を解釈できない点にも注意が必要だが、そういう入力を受け付けることは実用上そんなに無い気もする。
  - `Number(x)`
    - 文字列は大体よしなに数値に変換してくれそうだが `true`, `false`, `null` なども $0$ や $1$ に評価して動いてしまう点に逆に注意が必要かも。ただし `undefined` を渡すと `NaN` が返るところがややこしい。文字列入力想定ならこの辺は踏む心配は無い。
    - `parseFloat` と違い `"123foo"` とかは `NaN` になってくれるので fail fast の観点で安心。
  - `valueAsNumber`
    - 想定している数値文字列に対しては `Number(x)` と同じ挙動をしそう？（仕様要確認）
    - 数値入力欄のフォームに入力できる文字列を変換するロジックなので特に変な挙動は想定せず使えそう。
    - `Number(event.target.value)` とかわざわざするよりは `event.target.valueAsNumber` を取り出した方が綺麗な気がする（パフォーマンスの細かい違いとかは調べ切れていない）。
    - ただ `type="text"`のときは常に `NaN` に評価されるので `<input type="text">` を数値入力欄として使っているときは使用できない。

TypeScript で `unknown` 型の変数を数値に変換したいときは、 まず `typeof` で場合分けして `string` 以外のケースは用途に応じて適宜定義し、 `string` 型のケースに `Number` を使ってパースするのが一番安全そうかなと思いました。

## Links

- [conversion table](https://stackoverflow.com/questions/17106681/parseint-vs-unary-plus-when-to-use-which/17106702#17106702?newreg=6a1d4706ff50425ca16bd5ec2f6e80e0)
- [parseFloat](https://tc39.es/ecma262/multipage/global-object.html#sec-parsefloat-string)
- [rules-for-parsing-floating-point-number-values](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-floating-point-number-values)
