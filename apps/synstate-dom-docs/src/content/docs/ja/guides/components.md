---
title: コンポーネント
description: Bindable を受け取る props、一度だけ読む props、子要素。
---

コンポーネントは props から `JSX.Element` への関数で、マウント時に 1 回だけ呼ばれる。コンポーネントごとの状態や effect の API はない。状態は synstate の Observable で、コンポーネントが表示するものはそれに束縛される。

## props は Bindable

データを受け取るコンポーネントは `Bindable<T>` を受け取る。呼び出し側は Observable・定数・`view` のどれでも渡せる。

```tsx
import { createState } from 'synstate';
import {
    constant,
    mapBindable,
    render,
    type Bindable,
    type JSX,
} from 'synstate-dom';

type BadgeProps = Readonly<{
    label: Bindable<string>;
    count: Bindable<number>;
}>;

// Props are plain values holding bindables, so destructuring them is safe:
// the component is called once and binds what it was given.
const Badge = ({ label, count }: BadgeProps): JSX.Element => (
    <span>
        {label}
        {mapBindable(count, (n) => (n > 99 ? ' (99+)' : ` (${n})`))}
    </span>
);

const [unread$, setUnread] = createState(3);

const Inbox = (): JSX.Element => (
    <nav>
        {/* A constant stays a constant: nothing is subscribed for it. */}
        <Badge label={constant('Inbox')} count={unread$} />
        <Badge label={constant('Archive')} count={constant(120)} />
        <button
            type={constant('button')}
            onClick={() => {
                setUnread(0);
            }}
        >
            {constant('Mark all read')}
        </button>
    </nav>
);

render(Inbox, document.body);
```

props が持つのは、後の再描画で置き換わる値ではなく Bindable なので、分割代入しても何も失われない。`mapBindable` と `derive` を使えば（[Bindable](/mono/synstate-dom/ja/guides/bindable/#bindable-を受け取る側-mapbindablederivetoobservable) を参照）、渡された定数は定数のままでグラフに入らない。

## 一度だけ読む props

初期値として一度だけ読む props は `Constant<T>` で受ける。

```tsx
import { createState } from 'synstate';
import { constant, type Constant, type JSX } from 'synstate-dom';

// `initial` is read once, when the component is called. Typing it
// `Constant<number>` says so: an observable or a plain number is an error.
const Stepper = ({
    initial,
}: Readonly<{ initial: Constant<number> }>): JSX.Element => {
    const [value$, , { updateState }] = createState<number>(initial);

    return (
        <button
            type={constant('button')}
            onClick={() => {
                updateState((n) => n + 1);
            }}
        >
            {value$}
        </button>
    );
};

export const Form = (): JSX.Element => <Stepper initial={constant(10)} />;
```

呼び出し側は `initial={constant(10)}` と書くことになり、Observable も素の数値も型エラーになる。一度だけ読むことが、名前の慣習ではなく型に表れる。コンポーネントの中では `Constant<T>` をそのまま `T` として使える。

## 子要素

```tsx
import { constant, type Child, type JSX } from 'synstate-dom';

type CardProps = Readonly<{
    title: JSX.Element;
    children: Child;
}>;

// Children and elements passed as props are descriptions, mounted where the
// component puts them.
const Card = ({ title, children }: CardProps): JSX.Element => (
    <section class={constant('card')}>
        <h2>{title}</h2>
        {children}
    </section>
);

export const Page = (): JSX.Element => (
    <Card title={<em>{constant('Welcome')}</em>}>
        <p>{constant('Components are plain functions, called once.')}</p>
    </Card>
);
```

`children` や props で渡した要素は記述であり、コンポーネントが置いた場所に、置いた回数だけマウントされる。`Child` は JSX が子要素として受け付けるもので、要素・`Bindable<string | number>`・それらの配列のどれかである。

## context はない

`createContext` はない。アプリの状態はモジュールのトップレベルのストアに置き、どのコンポーネントからでも import する。ある部分木にだけ見せたい Observable は props で渡す。コンポーネントは 1 回しか呼ばれないので、途中のコンポーネントを経由して同じ Observable を渡しても、どれも再実行されない。

## 命名

ライブラリ自身の props には `$` を付けない（`cond`、`items`、`value`）。受け取るのは `Bindable` で、Observable だけでなく定数や `view` のこともあるためである。サンプルでは、synstate のドキュメントと同じく Observable を持つ変数に `$` を付ける（`count$`、`item$`）。どちらも強制はしない。自作コンポーネントの props に付けるかは作者が決める。
