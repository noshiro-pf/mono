---
title: ライフサイクルとスコープ
description: スコープがどこで作られ、何を破棄するのか。そして、表示していないビューのために派生を計算させない 2 つの書き方。
---

## スコープ

synstate-dom は独自の所有者ツリーを持たず、synstate 本体のスコープを使います。スコープの実行中に同期的に作られた Observable はそのスコープに属し、束縛が行う購読もすべてそのスコープに属します。スコープを破棄すると、それらがまとめて破棄されます。

スコープを作るのは、単独で破棄できるところだけです。

| 作るもの                                        | 親スコープ                   | 破棄されるとき                           |
| :---------------------------------------------- | :--------------------------- | :--------------------------------------- |
| `render`                                        | なし                         | `render` が返した関数を呼んだとき        |
| `If` / `MatchOptional` / `MatchResult` の各分岐 | `If` をマウントしたスコープ  | 分岐が変わったとき、親が破棄されたとき   |
| `For` の各行                                    | `For` をマウントしたスコープ | 行のキーが消えたとき、親が破棄されたとき |

コンポーネントごとにはスコープを作りません。コンポーネントは 1 回しか呼ばれず、その寿命はマウントされた分岐・行・ルートとちょうど同じだからです。

モジュールのトップレベル、つまりすべてのスコープの外で定義した状態はどこにも属さず、ページと同じだけ生き続けます。アプリのストアはそこに置きます。

## 2 つの書き方

synstate の派生は遅延評価ではありません。読まれていてもいなくても、親が変わるたびに計算されます。そこで、表示していないビューのために派生が計算されないよう、次の 2 つの書き方をおすすめします。

**1 つのビューだけが読む派生は、ストアの横ではなく、そのコンポーネントの中で作りましょう。** そうすれば派生はコンポーネントがマウントされている間だけ存在し、作った時点から束縛という読み手がいることになります。

```tsx
import { createState, map } from 'synstate';
import { type JSX, view } from 'synstate-dom';
import { Arr } from 'ts-data-forge';

// The store: module level, so it belongs to no scope and lives as long as the
// page.
export const [cart$, setCart] = createState<readonly number[]>([]);

export const CartTotal = (): JSX.Element => {
    // Only this view reads the total, so it is created here. It belongs to the
    // scope this component is mounted in and is disposed with it.
    const total$ = cart$.pipe(map(Arr.sum));

    return <p>{view(total$, (t) => `Total: ${t}`)}</p>;
};
```

**分岐で表示するものは、分岐の中で作りましょう**（`If` の `then` や、`MatchOptional` に渡す関数の中）。2 つとも先に作っておいてから選ぶ、という書き方は避けます。

```tsx
import { createBooleanState, createState, map } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';

const [showStats$] = createBooleanState(false);

const [samples$] = createState<readonly number[]>([]);

export const Panel = (): JSX.Element => (
    <If
        cond={showStats$}
        then={<Stats />}
        else={<p>{constant('Stats are hidden')}</p>}
    />
);

const Stats = (): JSX.Element => {
    // Created only while the branch is shown, and disposed when it closes.
    const total$ = samples$.pipe(map(Arr.sum));

    return <p>{view(total$, (t) => `Total: ${t}`)}</p>;
};
```

これでも残るのは、グローバルに定義した重い派生をたまにしか読まない場合です。synstate-dom は、読まれていない派生を休眠させることはしません。実際のアプリで問題になったら、そのときに改めて検討します。

## イベントハンドラ

ハンドラは、どのスコープの外でも実行されます。ハンドラが呼ばれる時点では、どの `run` も動いていません。そのため、ハンドラの中で作った Observable（`a$.pipe(map(...))` など）はどのスコープにも属さず、行や分岐が消えた後も計算され続けてしまいます。開発ビルドでは、synstate-dom が登録したハンドラの中で Observable が作られると warning が出ます。

ハンドラでは状態に書き込むだけにして、その状態からの派生はマウント時に作っておきましょう。`await` の後など、後から実行する処理でどうしても Observable を作る必要があるなら、コンポーネントのマウント中に `getCurrentScope()` でスコープを取っておき、後の処理をそのスコープの `run` で包んでください。
