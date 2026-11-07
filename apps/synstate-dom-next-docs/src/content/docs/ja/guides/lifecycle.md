---
title: ライフサイクルと owner
description: owner がどこで作られ、何を破棄するのか。そして、表示していないビューのために派生を計算させない 2 つの書き方。
---

## owner

synstate-dom-next は独自の寿命の仕組みを持たず、synstate-next の owner を使います。owner は唯一の寿命の仕組みです。owner の `run` の実行中に作られたもの（Observable、束縛、購読、`onCleanup` で登録した後始末、その中で作った owner）は、すべてその owner に属します。owner を破棄すると、子の owner を破棄し、次に後始末を実行し、最後にノードを破棄します。どれも新しいものから順にです。参照カウントはなく、ソースが終わったことをグラフの下へ伝えることもありません。何かに依存するものは、その owner と一緒に消えます。

owner を作るのは、単独で破棄できるところだけです。

| 作るもの                                                   | 親                          | 破棄されるとき                           |
| :--------------------------------------------------------- | :-------------------------- | :--------------------------------------- |
| `render`                                                   | なし                        | `render` が返した関数を呼んだとき        |
| `If` / `MatchOptional` / `MatchResult` / `Switch` の各分岐 | switch をマウントした owner | 分岐が変わったとき、親が破棄されたとき   |
| `For` の各行                                               | `For` をマウントした owner  | 行のキーが消えたとき、親が破棄されたとき |
| `mountChild` の呼び出しごと                                | 呼び出したときの owner      | 親が破棄されたとき、子が例外を投げたとき |

コンポーネントごとには owner を作りません。コンポーネントは 1 回しか呼ばれず、その寿命はマウントされた分岐・行・ルートとちょうど同じだからです。

モジュールのトップレベル、つまりすべての owner の外で定義した状態はどこにも属さず、ページと同じだけ生き続けます。アプリのストアはそこに置きます。

分岐の owner は、普通の `createOwner()` とは少し違う作り方をします。その中で作られるノードはどれも、分岐を決めるノードよりグラフの深いところに置かれます。そのおかげで switch は、分岐のノードを訪れる前に、更新の中で分岐を決められます（[仕組み](/mono/synstate-dom-next/ja/background/how-it-works/#switch-は分岐が計算する前に決める)）。

## 2 つの書き方

synstate-next の派生は遅延評価ではありません。読まれていてもいなくても、親が変わるたびに計算されます（前回と等しい結果はそれより先へは伝わりませんが）。そこで、表示していないビューのために派生が計算されないよう、次の 2 つの書き方をおすすめします。

**1 つのビューだけが読む派生は、ストアの横ではなく、そのコンポーネントの中で作りましょう。** そうすれば派生はコンポーネントがマウントされている間だけ存在し、作った時点から束縛という読み手がいることになります。

```tsx
import type { JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';
import { Arr } from 'ts-data-forge';

// The store: module level, so it belongs to no owner and lives as long as the
// page.
export const [cart$, setCart] = createState<readonly number[]>([]);

export const CartTotal = (): JSX.Element => {
    // Only this view reads the total, so it is created here. It belongs to the
    // owner this component is mounted in and is disposed with it.
    const total$ = cart$.pipe(map(Arr.sum));

    return <p>{total$.pipe(map((t) => `Total: ${t}`))}</p>;
};
```

**分岐で表示するものは、分岐の中で作りましょう**（`If` の `then` がマウントするコンポーネントや、`MatchOptional` に渡す関数の中）。2 つとも先に作っておいてから選ぶ、という書き方は避けます。

```tsx
import { constant, If, type JSX } from 'synstate-dom-next';
import { createBooleanState, createState, map } from 'synstate-next';
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

    return <p>{total$.pipe(map((t) => `Total: ${t}`))}</p>;
};
```

「分岐の中」とは、上の `Stats` のように分岐がマウントするコンポーネントの中のことです。`then` に直接書いた JSX は書いた場所で `If` が選ぶ前に評価されるので、その中の `pipe(map(...))` は外側のコンポーネントの owner に作られ、分岐が隠れている間も計算を続けます。軽い束縛が数個ならそれで構いませんが、束縛が多い分岐や頻繁に更新される分岐は、独立したコンポーネントに移しましょう。

これでも残るのは、グローバルに定義した重い派生をたまにしか読まない場合です。読まれていない派生を休眠させる仕組みはありません。

## イベントハンドラと `await`

owner が現在の owner になるのは、その `run` の実行中だけです。イベントハンドラ、タイマーのコールバック、`subscribe` に渡した関数、そしてすべての再計算は、現在の owner が無い状態で実行されます。書き込みの時点でたまたま現在の owner だったものに、作ったものが属してしまわないようにするためです。そのため、ハンドラの中で作った Observable（`a$.pipe(map(...))` など）はどの owner にも属さず、行や分岐が消えた後も計算され続け、そこで行った `subscribe` も解除されません。実行時に警告は出ません（eslint-plugin-synstate の `no-observable-in-handler` は synstate についてこれを報告しますが、synstate-next のパッケージ名はまだ知りません）。

ハンドラでは状態に書き込むだけにして、その状態からの派生はマウント時に作っておきましょう。書き込みに owner は要りません。後の処理でどうしても、コンポーネントと一緒に消えるべきものを作る必要があるなら、コンポーネントのマウント中に `getOwner()` で owner を取っておき、その処理を owner の `run` で包んでください。破棄済みの owner でも `run` は owner なしで関数を呼ぶので、先に `disposed` を確かめます。

```tsx
import type { JSX } from 'synstate-dom-next';
import { createState, getOwner, map } from 'synstate-next';

type Profile = Readonly<{ name: string }>;

declare const fetchProfile: () => Promise<Profile>;

export const Greeting = (): JSX.Element => {
    const [name$, setName] = createState('');

    // Taken while the component mounts: the owner it is mounted in.
    const owner = getOwner();

    const load = async (): Promise<void> => {
        const profile = await fetchProfile();

        // After the `await`, no owner is current. A write needs none; something
        // made here that should go with the component is made in its owner, unless
        // the component was unmounted while the fetch was pending.
        setName(profile.name);

        if (owner === undefined || owner.disposed) {
            return;
        }

        owner.run(() => {
            name$.subscribe((name) => {
                console.info(`greeting ${name}`);
            });
        });
    };

    load().catch((error: unknown) => {
        console.error(error);
    });

    return <p>{name$.pipe(map((name) => `Hello, ${name}`))}</p>;
};
```

コンポーネントの中の `await` の後も同じです。コンポーネントが owner の中で実行されるのは return するまでなので、コンポーネントが始めた `async` 関数の中では、最初の `await` より後は owner が無い状態で実行されます。

## コンポーネントと同じだけ続く副作用

コンポーネントは 1 回しか呼ばれません。ほかのライブラリなら effect で実行する処理は、コンポーネントの本体で始めて、その owner が破棄されるときに止めます。

- `source.subscribe(next)` は、すぐに今の値で `next` を呼び、その後は値を変えた更新が落ち着くたびに 1 回呼びます。コンポーネントのマウント中に行った購読はコンポーネントの owner に属し、owner が破棄されると解除されます。owner より長く続けるときは `untracked` の中で購読します。`next` が行った書き込みは、今の更新の後に次の更新を始めます。今の更新に割り込むことはありません。
- `onCleanup(fn)` は、現在の owner が破棄されるときに `fn` を実行します。
- `listenInScope(target, type, listener, options)` は、`window` や `document` のように、コンポーネントが描く要素ではないものにイベントリスナーを登録し、owner が破棄されると外します。コンポーネントが描く要素には `onClick` などの props を使ってください。
- `createAfterUpdate()` は、処理を microtask で実行する関数を返します。実行されるのは、進行中の更新とそれによる DOM の変更が終わった後で、それまでに owner が破棄されていれば実行しません。コンポーネントのノードが document に入るのは、それを含む記述全体がマウントされた後なので、ノードが document に入っている必要がある処理（入力欄へのフォーカス、要素の計測）を最初のマウントの後に実行するにはこれを使います。

```tsx
import {
    constant,
    createAfterUpdate,
    listenInScope,
    type JSX,
} from 'synstate-dom-next';
import { createState } from 'synstate-next';

export const SearchBox = (): JSX.Element => {
    // Starts from the query saved last time.
    const [query$, setQuery] = createState(
        sessionStorage.getItem('search') ?? '',
    );

    // Saves the query whenever it changes. Subscribed while the component mounts,
    // so it belongs to the component's owner, which unsubscribes it: what an
    // effect would do.
    query$.subscribe((query) => {
        sessionStorage.setItem('search', query);
    });

    // Removed with the owner, so a closed branch leaves no listener behind.
    listenInScope(globalThis, 'keydown', (event) => {
        if (event instanceof KeyboardEvent && event.key === 'Escape') {
            setQuery('');
        }
    });

    // The input is in the document only once the whole description is mounted, so
    // it is focused after that.
    const afterUpdate = createAfterUpdate();

    let mut_input: HTMLInputElement | undefined = undefined;

    afterUpdate(() => {
        mut_input?.focus();
    });

    return (
        <input
            placeholder={constant('Search')}
            ref={(element) => {
                mut_input = element;
            }}
            value={query$}
            onInput={(event) => {
                setQuery(event.currentTarget.value);
            }}
        />
    );
};
```
