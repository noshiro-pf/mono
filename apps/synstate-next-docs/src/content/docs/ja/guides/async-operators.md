---
title: 非同期オペレーター
description: debounce・throttle・audit、Promise と組み合わせる switchMap と mergeMap、timer と counter、fromSubscribable。
---

アプリケーションの時間は、非同期オペレーターと非同期ソースから生まれます。それらが後から生み出す値は、1 つ 1 つがそれぞれ 1 回の更新になり、普通の書き込みと同じように進みます。

## `debounce`・`throttle`・`audit`

連続する値をならす 3 つの方法です。

- `debounce(ms)`: 次の値が来ないまま `ms` 経ったときの最後の値。
- `throttle(ms)`: 最初の値をすぐに流し、その後 `ms` の間は何も流さない。
- `audit(ms)`: 連続の最初の値から `ms` 後の最新の値。

```tsx
import { audit, debounce, source, throttle } from 'synstate-next';

const keys = source<string>();

const mut_debounced: string[] = [];

const mut_throttled: string[] = [];

const mut_audited: string[] = [];

// The last value, once 100 ms pass without another.
keys.pipe(debounce(100)).subscribe((k) => {
    mut_debounced.push(k);
});

// The first value at once, then nothing for 100 ms.
keys.pipe(throttle(100)).subscribe((k) => {
    mut_throttled.push(k);
});

// The latest value, 100 ms after the first of a burst.
keys.pipe(audit(100)).subscribe((k) => {
    mut_audited.push(k);
});

keys.emit('a');

await vi.advanceTimersByTimeAsync(40);

keys.emit('b');

await vi.advanceTimersByTimeAsync(40);

keys.emit('c');

await vi.advanceTimersByTimeAsync(200);

assert.deepStrictEqual(mut_debounced, ['c']);

assert.deepStrictEqual(mut_throttled, ['a']);

assert.deepStrictEqual(mut_audited, ['c']);
```

状態に付けたときは、どれも状態が最初に持っている値を持つので、結果は `InitializedObservable` のままです。破棄すると、待っていた値は捨てられます。

## `switchMap`: 最新のものだけ

`switchMap(project)` は、最新の値に対して `project` が返す Observable を追いかけ、それまで追っていたものを破棄します。リクエストに使えば、新しいリクエストを出した後に返ってきた古い応答は決して見えません。

```tsx
import {
    createState,
    fromPromise,
    just,
    switchMap,
    type Observable,
} from 'synstate-next';
import { Result } from 'ts-std-forge';

type User = Readonly<{ id: number; name: string }>;

const [selectedId, setSelectedId] = createState<number | undefined>(undefined);

// `fetchUser(id, ms)` stands for a request: it resolves to the user after
// `ms` milliseconds.
const user: Observable<Result<User | undefined, unknown>> = selectedId.pipe(
    switchMap((id): Observable<Result<User | undefined, unknown>> =>
        // A branch with nothing to wait for is `just(...)`.
        id === undefined
            ? just(Result.ok(undefined))
            : fromPromise(fetchUser(id, id === 1 ? 300 : 100)),
    ),
);

const mut_names: (string | undefined)[] = [];

user.subscribe((result) => {
    if (Result.isOk(result)) {
        mut_names.push(result.value?.name);
    }
});

setSelectedId(1);

// The answer for user 1 comes after the one for user 2 and is dropped:
// `switchMap` follows only the latest request.
setSelectedId(2);

await vi.advanceTimersByTimeAsync(500);

assert.deepStrictEqual(mut_names, [undefined, 'user 2']);
```

射影の中で作ったものは専用の owner に属し、次の値が来て置き換わるときに破棄されます。そこで作った `fromAbortablePromise` は中断され、`timer` は止まります。待つものがない分岐は `just(value)`、何も追わない分岐は `empty()` です。

## `mergeMap`: すべて

`mergeMap(project)` は、`project` が返す Observable をすべて追いかけ、それぞれがもう何も流せなくなった（Promise が決着した、タイマーが発火した）ところで手放します。値はすべて、届いた順に届けられます。

```tsx
import { createValueEmitter, fromPromise, mergeMap } from 'synstate-next';
import { Result } from 'ts-std-forge';

const [fileChosen, chooseFile] =
    createValueEmitter<Readonly<{ name: string; size: number }>>();

// `upload(name, size)` stands for a request that takes longer for a bigger
// file.
// Every upload runs to the end, and each outcome is delivered, in the
// order they come.
const uploaded = fileChosen.pipe(
    mergeMap((file) => fromPromise(upload(file.name, file.size))),
);

const mut_done: string[] = [];

uploaded.subscribe((result) => {
    if (Result.isOk(result)) {
        mut_done.push(result.value);
    }
});

chooseFile({ name: 'big.png', size: 300 });

chooseFile({ name: 'small.png', size: 100 });

await vi.advanceTimersByTimeAsync(500);

assert.deepStrictEqual(mut_done, ['small.png uploaded', 'big.png uploaded']);
```

## `timer` と `counter`

`timer(ms)` は作ってから `ms` 後に `0` を 1 回流します。`counter(ms)` は `ms` ごとに `0`・`1`・`2`… と流します。どちらも作った時点で始まるので、始めたい場所で、止めるべき owner の中で作ってください。

```tsx
import { counter, createRootOwner, timer } from 'synstate-next';

const owner = createRootOwner();

const mut_ticks: number[] = [];

owner.run(() => {
    // Starts now, where it is created, and belongs to `owner`.
    const ticks = counter(1000);

    ticks.subscribe((n) => {
        mut_ticks.push(n);
    });

    // Emits `0` once, after 500 ms, and settles.
    const delay = timer(500);

    delay.subscribe(() => {
        mut_ticks.push(-1);
    });
});

await vi.advanceTimersByTimeAsync(2500);

assert.deepStrictEqual(mut_ticks, [0, -1, 1, 2]);

// Disposing the owner clears the counter's timer.
owner.dispose();

await vi.advanceTimersByTimeAsync(5000);

assert.deepStrictEqual(mut_ticks, [0, -1, 1, 2]);
```

## Promise と他のライブラリ

- `fromPromise(promise)` は `Result.ok(value)` か `Result.err(error)` を 1 回流し、終わります（settled になります）。
- `fromAbortablePromise((signal) => promise)` も同じことをし、破棄されると、Promise が決着していてもいなくてもシグナルを中断します。そのため、レスポンスボディは例のようにファクトリの中で読んでください。後で読むと途中で切られることがあります。それに続く reject では何も流しません。
- `fromSubscribable(subscribable)` は、RxJS の Observable や TC39 の `Observable` のように、オブザーバーオブジェクト（`next`・`error`・`complete`）で購読するものなら何でも追いかけます。値は `Result.ok`、エラーは `Result.err` として届きます。

```tsx
import { fromSubscribable, type Subscribable } from 'synstate-next';
import { Optional, Result } from 'ts-std-forge';

// Anything subscribed to with an observer object: an RxJS observable, a
// TC39 `Observable`, or this.
const words: Subscribable<string> = {
    subscribe: (observer) => {
        observer.next('hello');

        observer.next('world');

        observer.complete();

        return { unsubscribe: () => {} };
    },
};

const followed = fromSubscribable(words);

// A value given while it subscribes is held from the start.
assert.deepStrictEqual(
    followed.getSnapshot(),
    Optional.some(Result.ok('world')),
);
```
