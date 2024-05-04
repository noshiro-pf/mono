---
title: 'TypeScript で関数の戻り値型を undefined とすべきか void とすべきか'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['typescript']
published: true
---

本記事の内容は TypeScript 5.2.2 時点で確認したものです。

## ケース1： 明示的に値を返さない関数

以下の関数 `f` を例として考えます。

```js
const f = () => {
  return;
};
```

この関数 `f` に対して TypeScript で型を付けるときは、 `f` は明示的な戻り値を持たないため以下のように `void` を使ってアノテーションするのが一般的です。

```ts
const f = (): void => {
  return;
};
```

一方で、ランタイムでの挙動を考えると、 JavaScript として `f()` を実行した結果は `undefined` であるため、この関数に

```ts
const f = (): undefined => {
  return;
};

console.log(f()); // undefined
```

という戻り値型を付けるのもありなのではないか、という考え方もありそうです。
実際、この型注釈でも型エラーになるわけではありません。

### 補足1： void 型の性質

`void` は `undefined` のエイリアスではありません。より具体的には、`void` は `undefined` の上位型です（＝`undefined` は `void` の部分型）。

```ts
const v: void = undefined; // OK

// @ts-expect-error
const u: undefined = v; // エラー
```

### 補足2： TypeScript の型推論

TypeScript に型推論させてみると、

```ts
const f = () => {
  if (1 < 0) {
    return;
  }
};
```

この関数は `() => void` 型になるのに対し、

```ts
const f = () => {
  if (1 < 0) {
    return 0;
  }
};
```

この関数は `() => 0 | undefined` となるようです。明示的に値を返すことがある場合は、 `void` ではなく `undefined` との union が戻り値型になるように見えます。

### 関連 issue があった

TypeScript開発者の Ryan Cavanaugh 氏によると、 `void` 型は関数の戻り値型が変わる変更を加えたときの後方互換性を保つための道具ということのようです。
https://github.com/microsoft/TypeScript/issues/36239#issuecomment-575722576

冒頭の `f` のような関数があったとき、戻り値型を `undefined` としている場合はその戻り値が使われている可能性を考慮する必要があり、これが `number` など何か値を返す関数に変わる場合は破壊的変更となってしまいます。一方、戻り値型を `void` としていればその戻り値が使われないことを意図しているため、後から何か値を返す関数に変更したとしても破壊的変更とする必要がありません。

したがって、関数 `f` には前者 `void` を使って型注釈しておくのが適切のようです。

:::message
以下のように戻り値が `void` 型の関数の結果を変数に代入するコードはエラーになるわけではない点に注意が必要です（TypeScript (v5.2.2)）。

```ts
type voidFunc = () => void;

const f: voidFunc = () => true;

const v = f(); // v は void 型になるだけでエラーにはならない
```

この問題は、 以下の eslint ルールを有効にしていれば検出できます。

@[card](https://typescript-eslint.io/rules/no-confusing-void-expression/)
:::

## ケース2： 値を返す場合と返さない場合がある関数

[oidc-client-ts](https://github.com/authts/oidc-client-ts) というライブラリを使っていて、 `signinCallback` というメソッドの戻り値が `Promise<User | void>` という型になっており、この戻り値を使う際に値が `User` なのかそうでないのかを判別するコードを書きづらいという問題に遭遇しました。

```ts
const maybeUser = await userManager.signinCallback(url);

if (!!maybeUser) {
  // maybeUser is User
  console.log(maybeUser.profile);
}
```

このコードは [strict-boolean-expressions](https://typescript-eslint.io/rules/strict-boolean-expressions/) という eslint ルールを有効化していると `!!result` の部分で boolean へキャストするコードを禁じられエラーになってしまいます。ところが、 `result` は `User | undefined` や `User | null` ではなく `User | void` であるため、 `undefined` や `null` との明示的な比較で null check の条件式を書くことができません。

このメソッドは、 `Promise<void>` 型を戻り値とするメソッド `signinPopupCallback`, `signinSilentCallback` と `Promise<User>` 型を戻り値とする `signinRedirectCallback` が中で呼び分けられる内部実装になっており、これをそのまま `Promise<User | void>` という戻り値型にしているようでした。

```ts
export class UserManager {
  // ...

  public async signinCallback(
    url = window.location.href,
  ): Promise<User | void> {
    const { state } = await this._client.readSigninResponseState(url);
    switch (state.request_type) {
      case 'si:r':
        return await this.signinRedirectCallback(url);
      case 'si:p':
        return await this.signinPopupCallback(url);
      case 'si:s':
        return await this.signinSilentCallback(url);
      default:
        throw new Error('invalid response_type in state');
    }
  }
}
```

メソッドの戻り値を使うユーザーとしては、この関数の戻り値が `User | void` という値を返すのか返さないのかどっちつかずな型であることは好ましくないと思われるため、 `User | undefined` にしてもらえるよう、以下の PR を送っています。

https://github.com/authts/oidc-client-ts/issues/1492

https://github.com/authts/oidc-client-ts/pull/1490

この問題は、以下の eslint ルールを有効にするとエラーとして検出することができます。

https://typescript-eslint.io/rules/no-invalid-void-type

## 結論

- 明示的な戻り値を持たない関数は後方互換性を保つ変更をしやすくするために `undefined` ではなく `void` で型注釈しておいた方が良い
- 明示的な戻り値を持つ関数は `void` ではなく `undefined` との union で型注釈すべき

## おまけ： void 型周りで便利な eslint ルール

戻り値が `void` 型の関数を式の中で使うことを禁止するルール

https://typescript-eslint.io/rules/no-confusing-void-expression/

`void` を他の方と混ぜて使うことを禁止するルール

https://typescript-eslint.io/rules/no-invalid-void-type

### 関連URL

https://typescriptbook.jp/reference/functions/void-type

https://zenn.dev/dozo13189/articles/c7d7932c5655a0

https://stackoverflow.com/questions/58885485/why-does-typescript-have-both-void-and-undefined

https://www.typescriptlang.org/docs/handbook/2/functions.html#void

https://www.typescriptlang.org/docs/handbook/2/functions.html#return-type-void
