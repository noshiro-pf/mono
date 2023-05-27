---
title: "numeric input の Controlled な React コンポーネントのインターフェース考察（加筆予定）"
emoji: "🐈"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["typescript", "react", "frontend"]
published: true
---

数値入力を行うための input 要素は、GUI アプリケーションではありふれた素朴な form 要素であるにもかかわらず、React コンポーネントとして実装する際バリデーションや正規化など少しでも気の利いたことをしようとすると途端に設計が悩ましくなりがちです。

## 制御されたコンポーネントと非制御コンポーネント

- controlled component（制御されたコンポーネント） ... form の状態を JavaScript の状態と同期させ管理する方法

  ```tsx
  import * as React from "react";

  const InputControlled = () => {
    const [str, setStr] = React.useState("");

    console.log({ str });

    const onChange = React.useCallback(
      (ev: React.ChangeEvent<HTMLInputElement>) => {
        setStr(ev.target.value);
      },
      []
    );

    return (
      <div>
        <div>{"controlled input"}</div>
        <input type="text" value={str} onChange={onChange} />
      </div>
    );
  };
  ```

- uncontrolled component（非制御コンポーネント） ... form の状態を DOM 自身が扱う

  ```tsx
  import * as React from "react";

  const InputUnControlled = () => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const submit = React.useCallback(() => {
      console.log({ num: inputRef.current?.value });
    }, []);

    return (
      <div>
        <div>
          <div>{"uncontrolled input"}</div>
          <input type="text" ref={inputRef} defaultValue={""} />
        </div>
        <div>
          <button type={"submit"} onClick={submit}>
            {"Submit"}
          </button>
        </div>
      </div>
    );
  };
  ```

![text-input](https://github.com/noshiro-pf/mono/blob/develop/articles/text-input.png?raw=true)

controlled component による実装では form の最新の値は state に常に反映されるため、その値を使った処理は単にその state 変数を使うだけですが、 uncontrolled component による実装では form の値は DOM に保持されており、必要なとき（上の例では submit を押したとき）に ref を介して最新の値を "pull" する必要があります。

> ほとんどの場合では、フォームの実装には制御されたコンポーネント (controlled component) を使用することをお勧めしています。制御されたコンポーネントでは、フォームのデータは React コンポーネントが扱います。非制御コンポーネント (uncontrolled component) はその代替となるものであり、フォームデータを DOM 自身が扱います。

https://ja.legacy.reactjs.org/docs/uncontrolled-components.html

https://goshacmd.com/controlled-vs-uncontrolled-inputs-react/

`view = f(state)` という関係が成り立っている（すべての画面状態が JavaScript で保持されている状態の像になっている）ことはウェブフロントエンド実装をシンプルにするために有効であるという考え方がありますが、それに沿うと form 要素も原則 controlled component で実装されていることが望ましいということになります。

## 数値入力欄の場合

しかし、数値入力欄の場合は少し問題が難しくなります。ユーザーが入力する文字列は数値として有効であるとは限らないため、状態を `number` 型の変数で保持していると、 その invalid な状態を数値として対応させられないため即座に NaN などに潰してしまい、入力を阻害してしまうためです。

先ほどの例を `type="number"` とした例を考えます。

```diff
- const InputControlled = () => {
+ const NumericInputControlled = () => {
-   const [str, setStr] = React.useState("");
+   const [num, setNum] = React.useState(0);

-   console.log({ str });
+   console.log({ num });

    const onChange = React.useCallback(
      (ev: React.ChangeEvent<HTMLInputElement>) => {
-       setNum(ev.target.valueAsNumber);
+       setNum(ev.target.valueAsNumber);
      },
      []
    );

    return (
      <div>
-       <div>{"controlled input"}</div>
+       <div>{"controlled numeric input"}</div>
-       <input type="text" value={str} onChange={onChange} />
+       <input type="number" value={num} onChange={onChange} />
      </div>
    );
  };
```

```diff
- const InputUnControlled = () => {
+ const NumericInputUnControlled = () => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const submit = React.useCallback(() => {
-     console.log({ num: inputRef.current?.value });
+     console.log({ num: inputRef.current?.valueAsNumber });
    }, []);

    return (
      <Grid container spacing={1} direction={"column"}>
        <Grid item>
-         <div>{"uncontrolled input"}</div>
+         <div>{"uncontrolled numeric input"}</div>
-         <input type="text" ref={inputRef} defaultValue={0} />
+         <input type="number" ref={inputRef} defaultValue={0} />
        </Grid>
        <Grid item>
          <button type={"submit"} onClick={submit}>
            {"Submit"}
          </button>
        </Grid>
      </Grid>
    );
  };
```

![numeric-input](https://github.com/noshiro-pf/mono/blob/develop/articles/numeric-input.png?raw=true)

`<input type='number' />` とするとその入力欄は[有効な浮動小数点数（つまり、 NaN でも Infinity でもないもの）](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-floating-point-number) （`0-9`, `-`, `.`, `e`, `E`, `+` からなる並び順に一定の制約のある文字列）のみを受け付けるようになりますが、入力途中の状態も認める必要があるため、 submit 時に有効な数値文字列になっているとは限りません。

`"3.4e+1"` という文字列を入力しようとすると `NumericInputControlled` の方では `"3.4e"` の時点で `""` に潰されてしまい入力が阻害されてしまいます。

CSS コンポーネントライブラリの 「[Blueprint.js](https://blueprintjs.com)」 の[数値入力欄のコンポーネント](https://blueprintjs.com/docs/#core/components/numeric-input)のドキュメントには、「このコンポーネントはデフォルトで uncontrolled mode で動作しそれが推奨の使用方法である」と書かれています。
もし数値入力欄の挙動を細かく制御するため controlled mode（`value` を prop として渡すモード）を使用したい場合は、 `value` には（`number`ではなく） **`string`** 型でデータを渡し、`onValueChange` にも `string` を受け取るコールバックを渡すべきだと書かれています。
これは `value` プロパティを `number` 型で持つようにしていると、入力途中の値 `"0."` や `"-"` などが即座に `"0"` や `NaN` に変換されてしまい、ユーザーの入力を阻害してしまうため。

しかし、

```ts
type Props = Readonly<{
  value: string;
  onChange: (value: string) => void;
}>;
```

というインターフェースの controlled numeric input コンポーネントを使用しようとすると、
本来意味的には `number` で持ちたい state を `string` で持つことになり、コードの可読性と使い勝手が損なわれてしまいます。

```tsx
const App = () => {
  const [numStr, setNumStr] = React.useState("0");

  const onChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setNumStr(ev.target.value);
    },
    []
  );

  // フォーム状態 `numStr` を使用する箇所で parse 処理が都度必要になる
  const num = React.useMemo(() => {
    const n = Number.parseFloat(numStr);
    if (Number.isNaN(n)) {
      return undefined;
    }
    return n;
  }, [numStr]);

  return (
    <div>
      <div>{"controlled numeric input"}</div>
      <input type="number" value={numStr} onChange={onChange} />
      <div>{"n + 1"}</div>
      {num === undefined ? <div>{"error"}</div> : <div>{num + 1}</div>}
    </div>
  );
};
```

この問題を回避するには、やはり numeric input コンポーネントは

```ts
type Props = Readonly<{
  value: number;
  onChange: (value: number) => void;
}>;
```

というインターフェースを前提としてこのコンポーネント内で数値文字列状態を扱うなんらかの工夫をするのが良さそうです。

もし単純な用途であれば、やはり uncontrolled な挙動をそのまま使うのは無難そうですが、入力された数値に対して

- clamp （min, max の範囲に収める処理）
- 小数点以下を指定桁数で丸める
- 固定小数点表記にする

などの後処理などを行った数値のみを state に反映し、form にもその結果を反映し直したいという要件がある場合は難しくなってきます。

一つ対策として、 `onKeyDown` で特定のキーの入力イベントを無視する処理を挟むことで避けたい数値文字列をブロックする、という方法は考えられます（例えば `固定小数点表記にする` という要件に対して `"e"` という文字の入力をブロックする、など）。しかし、この方法は負数を含む数値型の場合には同様に文字種だけでは例えば `"0-2-3"` というフォーム状態を弾くことはできなくなるため、万能な方法とは言えなさそうです。

よって、

- numeric input のスタイリングのみを担当するステートレスなコンポーネントを作る。このコンポーネントのインターフェースは文字列データ（と `disabled` などの属性）をやり取りするようにする。
- 入力中の文字列を `string` 型の内部 state 持ち、入力欄からフォーカスが離れたときにそれを正規化する処理を行って `onChange` コールバックに渡しフォームにも反映し直す、ということを行うステートフルなラッパー numeric input コンポーネントをそのアプリケーションで扱う数値型ごとに作る

という作りにするのが最も汎用性が高く便利であると私は考えています。

```tsx
// prettier-ignore
export type ScoreType =
      // eslint-disable-next-line @typescript-eslint/sort-type-constituents
      0   | 0.01 | 0.02 | 0.03 | 0.04 | 0.05 | 0.06 | 0.07 | 0.08 | 0.09
    | 0.1 | 0.11 | 0.12 | 0.13 | 0.14 | 0.15 | 0.16 | 0.17 | 0.18 | 0.19
    | 0.2 | 0.21 | 0.22 | 0.23 | 0.24 | 0.25 | 0.26 | 0.27 | 0.28 | 0.29
    | 0.3 | 0.31 | 0.32 | 0.33 | 0.34 | 0.35 | 0.36 | 0.37 | 0.38 | 0.39
    | 0.4 | 0.41 | 0.42 | 0.43 | 0.44 | 0.45 | 0.46 | 0.47 | 0.48 | 0.49
    | 0.5 | 0.51 | 0.52 | 0.53 | 0.54 | 0.55 | 0.56 | 0.57 | 0.58 | 0.59
    | 0.6 | 0.61 | 0.62 | 0.63 | 0.64 | 0.65 | 0.66 | 0.67 | 0.68 | 0.69
    | 0.7 | 0.71 | 0.72 | 0.73 | 0.74 | 0.75 | 0.76 | 0.77 | 0.78 | 0.79
    | 0.8 | 0.81 | 0.82 | 0.83 | 0.84 | 0.85 | 0.86 | 0.87 | 0.88 | 0.89
    | 0.9 | 0.91 | 0.92 | 0.93 | 0.94 | 0.95 | 0.96 | 0.97 | 0.98 | 0.99
    | 1;

type Props = Readonly<{
  score: ScoreType;
  onScoreChange: (value: ScoreType) => void;
  disabled?: boolean;
}>;

const config = {
  step: 0.01,
  defaultValue: 0,
  min: 0,
  max: 1,
  digit: 2,
} as const;

const { step, defaultValue, min, max } = config;

const clampAndRoundScore = clampAndRoundFn(config);

export const ExampleNumericInput = ({
  score: valueFromProps,
  disabled = false,
  onScoreChange: onValueChange,
}: Props) => {
  const {
    valueAsStr,
    setValueStr,
    onDecrementMouseDown,
    onIncrementMouseDown,
    onInputBlur,
    onKeyDown,
  } = useNumericInputState({
    onValueChange,
    defaultValue,
    normalizeValue: clampAndRoundScore,
    valueFromProps,
    step,
  });

  const inputProps = useMemo(
    () => ({ min, max, step, onKeyDown }),
    [onKeyDown]
  );

  return (
    <NumericInputView
      disabled={disabled}
      fillSpace={true}
      inputProps={inputProps}
      selectOnFocus={true}
      valueAsStr={valueAsStr}
      onDecrementMouseDown={onDecrementMouseDown}
      onIncrementMouseDown={onIncrementMouseDown}
      onInputBlur={onInputBlur}
      onInputStringChange={setValueStr}
    />
  );
};
```

```ts
export const clampAndRoundFn =
  <T extends number>(
    cfg: Readonly<{
      min: T;
      max: T;
      digit: number;
      defaultValue: T;
    }>
  ) =>
  (x: number): T =>
    !Number.isFinite(x)
      ? cfg.defaultValue
      : x < cfg.min
      ? cfg.min
      : cfg.max < x
      ? cfg.max
      : ((Math.round(x * 10 ** cfg.digit) / 10 ** cfg.digit) as T);
```

（サンプルコードと説明を加筆予定）
