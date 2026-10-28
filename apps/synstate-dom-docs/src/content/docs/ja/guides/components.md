---
title: コンポーネント
description: Bindable を受け取る props、一度だけ読む props、そして子要素。
---

コンポーネントは props を受け取って `JSX.Element` を返す関数で、マウント時に 1 回だけ呼ばれます。コンポーネントごとの状態や effect の API はありません。状態は synstate の Observable で持ち、コンポーネントが表示するものをそれに束縛します。

## props は Bindable で受け取る

データを受け取るコンポーネントは、props を `Bindable<T>` で受け取ります。呼び出す側は、Observable・定数・`view` のどれでも渡せます。

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

props が持っているのは、再描画のたびに差し替わる値ではなく Bindable です。なので、分割代入しても何も失われません。`mapBindable` と `derive` を使えば（[Bindable](/mono/synstate-dom/ja/guides/bindable/#bindable-を受け取る側-mapbindablederivetoobservable) を参照）、渡された定数は定数のままで、グラフに入ることもありません。

## 一度だけ読む props

初期値として一度だけ読む props は、`Constant<T>` で受け取ります。

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

こうすると呼び出す側は `initial={constant(10)}` と書くことになり、Observable や素の数値を渡すと型エラーになります。一度しか読まないことが、名前の付け方の慣習ではなく型に表れるわけです。コンポーネントの中では、`Constant<T>` をそのまま `T` として使えます。

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

`children` や props で渡した要素はただの記述です。コンポーネントがそれを置いた場所に、置いた回数だけマウントされます。`Child` は JSX が子要素として受け付けるものの型で、要素・`Bindable<string | number>`・それらの配列のどれかです。

## context はありません

`createContext` はありません。アプリの状態はモジュールのトップレベルにストアとして置き、どのコンポーネントからでも import して使います。ある部分木にだけ見せたい Observable は props で渡してください。コンポーネントは 1 回しか呼ばれないので、途中のコンポーネントを何段経由して同じ Observable を渡しても、どれも再実行されません。

## 命名

ライブラリ自身の props には `$` を付けていません（`cond`、`items`、`value`）。受け取るのは `Bindable` で、Observable だけでなく定数や `view` のこともあるからです。一方サンプルでは、synstate のドキュメントと同じく、Observable を持つ変数に `$` を付けています（`count$`、`item$`）。どちらも強制ではありません。自作コンポーネントの props に付けるかどうかは、作る人が決めてください。
