---
title: 要素
description: 属性、プロパティ、class、style、イベント、ref、SVG。
---

組み込み要素の props は `lib.dom.d.ts` から生成されるので、エディタが補完し型を検査する。要素の書き込み可能なプリミティブ型の DOM プロパティ（`id`、`disabled`、`value`、`tabIndex` など）はその型の `Bindable`、`aria-*` と `data-*` は `Bindable<string>`、イベントはそれぞれのハンドラになる。

## 属性とプロパティ

```tsx
import { createBooleanState, createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [name$, setName] = createState('');

const [agreed$, { toggle: toggleAgreed }] = createBooleanState(false);

export const SignUp = (): JSX.Element => (
    <div id={constant('sign-up')} data-step={constant('1')}>
        {/* `value` and `checked` are written as properties, which is what
        stays in step with the user's input. */}
        <input
            value={name$}
            placeholder={constant('Your name')}
            aria-label={constant('Name')}
            onInput={(event) => {
                setName(event.currentTarget.value);
            }}
        />
        <input
            type={constant('checkbox')}
            checked={agreed$}
            onChange={() => {
                toggleAgreed();
            }}
        />
        {/* A boolean attribute is removed while its value is `false`. */}
        <button
            type={constant('submit')}
            disabled={view(agreed$, (agreed) => !agreed)}
        >
            {constant('Sign up')}
        </button>
    </div>
);
```

- ほとんどの props は `setAttribute` で書く。`value`・`checked`・`selected`・`indeterminate` のように、ユーザーの操作で属性と実際の値がずれるものは DOM のプロパティとして書く（`element.value = v`）。
- `disabled` などの真偽属性は `Bindable<boolean>` を受け取り、値が `false` の間は属性を外す。

## `class` と `style`

```tsx
import { createBooleanState, createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [isActive$] = createBooleanState(false);

const [progress$] = createState(0.3);

export const Item = (): JSX.Element => (
    // One `Bindable<boolean>` per class name: each is toggled on its own.
    <li class={{ item: constant(true), active: isActive$ }}>
        {/* Or the whole class as one string. Never both on one element. */}
        <span class={view(isActive$, (active) => (active ? 'on' : 'off'))}>
            {constant('status')}
        </span>
        {/* One `Bindable<string>` per hyphenated CSS property name. */}
        <div
            style={{
                width: view(progress$, (p) => `${p * 100}%`),
                'background-color': constant('teal'),
            }}
        />
    </li>
);
```

- `class` は 1 つの `Bindable<string>` か、クラス名ごとに `Bindable<boolean>` を持つオブジェクトのどちらかで、後者は `classList.toggle` でクラスごとに個別に切り替える。1 つの要素で両方は使えない。クラス文字列全体を書くと、オブジェクトで切り替えたクラスが消えてしまうためである。
- `style` は `cssText` の文字列か、CSS プロパティごとに `Bindable<string>` を持つオブジェクトのどちらか。各プロパティを `style.setProperty` で書くので、キーはハイフン区切りの名前（`'background-color'`、`'--accent'`）である。

## イベントと `ref`

```tsx
import { createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [position$, setPosition] = createState('');

const [width$, setWidth] = createState(0);

const resizeObserver = new ResizeObserver((entries) => {
    setWidth(entries[0]?.contentRect.width ?? 0);
});

export const Pad = (): JSX.Element => (
    <div
        ref={(element) => {
            // Called once, right after the element is created and before anything
            // is bound or its children are mounted.
            resizeObserver.observe(element);
        }}
        onPointerMove={(event) => {
            // `currentTarget` is narrowed to the element: HTMLDivElement here.
            const rect = event.currentTarget.getBoundingClientRect();

            setPosition(
                `${Math.round(event.clientX - rect.left)}, ${Math.round(event.clientY - rect.top)}`,
            );
        }}
    >
        {constant('Pointer at ')}
        {position$}
        {view(width$, (w) => ` in a pad ${Math.round(w)}px wide`)}
    </div>
);
```

- ハンドラの名前は `on` にイベント名を PascalCase でつなげたもの（`onClick`、`onInput`、`onPointerDown`）。`currentTarget` は要素の型に絞られる。ハンドラは関数で、Observable は受け付けない。束縛したスコープが破棄されると外れる。
- `ref` は要素を作った直後、何も束縛せず子もマウントしないうちに、要素を引数に 1 回呼ばれる。

## SVG

```tsx
import { createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [radius$] = createState(10);

// `svg` and `circle` are created in the SVG namespace.
export const Dot = (): JSX.Element => (
    <svg viewBox={constant('0 0 100 100')} width={constant(100)}>
        <circle
            cx={constant(50)}
            cy={constant(50)}
            r={radius$}
            fill={view(radius$, (r) => (r > 30 ? 'tomato' : 'teal'))}
        />
    </svg>
);
```

`SVGElementTagNameMap` のうち HTML にないタグは SVG の名前空間で作る。SVG のプロパティは `SVGAnimatedLength` などなので HTML のように `lib.dom.d.ts` から型を読み取れず、SVG の要素が受け付ける属性は一覧で決まっていて、それぞれ `Bindable<number | string>` を受け取る。`a`・`script`・`style`・`title` は HTML にもあるので、常に HTML の要素として作る。
