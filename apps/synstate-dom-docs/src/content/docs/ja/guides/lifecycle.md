---
title: ライフサイクルとスコープ
description: スコープを作る場所、スコープが破棄するもの、表示していないビューの派生を計算させない 2 つの書き方。
---

## スコープ

synstate-dom は独自の所有者ツリーを持たず、synstate 本体のスコープを使う。スコープの実行中に同期的に作られた Observable はそのスコープに属し、束縛が行う購読もすべてそうなる。スコープを破棄すると、それらがまとめて破棄される。

スコープを作るのは、独立して破棄できるところだけである。

| 作るもの                                        | 親スコープ                   | 破棄するとき                             |
| :---------------------------------------------- | :--------------------------- | :--------------------------------------- |
| `render`                                        | なし                         | `render` が返した関数を呼んだとき        |
| `If` / `MatchOptional` / `MatchResult` の各分岐 | `If` をマウントしたスコープ  | 分岐が変わったとき、親が破棄されたとき   |
| `For` の各行                                    | `For` をマウントしたスコープ | 行のキーが消えたとき、親が破棄されたとき |

コンポーネントにはスコープを作らない。1 回しか呼ばれず、寿命はマウントされた分岐・行・ルートとちょうど同じだからである。

モジュールのトップレベル、つまりすべてのスコープの外で定義した状態はどこにも属さず、ページと同じだけ生きる。アプリのストアはそこに置く。

## 2 つの書き方

synstate の派生は遅延評価ではなく、読まれていてもいなくても、親が変わるたびに計算される。次の 2 つの書き方で、表示していないビューのために派生が計算されるのを避けられる。

**1 つのビューだけが読む派生は、ストアの横ではなくそのコンポーネントの中で作る。** コンポーネントがマウントされている間だけ存在し、作った時点から束縛という読み手がいる。

```tsx
import { createState, map } from 'synstate';
import { type JSX, view } from 'synstate-dom';
import { Arr } from 'ts-data-forge';

// The store: module level, so it belongs to no scope and lives as long as
// the page.
export const [cart$, setCart] = createState<readonly number[]>([]);

export const CartTotal = (): JSX.Element => {
    // Only this view reads the total, so it is created here. It belongs to the
    // scope this component is mounted in and is disposed with it.
    const total$ = cart$.pipe(map(Arr.sum));

    return <p>{view(total$, (t) => `Total: ${t}`)}</p>;
};
```

**分岐が表示するものは分岐の中で作る**（`If` の `then`、`MatchOptional` に渡す関数）。2 つを先に作ってから選ばない。

```tsx
import { createBooleanState, createState, map } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';

const [showStats$] = createBooleanState(false);

const [samples$] = createState<readonly number[]>([]);

const Stats = (): JSX.Element => {
    // Created only while the branch is shown, and disposed when it closes.
    const total$ = samples$.pipe(map(Arr.sum));

    return <p>{view(total$, (t) => `Total: ${t}`)}</p>;
};

export const Panel = (): JSX.Element => (
    <If
        cond={showStats$}
        then={<Stats />}
        else={<p>{constant('Stats are hidden')}</p>}
    />
);
```

残るのは、グローバルに定義した重い派生をたまにしか読まない場合である。synstate-dom は読まれていない派生を休眠させない。実際のアプリで問題になったら再検討する。

## イベントハンドラ

ハンドラはどのスコープの外でも実行される。呼ばれる時点では、どの `run` も動いていない。ハンドラの中で作った Observable（`a$.pipe(map(...))` など）はどのスコープにも属さず、行や分岐が消えた後も計算され続ける。開発ビルドでは、synstate-dom が登録したハンドラの中で Observable が作られると warning を出す。

代わりにハンドラからは状態に書き込み、その状態からの派生はマウント時に作る。`await` の後など、後から実行する処理でどうしても Observable を作る必要があるなら、コンポーネントのマウント中に `getCurrentScope()` でスコープを取っておき、後の処理をそのスコープの `run` で包む。
