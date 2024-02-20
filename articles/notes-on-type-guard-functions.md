---
title: 'TypeScriptの型ガード関数を定義する際に避けるべきパターン覚書'
emoji: '🐈'
type: 'tech'
topics: ['typescript']
published: true
---

TypeScriptにおいて、型ガード関数[^1]を定義する際に実は避けた方が良い型注釈のパターンがあることが分かったので、その覚書です。

---

[^1]: https://typescriptbook.jp/reference/functions/type-guard-functions

本記事は執筆時点で最新の TypeScript 5.3.2 での動作を基に書いています。

## `isAbortError` 関数の例

例として、以下のような型ガード関数 `isAbortError` の戻り値型のアノテーションが適切かどうかを考えます。

```ts
const isAbortError = (a: unknown): a is Error =>
  a instanceof Error && a.name === 'AbortError';
```

:::message

`'AbortError'` とは `AbortController#abort()` メソッド[^2]の呼び出しにより発生するものです。

:::

[^2]: https://developer.mozilla.org/ja/docs/Web/API/AbortController/abort#reason

この関数は少なくとも `a` が `Error` 型であるかどうかはチェックしているので `a is Error` という型ガードは一見付けておいて損が無いように思えます。実際、

```ts
declare const e: unknown;
if (isAbortError(e)) {
  console.log(e); // e: Error
} else {
  console.log(e); // e: unknown
}
```

などと書いたとき、 else 節において `e` は単に元の `unknown` 型のままであり、特に 「`Error` 型以外」という型に絞られているわけではなさそうに見えます。

このことから、私はこれまで、TypeScript は戻り値型が `a is T` とアノテーションされた型ガード関数を否定形で用いたときに対象の変数（上の例の `e`）を「`T` ではない型」に絞ってはいないと認識しており、そのため、 `T` がその型ガード関数ランタイムチェック内容より甘い型であっても実害が無く、またそうであることも求められていないと考えていました。

しかし、この `isAbortError` 関数は以下のような使用例において好ましくない挙動を生んでしまいます。

```ts
const isAbortError = (a: unknown): a is Error =>
  a instanceof Error && a.name === 'AbortError';

declare const e: unknown;
if (e instanceof Error) {
  if (isAbortError(e)) {
    console.log(e.message);
  } else {
    // @ts-expect-error
    console.log(e.message); // e: never
  }
}
```

このように `Error` 型をエラータイプによってさらに場合分けするような文脈でこれらの型ガード関数を使ってしまうと、 `isAbortError(e)` の else 節で `e` が `never` 型になり、型エラーになってしまいます。

もちろん、このコードは `Error` 型かどうかのチェックが二重に行われている点が冗長なので、

```ts
if (e instanceof Error) {
  switch (e.name) {
    case 'AbortError':
      console.log(e.message);
      break;

    default:
      console.log(e.message);
  }
}
```

などと書いても良さそう[^※]ではあり、こうすれば先の例のような型エラーも回避できます。しかし、これは `isAbortError` 関数起因の問題を**使用側の工夫で回避したに過ぎない**ため、型ガード関数 `isAbortError` の定義自体の良し悪しを語る材料としては妥当でなく、 `isAbortError` はそれが使用可能ななるべく多くの文脈で好ましくない挙動を生まないように定義した方が良いと思います。

[^※]: このままだと `isAbortError` 関数を使っている場合より `'AbortError'` という文字列を書き間違えるリスクが生じやすくなる点で劣りますが、それは `export const AbortError = "AbortError";` を共通定数定義に置けば解決するので実質問題ありません。

型ガード関数をランタイムチェックよりも緩い戻り値型でアノテーションすると、`肯定形 && 否定形`の型ガードが生じたときにランタイム動作と一致しない `never` 型を生じさせる可能性があるため、**型ガード関数の戻り値型はランタイムチェックとぴったり一致するものにすべき**と言えそうです。

したがって、上の型ガード関数は例えば以下のように修正した方が良さそうです。

```ts
const isError = (a: unknown): a is Error => a instanceof Error; // 作らなくても良い

// そもそも isAbortError 自体は型ガード関数にせず Error を受け取る関数にしてしまう
const isAbortError = (err: Error): boolean => err.name === 'AbortError';

declare const e: unknown;
if (isError(e)) {
  if (isAbortError(e)) {
    console.log(e.message);
  } else {
    console.log(e.message); // no type error
  }
}
```

あるいは

```ts
// isAbortError を型ガード関数にする場合
const isAbortError = (
  a: unknown,
): a is Error & Readonly<{ name: 'AbortError' }> =>
  a instanceof Error && a.name === 'AbortError';

// 下の例で `instanceof Error` チェックが無駄に2回行われてしまうのは欠点だが、 isAbortError 自体は便利になった。
declare const e: unknown;
if (e instanceof Error) {
  if (isAbortError(e)) {
    console.log(e.message);
  } else {
    console.log(e.message); // no type error
  }
}
```

## `isTruthy` 関数の例

次の例として `isTruthy` という関数を考えます。

```ts
/**
 * 注：NaN は型で表現できていない。
 */
type FalsyValue = undefined | null | false | 0 | -0 | 0n | '';

const isTruthy = <A>(a: A): a is Exclude<A, FalsyValue> => !!a;
```

この関数は以下のように falsy 値を除くように工夫しています。

```ts
declare const u: 0 | 1 | 2;
if (isTruthy(u)) {
  console.log(u); // u: 1 | 2
}
```

ただし、falsy 値のうち `NaN` だけは1対1対応する型が存在しないため表現できていません。前節の結論に従えば、型ガード関数はランタイム動作とぴったり一致する戻り値型を持つべきであるため、 `isTruthy` 関数の定義は不適切です。

具体的には以下の例で問題が生じます。

```ts
type FalsyValue = undefined | null | false | 0 | -0 | 0n | '';

const isTruthy = <A>(a: A): a is Exclude<A, FalsyValue> => !!a;

const isFalsyOrObject = (a: unknown): a is FalsyValue | object =>
  typeof a === 'object' || !a;

const v: unknown = NaN;
if (isFalsyOrObject(v)) {
  if (isTruthy(v)) {
    console.log(v); // v: object
  } else {
    console.log(v); // v: FalsyValue

    switch (v) {
      case undefined:
      case '':
      case 0:
      case -0:
      case 0n:
      case false:
      case null:
        console.log('ok');
        break;

      default:
        const _: never = v; // v: never
        throw new Error('unreachable');
    }
  }
}
```

この例において、 else 節で `v` は `FalsyValue` 型となりますが、ランタイムでは `NaN` が来るパターンが存在します。そのため、 `default` case で `v` は `never` 型ですが `v = NaN` のとき `"Uncaught Error: unreachable"` エラーになります。

しかし、ここで型注釈側がランタイム動作にこれ以上寄せるのが不可能だからと言って

```ts
const isTruthyOrNaN = <A>(a: A): a is Exclude<A, FalsyValue> =>
  Number.isNaN(a) || !!a;
```

とランタイム動作の方を型に寄せるのは、使い勝手が悪すぎて受け入れられません。

さらに言えば、 `isTruthy` は以下のように `unknown` 型に適用した場合に else 節が `never` 型になってしまう問題もあります。

```ts
declare const v: unknown;
if (isTruthy(v)) {
  console.log(v); // v: unknown
} else {
  console.log(v); // v: never
}
```

これに関しては `isTruthyOrNaN` でも同様のことが起こるため解決していません。

以下の `isFalsyOtherThanNaN` ならばこの問題が起きないことを踏まえると、 `isTruthy`（や `isTruthyOrNaN`）のような「補集合」を述語とする型ガード関数（`<A>(a: A): a is Exclude<A, X>`）を定義することもやめた方が良さそうです。

```ts
const isFalsyOtherThanNaN = <A>(a: A): a is FalsyValue =>
  !Number.isNaN(a) && !a;

declare const v: unknown;
if (isFalsyOtherThanNaN(v)) {
  console.log(v); // v: FalsyValue
} else {
  console.log(v); // v: unknown
}
```

## まとめ

- 型ガード関数の戻り値型にランタイムチェックより緩い型を付けない方が良い。型ガード関数の戻り値型はランタイムチェックとぴったり一致するものにすべき。
- 「補集合」を述語とする型ガード関数（`<A>(a: A): a is Exclude<A, X>`）は定義すべきでない。

他にも避けるべきパターンに気づいたら追記します。
