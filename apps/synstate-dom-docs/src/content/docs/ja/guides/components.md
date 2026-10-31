---
title: コンポーネント
description: Bindable を受け取り特別な扱いの要らない props、一度だけ読む props、そして子要素。
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

`mapBindable` と `derive` を使えば（[Bindable](/mono/synstate-dom/ja/guides/bindable/#bindable-を受け取る側-mapbindablederivetoobservable) を参照）、渡された定数は定数のままで、グラフに入ることもありません。

## props は普通の JavaScript の値

データを受け取る props に入っているのは、値を読み出したものではなく Bindable（Observable・定数・`view`）そのものなので、特別に気をつけることはありません。関数の引数を扱ういつもの JavaScript の書き方が props にもそのまま使え、更新も止まりません。

```tsx
import { createState } from 'synstate';
import {
    constant,
    derive,
    If,
    mapBindable,
    type Bindable,
    type JSX,
} from 'synstate-dom';

type CountedTextAreaProps = Readonly<{
    label: Bindable<string>;
    value: Bindable<string>;
    onInput: (value: string) => void;
    maxLength?: Bindable<number>;
}>;

type FieldProps = Readonly<{ hint: Bindable<string> }> & CountedTextAreaProps;

export const Compose = (): JSX.Element => (
    <Field
        label={constant('Message')}
        hint={constant('Plain text only.')}
        value={draft$}
        onInput={setDraft}
    />
);

// A helper takes bindables and returns one, like any other function.
const remainingOf = (
    value: Bindable<string>,
    maxLength: Bindable<number>,
): Bindable<number> => derive([value, maxLength], (v, max) => max - v.length);

// A component called only while its branch is mounted, so its text is
// derived only while it is shown.
const CharactersLeft = ({
    count,
}: Readonly<{ count: Bindable<number> }>): JSX.Element => (
    <small>{mapBindable(count, (n) => `${n} characters left`)}</small>
);

const CountedTextArea = ({
    label,
    value,
    onInput,
    // A default is a destructuring default.
    maxLength = constant(140),
}: CountedTextAreaProps): JSX.Element => {
    // Computed in the component body and kept in a variable, and it still
    // updates: `remaining` is a bindable derived from the props, not a number
    // read once.
    const remaining = remainingOf(value, maxLength);

    return (
        <span>
            <label>
                {label}
                <textarea
                    value={value}
                    onInput={(event) => {
                        onInput(event.currentTarget.value);
                    }}
                />
            </label>
            {/* The price: a derived value that updates is built as a bindable,
          and an element shown depending on an updating value is `If`,
          not `&&` or `? :`. */}
            <If
                cond={mapBindable(remaining, (n) => n < 0)}
                then={<strong>{constant('Too long')}</strong>}
                else={<CharactersLeft count={remaining} />}
            />
        </span>
    );
};

// The props this component does not use itself are forwarded with a rest
// pattern.
const Field = ({ hint, ...textArea }: FieldProps): JSX.Element => (
    <div>
        <CountedTextArea {...textArea} />
        <p>{hint}</p>
    </div>
);

const [draft$, setDraft] = createState('');
```

- props を分割代入できます。
- デフォルト値は分割代入のデフォルト値で書けます（`maxLength = constant(140)`）。
- 自分で使わない props は rest パターン（`{ hint, ...textArea }`）でまとめて、別のコンポーネントにスプレッドで渡せます。
- コンポーネント本体で計算して変数に入れておくことも、props をヘルパー関数に渡すこともできます。

Solid では、これらのどれにもルールが付いてきます。props は getter の集まりなので、コンポーネント本体で、JSX や `createMemo`・`createEffect` のような追跡スコープの外で読むと、その 1 回しか読まれません。分割代入もそういう読み方の一つです。そのため、デフォルト値には `mergeProps`、残りの props を渡すには `splitProps` が要りますし、本体で計算した値は `createMemo` か関数で包む必要があります。ルールを破ってもコードはコンパイルが通って最初の値を表示し、更新だけが止まります。それを指摘してくれるのは lint（`solid/reactivity`、`solid/no-destructure`）で、`tsc` にはできません。synstate-dom には props の扱いについてこういうルールがありません。更新されるのは `Bindable` 型を持つものです。

### 代わりに、派生値は Bindable として組み立てる

この自由さは props が値ではなく Bindable であることから来ていて、裏返すと制約にもなります。Solid では、派生した値は `{props.maxLength - props.value.length}` のような JSX の中の式で、コンパイラが最新に保ってくれます。synstate-dom では、その式を JSX にそのまま書くことはできません。計算を関数に渡して、派生を新しい Bindable として組み立てます。

- 入力が 1 つなら `mapBindable`（Observable を持っているなら `view` や `pipe(map(...))` でも）
- 入力が複数なら `derive([a, b], fn)`
- 待つ・絞り込む・debounce するといった処理は、`toObservable` を通して synstate のオペレーターで（束縛する前に `withInitialValue` で初期値を付けます）
- 更新される値によって要素を出し分けるなら、JSX を `&&` や `? :` で囲むのではなく、`Bindable<boolean>` を渡した `If`（か `MatchOptional`・`MatchResult`）で

そのため同じコンポーネントでも Solid より書く量が増えますし、書くにはこれらのヘルパーと、その先では synstate のオペレーターを知っている必要があります。その代わり、どの派生も型の付いた値になるので、上の `remaining` のように名前を付けて変数に置き、別の場所に渡せます。

## 一度だけ読む props

初期値として一度だけ読む props は、`Constant<T>` で受け取ります。

```tsx
import { createState } from 'synstate';
import { constant, type Constant, type JSX } from 'synstate-dom';

export const Form = (): JSX.Element => <Stepper initial={constant(10)} />;

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
```

こうすると呼び出す側は `initial={constant(10)}` と書くことになり、Observable や素の数値を渡すと型エラーになります。一度しか読まないことが、名前の付け方の慣習ではなく型に表れるわけです。コンポーネントの中では、`Constant<T>` をそのまま `T` として使えます。

## 子要素

```tsx
import { constant, type Child, type JSX } from 'synstate-dom';

type CardProps = Readonly<{
    title: JSX.Element;
    children: Child;
}>;

export const Page = (): JSX.Element => (
    <Card title={<em>{constant('Welcome')}</em>}>
        <p>{constant('Components are plain functions, called once.')}</p>
    </Card>
);

// Children and elements passed as props are descriptions, mounted where the
// component puts them.
const Card = ({ title, children }: CardProps): JSX.Element => (
    <section class={constant('card')}>
        <h2>{title}</h2>
        {children}
    </section>
);
```

`children` や props で渡した要素はただの記述です。コンポーネントがそれを置いた場所に、置いた回数だけマウントされます。`Child` は JSX が子要素として受け付けるものの型で、要素・`Bindable<string | number>`・それらの配列のどれかです。

## context はありません

`createContext` はありません。アプリの状態はモジュールのトップレベルにストアとして置き、どのコンポーネントからでも import して使います。ある部分木にだけ見せたい Observable は props で渡してください。コンポーネントは 1 回しか呼ばれないので、途中のコンポーネントを何段経由して同じ Observable を渡しても、どれも再実行されません。

## 命名

ライブラリ自身の props には `$` を付けていません（`cond`、`items`、`value`）。受け取るのは `Bindable` で、Observable だけでなく定数や `view` のこともあるからです。一方サンプルでは、synstate のドキュメントと同じく、Observable を持つ変数に `$` を付けています（`count$`、`item$`）。どちらも強制ではありません。自作コンポーネントの props に付けるかどうかは、作る人が決めてください。
