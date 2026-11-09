---
title: 状態と書き込み
description: createState とそのオプション、更新中に行った書き込みの扱い、batch、createReducer、createBooleanState、イベントエミッター。
---

## `createState` と 3 つ目の要素

`createState(initialState)` はタプルを返します。状態、そのセッター、そしてそれ以外の操作をまとめたオブジェクトです。タプルになっているので、状態は読むコードへ、セッターは書くコードへ、別々に渡せます。

```tsx
import { createState } from 'synstate-next';

const [count, setCount, { updateState, resetState, getSnapshot }] =
    createState(0);

const mut_seen: number[] = [];

count.subscribe((value) => {
    mut_seen.push(value);
});

setCount(10);

updateState((n) => n + 1);

// An equal value passes nothing on.
setCount(11);

assert.strictEqual(getSnapshot(), 11);

resetState();

assert.deepStrictEqual(mut_seen, [0, 10, 11, 0]);
```

| 要素           | 内容                                                      |
| :------------- | :-------------------------------------------------------- |
| `state`        | `InitializedObservable<S>`。`.value`・`subscribe`・`pipe` |
| `setState`     | 値を書き込む。今の値と等しい値は何も伝えない              |
| `updateState`  | `fn(current)` を書き込む                                  |
| `resetState`   | 初期値をもう一度書き込む                                  |
| `getSnapshot`  | 今の値を読む                                              |
| `initialState` | 最初の値                                                  |

セッターは何も返しません。更新が値を計算し直している間に `map` や `derive` などのオペレーターの中で行った書き込みは、進行中の更新の購読者と束縛が実行されてから適用される（下を参照）ので、返すべき値はまだ決まっていないからです。必要なら `getSnapshot` か `.value` で読んでください。

`state(initialValue)` は同じ状態をオブジェクトとして作ります。`.value`・`.set`・`.update` を持ち、まとめて扱いたいコードに向いています。

## 何を変化とみなすか

状態は、書き込みが値を変えるとき（`Object.is` で判定）にだけ伝えます。「変える」の意味は 2 つのオプションで変えられます。

- `equals: (current, next) => boolean` は比較を置き換えます。
- `keepEqualParts: true` にすると、書き込んだ値のうち今の値の同じ部分と深く等しい部分を、すべて今の値のもので置き換えます。毎回新しいオブジェクトを返すソースから丸ごと書き込む値でも、変わっていない部分は同一性を保つので、変わっていない部分を読む `map` は何も伝えず、深く等しい値なら何も伝わりません。

```tsx
import { createState, map } from 'synstate-next';

type User = Readonly<{
    name: string;
    tags: readonly string[];
}>;

// A server answers with a new object every time, equal or not.
const [user, setUser] = createState<User>(
    { name: 'Ada', tags: ['admin'] },
    { keepEqualParts: true },
);

const tags = user.pipe(map((u) => u.tags));

const mut_tagUpdates: (readonly string[])[] = [];

tags.subscribe((t) => {
    mut_tagUpdates.push(t);
});

const before = user.value;

// Deeply equal: nothing is passed on, and the object held stays.
setUser({ name: 'Ada', tags: ['admin'] });

assert.strictEqual(user.value, before);

// Only `name` changed: `tags` keeps its array, so `tags` passes nothing.
setUser({ name: 'Ada Lovelace', tags: ['admin'] });

assert.strictEqual(user.value.tags, before.tags);

assert.strictEqual(mut_tagUpdates.length, 1);

// `equals` decides what counts as a change.
const [point, setPoint] = createState(
    { x: 0, y: 0 },
    {
        equals: (current, next) => current.x === next.x && current.y === next.y,
    },
);

const mut_points: number[] = [];

point.subscribe((p) => {
    mut_points.push(p.x);
});

setPoint({ x: 0, y: 0 });

setPoint({ x: 1, y: 0 });

assert.deepStrictEqual(mut_points, [0, 1]);
```

## 更新中の書き込み

更新は 2 つの段階で進みます。まず、更新の届いた派生値を浅いものから計算し直します。次に、すべての値が新しくなった後で、購読者と synstate-dom-next の束縛が実行されます。ここから 2 つの規則が出てきますが、どちらも更新にとってもともと必要なことなので、実際に覚えておく必要はありません。

- **更新が値を計算し直している間に `map` や `derive` などのオペレーターの中で行った書き込みは、更新が終わるまで待ちます。** 状態に書き込む `map` があっても、進行中の更新は中断されません。書き込みはその更新の購読者と束縛が実行されてから順に適用され、次の更新を始めます。`update(fn)` は `fn` そのものを遅らせるので、1 回の更新の中で呼んだ 2 つの `update` はどちらも適用されます。
- **購読者や束縛が行った書き込みは次の更新を始めます。** 更新が入れ子になることはありません。

どちらの場合も、購読者やオペレーターから自分の更新の届く先に書き込み続けるプログラムは、無限ループにならず、更新が 100 回続いたところで原因を示すエラーで止まります。

したがって購読者からの書き込みは動きますが、それは 2 回目の更新です。両方の値を読むものは、1 回目が済んで 2 回目がまだの状態を目にします。代わりに値を派生させれば、同じ更新の一部になります。

```tsx
import { createState, derive, map } from 'synstate-next';

// Kept in step by a subscriber (avoid this):
const [celsius, setCelsius] = createState(0);

const [fahrenheit, setFahrenheit] = createState(32);

celsius.subscribe((c) => {
    setFahrenheit((c * 9) / 5 + 32);
});

const label = derive([celsius, fahrenheit], (c, f) => `${c}°C = ${f}°F`);

const mut_labels: string[] = [];

label.subscribe((text) => {
    mut_labels.push(text);
});

setCelsius(100);

// The subscriber's write is an update of its own, so `label` showed the
// update half done.
assert.deepStrictEqual(mut_labels, [
    '0°C = 32°F',
    '100°C = 32°F',
    '100°C = 212°F',
]);

// Derived instead: one update, nothing half done.
const [celsius2, setCelsius2] = createState(0);

const fahrenheit2 = celsius2.pipe(map((c) => (c * 9) / 5 + 32));

const label2 = derive([celsius2, fahrenheit2], (c, f) => `${c}°C = ${f}°F`);

const mut_labels2: string[] = [];

label2.subscribe((text) => {
    mut_labels2.push(text);
});

setCelsius2(100);

assert.deepStrictEqual(mut_labels2, ['0°C = 32°F', '100°C = 212°F']);
```

## `batch`

更新の外の書き込みは、1 つ 1 つがそれぞれ 1 回の更新です。`batch(fn)` は `fn` の中の書き込みを 1 回の更新にまとめるので、そのうちいくつかに依存するものは、すべてを反映した値で 1 回だけ計算されます。

```tsx
import { batch, createState, derive } from 'synstate-next';

const [first, setFirst] = createState('Ada');

const [last, setLast] = createState('Lovelace');

const fullName = derive([first, last], (f, l) => `${f} ${l}`);

const mut_seen: string[] = [];

fullName.subscribe((name) => {
    mut_seen.push(name);
});

// Two writes, two updates.
setFirst('Grace');

setLast('Hopper');

// Two writes, one update.
batch(() => {
    setFirst('Alan');

    setLast('Turing');
});

assert.deepStrictEqual(mut_seen, [
    'Ada Lovelace',
    'Grace Lovelace',
    'Grace Hopper',
    'Alan Turing',
]);
```

batch の中で 2 回書き込んだ状態は、最後の値で 1 回だけ伝わります。

## `createReducer`

reducer を通してだけ書き込む状態です。`dispatch` は何も返しません。更新が値を計算し直している間に `map` や `derive` などのオペレーターの中で行った dispatch はほかの書き込みと同じくその更新の購読者と束縛が実行されるまで待ち、それより前の書き込みが残した状態に対して reduce します。

```tsx
import { createReducer } from 'synstate-next';

type Action = Readonly<
    | { type: 'increment' }
    | { type: 'decrement' }
    | { type: 'set'; value: number }
>;

const reducer = (current: number, action: Action): number => {
    switch (action.type) {
        case 'increment':
            return current + 1;

        case 'decrement':
            return current - 1;

        case 'set':
            return action.value;
    }
};

const [count, dispatch, { getSnapshot }] = createReducer(reducer, 0);

const mut_seen: number[] = [];

count.subscribe((value) => {
    mut_seen.push(value);
});

dispatch({ type: 'increment' });

dispatch({ type: 'increment' });

dispatch({ type: 'set', value: 10 });

dispatch({ type: 'decrement' });

assert.strictEqual(getSnapshot(), 9);

assert.deepStrictEqual(mut_seen, [0, 1, 2, 10, 9]);
```

## `createBooleanState`

`createState` のセッターに加えて、`setTrue`・`setFalse`・`toggle` を持つ真偽値の状態です。

```tsx
import { createBooleanState } from 'synstate-next';

const [isOpen, { setTrue: open, setFalse: close, toggle }] =
    createBooleanState(false);

const mut_seen: boolean[] = [];

isOpen.subscribe((value) => {
    mut_seen.push(value);
});

open();

// Already open: nothing is passed on.
open();

toggle();

close();

assert.deepStrictEqual(mut_seen, [false, true, false]);
```

## イベント: `createEventEmitter`・`createValueEmitter`・`source`

状態は値を持ち、それと等しい書き込みは落とします。イベントは最初に発火するまで何も持たず、直前の値と等しいかどうかにかかわらず、発火のたびに伝わります。2 回のクリックは 2 回のクリックです。更新が届ける前に複数の値が与えられたときは、それぞれを別の更新で順に届けます。

```tsx
import {
    createEventEmitter,
    createValueEmitter,
    scan,
    source,
} from 'synstate-next';

// An event holds nothing until it first fires, and every `emit` passes on,
// equal to the last or not.
const [clicked, click] = createEventEmitter();

const clicks = clicked.pipe(scan((n) => n + 1, 0));

click();

click();

assert.strictEqual(clicks.value, 2);

const [keyPressed, pressKey] = createValueEmitter<string>();

const mut_keys: string[] = [];

keyPressed.subscribe((key) => {
    mut_keys.push(key);
});

pressKey('a');

pressKey('a');

assert.deepStrictEqual(mut_keys, ['a', 'a']);

// Both are `source()`, with the function taken off.
const messages = source<string>();

assert.isFalse(messages.hasValue);

messages.next('hello');

assert.strictEqual(messages.getSnapshot(), 'hello');
```
