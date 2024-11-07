---
title: 'numeric input の React コンポーネントのインターフェース設計考察'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['typescript', 'react', 'frontend', 'controlled', 'input']
published: true
---

数値入力を行うための input 要素（numeric input）は、GUI アプリケーションではごくありふれた UI 部品ですが、React コンポーネントとして実装するときに `view = f(state)` という原則を厳密に守る実装がしづらいという特徴があり、実は状態管理やインターフェースの設計方法が悩ましくなりがちです。

本記事では、そのあたりの事情を説明し、 numeric input （ライブラリ）の React での実装方法の解を考察していきます。

## 制御されたコンポーネントと非制御コンポーネント

numeric input の設計を考える上で、まず React の **controlled component**（制御されたコンポーネント） と **uncontrolled component**（非制御コンポーネント） について押さえる必要があります。

- controlled component（制御されたコンポーネント） ... form の状態を JavaScript の状態と同期させ管理する

  ```tsx
  import * as React from 'react';

  const InputControlled = () => {
    const [str, setStr] = React.useState('');

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
        <div>{str}</div>
      </div>
    );
  };
  ```

- uncontrolled component（非制御コンポーネント） ... form の状態を DOM 自身が扱う

  ```tsx
  import * as React from 'react';

  const InputUncontrolled = () => {
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

![text-input](https://github.com/noshiro-pf/mono/blob/develop/articles/numeric-input-interface/text-input.png?raw=true)

controlled component による実装では form の最新の値は state に常に反映されるため、その値を使った処理は単にその state 変数を使うだけですが、 uncontrolled component による実装では form の値は DOM に保持されており、必要なとき（上の例では submit を押したとき）に ref を介して最新の値を "pull" する必要があります。
`<input />` 要素の場合、 `value` プロパティの方を使って state を常に入力欄に反映し onChange で変更を即 state に反映する実装方式は controlled mode、 `defaultValue` プロパティの方を使って初期値のみ設定し、以後は ref を経由して DOM に保持されている値を取り出したり（pull）、更新したりする実装方式は uncontrolled mode と言えます。

実装例： https://playcode.io/2136118

React 公式ドキュメントには以下のように書かれています。

> ほとんどの場合では、フォームの実装には制御されたコンポーネント (controlled component) を使用することをお勧めしています。制御されたコンポーネントでは、フォームのデータは React コンポーネントが扱います。非制御コンポーネント (uncontrolled component) はその代替となるものであり、フォームデータを DOM 自身が扱います。

https://ja.legacy.reactjs.org/docs/uncontrolled-components.html

https://ja.react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components

https://goshacmd.com/controlled-vs-uncontrolled-inputs-react/

React などを用いてフロントエンドを実装する一番のメリットは、従来のように画面状態を DOM に直接持たせるのではなく、JavaScript の変数として持ち、画面状態がその像になっている（`view = f(state)` を満たす）ように実装しやすい点にあります。
コンポーネントを uncontrolled mode で実装してしまうと React のメリットを手放すことになってしまうので、 input 等のフォーム要素も controlled mode として実装するのが基本と言えます。

## numeric input の場合の難しさ

ところが、 numeric input には、**数値型データをやり取りするインターフェースの controlled な component として実装することができない**、という厄介な特徴があります。これは、ユーザーが入力途中の文字列は数値として有効であるとは限らないため、状態を `number` 型の変数で保持し controlled な作りにしてしまうと、 数値に対応させられない文字列が即座に `NaN` に潰れてしまい入力を邪魔してしまう、という問題があるためです。

どういうことか説明するために、先ほどの例を `type="number"` とした例を考えます。

```diff
- const InputControlled = () => {
+ const BadNumericInputControlled = () => {
-   const [str, setStr] = React.useState("");
+   const [num, setNum] = React.useState(0);

-   console.log({ str });
+   console.log({ num });

    const onChange = React.useCallback(
      (ev: React.ChangeEvent<HTMLInputElement>) => {
-       setStr(ev.target.value);
+       setNum(ev.target.valueAsNumber);
      },
      []
    );

    return (
      <div>
-       <div>{"controlled input"}</div>
+       <div>{"controlled numeric input (bad)"}</div>
-       <input type="text" value={str} onChange={onChange} />
+       <input type="number" value={num} onChange={onChange} />
      </div>
    );
  };
```

`<input type='number' />` とするとその input はモダンブラウザでは["有効な浮動小数点数"](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-floating-point-number) （`0-9`, `-`, `.`, `e`, `E`, `+` からなる並び順に一定の制約のある文字列）のみを受け付けるようにはなりますが、入力途中の状態も認める必要があるため、 有効な数値文字列になっているとは限りません。

`BadNumericInputControlled` では、例えば `"-1"` や `"3.4e+1"` という値を入力しようとすると `"-"` や `"3.4e"` などの**入力途中の文字列を有効な数値に対応させることができず `NaN` に変換されてしまう**ので、 input の内容は `""` に潰されてしまい入力が阻害されてしまいます。

これが numeric input を数値型データをやり取りするインターフェースの controlled な component として実装することができない理由です。

## CSS コンポーネントライブラリ Blueprint.js の見解

この問題に関して、CSS コンポーネントライブラリの 「[Blueprint.js](https://blueprintjs.com)」 （Material UI 等と同様のライブラリ）の[Numeric input コンポーネント](https://blueprintjs.com/docs/#core/components/numeric-input.uncontrolled-mode)のドキュメントには、

> By default, this component will function in uncontrolled mode, managing all of its own state. ... In general, uncontrolled mode is the recommended API for this component, ..." --- （筆者訳）このコンポーネントはデフォルトで uncontrolled mode で機能し、それ自体の状態をすべて管理します。（中略）一般に、このコンポーネントには uncontrolled mode が推奨される API です。

と書かれています。
また、同ページの [controlled-mode](https://blueprintjs.com/docs/#core/components/numeric-input.controlled-mode) の節には、

> If you need to have more control over your numeric input's behavior, you can specify the value property to use the component in controlled mode. --- （筆者訳） 数値入力の動作をさらに制御する必要がある場合は、 value プロパティを指定してコンポーネントを制御モードで使用できます。

> Note that NumericInput supports arbitrary text entry (not only numeric digits) so the value should always be provided as a string, not a number. --- （筆者訳） NumericInput は任意のテキスト入力 (数値だけでなく) をサポートしているため、値は常に数値ではなく文字列として指定する必要があることに注意してください。

とも書かれています。

`NumericInput` を controlled mode かつ `number` 型で状態を持ち使用しようとすると、入力途中の値 `"0."` や `"-"` などが `"0"` や `NaN` という状態に対応することになり、入力欄も"0"や空文字に即座に潰れてユーザーの入力を阻害してしまう、という問題がやはり指摘されています。
Blueprint.js の `NumericInput` コンポーネントは、 `number` 型の API を提供すると共に controlled mode で使いたい場合のための **`string`** 型データのAPIを使うという方法を提供しています。

## Controlled mode の numeric input

Blueprint.js がそうしているように、 controlled mode で numeric input を実装したい場合、入力途中の値に1対1対応するデータ形式として `string` 型のインターフェースを持つ必要が生じます。

しかし、 `string` 型インターフェースの controlled numeric input コンポーネント（下の例の `NumericInputControlled` ）だと、以下の実装例のようにそれを使う側の親コンポーネントで数値 state を `string` 型で持たなければならなくなり、また parse/stringify 処理も都度必要になるため、ただの数値入力欄一個が欲しいという要求に比して実装コストが大きく可読性も落ちてしまいます。

実装例：

```tsx
type Props = Readonly<{
  value: string;
  onChange: (value: string) => void;
}>;

// 例なので <input type="number" /> をラップしただけの実装
const NumericInputControlled = React.memo<Props>(({ value, onChange }) => {
  const handleChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const value = ev.target.value;
      onChange(value);
    },
    [],
  );

  return <input type='number' value={value} onChange={handleChange} />;
});

const App = () => {
  const [numStr, setNumStr] = React.useState('0');

  // フォーム状態 `numStr` を使用する箇所で parse 処理が都度必要になる
  const num = React.useMemo(() => {
    const n = Number.parseFloat(numStr);
    return Number.isNaN(n) ? undefined : n;
  }, [numStr]);

  return (
    <div>
      <div>{'controlled numeric input'}</div>
      <NumericInputControlled value={numStr} onChange={setNumStr} />
      <div>{'n + 1'}</div>
      {num === undefined ? <div>{'error'}</div> : <div>{num + 1}</div>}
    </div>
  );
};
```

UI状態の管理をシンプルにしたくて controlled numeric input にしたのに、その目的のためにすべての numeric input に紐づく数値の state を `string` 型で持たなければならなくなるのでは、これはこれで状態管理が複雑になり本末転倒な感があります。やはり `string` で数値情報をやりとりするのは受け入れがたいと思われます。

したがって、 numeric input は `number` 型データをやりとりするステートフルなコンポーネントとして実装する方が多くの状況では便利で周辺コードのメンテナビリティの観点でも優れると私も考えます。

### ステートフルな numeric input コンポーネントの悩み

`number` 型をインターフェースにすることを優先し、NumericInput をステートフルなコンポーネントとして実装すると多くの単純なユースケースで便利ですが、特殊な使い方が必要になるときにはその内部に状態があることが邪魔になることも少なくないです。

例えば、スライダーのような要素と数値入力欄を同期させたいユースケースがあるとします。

![slider-input](https://github.com/noshiro-pf/mono/blob/develop/articles/numeric-input-interface/numeric-input-with-slider.png?raw=true)

このとき、数値データの state は本来これらを束ねる親コンポーネントに一つだけ持てばよいはずですが、 numeric input が内部に state を持っていると状態の二重管理が発生し、親子間で状態を同期するための処理が発生します。ステートフルなコンポーネントを親子に組み合わせデータを同期させようとすると、下手な実装をするとすぐ親子間の無限ループが起こってしまうという悩みがあります[^infinite_loop]。

[^infinite_loop]: `number` 型データを `value` と `onChange` props でやりとりするステートフルなコンポーネントは、 `value` の変更を内部 state に反映するための副作用を `useEffect` 等で書く必要が生じます。すると、この `useEffect` の書き方が悪かったり、親コンポーネントの状態管理の仕方がまずかったりで、「親コンポーネントの状態更新 → 子の useEffect が発火 → onChange を通して親に変更を通知 → 親コンポーネントの状態が更新 …」という無限ループが起きてしまうことがあります（こういう無限ループが起きないように、 props に依存する `useEffect` を書くときは十分注意して実装する必要があります）。

このようなケースでは numeric input は `string` インターフェースでステートレスな controlled コンポーネントとして配置した方が、状態管理がはるかにシンプルになるので嬉しいです。
そもそも、このケースでは有限の数値の値しか取らないスライダーと、数値でない値まで取り得る numeric input の文字列状態を同期させる方法（スライダー側で無効になる値をどのようなデフォルト値にマップするかとそのタイミング）を定義するのは親コンポーネントの責務であるため、どのように parse 結果を数値に対応させるかは numeric input コンポーネント内部で定義すべきではないと言えます。

React の実装例： https://playcode.io/2136118

他には、 controlled numeric input の入出力である `number` 型データをそのまま持ち回るのではなく、入力文字列を state に反映する前の段階で

- clamp （値を $[min, max]$ の範囲に収まるようにする処理[^input-min-max]）
- 小数点以下を指定桁数で丸める（特に、整数になるように丸める）

などの処理を施したデータで入出力を行いたい、というような要求が生まれることもたびたびあります。

[^input-min-max]: `min`, `max` prop を設定することでできると思うかもしれませんが、そのままでは矢印キーや△▽ボタンで操作したときの挙動が変わるだけで、文字列欄での直接の入力やコピーペーストなどを防げるわけではありません（そうでないと、`min=0.5` のときに `0.6` を打とうとして `0.` の時点で違反してしまったりするので、 `min`, `max` の設定によらずどんな数値でも入力できるのは妥当な挙動です）。（ネイティヴHTML要素の例： https://developer.mozilla.org/ja/play?id=dc3oU7GkCpNmkh0Jr6raV5%2FD04EMkMO%2Bh9btyNBXvz49MrjumlCokhjD9CAEtEyNMvloPLGtOHM9SSFG）

こういうときに、

- インターフェースを `number` 型にするための状態管理を行う numeric input （子）コンポーネント
- インターフェースを整数にするための状態管理を行う numeric input （親）コンポーネント

を組み合わせるような実装になってしまうと、先ほどのスライダーの例と同様に無駄な `number` 型中間 state が挟まり、ステートフルなコンポーネントを密に組み合わせることとなりバグの元です。この場合も、「子」コンポーネントの方はステートレスなものを使い、「親」の方で直接整数と文字列の対応方法を定義し入出力も行う方が安全です。

## ではどうするか？（numeric input コンポーネント設計の筆者の結論）

前節までの議論を踏まえて、私は `NumericInput` コンポーネントとして以下の設計が良いだろうと考えています。所謂 Container/Presentational Component パターンと呼ばれるものに近い設計だと思います。

- numeric input のスタイリングのみを担当するステートレスな presentational コンポーネント（`NumericInputView`）を作る。
  - このコンポーネントのインターフェースは `string` の `value` と `onChange` 関数（と `disabled` などの各種ネイティヴ input 要素の属性）とする。
  - 機能としては、受け取った値をそのまま表示することと、ユーザーが input に文字を入力したらコールバック関数を実行することだけを担う。内部状態を持たない。
- `NumericInputView` をラップして数値型のインターフェースを持たせたステートフルな container コンポーネント `NumericInput` を用途毎に個別に実装する。このコンポーネントの内部実装では主に以下の 3 点を定義し実装する。
  1. 入力文字列と同期させる state … = `React.useState<string>("0")`
     - props の値が変わったら state に反映させる `React.useEffect` も実装する
  2. 文字列から数値への変換のタイミング（`submit`） … 「入力欄からフォーカスが離れたとき（= `onBlur`）」としておくと大体の場面で良さそうだが、前述の例のように submit ボタンも内蔵した上でそれが押下されたとき、と定義することなどもできる。
  3. 文字列 ↔ 数値変換の方法（`decode`, `encode`） … 2. で定義した `submit` のタイミングで、文字列を数値に変換する方法を定義する。 `Number.parseInt` や `Number.parseFloat` をそのまま使うだけでも良いかもしれないし、その後 `[min, max]` の範囲に clamp したり、小数点以下を指定桁数で丸めるなどのより複雑な変換を追加することもできる。

このような二段構えの実装設計には主に以下の二つのメリットがあります。

一つは、`NumericInputView`というスタイリングだけを担当する完全にステートレスなコンポーネントが提供されるという点です。
Material UI のような UI コンポーネントライブラリを使っていると、その見た目だけは拝借したいが挙動は気に食わないということがよくあるのですが、ステートレスコンポーネント `NumericInputView` が提供されていると自前で状態管理するという選択肢があるのは大きなメリットです。
Blueprint.js の `NumericInput` コンポーネントは `string` 型を使って controlled mode で細かい制御を行う、という脱出ハッチも用意しているのでかなり理想に近いですが、 同じコンポーネントに渡す props で uncontrolled/controlled mode を切り替えるような使い方であり、ステートレスに使いたい場合に無駄な状態管理が中で走っていて効率が悪いという点で若干不満はあります。
やはり、世の中の UI ライブラリは多くのユースケースに対応できるステートフルなパーツを提供すると共に、ステートレスなパーツもそれ単体で提供するようにしてほしいと私は思います。

もう一つは、ただの `number` 型より狭いカスタム数値型（例えば [実装例 A](#実装例A) における`ScoreType`）に対応する numeric input を使った実装が綺麗になる点です。型の制約に合う値だけをグローバルな state に反映するためにユーザー入力結果の文字列を数値に変換する処理を numeric input のレイヤーで行うことができるので、 `NumericInput` を使う側の実装がシンプルになります 。
複数のカスタム数値型があってそれぞれに対応する numeric input を UI に配置したいが見た目は同じで良い、という場合、`NumericInputView` を使ってそれぞれの数値型ごとに `NumericInput` を個別に実装して使う、というやり方を上の設計は意識しています（`NumericInputView` という一つのスタイル実装を使いまわし `NumericInput` は複数実装するというイメージ）。
`number` 型より狭い数値型としては、 union 型で定義された有限集合（例： 0以上10以下の整数 `0|1|2|3|4|5|6|7|8|9|10` など）や、 Branded Type[^1] （例： io-ts の `Int` 型）などが考えられます。いずれにせよ、`NumericInput`としては大きな差は無くほぼ同じ手順で実装することができます。

<!-- 一つ対策として、 `onKeyDown` で特定のキーの入力イベントを無視する処理を挟むことで避けたい数値文字列をブロックする、という方法を思いつくかもしれません（例えば `固定小数点表記にする` という要件に対して `"e"` という文字の入力をブロックする、など）。しかし、この方法は負数を含む数値型の場合には同様に文字種だけでは例えば `"0-2-3"` というフォーム状態を弾くことはできないようなので、万能な方法とは言えなさそうです。（【TODO: ブラウザの numeric input の仕様のリンク】）。 -->

[^1]: 参考： [TypeScript の Type Branding をより便利に活用する方法のまとめ](https://zenn.dev/noshiro_piko/articles/typescript-branded-type-int)

![numeric-input-architecture](https://github.com/noshiro-pf/mono/blob/develop/articles/numeric-input-interface/numeric-input-architecture.jpg?raw=true)

### 実装例 A

- App.tsx

  ```tsx
  import * as React from 'react';
  import { ScoreType } from './score';
  import { ScoreNumericInput } from './score-input';

  export const App = () => {
    const [score, onScoreChange] = React.useState<ScoreType>(0);

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
  import * as React from 'react';

  type Props = Readonly<{
    value: string;
    disabled: boolean;
    min: number;
    max: number;
    step: number;
    onChange: (value: string) => void;
    onBlur: () => void;
  }>;

  export const NumericInputView = React.memo<Props>((props) => {
    const { value, disabled, max, min, step, onChange, onBlur } = props;

    const handleChange = React.useCallback(
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
  });

  NumericInputView.displayName = 'NumericInputView';
  ```

- score.ts

  ```ts
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
  import * as React from 'react';

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
    const [valueAsStr, setValueAsStr] = React.useState(encode(valueFromProps));

    React.useEffect(() => {
      setValueAsStr(encode(valueFromProps));
    }, [valueFromProps, setValueAsStr, encode]);

    const submit = React.useCallback(() => {
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
