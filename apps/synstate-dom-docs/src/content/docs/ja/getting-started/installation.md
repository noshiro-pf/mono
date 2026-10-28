---
title: インストール
description: JSX の変換を設定し、最初のコンポーネントを描画する。
---

## インストール

synstate-dom は、アプリが状態を作るために import する synstate と一緒にインストールする。synstate は peer dependency なので、アプリと synstate-dom は同じインスタンスを共有する。

```sh
npm install synstate-dom synstate
```

もう 1 つの peer dependency である ts-data-forge は synstate の dependency なので一緒に入る。アプリから import するようになったら（たとえば[制御構文](/mono/synstate-dom/ja/guides/control-flow/)の `Optional`）、自分で追加する。

## JSX の変換を設定する

`tsconfig.json` で JSX の変換先を synstate-dom にする。必要なのはこれだけで、変換は TypeScript 自身のものなので、`jsxImportSource` を読むバンドラー（Vite、esbuild）はそのまま従う。

```jsonc
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "synstate-dom",
    },
}
```

## 最初のコンポーネント

```tsx
import { createState } from 'synstate';
import { constant, render, view, type JSX } from 'synstate-dom';

const [count$, _setCount, { updateState: updateCount }] = createState(0);

// Called once. Only the text node bound to `count$` changes afterwards.
const Counter = (): JSX.Element => (
    <div>
        <p>{view(count$, (n) => `Count: ${n}`)}</p>
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

`render(App, container)` は `<App />` ではなくコンポーネントそのものを受け取り、ルートスコープの中で 1 回だけ呼ぶ。返る関数はアプリをアンマウントする。アプリが作った購読と派生をすべて破棄し、ノードを取り除く。

JSX のテキストも `Bindable` なので、ラベルは `+1` ではなく `constant('+1')` と書く。理由は [Bindable](/mono/synstate-dom/ja/guides/bindable/) で説明する。
