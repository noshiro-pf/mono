---
title: '[WIP] ウェブフロントエンドフレームワーク Survey（加筆予定）'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['javascript', 'typescript', 'react', 'frontend', 'spa']
published: false
---

:::message
なるべく気を付けますが、自分はいずれのフレームワークについてもその開発者レベルで実装の詳細を熟知しているわけではありませんので、不正確になりうる点はご了承ください。誤りがあればぜひコメント欄でご指摘ください。
:::

## 今回取り上げたフレームワーク・ライブラリとその理由（使用時期）

- 業務でもプライベートでも使用経験があるもの
  - [React](https://react.dev/) （2019年頃～現在）
  - [Angular](https://angular.dev/) (v2) （2017年～2018年頃、2020～2022年頃）
- プライベートで使用経験があるもの
- Vanilla JS, jQuery（2015年？～2017年頃）
  - [Preact](https://preactjs.com/) （2021年頃～現在）
  - [Solid](https://www.solidjs.com/) （2021年頃）
- 名前は元から知っていたが少ししか書いたことがないもの
  - [Svelte](https://svelte.jp/)
  - [Vue](https://vuejs.org/)
  - [Elm](https://elm-lang.org/)
  - [PureScript](https://www.purescript.org/)
  - [ReScript](https://rescript-lang.org/)
- Rust (WebAssembly) を活用するタイプの SPA フレームワークも比較したいため追加
  - [DIOXUS](https://dioxuslabs.com/)
  - [Yew](https://yew.rs/)
  - https://github.com/flosse/rust-web-framework-comparison により詳しい比較あり
- 今回 SPA フレームワーク調査中に存在を知ったもの
  - [Inferno](https://www.infernojs.org/)
  - [Ember](https://emberjs.com/)
  - [Lit](https://lit.dev/)
  - State of JS 2024 の top 10 から
    - [Qwik](https://qwik.dev/)
    - [Stencil](https://stenciljs.com/)
    - [HTMX](https://htmx.org/)

## State of JS

https://2024.stateofjs.com/ja-JP/libraries/front-end-frameworks/

## 比較表

|            | 使用する言語           | View の記述言語             | レンダリング方式                                     | 登場時期（年） | 特徴                                                                                  |
| :--------- | :--------------------- | :-------------------------- | :--------------------------------------------------- | :------------- | :------------------------------------------------------------------------------------ |
| React      | JavaScript, TypeScript | JSX                         | 仮想DOM                                              | 2013           | 関数コンポーネント、hooks                                                             |
| Preact     | JavaScript, TypeScript | JSX                         | 仮想DOM                                              | 2015           | 関数コンポーネント、hooks、軽量                                                       |
| Inferno    | JavaScript, TypeScript | JSX                         | 仮想DOM                                              | 2016           | 最適化された仮想DOM実装によりハイパフォーマンス                                       |
| Solid      | JavaScript, TypeScript | JSX                         | fine-grainedリアクティビティ                         | 2019           | 仮想DOMを使わず独自のリアクティヴシステムを提供、ハイパフォーマンス・省バンドルサイズ |
| Svelte     | JavaScript, TypeScript | Svelte 構文                 |                                                      | 2016           | コンパイル時にコードを最適化するフレームワーク                                        |
| Vue        | JavaScript, TypeScript | JSX or テンプレート構文     | 仮想DOM                                              | 2014           | テンプレート用の記法でデータバインディングを記述する                                  |
| Angular    | JavaScript, TypeScript | テンプレート構文            | Incremental DOM                                      | 2009           | テンプレート用の記法でデータバインディングを記述する                                  |
| Ember      | JavaScript, TypeScript | テンプレート構文            | Glimmer                                              | 2011           |                                                                                       |
| Lit        | JavaScript, TypeScript | TypeScript デコレーターなど | Web Componentsの更新APIを直接利用                    | 2019年頃？     | Web components を記述するための軽量ライブラリ                                         |
| Stencil    | JavaScript, TypeScript | JSX                         | Web Componentsの更新APIを直接利用                    | 2017年         | Web Components をベースにしたコンパイラ                                               |
| Qwik       | JavaScript, TypeScript | JSX                         | Resumability & パーシャルハイドレーション            | 2021年         | SSR との親和性を重視した設計により、高速なロードとインタラクティブ性を両立させる      |
| Elm        | Elm                    | Elm                         | 仮想DOM の最適化版                                   | 2012           | 静的型付けの純粋関数型プログラミング言語                                              |
| PureScript | PureScript             | PureScript 独自構文         | 仮想DOM の最適化版                                   | 2014           | 静的型付けの純粋関数型プログラミング言語、Haskell の影響を強く受けた言語              |
| ReScript   | ReScript               | JSX or ReasonML             |                                                      | 2020           | OCamlから派生した言語                                                                 |
| HTMX       | HTMX, JavaScript       | HTMX                        | サーバーサイドでHTMLを生成し、ブラウザで部分的な更新 | 2020年         | HTMLの拡張構文、JavaScript をほとんど書かずに動的な Web アプリケーションを開発できる  |
| Yew        | Rust, WebAssembly      |                             | 仮想DOM に類似する最適化された差分検出システム       | 2018年頃？     | Rust で記述                                                                           |

## 各フレームワークの特徴

### [React](https://react.dev/), [Preact](https://preactjs.com/)

```tsx
import * as React from 'react';

export const Counter = () => {
  const [count, setCount] = React.useState(0);

  const increment = () => {
    setCount((c) => c + 1);
  };

  return (
    <div>
      <p>{`カウント : ${count}`}</p>
      <button onClick={increment}>{'カウントアップ'}</button>
    </div>
  );
};
```

- 仮想DOM を使用
- 関数コンポーネントと Hooks （useState など）で記述
  - class でも記述できるが現在使われることは稀
- 😊 hooks によりコンポーネント内 state を1行で追加したり、ロジックを関数として共通化したりといった抽象化がシンプルに行える
- 😊 すべてをJavaScript の世界で完結させることができる（Angular などでは template 構文を扱う必要がある）
- 😊 `setState` などによりディスパッチされる"rendering" でコンポーネント関数が呼び出され、その内容がメモ化されたものを除き毎回すべて再評価され、あとは仮想DOMが勝手に差分を DOM に適用してくれる、というメンタルモデルさえ獲得すればほとんど問題無く実用できる。
- [React のルール](https://ja.react.dev/reference/rules) を守る必要がある
  - これは、 コンポーネントとフックを冪等にすることやprops と state はイミュータブルに扱うことなど、自然なコンポーネント記述をしていれば抵触しないものではあります。
  - Strict Mode で検出しやすくすることもできます。
- 🙁 React hooks のルールを守る必要がある
  - Rule of React hooks
    1. 最上位でのみ Hook を呼び出す
       - Hook は、ループ、条件分岐、またはネストされた関数内で呼び出してはいけません。
       - Hook は、常に React 関数のトップレベルで呼び出す必要があります。
    2. React 関数内でのみ Hook を呼び出す
       - Hook は、通常の JavaScript 関数内で呼び出してはいけません。
       - Hook は、React 関数コンポーネント、またはカスタム Hook の中で呼び出す必要があります。
  - [`react-hooks/rules-of-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks) でほぼ検出できます。
  - これは状態管理実装の仕方に React の実装上の都合での制約が生じるものであり、他フレームワークと比べるとデメリットと呼べる可能性があるものです。

### [Angular](https://angular.dev/)

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <div>
      <p>カウント: {{ count }}</p>
      <div>{`${count % 2 === 0 ? '偶数' : '奇数'}`}</div>

      <button (click)="increment()">カウントアップ</button>
    </div>
  `,
  styles: [],
})
export class CounterComponent {
  count = 0;

  increment() {
    this.count++;
  }
}
```

- クラスベースコンポーネント
- style, template は別ファイルに分離することも可能
- 🙁 覚えるべきルールが膨大
  - template 構文（ `ngIf`, `ngFor`, `ngSwitch`, ... ）を覚える必要ある。
  - コンポーネントを定義して NgModule に登録する、などの作業
- 🙁 コード記述量が多い
  - コンポーネントを一つ作成するのにも専用コマンドが用意されているほど
- 🙁 TypeScript 中のコードでありながら、 template 部分の Syntax Highlighting を行うには専用の拡張を入れる必要がある。
- 🙁 コンポーネント作成の手間が大きい

  - template 内で参照するためのコンポーネント名 `app-counter` と JS 変数名 `CounterComponent` を別途定義する必要がある。
  - コンポーネントを定義した後 Module に別途追加しないと template 内で参照できない。

    ```ts
    import { NgModule } from '@angular/core';
    import { AppComponent } from './app.component';
    import { MyComponent } from './my-component/my-component.component'; // 追加

    @NgModule({
      declarations: [
        AppComponent,
        MyComponent, // 追加
      ],
      imports: [BrowserModule],
      providers: [],
      bootstrap: [AppComponent],
    })
    export class AppModule {}
    ```

- レンダリングエンジン Ivy において、インクリメンタル DOM という技術を採用している。
  - 仮想DOM（Virtual DOM） との比較：
    - 仮想DOM： JavaScript で DOM の構造を再現した仮想的な DOM ツリー（仮想DOM）を作成し、変更があった部分だけ実際の DOM に反映させる。
    - インクリメンタル DOM： 各コンポーネントを DOM 操作の命令列にコンパイルし、データの変更に応じて必要な部分だけを直接 DOM に変更を加える。
  - ツリーシェイカビリティとメモリ効率に優れる（らしい）
    - フレームワーク間のパフォーマンス比較については後述しますが、Solid や Preact などのより優れた選択肢があるため採用の根拠にはならなさそうです。

### [Vue](https://vuejs.org/)

- コンポーネント記述例（[template 構文](https://vuejs.org/guide/essentials/template-syntax.html)）

  ```vue
  <template>
    <div>
      <p>カウント: {{ count }}</p>
      <button @click="increment">カウントアップ</button>
    </div>
  </template>

  <script>
  export default {
    data() {
      return {
        count: 0,
      };
    },
    methods: {
      increment() {
        this.count++;
      },
    },
  };
  </script>
  ```

- コンポーネント記述例（[JSX](https://vuejs.org/guide/extras/render-function.html#jsx-tsx)）

  ```js
  import { ref, reactive } from 'vue';

  export const Counter = {
    setup() {
      // リアクティブなカウント変数を定義
      const count = ref(0);

      const increment = () => {
        count.value++;
      };

      return () => (
        <div>
          <p>カウント: {count.value}</p>
          <button onClick={increment}>+</button>
        </div>
      );
    },
  };
  ```

- [Virtual DOM](https://vuejs.org/guide/extras/rendering-mechanism.html#virtual-dom) を使用
  - render function の実行結果である仮想DOMツリーの差分のみを Real DOM に適用するシステム。

![virtual-dom](https://github.com/noshiro-pf/mono/blob/develop/articles/frontend-frameworks/virtual-dom.png?raw=true)

### [Ember](https://emberjs.com/)

テンプレート

```html
<div>
  <p>Count: {{count}}</p>
  <button {{on "click" this.increment}}>Increment</button>
</div>
```

コンポーネント

```js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CounterComponent extends Component {
  @tracked count = 0;

  @action
  increment() {
    this.count++;
  }
}
```

- Glimmer というレンダリングエンジンを採用している。
  - 各コンポーネントを DOM 操作の命令列にコンパイルし、データの変更に応じて必要な部分だけを直接 DOM に変更を加える
- Ruby on Rails の開発者でもある Yehuda Katz と Tom Dale によって2011年に開発された。

### [Inferno](https://www.infernojs.org/)

加筆予定

### [Solid](https://www.solidjs.com/)

- 特徴
  - React の影響を受けたフレームワーク
  - 仮想 DOM を使わず独自のリアクティヴシステムを採用しておりパフォーマンスに優れる
    ![benchmark1](https://github.com/noshiro-pf/mono/blob/develop/articles/frontend-frameworks/benchmark1.png?raw=true)
    ![benchmark2](https://github.com/noshiro-pf/mono/blob/develop/articles/frontend-frameworks/benchmark2.png?raw=true)

```tsx
import { onCleanup, createSignal } from 'solid-js';
import { render } from 'solid-js/web';

const CountingComponent = () => {
  const [count, setCount] = createSignal(0);

  const timer = setInterval(() => {
    setCount((count) => count + 1);
  }, 1000);

  onCleanup(() => {
    clearInterval(timer);
  });

  return <div>{`Count value is ${count()}`}</div>;
};

render(() => <CountingComponent />, document.getElementById('app'));
```

- React Hook のようなルールを理解する必要が無い
  - Hook は、ループ、条件分岐、またはネストされた関数内で呼び出してはいけません。
    Hook は、常に React 関数のトップレベルで呼び出す必要があります。
- すべてのコンポーネントは一度だけ評価（実行）され、依存関係が更新されるたびに実行されるのは hook と binding だけ

見た目同じ動作をする React コンポーネント実装：

```tsx
import * as React from 'react';

export const CountingComponent = () => {
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <div>{`Count value is ${count}`}</div>;
};
```

#### 使用時の注意点

リアクティヴシステムの仕組みを意識せねばならないシーンにちょくちょく遭遇する

1. ダメな例 その1： props を destruct するとリアクティヴな値の伝播が途切れて正しく動かない

   ```tsx
   const ViewComponent = ({ count }) => (
     //                   ~~~~~~~~~
     // Destructuring component props breaks Solid's reactivity;
     // use property access instead. eslint(solid/no-destructure)
     <div>{`Count value is ${count()}`}</div>
     //                      ↑ この値が 0 のまま動かなくなる
   );

   const CountingComponent = () => {
     const [count, setCount] = createSignal(0);
     // 中略
     return <ViewComponent count={count} />;
   };
   ```

   正しい実装（[`solid/no-destructure`](https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/no-destructure.md) という eslint ルールで自動修正可能）

   ```tsx
   const ViewComponent = (props) => (
     <div>{`Count value is ${props.count()}`}</div>
   );
   ```

2. ダメな例 その2：（配列を JSX 内で `Array.prototype.map` などで展開してはダメ）

   ```tsx
   const Component = (props) => (
     <ol>
       {props.data.map((d) => (
         <li>{d.text}</li>
       ))}
     </ol>
   );
   ```

   正しい実装（[`prefer-for`](https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/prefer-for.md)という eslint ルールで自動修正可能）

   ```tsx
   const Component = (props) => (
     <ol>
       <For each={props.data}>{(d) => <li>{d.text}</li>}</For>
     </ol>
   );
   ```

3. ダメな例 その3：（JSX 内で三項演算子などを用いてはダメ）

   ```tsx
   const Component = (props) => (
     <div>{props.cond ? <span>Content</span> : <span>Fallback</span>}</div>
   );
   ```

   正しい実装（[`prefer-show`](https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/prefer-show.md)という eslint ルールで自動修正可能）

   ```tsx
   const Component = (props) => (
     <div>
       <Show when={props.cond} fallback={<span>Fallback</span>}>
         <span>Content</span>
       </Show>
     </div>
   );
   ```

これらの例が動かないのは、 Solid の状態管理で使われる `Signal` は純粋な Object ではなく、 [`Proxy`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Proxy) から作られた特殊なObjectであることが原因です。 Proxy は Object の Getter と Setter の動作を乗っ取り、それらのプロパティの値が読まれたり、変えられたときに行う処理を改変する仕組みです。

例えば [Immer](https://immerjs.github.io/immer/#how-immer-works) は Proxy を使った JS の有名ライブラリの一つです。 immer の `produce` 関数が提供する `draft` オブジェクトは Proxy でできており、この `draft` に対する破壊的操作は `currentState` オブジェクトを改変することも丸ごと deep copy することもなく `nextState` を作ってくれます。

Solid ではこの Proxy をリアクティヴな変数を実現するために使用しており、そのためプログラマーは前述のような良くない例を踏まないようにリアクティヴィティを保つために慎重にコードを書く必要があります。配列の展開には `<For>`、条件分岐には `<Show>` を使う必要があります。

ただし、数年前 Solid を試したときには eslint plugin が整備されていなかったか私が存在を認知していなかったので、リアクティヴィティを保つ実装に注意力が結構必要だなという印象を受けたのですが、いつの間にか自動修正含め色々整備されていたのでほとんど困ることはないかもしれません。

### [Svelte](https://svelte.jp/)

- コンパイル時にコードを最適化する（仮想DOMを使用しない）
  - 実行時のパフォーマンスが良く、バンドルサイズが小さい

```html
<script lang="ts">
  import Even from './even.svelte';
  import Odd from './odd.svelte';

  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log({ doubled });
  });

  const increment = () => {
    count++;
  };
</script>

<div>
  <p>カウント: {count}</p>
  <p>カウント x 2: {doubled}</p>
  <div>{count % 2 === 0 ? "偶数" : "奇数"}</div>
  <div>{#if count % 2 === 0}<Even />{:else}<Odd />{/if}</div>
  <button onclick="{increment}">カウントアップ</button>
</div>
```

even.svelte

```svelte
<div>
  Even
</div>
```

odd.svelte

```svelte
<div>
  Odd
</div>
```

- 1ファイル1コンポーネントが強制される
  - コードの治安が保たれるという見方もできる半面、わざわざファイルに切り出すまでもない小さな共通コンポーネントをローカルに繰り返し使いたいユースケースでちょっと不便になりそう。

### [Elm](https://elm-lang.org/)

```elm
module Counter exposing (main)

import Browser
import Html exposing (..)
import Html.Events exposing (onClick)


type Model =
    { count : Int }


init : Model
init =
    { count = 0 }


type Msg
    = Increment


update : Msg -> Model -> Model
update msg model =
    case msg of
        Increment ->
            { model | count = model.count + 1 }


view : Model -> Html Msg
view model =
    div []
        [ p [] [ text ("カウント : " ++ String.fromInt model.count) ]
        , button [ onClick Increment ] [ text "カウントアップ" ]
        ]


main : Program () Model Msg
main =
    Browser.sandbox
        { init = init
        , view = view
        , update = update
        }
```

加筆予定

### [PureScript](https://www.purescript.org/)

```purescript
module Counter where

import Prelude
import Effect (Effect)
import React.Basic
import React.Basic.DOM (div, p, button, text)
import React.Basic.Events (onClick)
import React.Hooks (useState)

component = React.Basic.component "Counter" \ctx -> do
  (count, setCount) <- useState 0

  pure do
    div [] do
      p [] [ text $ "カウント : " <> show count ]
      button [ onClick $ \_ -> setCount (add 1 count) ] [ text "カウントアップ" ]
```

加筆予定

### [ReScript](https://rescript-lang.org/)

```rescript
import React from 'react';
import * as ReactHooks from 'react';

@react.component
let make = () => {
  let (count, setCount) = ReactHooks.useState(() => 0);

  let increment = () => setCount(prev => prev + 1);

  <div>
    <p> {React.string( "カウント : " ++ string_of_int(count)) } </p>
    <button onClick={_event => increment()}> {React.string("カウントアップ")} </button>
  </div>
};
```

加筆予定

### [DIOXUS](https://dioxuslabs.com/)

```rust
use dioxus::prelude::*;

fn main() {
    dioxus::desktop::launch(App);
}

fn App(cx: Scope) -> Element {
    let (count, set_count) = use_state(&cx, || 0);

    cx.render(rsx! {
        div {
            p { "カウント : {count}" }
            button { onclick: move |_| set_count(count + 1), "カウントアップ" }
        }
    })
}
```

加筆予定

### [Yew](https://yew.rs/)

```rust
use yew::prelude::*;

enum Msg {
    AddOne,
}

struct Counter {
    count: i64,
}

impl Component for Counter {
    type Message = Msg;
    type Properties = ();

    fn create(_ctx: &Context<Self>) -> Self {
        Self { count: 0 }
    }

    fn update(&mut self, _ctx: &Context<Self>, msg: Self::Message) -> bool {
        match msg {
            Msg::AddOne => {
                self.count += 1;
                true
            }
        }
    }

    fn view(&self, ctx: &Context<Self>) -> Html {
        html! {
            <div>
                <p>{ format!("カウント : {}", self.count) }</p>
                <button onclick={ctx.link().callback(|_| Msg::AddOne)}>
                    { "カウントアップ" }
                </button>
            </div>
        }
    }
}

fn main() {
    yew::start_app::<Counter>();
}
```

加筆予定

### [Lit](https://lit.dev/)

```tsx
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-counter')
export class MyCounter extends LitElement {
  static styles = css`
    p {
      color: blue;
    }
  `;

  @property({ type: Number }) count = 0;

  render() {
    return html`
      <div>
        <p>カウント : ${this.count}</p>
        <button @click=${this._onClick}>カウントアップ</button>
      </div>
    `;
  }

  private _onClick() {
    this.count++;
  }
}
```

加筆予定

### [Qwik](https://qwik.dev/)

```tsx
import { component$, useSignal } from '@builder.io/qwik';

export const Counter = component$(() => {
  const count = useSignal(0);

  const increment = () => {
    count.value++;
  };

  return (
    <div>
      <p>カウント : {count.value}</p>
      <button onClick$={increment}>カウントアップ</button>
    </div>
  );
});
```

加筆予定

### [Stencil](https://stenciljs.com/)

```tsx
import { Component, h, State } from '@stencil/core';

@Component({
  tag: 'my-counter',
  shadow: true,
})
export class MyCounter {
  @State() count = 0;

  render() {
    return (
      <div>
        <p>カウント : {this.count}</p>
        <button onClick={() => this.count++}>カウントアップ</button>
      </div>
    );
  }
}
```

加筆予定

### [HTMX](https://htmx.org/)

加筆予定

---

## 筆者がフロントエンドフレームワークを選ぶなら

以上、代表的なフロントエンドフレームワークについてまとめました。

筆者は、現在はメンテナンスしているすべてのフロントエンド実装に React か Preact を使用しています。使用時期や期間に差はありますが、過去には VanillaJS/jQuery や Angular なども実用アプリケーション開発に使用した経験（数千行以上）がありますが、今後当分は React/Preact を使うのが結論かなと考えています。
そこで React をベースとして他フレームワークのどういうところに利点を感じるか、どういうところに不満を感じる（あるいは感じそう）かを考えてみたいと思います。

### パフォーマンス観点

パフォーマンス面を重視する場合、Solid, Svelte, Inferno, などが React と比べて特にパフォーマンスに優れているようですが、この中で選ぶなら私は **Solid** を選びたいかなと思います（今更宣言的 UI を捨てて Vanilla JS で書くという選択肢はほぼ無いでしょう）。
**Inferno** は syntax が class component で記述する旧 React に近く、 hooks と関数コンポーネントで記述できる React 等と比べてあまり書きやすくはなさそうです。仮想DOMの実装が bit 演算を使用することなどにより React より高速化されているらしく、十分高いパフォーマンスを示していますが、仮想DOMを使っていることには変わりが無いので、リアクティヴィティを直接管理しようとする Svelte や Solid と比べると、ランタイムパフォーマンス・バンドルサイズで僅かに劣るようです。
**Svelte** はコンパイル時にコードを最適化しますが、結局 Solid と同じように仮想DOMを使わずにリアクティヴな値の伝播を管理する点では本質的な動作は同じものになると考えられ、パフォーマンス面で大きな優劣は付かないのではないかと思います。benchmark では僅かに Solid が勝るようです。また、小さなローカルコンポーネントを記述することがおそらくできないため柔軟性に若干欠けるような気もします。
**Solid** は React hooks に慣れた開発者にとってこの3つのうち最も親和性の高い選択肢だと思います。先述の通り JSX 記述時にいくつかの注意点がありますが、代わりに `useMemo`, `useCallback` hooks などや `React.memo` などによりメモ化のためのコードを記述する手間を大幅に削減できるため開発体験が非常に良さそうです。 Svelte と異なり、 Solid は（Svelteと同じくコンパイラでもありますが） TypeScript 上で使用するライブラリであるため、 Syntax Highlighting がしやすいという利点もあります。

ただ、これまで経験上 React のレンダリングエンジンだと遅くてどうしようもないから他を使いたい、という状況に遭遇したことがほとんど無いため、パフォーマンスを改善するためにReact 以外のフレームワークを使う強い動機は持ち合わせていないというのが正直なところです。
結局、宣言的UIとコンポーネントを実現する上での選択肢は

- rendering のたびにコンポーネントツリーを全部再計算してしまう（適宜メモ化する）が、仮想DOMを挟むことで差分を取って DOM に反映するところだけ最適化する（React, Preact などのやり方）
- 不要な再計算を省くために、自動的にリアクティヴに再計算する対象をコードとして記述し管理する（Solid や Svelte のやり方）

の二択になりそうで、後者はリアクティヴィティのための記述がどうしても発生することになるため、パフォーマンスとコード記述量のトレードオフが存在するのが現状なのかなという気がするのですが、それならばパフォーマンス面の要求が相当強くならない限りは syntax の良し悪し（場合によっては慣れ）を優先して良いのかな、という気持ちです。

その点、 React との親和性の高さとパフォーマンス・省バンドルサイズを両立できる選択肢として **Preact** も有力です。独自リアクティヴシステムを持つ Solid, Svelte ほどの理論値は追求できませんが、 多くの場合実用上十分なのかなと思っています。react との親和性を重視して作られており、適切に import 先の alias を設定することで React 製のライブラリを流用できる点が魅力です。実際私はいくつかのアプリケーションでは現在も採用しています。自分が Solid を採用する場合は実用上の要求というよりは技術的興味が大きな理由となりそうです。
**Vue**, **Angular** はいくつかの benchmark 上 React より優れていますが Preact や Solid ほどではなく、syntax の観点でデメリットが大きいと感じるため自分が採用する可能性はほぼ無さそうです。

### Syntax 観点

component や hooks をメモ化する手間が無いこと、 hook の記述ルールの少なさで Solid は優れていますが、代わりに React や Preact には無い Proxy オブジェクトの維持にまつわる JSX 内の記法の制約が生じるのが若干煩わしいような気もします。制御構文のための `For` や `Show` などの import の手間も気になるのかなと思いましたが、これは `useMemo` や `useCallback` などの import の手間との取引なので優劣はあまり付かないかなと思います。

メモ化のためのボイラープレートコードのうちフックを使うものは、グローバルステートに状態管理を寄せることで、コンポーネント内にコールバック関数やリアクティヴな変数を持たずに済むようにすることで大部分を回避することができます。そうなると、`React.memo` だけがボイラープレートとして残ることになりそうです。

加えて、React の場合は現在 [React Compiler](https://ja.react.dev/learn/react-compiler) というものがベータ版で提供されており、 `useMemo` や `React.memo` などによるメモ化のためのコードを自動で挿入することができるようです。まだ試せていないのですが、これを最大限活用できれば、メモ化のための多くの記述を完全に省いた React 関数コンポーネントは（`<For>` や `<Show>` などの JSX 内制御構文を必要とする）Solid に比べても真に少ないコンポーネント記述・import を実現できるので、 TypeScript の範疇でのフロントエンド実装の syntax の最適解の一つとなりそうな予感がします。

### 言語

TypeScript には JavaScript のスーパーセットであるという明確な利点がありますが、を使う以上どうしても JavaScript の負債も引き継ぐことになってしまうため、より洗練された堅牢性・保守性に優れた言語を使いたい場合は他の言語を検討する手もありそうです。

TypeScript よりも安全な言語でフロントエンドを構築したい場合に、 Elm, PureScript, ReScript などの純粋関数型言語を採用するのは有力です。 ReScript は比較的 JavaScript エンジニアが親しみやすい syntax をしているのと、比較的可読性の高い JS/TS コードを出力することが一応できるため移行のハードルが他二つよりは低いです。ただ、試した感じだと自分の手で書いたコードを置き換えられるほどのクオリティのコードは吐いてくれないため、 React&TypeScript プロジェクトの一部コードから置き換えていくような使い方はあまりする気にはなりませんでした。

Rust を使うタイプのフロントエンドフレームワークは、バックエンドにも Rust を使う場合などに言語を統一する選択肢として面白そうです。 使用できるかどうかは [WASM Browser Compatibility](https://developer.mozilla.org/en-US/docs/WebAssembly#browser_compatibility) を確認する必要があるかもしれません。 WASM のバンドルサイズが大きいというデメリットがあるらしいのと、マクロによる記述がエディタで補完が効きづらく書きづらいという噂を聞いたことだけあるので、このあたり詳しく調べてみようと思います。

結局抜き差しならない問題として、コンポーネントライブラリ（[Material UI](https://mui.com/material-ui/?srsltid=AfmBOormP6d7WQO8yFX4g1sLIYwFSP5IkFbXkelCkVuTNcN99900hDvz) や [Blueprint](https://blueprintjs.com/docs/) など）などで React 向けのものを使いたいとなるとReact を選んでおくのが無難になりやすいと思います。デザインは自作で済むなど外部依存無く実装できることが分かっている状況では、それ以外のフレームワークを採用する可能性がありそうです。

## TODO

- benchmark のコードを詳しく読んでみる
  - 公平な比較になっているのか自分の目で確認したい
- Vanilla JS/jQuery による命令的 UI は何がつらかったのかを言語化してみる
  - 本記事では宣言的UIを実現するもののみを比較していたため
- Rust を使うタイプのフロントエンドフレームワークについて詳しく調べる
