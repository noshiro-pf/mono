---
title: 低レベル API
description: JSX で書けない DOM のための mountable、mountChild、isChild、Switch。
---

ページのほとんどは JSX で書けます。残り（手で描く canvas、サードパーティのウィジェット、マウントの例外を捕まえるエラーバウンダリ、ルーター）のために 4 つの関数があります。制御フローのコンポーネントはこれらでできているので、これらで書いたコードも同じルールに従います。マウントされた owner の中で実行され、その owner と一緒に消えます。

## `mountable`

`mountable(mount)` は、関数がノードを自分で作って返す記述です。返すのは 1 つのノードか、順に並べた複数のノードです。`mount` は記述がマウントされた場所で、その owner と名前空間の中で、マウントのたびに実行されます。そのため同じ記述を何度マウントしても構いません。

```tsx
import { mountable, mountChild, type JSX } from 'synstate-dom-next';
import { counter, map, withInitialValue } from 'synstate-next';

// A canvas drawn by hand, with a caption the JSX way.
export const Sparkline = ({
    points,
}: Readonly<{ points: readonly number[] }>): JSX.Element =>
    mountable(() => {
        const figure = document.createElement('figure');

        const canvas = document.createElement('canvas');

        const context = canvas.getContext('2d');

        for (const [x, y] of points.entries()) {
            context?.fillRect(x * 4, 40 - y, 3, y);
        }

        figure.append(canvas);

        // Mounted in this description's owner: the counter, and the text that
        // follows it, go when the sparkline is unmounted.
        mountChild(
            <figcaption>
                {counter(1000)
                    .pipe(map((s) => `drawn ${s + 1} s ago`))
                    .pipe(withInitialValue('drawn just now'))}
            </figcaption>,
            figure,
        );

        return figure;
    });
```

返した最初と最後のノードが、マウントの始まりと終わりです。`For` の行や分岐は、それを手がかりに動かされ、取り除かれます。マウントされている間、それらはその場にとどまり、その外側には何も挿入しません。変わるものは、それらが持つ要素の中に、束縛か `mountChild` で入れます。後から自分のルートを置き換えたり、隣に兄弟を挿入したりする `mountable` は、取り除かれるときにノードを置き去りにします。

## `mountChild`

`mountChild(child, parent?)` は、JSX が子として受け付けるものをマウントし、そのノードを順に返します。`mountable` が自分で作った要素の中に入れるためのものです。

- 子が作ったもの（束縛、`Switch`、購読）は、現在の owner の下の専用の owner に属し、それと一緒に消えます。
- `parent` を渡すと、ノードを 1 回の挿入でそこに追加し、その名前空間で作ります。手で作った `<svg>` の中は SVG、その `<foreignObject>` の中は HTML です。渡さないと、進行中のマウントの名前空間で作り、置く場所は呼び出し側が決めます。
- 途中で例外を投げた子は呼び出しを失敗させ、自分のものを何も残しません。それまでに作ったものは破棄され、何も追加されません。エラーバウンダリにはこれで足ります。

```tsx
import { constant, mountable, mountChild, type JSX } from 'synstate-dom-next';

// Mounts `children`, or `fallback` when mounting them throws. What the children
// made before the throw is disposed by `mountChild`, so nothing of them stays.
export const ErrorBoundary = ({
    children,
    fallback,
}: Readonly<{ children: JSX.Element; fallback: JSX.Element }>): JSX.Element =>
    mountable(() => {
        const box = document.createElement('div');

        try {
            mountChild(children, box);
        } catch (error) {
            console.error(error);

            mountChild(fallback, box);
        }

        return box;
    });

export const Page = (): JSX.Element => (
    <ErrorBoundary fallback={<p>{constant('Something went wrong.')}</p>}>
        <Chart />
    </ErrorBoundary>
);

const Chart = (): JSX.Element => {
    throw new Error('no data');
};
```

- owner が消えても、ノードは取り除きません。`mountable` が作った `parent` は要素ごと消えます。マウントより長く残る要素にマウントするなら `Portal` を使ってください。
- どの owner の外で呼んでも（イベントハンドラからなど）、作ったものは破棄されず、警告が出ます。

## `isChild`

`isChild(value)` は、子とそれ以外の値を実行時に見分けます。1 つの prop で子か別のものを受け取るコンポーネントのためのものです。見るのは 1 段だけで、文字列・数値・Observable・記述、そして中身にかかわらず配列なら子とみなします。配列の要素のうち子でないもの（`null` やオブジェクト）は、空のテキストノードとしてマウントされます。

## ルーターのための `Switch`

`Switch`（[制御フロー](/mono/synstate-dom-next/ja/guides/control-flow/#switch)を参照）を公開しているので、ルーターはページをマウントするための分岐のコンポーネントを自分で写す必要がありません。ルーターは低レベルのコードを使わない、ただのコンポーネントになります。

```tsx
import { constant, listenInScope, Switch, type JSX } from 'synstate-dom-next';
import { createState } from 'synstate-next';
import type { ReadonlyRecord } from 'ts-type-forge';

// A hash router is a component: `Switch` keeps a page mounted while its path
// stays, and `listenInScope` stops listening when the router is unmounted.
export const HashRouter = ({
    pages,
    notFound,
}: Readonly<{
    pages: ReadonlyRecord<string, () => JSX.Element>;
    notFound: JSX.Element;
}>): JSX.Element => {
    const [path$, setPath] = createState(location.hash.slice(1));

    listenInScope(globalThis, 'hashchange', () => {
        setPath(location.hash.slice(1));
    });

    return (
        <Switch value={path$} key={(path) => path}>
            {(path) => pages[path]?.() ?? notFound}
        </Switch>
    );
};

export const App = (): JSX.Element => (
    <HashRouter
        pages={{
            '': () => <p>{constant('Home')}</p>,
            about: () => <p>{constant('About')}</p>,
        }}
        notFound={<p>{constant('Not found')}</p>}
    />
);
```

## ここにないもの

synstate-dom の `toNodes`、`createMountable`、型 `Mountable` と `MountedNodes` は作り直していません。記述が `JSX.Element` そのものなので別の mountable 型は要らず、JSX のコンパイル先のファクトリは `synstate-dom-next/jsx-runtime` の `jsx` です。
