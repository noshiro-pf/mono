---
title: 'numeric input の React コンポーネントのインターフェース考察'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['typescript', 'react', 'frontend']
published: true
---

数値入力を行うための input 要素（numeric input）は、GUI アプリケーションではごくありふれた UI 部品ですが、React コンポーネントとして実装するときに `view = f(state)` という原則を厳密に守る実装がしづらいという特徴があり、実は状態管理やインターフェースの設計方法が悩ましくなりがちです。

本記事では、そうした numeric input （ライブラリ）の React での実装方法の解を探るべく考察していきます。

## 制御されたコンポーネントと非制御コンポーネント

numeric input の設計を考える上で、まず React の controlled component（制御されたコンポーネント） と uncontrolled component（非制御コンポーネント） について押さえる必要があります。

- controlled component（制御されたコンポーネント） ... form の状態を JavaScript の状態と同期させ管理する方法

  ```tsx
  import * as React from 'react';

  const InputControlled = () => {
    const [str, setStr] = React.useState('');

    console.log({ str });

    const onChange = React.useCallback(
      (ev: React.ChangeEvent<HTMLInputElement>) => {
        setStr(ev.target.value);
      },
      [],
    );

    return (
      <div>
        <div>{'controlled input'}</div>
        <input type='text' value={str} onChange={onChange} />
      </div>
    );
  };
  ```

- uncontrolled component（非制御コンポーネント） ... form の状態を DOM 自身が扱う

  ```tsx
  import * as React from 'react';

  const InputUnControlled = () => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const submit = React.useCallback(() => {
      console.log({ num: inputRef.current?.value });
    }, []);

    return (
      <div>
        <div>
          <div>{'uncontrolled input'}</div>
          <input type='text' ref={inputRef} defaultValue={''} />
        </div>
        <div>
          <button type={'submit'} onClick={submit}>
            {'Submit'}
          </button>
        </div>
      </div>
    );
  };
  ```

![text-input](https://github.com/noshiro-pf/mono/blob/develop/articles/text-input.png?raw=true)

controlled component による実装では form の最新の値は state に常に反映されるため、その値を使った処理は単にその state 変数を使うだけですが、 uncontrolled component による実装では form の値は DOM に保持されており、必要なとき（上の例では submit を押したとき）に ref を介して最新の値を "pull" する必要があります。
`<input />`要素の場合は `value` プロパティの方を使っているのが controlled mode、 `defaultValue` プロパティの方を使っているのが uncontrolled mode と思っておけば一旦大丈夫です。

React 公式ドキュメントには、これら 2 パターンの実装方法について以下のように使い分け方が書かれています。

> ほとんどの場合では、フォームの実装には制御されたコンポーネント (controlled component) を使用することをお勧めしています。制御されたコンポーネントでは、フォームのデータは React コンポーネントが扱います。非制御コンポーネント (uncontrolled component) はその代替となるものであり、フォームデータを DOM 自身が扱います。

https://ja.legacy.reactjs.org/docs/uncontrolled-components.html

https://goshacmd.com/controlled-vs-uncontrolled-inputs-react/

## numeric input の場合

`view = f(state)` という関係が成り立っている（すべての画面状態が JavaScript で保持されている状態の像になっている）ことはウェブフロントエンド実装をシンプルにするために有効であるという考え方があります。この原則に従って実装するのならば、すべての form 要素は React 公式ドキュメントが推奨している通り controlled component で実装されるべきです。

ところが、 numeric input も `view = f(state)` の原則に従い controlled component で実装を行おうとすると少し厄介な問題があります。ユーザーが入力途中の文字列は数値として有効であるとは限らないため、状態を `number` 型の変数で保持し controlled な状態（state が表示に即反映される状態）にしていると、 その不正な文字列が数値に対応させられないために `NaN` に潰れてしまったりすることで、入力を阻害してしまう、という問題です。

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

`<input type='number' />` とするとその input はモダンブラウザでは[有効な浮動小数点数（つまり、 NaN でも Infinity でもないもの）](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-floating-point-number) （`0-9`, `-`, `.`, `e`, `E`, `+` からなる並び順に一定の制約のある文字列）のみを受け付けるようになりますが、入力途中の状態も認める必要があるため、 submit 時に有効な数値文字列になっているとは限りません。

例えば `"3.4e+1"` という値を入力しようとすると `NumericInputControlled` の方では `"3.4e"` の時点の文字列を有効な数値に対応させることができず `NaN` に変換されてしまうので、 numeric input の内容は `""` に潰されてしまい入力が阻害されてしまいます。

これに関して、CSS コンポーネントライブラリの 「[Blueprint.js](https://blueprintjs.com)」 の[Numeric input コンポーネント](https://blueprintjs.com/docs/#core/components/numeric-input.uncontrolled-mode)のドキュメントには、

> By default, this component will function in uncontrolled mode, managing all of its own state. ... In general, uncontrolled mode is the recommended API for this component, ..." --- （筆者訳）このコンポーネントはデフォルトで uncontrolled mode で機能し、それ自体の状態をすべて管理します。（中略）一般に、このコンポーネントには uncontrolled mode が推奨される API です。

と書かれています。
また、 [controlled-mode](https://blueprintjs.com/docs/#core/components/numeric-input.controlled-mode) の節には、

> If you need to have more control over your numeric input's behavior, you can specify the value property to use the component in controlled mode. --- （筆者訳） 数値入力の動作をさらに制御する必要がある場合は、 value プロパティを指定してコンポーネントを制御モードで使用できます。

> Note that NumericInput supports arbitrary text entry (not only numeric digits) so the value should always be provided as a string, not a number. --- （筆者訳） NumericInput は任意のテキスト入力 (数値だけでなく) をサポートしているため、値は常に数値ではなく文字列として指定する必要があることに注意してください。

とも書かれています。

`NumericInput` を controlled mode（`value` を prop として渡すモード）で使用したい場合は、上で書かれている通り `value` には（`number`ではなく） **`string`** 型でデータを渡す必要があり、`onValueChange` にも **`string`** を受け取るコールバックを渡す必要が生じます。
これはなぜかというと、 `value` プロパティを `number` 型で持つようにしていると、入力途中の値 `"0."` や `"-"` などが即座に `"0"` や `NaN` に変換されて表示に反映されてしまい、ユーザーの入力を阻害してしまうためです。

しかし、

```ts
type Props = Readonly<{
  value: string;
  onChange: (value: string) => void;
}>;
```

というインターフェースの controlled numeric input コンポーネント（下の例の `FullyControlledNumericInput` ）を直接使おうとすると、以下の例のように数値 state を `string` で持たなければならなくなり、実装コストと可読性が犠牲になってしまいます。

```tsx
type Props = Readonly<{
  value: string;
  onChange: (value: string) => void;
}>;

// 例なので <input type="number" /> をラップしただけの実装
const FullyControlledNumericInput = (props: Props) => {
  const { value, onChange } = props;

  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const value = ev.target.value;
      onChange(value);
    },
    [],
  );

  return <input type='number' value={value} onChange={handleChange} />;
};

const App = () => {
  const [numStr, setNumStr] = React.useState('0');

  const onChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setNumStr(ev.target.value);
    },
    [],
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
      <div>{'controlled numeric input'}</div>
      <input type='number' value={numStr} onChange={onChange} />
      <FullyControlledNumericInput value={numStr} onChange={onChange} />
      <div>{'n + 1'}</div>
      {num === undefined ? <div>{'error'}</div> : <div>{num + 1}</div>}
    </div>
  );
};
```

状態管理をシンプルにしたくて controlled numeric input にしたいのに、その目的のためにすべての numeric input に紐づく数値の state を `string` 型で持たなければならなくなるのでは、 state の仕様説明力が低くコードの可読性が大きく犠牲になるので、やはり `FullyControlledNumericInput` のインターフェースは受け入れがたいかなと個人的には思います。

前述の Blueprint.js で推奨されている通り uncontrolled モードで実装する方がマシかもしれませんが、 submit 処理の実装は追加で必要なため、 numeric input を使う各箇所で submit タイミングを適切に制御しておかないと状態と表示が乖離してしまうリスクがあり、個人的にはこれも積極的に選びたい択ではありません。

また、 numeric input 要素に対しては、入力された数値に

- clamp （min, max の範囲に収める処理）
- 小数点以下を指定桁数で丸める
- 固定小数点表記にする

などの後処理を適当なタイミング（例えばフォーカスが外れたとき）施したい、というような要求が後から生まれることもたびたびあります。なるべく DOM ではなく JavaScript 側（≒ React 側、 useState を使っているので）に状態を持たせる方がそういった拡張もしやすくなることが多いです（uncontrolled mode でも `onBlur` で submit すればよいのでできなくはないですが）。

以上を踏まえると、やはり numeric input コンポーネントは

```ts
type Props = Readonly<{
  value: number;
  onChange: (value: number) => void;
}>;
```

というインターフェースで実装し、その内部で入力途中の文字列状態をうまく扱うような工夫をするのが良さそうです。

<!-- 一つ対策として、 `onKeyDown` で特定のキーの入力イベントを無視する処理を挟むことで避けたい数値文字列をブロックする、という方法を思いつくかもしれません（例えば `固定小数点表記にする` という要件に対して `"e"` という文字の入力をブロックする、など）。しかし、この方法は負数を含む数値型の場合には同様に文字種だけでは例えば `"0-2-3"` というフォーム状態を弾くことはできないようなので、万能な方法とは言えなさそうです。（【TODO: ブラウザの numeric input の仕様のリンク】）。 -->

## numeric input コンポーネントの設計（筆者の結論）

前節までの議論を踏まえて、私は以下の設計で NumericInput コンポーネントを実装するのが良いだろうと考えています。

- numeric input のスタイリングのみを担当するステートレスなコンポーネント（`NumericInputView`）を作る。このコンポーネントのインターフェースは文字列データとコールバック関数（と `disabled` などの各種ネイティヴ input 要素の属性）とする。機能としては、受け取った値をそのまま表示することと、ユーザーが input に文字を入力したらコールバック関数を実行することだけをになう。内部状態を持たない。
- `NumericInputView` をラップして数値型のインターフェースを持たせたステートフルな container コンポーネント `NumericInput` を用途に応じて個別に実装する。このコンポーネントの内部実装では主に以下の 3 点を定義し実装する（適宜 React hooks として共通ユーティリティ化することもできる）。
  1. 入力文字列と同期させる state … = `React.useState<string>("0")`
     - props の値が変わったら state に反映させる `React.useEffect` も実装する
  2. 文字列から数値への変換のタイミング（`submit`） … 「入力欄からフォーカスが離れたとき（= `onBlur`）」としておくと大体の場面で良さそうだが、前述の例のように submit ボタンも内蔵した上でそれが押下されたとき、と定義することなどもできる。
  3. 文字列 ↔ 数値変換の方法（`decode`, `encode`） … 2. で定義した `submit` のタイミングで、文字列を数値に変換する方法を定義する。 `Number.parseInt` や `Number.parseFloat` をそのまま使うだけでも良いかもしれないし、その後 `[min, max]` の範囲に clamp したり、小数点以下を指定桁数で丸めるなどのより複雑な変換を追加することもできる。

このような 2 段構えの実装設計には主に以下の 2 つのメリットがあります。

一つは、`NumericInputView`というスタイリングだけを担当する完全にステートレスなコンポーネントが提供されるという点です。 Material UI のような UI コンポーネントライブラリを使っていて、フォーム要素の見た目だけは採用したいがその挙動が気に食わない（ユースケースに合わない）、ということを自分はたびたび感じるのですが、そういう不満を感じる人にとって `NumericInputView` を使って自前で状態管理することもできるというのは大きなメリットです（世の中の UI ライブラリはこういうパーツをもっと積極的に提供してほしい…）。

もう一つは、ただの `number` 型より狭い数値型（[実装例 A](#実装例A) における`ScoreType`）に対応する numeric input （[実装例 A](#実装例A) における`ScoreNumericInput`）を使った実装が綺麗になる点です。型の制約に合う値だけをグローバルな state に反映するためにユーザー入力結果の文字列を数値に変換する処理を **numeric input のレイヤーで行うことができる**ので、 `NumericInput` を使う側の実装がシンプルになります 。
複数のカスタム数値型（[実装例 A](#実装例A) の`ScoreType`）があってそれぞれに対応する numeric input を UI に配置したく、見た目は同じで良ければ、`NumericInputView` を使ってそれぞれの数値型ごとに `NumericInput` を個別に実装して使う、というやり方を上の設計は意識しています（`NumericInputView` という一つのスタイル実装を使いまわし `NumericInput` は複数実装するというイメージです）。
`number` 型より狭い数値型としては下の例のような union 型で定義された有限集合の場合もありますが、 Branded Type[^1] （例えば io-ts の `Int` 型など）もあり得ます。いずれにせよ、`NumericInput`としては大きな差は無くほぼ同じ手順で実装することができるはずです。

[^1]: 参考： [TypeScript の Type Branding をより便利に活用する方法のまとめ](https://zenn.dev/noshiro_piko/articles/typescript-branded-type-int)

### 実装例 A

- App.tsx

  ```tsx
  import { useState } from 'react';
  import { ScoreType } from './score';
  import { ScoreNumericInput } from './score-input';

  export const App = () => {
    const [score, onScoreChange] = useState<ScoreType>(0);

    return (
      <div>
        <ScoreNumericInput score={score} onScoreChange={onScoreChange} />
      </div>
    );
  };
  ```

- score-input.tsx

  ```tsx
  import { useNumericInputState } from './numeric-input-state';
  import { NumericInputView } from './numeric-input-view';
  import { ScoreType } from './score';

  type Props = Readonly<{
    score: ScoreType;
    onScoreChange: (value: ScoreType) => void;
    disabled?: boolean;
  }>;

  const { step, min, max } = ScoreType;

  export const ScoreNumericInput = ({
    score,
    disabled = false,
    onScoreChange,
  }: Props): JSX.Element => {
    const { valueAsStr, onValueAsStrChange, submit } = useNumericInputState({
      valueFromProps: score,
      onValueChange: onScoreChange,
      decode: ScoreType.decode,
      encode: ScoreType.encode,
    });

    return (
      <NumericInputView
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        value={valueAsStr}
        onBlur={submit}
        onChange={onValueAsStrChange}
      />
    );
  };
  ```

- numeric-input-view.tsx

  ```tsx
  import { useCallback } from 'react';

  type Props = Readonly<{
    value: string;
    disabled: boolean;
    min: number;
    max: number;
    step: number;
    onChange: (value: string) => void;
    onBlur: () => void;
  }>;

  export const NumericInputView = (props: Props): JSX.Element => {
    const { value, disabled, max, min, step, onChange, onBlur } = props;

    const handleChange = useCallback(
      (ev: React.ChangeEvent<HTMLInputElement>) => {
        onChange(ev.target.value);
      },
      [onChange],
    );

    return (
      <input
        disabled={disabled}
        max={max}
        min={min}
        step={step}
        type='number'
        value={value}
        onBlur={onBlur}
        onChange={handleChange}
      />
    );
  };
  ```

- score.ts

  ```ts
  /* eslint-disable @typescript-eslint/no-namespace */

  import { clampAndRound } from './numeric-type-utils';

  export type ScoreType =
    | 0
    | 0.1
    | 0.2
    | 0.3
    | 0.4
    | 0.5
    | 0.6
    | 0.7
    | 0.8
    | 0.9
    | 1;

  export namespace ScoreType {
    export const min = 0 satisfies ScoreType;
    export const max = 1 satisfies ScoreType;
    export const defaultValue = 0 satisfies ScoreType;
    export const digit = 1;
    export const step = 0.1;

    const clampAndRoundScore = clampAndRound<ScoreType>({
      defaultValue,
      digit,
      max,
      min,
      step,
    });

    export const encode = (s: ScoreType): string => s.toString();

    export const decode = (s: string): ScoreType =>
      clampAndRoundScore(Number.parseFloat(s));
  }
  ```

- numeric-input-state.ts

  ```ts
  import { useCallback, useEffect, useState } from 'react';

  export const useNumericInputState = <T extends number>({
    decode,
    encode,
    onValueChange,
    valueFromProps,
  }: Readonly<{
    valueFromProps: T;
    onValueChange: (value: T) => void;
    encode: (s: T) => string;
    decode: (s: string) => T;
  }>): Readonly<{
    valueAsStr: string;
    onValueAsStrChange: (value: string) => void;
    submit: () => void;
  }> => {
    const [valueAsStr, setValueAsStr] = useState(encode(valueFromProps));

    useEffect(() => {
      setValueAsStr(encode(valueFromProps));
    }, [valueFromProps, setValueAsStr, encode]);

    const submit = useCallback(() => {
      onValueChange(decode(valueAsStr));
    }, [decode, onValueChange, valueAsStr]);

    return {
      onValueAsStrChange: setValueAsStr,
      submit,
      valueAsStr,
    };
  };
  ```

- numeric-input-utils.ts

  ```ts
  export type NumericTypeProperties<T extends number> = Readonly<{
    min: T;
    max: T;
    digit: number;
    defaultValue: T;
    step?: number;
  }>;

  export const clampAndRound =
    <T extends number>(p: NumericTypeProperties<T>) =>
    (x: number): T =>
      !Number.isFinite(x)
        ? p.defaultValue
        : x < p.min
          ? p.min
          : p.max < x
            ? p.max
            : ((Math.round(x * 10 ** p.digit) / 10 ** p.digit) as T);
  ```

動くコード

https://github.com/noshiro-pf/mono/blob/develop/experimental/numeric-input
