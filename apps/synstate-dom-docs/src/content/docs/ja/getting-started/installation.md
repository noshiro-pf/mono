---
title: インストール
description: JSX の変換を設定して、最初のコンポーネントを描画してみます。
---

## インストール

synstate-dom は、アプリで状態を作るのに import する synstate と一緒にインストールします。synstate は peer dependency なので、アプリと synstate-dom は同じインスタンスを共有します。

```sh
npm install synstate-dom synstate
```

もう 1 つの peer dependency である ts-data-forge は synstate の dependency なので、一緒に入ってきます。アプリから直接 import するようになったら（たとえば[制御構文](/mono/synstate-dom/ja/guides/control-flow/)の `Optional`）、自分で追加してください。

## JSX の変換を設定する

`tsconfig.json` で、JSX の変換先を synstate-dom にします。必要なのはこれだけです。変換は TypeScript 自身のものなので、`jsxImportSource` を読むバンドラー（Vite、esbuild）ならそのまま従ってくれます。

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

`render(App, container)` には `<App />` ではなくコンポーネントそのものを渡します。`render` はそれをルートスコープの中で 1 回だけ呼びます。戻り値の関数を呼ぶとアプリがアンマウントされ、アプリが作った購読と派生がすべて破棄されて、ノードも取り除かれます。

JSX のテキストも `Bindable` なので、ラベルは `+1` ではなく `constant('+1')` と書きます。なぜそうするのかは [Bindable](/mono/synstate-dom/ja/guides/bindable/) で説明します。
