---
title: インストール
description: JSX の変換を設定して、最初のコンポーネントを描画します。
---

## インストール

synstate-dom-next はまだ公開していません。リポジトリの中では、パッケージから synstate-dom-next と synstate-next に workspace のパッケージとして依存します。

```jsonc
{
    "dependencies": {
        "synstate-dom-next": "workspace:*",
        "synstate-next": "workspace:*",
    },
}
```

synstate-next は peer dependency なので、アプリケーションと synstate-dom-next は同じ 1 つのコピーを共有します。グラフは 2 つのコピーにまたがれず、別のコピーの Observable は束縛するときに拒否されます。`MatchOptional` と `MatchResult` が受け取る `Optional` と `Result` は ts-std-forge のものです。アプリケーションから import するようになったら追加してください。

## JSX の変換を設定する

`tsconfig.json` で JSX の変換先を synstate-dom-next にします。必要なのはこれだけです。変換は TypeScript 自身のものなので、`jsxImportSource` を読むバンドラ（Vite、esbuild）ならそのまま使えます。

```jsonc
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "synstate-dom-next",
    },
}
```

## 最初のコンポーネント

```tsx
import { constant, render, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';

const [count$, _setCount, { updateState: updateCount }] = createState(0);

// Called once. Only the text node bound to `count$` changes afterwards.
const Counter = (): JSX.Element => (
    <div>
        <p>{count$.pipe(map((n) => `Count: ${n}`))}</p>
        <button
            type={constant('button')}
            onClick={() => {
                updateCount((n) => n + 1);
            }}
        >
            {constant('+1')}
        </button>
    </div>
);

const unmount = render(Counter, document.body);

// Later: disposes every subscription the app made and removes its nodes.
unmount();
```

`render(App, container)` は `<App />` ではなくコンポーネントそのものを受け取り、ルートの owner の中で 1 回呼びます。マウントはバッチです。アプリのマウント中に行った書き込みは、そのノードが `container` に入ってから伝播します。`render` はアプリをアンマウントする関数を返します。呼ぶとルートの owner が破棄され、アプリが作った束縛・派生・購読がすべて一緒に破棄され、ノードが取り除かれます。

JSX の中のテキストも `Bindable` なので、ラベルは `+1` ではなく `constant('+1')` と書きます。理由は [Bindable](/mono/synstate-dom-next/ja/guides/bindable/) で説明しています。
