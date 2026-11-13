---
title: 値を派生させる
description: pipe と 3 種類のオペレーター、derive、merge と zip、値が変わらなければ止まること、追いかけずに値を読む方法。
---

## `pipe`

`observable.pipe(op)` は 1 つのオペレーターを適用します。さらに適用するときは、`a.pipe(map(f)).pipe(filter(p))` のように `pipe` をつなぎます。各オペレーターは、最初に持っている値をどう扱うかを、受け取る型と返す型で表しています。

| オペレーターの型              | 意味                                     | オペレーター                                                                                                                                                          |
| :---------------------------- | :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `KeepInitialValueOperator`    | ソースが値を持てば値を持つ               | `map`・`debounce`・`throttle`・`audit`・`take`・`takeUntil`・`skipIfNoChange`・`keepEqualParts`・`withBufferedFrom`                                                   |
| `DropInitialValueOperator`    | ソースにかかわらず値を持たないことがある | `filter`・`skip`・`takeWhile`（`inclusive` 付きは `Keep`）・`skipWhile`・`skipUntil`・`pairwise`・`switchMap`・`mergeMap`・`withCurrentValueFrom`・`dropInitialValue` |
| `ProvideInitialValueOperator` | 常に値を持つ                             | `scan`・`withInitialValue`                                                                                                                                            |

`pipe` は、オペレーターの型を結果の型に反映します。`.value` を持つ `InitializedObservable<A>` か、値を `getSnapshot()` が `Optional` で返す `Observable<A>` です。例は[概要](/mono/synstate-next/ja/getting-started/introduction/#pipe-で値を派生させる)にあります。

種類は、横に添えた印ではなく、オペレーターが受け取る型と返す型そのものに表れています。`ProvideInitialValueOperator` は `InitializedObservable` を返す型なので、値を持たないかもしれない Observable を返す自作のオペレーターは、キャストしない限りこの型になりません。

## `derive`

`derive(parents, fn)` は複数の Observable から 1 つの値を計算します。親のいくつが変わっても 1 回の更新で 1 回だけ計算し、持っている値と等しくなければ伝えます。引数をそのままタプルにして返す `fn` なら最新の値そのものが得られ、届いた更新のたびに伝わります。毎回新しいタプルなので、そこで止まることはありません。

```tsx
import { batch, createState, derive } from 'synstate-next';

const [price, setPrice] = createState(100);

const [quantity, setQuantity] = createState(2);

// Computed once per update, however many parents changed.
const total = derive([price, quantity], (p, q) => p * q);

assert.strictEqual(total.value, 200);

// The latest values as a tuple.
const pair = derive([price, quantity], (p, q) => [p, q] as const);

const mut_totals: number[] = [];

const mut_pairs: string[] = [];

total.subscribe((t) => {
    mut_totals.push(t);
});

pair.subscribe(([p, q]) => {
    mut_pairs.push(`${p} × ${q}`);
});

batch(() => {
    setPrice(50);

    setQuantity(4);
});

// 50 × 4 is 200 again: `total` stops the update there. `pair` builds a new
// tuple on every update, so it never does.
assert.deepStrictEqual(mut_totals, [200]);

assert.deepStrictEqual(mut_pairs, ['100 × 2', '50 × 4']);
```

必要な値は `fn` の中で計算してください。計算は 1 回で、結果が変わらなければ更新はそこで止まります。タプルを返すのは、`debounce` の入力のようにタプルそのものが必要なときだけにします。どちらの場合も、親がすべて値を持った時点で値を持ちます。

## `merge` と `zip`

`merge(parents)` は、どれかの親が流した値をそのまま流します（1 回の更新で複数が流したときは、その最初のもの）。作られた時点では、同じ規則で、値が最後に与えられた親の値から始めます。そうしたくないイベントのストリームは `dropInitialValue()` で終えてください。`zip(parents)` は各親の n 番目の値を組にし、いちばん遅い親を待ちます。

```tsx
import { createValueEmitter, merge, zip } from 'synstate-next';

const [mouse, emitMouse] = createValueEmitter<string>();

const [keyboard, emitKeyboard] = createValueEmitter<string>();

// Whichever emitted.
const input = merge([mouse, keyboard]);

// The n-th value of each, paired.
const pairs = zip([mouse, keyboard]);

const mut_inputs: string[] = [];

const mut_pairs: string[] = [];

input.subscribe((value) => {
    mut_inputs.push(value);
});

pairs.subscribe(([m, k]) => {
    mut_pairs.push(`${m} + ${k}`);
});

emitMouse('click');

emitMouse('drag');

emitKeyboard('a');

emitKeyboard('b');

assert.deepStrictEqual(mut_inputs, ['click', 'drag', 'a', 'b']);

assert.deepStrictEqual(mut_pairs, ['click + a', 'drag + b']);
```

## 値が変わらなければそこで止まる

値を計算するノード（`map`・`derive`・状態への書き込み）は、その値を持っている値と比べ（`equals` を渡さなければ `Object.is`）、等しければ何も伝えません。その下は辿られません。`switchMap` が（`Object.is` で）比べるのは切り替えたときだけです。新しい内側の Observable が持つ値は、持っている値と等しければ止まり、内側の Observable がその後に流す値はそのまま通ります。値を流すだけのオペレーター（`filter`・`take` など）は届いたものを流し、イベントを流すもの（`merge`・`zip`・`scan`・`pairwise`・時間系のオペレーター）は比較しません。

値にとってはこれが望ましい動きですが、イベントにとってはそうではありません。クリックのたびに `1` へ変換すると毎回 `1` になり、2 回目の `1` は変化なしとみなされてしまいます。結果が繰り返しうるイベントの `map` には、`equals: () => false` を渡してください。

```tsx
import { createEventEmitter, createState, map, scan } from 'synstate-next';

const [count, setCount] = createState(1);

const isEven = count.pipe(map((n) => n % 2 === 0));

let mut_computed = 0;

const label = isEven.pipe(
    map((even) => {
        mut_computed += 1;

        return even ? 'even' : 'odd';
    }),
);

setCount(3);

setCount(5);

// `isEven` stayed `false`, so nothing below it was visited.
assert.strictEqual(mut_computed, 1);

assert.strictEqual(label.value, 'odd');

// An event mapped to a value that repeats: pass `equals: () => false`, or
// the second one is taken for no change.
const [clicked, click] = createEventEmitter();

const steps = clicked.pipe(map(() => 1, { equals: () => false }));

const position = steps.pipe(scan((sum, step) => sum + step, 0));

click();

click();

assert.strictEqual(position.value, 2);
```

`skipIfNoChange` は逆の場合のためにあります。繰り返す値を落としたいイベントソースや、独自の比較をしたいときです。

## 追いかけずに読む: `withCurrentValueFrom`

親は子を計算し直させます。ただ読むだけにしたい値もあります。フォームの送信時のテキストであって、キー入力のたびのテキストではない、というような場合です。`withCurrentValueFrom(other)` は、ソースの各値を、同じ更新で新しくなった `other` の値と組にします。`other` だけが変わっても何も流しません。

```tsx
import {
    createEventEmitter,
    createState,
    map,
    withCurrentValueFrom,
} from 'synstate-next';

const [draft, setDraft] = createState('');

const [submitted, submit] = createEventEmitter();

// What the draft holds when the form is submitted. Typing alone sends
// nothing: `draft` is read, not followed.
const sent = submitted
    .pipe(withCurrentValueFrom(draft))
    .pipe(map(([, text]) => text, { equals: () => false }));

const mut_sent: string[] = [];

sent.subscribe((text) => {
    mut_sent.push(text);
});

setDraft('h');

setDraft('hello');

submit();

submit();

assert.deepStrictEqual(mut_sent, ['hello', 'hello']);
```

`withBufferedFrom(other)` は同じことを、前回から `other` が流したすべての値について行います。
