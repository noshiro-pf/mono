---
title: Preact Signals
description: synstate の Observable と Preact Signals を双方向につなぐ synstate-preact-signals です。
---

`synstate-preact-signals` は synstate の Observable と [Preact Signals](https://preactjs.com/guide/v10/signals/) を双方向につなぎます。JSX に置いた signal は、コンポーネントを描き直さずにそれを表示している DOM ノードを更新します。synstate のオペレーターで派生させた値も、同じ細かさの更新でページに届きます。

```sh
npm install synstate synstate-preact-signals preact @preact/signals
```

このパッケージは synstate が export するものを `createState`・`createReducer`・`createBooleanState` 以外すべて re-export し、この 3 つは `ReadonlySignal` を返す版に置き換えます。

## Observable から signal へ

`toSignal(observable)` は Observable に従う `ReadonlySignal` を返します。

```tsx
import type * as Preact from 'preact';
import { createState } from 'synstate';
import { toSignal } from 'synstate-preact-signals';

const [count$, setCount] = createState(0);

const countSignal = toSignal<number>(count$);

const Counter = (): Preact.JSX.Element => {
    // No hooks needed — only this text node updates, not the whole component
    return (
        <div>
            <span>{countSignal}</span>
            <button
                onClick={() => {
                    setCount(countSignal.value + 1);
                }}
            >
                {'+1'}
            </button>
        </div>
    );
};
```

## signal から Observable へ

`fromSignal(signal)` は signal の値の Observable を返します。非同期のものも含め、synstate のオペレーターが signal を追えるようになります。

```tsx
import { signal } from '@preact/signals';
import { debounce } from 'synstate';
import { fromSignal } from 'synstate-preact-signals';

const input = signal('');

const [input$, dispose] = fromSignal(input);

const debouncedInput$ = input$.pipe(debounce(300));
```

owner の中（`switchMap` の射影、synstate-dom の行や分岐）で呼ぶと、その owner が破棄されたときに signal を追うのをやめます。それ以外では、要らなくなったら返された `dispose` を呼んでください。

## 状態を signal として使う

`createState`・`createBooleanState`・`createReducer` は、`synstate-preact-hooks` が返すフックの代わりに signal を返します。

```tsx
import type * as Preact from 'preact';
import { createState } from 'synstate-preact-signals';

const [countSignal, setCount, { updateState, resetState }] = createState(0);

const Counter = (): Preact.JSX.Element => (
    <div>
        <span>{countSignal}</span>
        <button
            onClick={() => {
                updateState((n) => n + 1);
            }}
        >
            {'+1'}
        </button>
        <button onClick={resetState}>{'Reset'}</button>
    </div>
);
```

オペレーターを橋渡しの synstate 側に置く理由は [Signals の上のオペレーター](/mono/synstate/ja/comparison/operators-on-signals/) にあります。signal は値を持つものなので、signal を通ったイベントや順序は失われます。
