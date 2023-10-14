# Web frontend framework 自作メモ

## SPA に必要な機能

-   component の管理
-   ルーティング
-

## sample input

```tsx
import { useMemo, useState } from 'react';

export const App = () => {
    const [num, setNum] = useState(2);

    const suffix = useMemo(() => new Array(num).fill('!').join(''), [num]);
    const msg = useMemo(() => `world${suffix}`, [suffix]);

    return (
        <div className='App'>
            <h1>Hello {msg}</h1>
            <button onClick={() => setNum((x: number) => x + 1)}>{'+1'}</button>
            <button onClick={() => setNum((x: number) => Math.max(0, x - 1))}>
                {'-1'}
            </button>
        </div>
    );
};
```

```tsx
function component<P, M>(
    model: (props: P) => M,
    view: (model: M) => JSX.Element,
) {}
interface Props {
    prefix: string;
}

export const App = component(
    (props: Props) => {
        const [num, setNum] = useState(2);
        const suffix = new Array(num).fill('!').join('');
        const msg = `${props.prefix}${suffix}`;

        return { msg, setNum };
    },
    (model) => (
        <div className='App'>
            <h1>{model.msg}</h1>
            <button onClick={() => model.setNum((x: number) => x + 1)}>
                {'+1'}
            </button>
            <button
                onClick={() => model.setNum((x: number) => Math.max(0, x - 1))}
            >
                {'-1'}
            </button>
        </div>
    ),
);
```

```tsx
export const App = component(
    (prevState: State, action: Action) => {
        /* action includes props as { type: "set-props1", value: <some-value> } */
        /* process */
        return nextState;
    },
    (state) => {
        /* post process */
    },
    (model) => (
        <div className='App'>
            <h1>{model.msg}</h1>
            <button onClick={() => model.setNum((x: number) => x + 1)}>
                {'+1'}
            </button>
            <button
                onClick={() => model.setNum((x: number) => Math.max(0, x - 1))}
            >
                {'-1'}
            </button>
        </div>
    ),
);
```

## Links

-   [仮想 DOM は本当に“速い”のか？ DOM 操作の新しい考え方を、フレームワークを実装して理解しよう](https://employment.en-japan.com/engineerhub/entry/2020/02/18/103000)
-   [自作フレームワークをつくって学ぶ 仮想 DOM 実践入門](https://kuroeveryday.blogspot.com/2018/11/how-to-create-virtual-dom-framework.html)
