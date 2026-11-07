---
title: 要素
description: 属性、プロパティ、class、style、イベント、ref、SVG。
---

組み込み要素の props は `lib.dom.d.ts` から生成されるので、エディタが補完し、型をチェックします。要素の書き込み可能なプリミティブ型の DOM プロパティ（`id`、`disabled`、`value`、`tabIndex` など）はその型の `Bindable` を、`aria-*` は文字列・数値・真偽値（`"true"` / `"false"` として書き込みます）の `Bindable` を、`data-*` は `Bindable<string>` を受け取り、イベントにはそれぞれ専用のハンドラがあります。

Observable を束縛した prop は、それぞれ 1 つの effect です。要素と書き込む名前を持つ小さなオブジェクトで、その Observable を変える更新のあとに実行されます。constant を渡した prop は要素を作るときに 1 回書き込まれるだけで、何も作りません。

## 属性とプロパティ

```tsx
import { constant, type JSX } from 'synstate-dom-next';
import { createBooleanState, createState, map } from 'synstate-next';

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
            disabled={agreed$.pipe(map((agreed) => !agreed))}
        >
            {constant('Sign up')}
        </button>
    </div>
);
```

- ほとんどの props は `setAttribute` で書き込みます。`value`、`checked`、`selected`、`indeterminate` など一部の props は、ユーザーの操作につれて属性と実際の値がずれていくので、代わりに DOM プロパティとして書き込みます（`element.value = v`）。
- `<input>` に束縛した `checked` と `indeterminate` は制御されます。`change` の後、次のアニメーションフレームかタスクの早い方で、束縛した値に戻します。そのため `onChange` が受け入れなかった変更は、描画される前に元に戻ります。上のチェックボックスで `toggleAgreed` を呼ばなかった場合がそうです。フレームが描かれない非表示のページでも戻ります。ユーザーが自由に切り替えられるチェックボックスにするなら、代わりに `defaultChecked` を渡してください。ラジオボタンのグループでは、すべてのボタンを束縛してください。
- `disabled` のような真偽値の属性は `Bindable<boolean>` を受け取り、値が `false` の間は取り除かれます。

## `class` と `style`

```tsx
import { constant, type JSX } from 'synstate-dom-next';
import { createBooleanState, createState, map } from 'synstate-next';

const [isActive$] = createBooleanState(false);

const [progress$] = createState(0.3);

export const Item = (): JSX.Element => (
    // One `Bindable<boolean>` per class name: each is toggled on its own.
    <li class={{ item: constant(true), active: isActive$ }}>
        {/* Or the whole class as one string. Never both on one element. */}
        <span class={isActive$.pipe(map((active) => (active ? 'on' : 'off')))}>
            {constant('status')}
        </span>
        {/* One `Bindable<string>` per hyphenated CSS property name. */}
        <div
            style={{
                width: progress$.pipe(map((p) => `${p * 100}%`)),
                'background-color': constant('teal'),
            }}
        />
    </li>
);
```

- `class` は、1 つの `Bindable<string>` か、クラス名ごとに `Bindable<boolean>` を 1 つずつ持つオブジェクトを受け取ります。オブジェクトの場合、各クラスは `classList.toggle` で個別に切り替わります。1 つの要素で両方を使わないでください。クラス文字列全体を書き込むと、オブジェクトで切り替えたクラスが消えてしまいます。オブジェクトの型は `ClassObject` として export しています。
- `style` は、`cssText` の文字列か、CSS プロパティごとに `Bindable<string | undefined>` を 1 つずつ持つオブジェクト（`StyleObject`）を受け取ります。各プロパティは `style.setProperty` で書き込むので、キーはハイフン区切りの名前（`'background-color'`、`'--accent'`）です。`undefined` はそのプロパティを取り除きます。

## イベントと `ref`

```tsx
import { constant, type JSX } from 'synstate-dom-next';
import { createState, map, onCleanup } from 'synstate-next';

const [position$, setPosition] = createState('');

const [width$, setWidth] = createState(0);

const resizeObserver = new ResizeObserver((entries) => {
    setWidth(entries[0]?.contentRect.width ?? 0);
});

export const Pad = (): JSX.Element => (
    <div
        ref={(element) => {
            // Called once, right after the element is created and before anything is
            // bound or its children are mounted, in the owner the element mounts in.
            resizeObserver.observe(element);

            onCleanup(() => {
                resizeObserver.unobserve(element);
            });
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
        {width$.pipe(map((w) => ` in a pad ${Math.round(w)}px wide`))}
    </div>
);
```

- ハンドラの名前は、`on` の後にイベント名をパスカルケースで続けたものです：`onClick`、`onInput`、`onPointerDown`。`currentTarget` は要素の型に絞り込まれます。ハンドラは常に関数で、Observable にはなりません。
- ハンドラは、要素がその `on…` プロパティを持っていればそこに代入し（`element.onclick`）、持っていなければ `addEventListener` で追加します。どちらも取り外しません。要素はそれを作った owner と一緒に手放され、ハンドラも一緒に消えるからです。自分のコードで `element.onclick` に代入すると、ハンドラが置き換わります。
- `ref` は、要素が作られた直後、何かが束縛されたり子がマウントされたりする前に、その要素を引数に 1 回だけ呼ばれます。要素がマウントされる owner の中で呼ばれるので、そこで `onCleanup` を登録すれば、要素が消えるときに始めたことを元に戻せます。

## SVG

```tsx
import { constant, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';

const [radius$] = createState(10);

// Everything inside `<svg>` is created in the SVG namespace, down to a
// `<foreignObject>`, whose contents are HTML again.
export const Dot = (): JSX.Element => (
    <svg viewBox={constant('0 0 100 100')} width={constant(100)}>
        {/* `a` and `title` are SVG elements here, because of where they stand. */}
        <a href={constant('#dot')}>
            <title>{constant('A dot')}</title>
            <circle
                cx={constant(50)}
                cy={constant(50)}
                r={radius$}
                fill={radius$.pipe(map((r) => (r > 30 ? 'tomato' : 'teal')))}
            />
        </a>
        <foreignObject
            x={constant(0)}
            y={constant(80)}
            width={constant(100)}
            height={constant(20)}
        >
            {/* HTML again: a real `<p>`, laid out as text. */}
            <p>{radius$.pipe(map((r) => `r = ${r}`))}</p>
        </foreignObject>
    </svg>
);
```

要素の名前空間は、タグではなくマウントされる場所で決まります。`<svg>` の中のものはすべて SVG の名前空間で作られ、`<foreignObject>` の子でまた HTML に戻ります。そのため、両方にある `<a>`、`<title>`、`<script>`、`<style>` は、`<svg>` の中では SVG の要素に、それ以外では HTML の要素になります。`<svg>` の中にマウントしたコンポーネントも、どこで書かれたかにかかわらず SVG の要素を作ります。

型はこれについていけません。JSX の要素の型は、それが置かれる場所によって変えられないからです。SVG にしかないタグは、決まった属性の一覧を受け取り、それぞれが `Bindable<number | string>` です。そのプロパティは素の値ではなく `SVGAnimatedLength` などだからです。`<a>`、`<title>`、`<script>`、`<style>` は、`<svg>` の中でも HTML の要素の props（`ref` も含む）のままです。`<svg>` の中の `<a>` の `href` は属性として書き込まれ、SVG はそれを読みます。
