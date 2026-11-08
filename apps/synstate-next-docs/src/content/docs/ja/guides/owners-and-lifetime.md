---
title: owner と寿命
description: createOwner・createRootOwner・run・dispose・onCleanup・getOwner・untracked。synstate-next のあらゆるものが持つ、ただ 1 つの寿命。
---

## すべては owner に属する

owner は寿命です。`run` の実行中に作ったものはすべてその owner に属します。派生 Observable、購読、タイマー、リクエスト、`onCleanup` で登録したクリーンアップ、その中で作った owner です。`dispose()` はそれらを新しいものから順に破棄します。まず子の owner、次にクリーンアップ、最後に Observable です。

```tsx
import { createRootOwner, createState, map, onCleanup } from 'synstate-next';

const [count, setCount] = createState(0);

const mut_log: string[] = [];

const owner = createRootOwner();

const doubled = owner.run(() => {
    const d = count.pipe(map((n) => n * 2));

    d.subscribe((value) => {
        mut_log.push(`doubled: ${value}`);
    });

    onCleanup(() => {
        mut_log.push('cleaned up');
    });

    return d;
});

setCount(1);

owner.dispose();

// The subscription and the derived node went with the owner.
setCount(2);

assert.deepStrictEqual(mut_log, ['doubled: 0', 'doubled: 2', 'cleaned up']);

assert.strictEqual(doubled.value, 2);
```

破棄した Observable はグラフから外れ、二度と値を流しません。最後に持っていた値は保ちます。

## 入れ子

`createOwner()` は実行中の owner の子を作り、`createRootOwner()` は親のない owner を作ります。親のない owner を破棄できるのは、その owner 自身の `dispose` だけです。子は単独で破棄できます。ページより先にダイアログを閉じるのと同じです。親を破棄すると、残っているものが破棄されます。

```tsx
import {
    createOwner,
    createRootOwner,
    getOwner,
    onCleanup,
} from 'synstate-next';

const mut_log: string[] = [];

const page = createRootOwner();

const dialog = page.run(() => {
    onCleanup(() => {
        mut_log.push('page');
    });

    // A child of the owner that is running: `page`.
    const child = createOwner();

    child.run(() => {
        onCleanup(() => {
            mut_log.push('dialog');
        });
    });

    return child;
});

assert.strictEqual(dialog.parent, page);

// Closing the dialog alone.
dialog.dispose();

// Disposing the page disposes what is left of it.
page.dispose();

assert.deepStrictEqual(mut_log, ['dialog', 'page']);

// Outside every `run`, there is no current owner.
assert.isUndefined(getOwner());
```

synstate-dom-next はすべての寿命をこの上に作っています。`render` がルートの owner を作り、`If`・`Switch` などの分岐のコンポーネントの各分岐とリストの各行は、それぞれ専用の owner の中でマウントされます。

## どの owner の外でも

どの `run` の外で実行したコードが作る Observable は、何にも破棄されません。ページと同じだけ生きるモジュールレベルのストアならそれで正しく、いずれ終わるべきものにとっては誤りです。どの owner の外で `onCleanup` を呼ぶと警告が出ます。そのクリーンアップは決して実行されないからです。

## `untracked`

`untracked(fn)` は、実行中の owner がない状態で `fn` を実行するので、そこで作ったものは呼び出し元より長く生きます。キャッシュのように、共有するものをたまたま最初の呼び出し元が作る場合に使います。

```tsx
import {
    createRootOwner,
    createState,
    map,
    untracked,
    type InitializedObservable,
} from 'synstate-next';

const [count, setCount] = createState(1);

const mut_cache = new Map<string, InitializedObservable<number>>();

// A cache shared by every caller: what it creates must not go when the
// first caller's owner does.
const squared = (): InitializedObservable<number> => {
    const cached = mut_cache.get('squared');

    if (cached !== undefined) {
        return cached;
    }

    const created = untracked(() => count.pipe(map((n) => n ** 2)));

    mut_cache.set('squared', created);

    return created;
};

const first = createRootOwner();

const s = first.run(squared);

first.dispose();

setCount(3);

// Still following `count`.
assert.strictEqual(s.value, 9);
```

購読者・束縛と派生値の再計算は、常に実行中の owner がない状態で動きます。購読者が作ったものが、たまたま書き込みを行った owner に属してしまうことはありません。

## 完了はない

`complete` はありません。もう値を流せないソース（発火した `timer`、決着した Promise）は **settled** になり、owner に破棄されるまで値と購読者を保ちます。完了をなくした理由と、オペレーターの中で何がそれに代わっているかは、[完了がない理由](/mono/synstate-next/ja/internals/why-no-completion/)にあります。
