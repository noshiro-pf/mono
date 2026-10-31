# synstate-dom 実装仕様

<!-- cspell:ignore Bindable bindable Mountable mountable thenable teardown Voby Sinuous Leptos snabbdom hydration -->

synstate の Observable を JSX の属性・子要素・props にそのまま渡し、DOM に直接束縛する UI ライブラリの実装仕様。コンパイラも仮想 DOM も持たない。

- 状態: 0.x として公開。パッケージの骨格、「4. 定数と `Bindable`」、「5. JSX の型」、「6. JSX ランタイムと `Mountable`」、「7. 束縛」、「8.2 `If`」、「8.3 `Match` 系」、「8.4 `For`」、「8.6 `Portal`」まで実装済み。
- 出典: 設計の起点は issue [#2131](https://github.com/noshiro-pf/mono/issues/2131)、synstate 側のライフサイクル（complete・dispose・スコープ）は「synstate ライフサイクル仕様」で確定した内容。本書は両者を UI ライブラリの実装の視点で 1 つにまとめたもので、食い違う箇所は本書で決め、その旨を書く。

## 1. 目的と範囲

### 1.1 目的

- コンポーネント関数はマウント時に 1 回だけ評価する。以後の更新は synstate の伝播で DOM の葉（属性・プロパティ・テキスト）に直接書き込む。
- コンパイラを使わない。TypeScript 標準の `jsx: react-jsx` と `jsxImportSource` だけで動く普通のライブラリにする。
- リアクティビティの正しさを lint ではなく型検査で守る。「ここには Observable か明示的な定数を渡さなければならない」を TypeScript が言う。
- 動的に生成・破棄される部分（リストの行、条件分岐、ルートの切り替え）で、派生 Observable・購読・timer・fetch が漏れない。

### 1.2 範囲外（当面）

- SSR とハイドレーション。
- 仮想 DOM による差分計算。
- コンポーネントの再実行（Preact Signals 方式）。

### 1.3 層の責任

| 層           | 責任                                                                                                       |
| :----------- | :--------------------------------------------------------------------------------------------------------- |
| synstate     | 値の伝播、complete と dispose の意味論、スコープ（`createScope` など）、生成した Observable のスコープ登録 |
| synstate-dom | JSX ランタイム、マウント、束縛、制御構文。スコープを作って評価し、破棄時に dispose する                    |
| アプリ       | グローバルな状態はモジュールのトップレベルで定義する。コンポーネントではスコープを意識しない               |

synstate-dom は独自の所有者（Owner）を持たず、synstate 本体のスコープを使う。#2131 の「所有者とライフサイクル」節は UI 層に Owner を置く案だったが、switchMap が射影の中で作った内側を所有するのに本体のスコープが要るため、ライフサイクル仕様で本体に移した。本書はそれに従う。

## 2. 決定事項

issue #2131 とライフサイクル仕様で決まったもの。実装はこれを前提にする。

1. **コンポーネント関数はマウント時に 1 回だけ呼ぶ。** 仮想 DOM も差分計算も持たない。
2. **コンパイラを使わない。** `jsx: react-jsx` と `jsxImportSource: "synstate-dom"` を使う。
3. **リアクティビティは型で表す。** 依存は synstate のグラフ（`pipe`・`combine`）で明示し、自動追跡はしない。実行時に持つのは「今どのスコープの中にいるか」だけである。
4. **データを受け取るスロットは `Bindable<T>`（`InitializedObservable<T> | Constant<T> | View<T>`）だけを受け付け、素の `T` は受け付けない。** 定数は `constant()` で包む。対象は DOM の属性・プロパティ、テキストの子要素、ライブラリが提供するコンポーネントの props。`{count$.getSnapshot().value}` のような「一度だけ読まれて更新されない」誤りを型エラーにするためである。
    - 例外（データではないもの）: イベントハンドラ、`ref`、`For` の `key` 関数、子要素を返す関数。
5. **束縛先に Observable を渡すなら初期値ありのもの（`InitializedObservable`）を要求する。** マウント時点で DOM に書く値が要るため。
6. **条件分岐とリストには専用のコンポーネント（`If`、`Match` 系、`For`）を使う。** 本体の `if` や早期 return はリアクティブにならないため。条件分岐は `<If cond then else />` とし、2 つの分岐を対等な props として書く。
7. **`JSX.Element` は遅延評価のマウント可能な記述（`Mountable`）である。** `jsx()` は DOM を作らない。JSX の子要素は `jsx()` より先に評価されるので、即時に DOM を作ると `<If cond={c$} then={<Heavy />} />` の `<Heavy />` が選ばれる前に作られてしまう。
8. **後始末はスコープが担う。** マウント中に同期的に作られた Observable と束縛の購読は、その時点のスコープに属し、スコープの dispose でまとめて破棄される。参照カウントは使わない（complete は取り消せず、消費者 0 件の瞬間にグローバルな counter が止まると再開できないため）。
9. **アプリのロジックは永続ストアとして書き、動的に作るのはビューに属する派生だけにする。** すべての Observable を永続させて動的生成をなくす案は採らない（リストの細粒度更新と、数が決まらない UI が書けなくなる）。
10. **制御構文は JSX のコンポーネントだけを提供し、関数版の別名は用意しない**（「8」）。
11. **context（React の `createContext` に当たるもの）は提供しない。** アプリの状態はストアを import すれば届く。ある部分木だけに見せたい Observable は props で明示的に渡す。コンポーネントは 1 回しか評価されないので、同じ Observable の参照を props で受け渡すだけなら途中のコンポーネントに再評価のコストはかからない。

## 3. 前提となる synstate 側の変更

synstate-dom の実装に先立って、または並行して synstate に入れる。詳細はライフサイクル仕様。

| 変更                                                                                    | synstate-dom が必要とする理由                                                    | 状態                    |
| :-------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- | :---------------------- |
| 完了したノードを親の子リストと伝播順から外す。子リストを `Set`、伝播順を depth バケツに | 行の破棄でノードが残らないこと。行数分のノードを O(1) 近くで作れること           | #2138（patch）          |
| `dispose()`（上流に伝えない完了）。子の `complete()` で上流を連鎖完了させる動作はなくす | スコープが所有ノードを、共有の上流を止めずに破棄すること                         | #2153（minor）          |
| スコープ API（`createScope`・`run`・`getCurrentScope`・`onScopeDispose`・`untracked`）  | マウントと破棄の単位。`assembleObservable` が生成時に現在のスコープへ登録する    | #2334（minor）          |
| switchMap / mergeMap が所有しない内側を完了させない                                     | 共有の Observable を返す切り替えで、その Observable が死なないこと               | #2335（patch）          |
| 完了済みの親に pipe した子を生成と同時に完了させる                                      | 完了済みの Observable を束縛したときに「一度だけ書く」と判定できること           | #2248                   |
| Observable に実行時の目印（symbol）を付ける                                             | `Constant` と Observable を実行時に区別すること（「4.1」）                       | `isObservable`（minor） |
| 伝播中の書き込み（購読者や operator の中での `next` / `setState`）に warning を出す     | synstate-dom 自身が伝播中に書き込まないことをテストで確かめられること（「8.4」） | #2336（minor）          |

スコープ API の形（ライフサイクル仕様 6.1）:

```ts
export type Scope = Readonly<{
    run: <R>(fn: () => R) => R;
    dispose: () => void;
    isDisposed: () => boolean;
}>;

export declare const getCurrentScope: () => Scope | undefined;
export declare const createScope: (parent?: Scope | undefined) => Scope;
export declare const onScopeDispose: (fn: () => void) => void;
export declare const untracked: <R>(fn: () => R) => R;
```

所属の規則:

1. `scope.run(fn)` の実行中に**同期的に**作られた Observable は、いちばん内側の run のスコープに属する。
2. run の外（モジュールのトップレベル、`untracked` の中）で作られたものはどのスコープにも属さない（グローバル）。
3. `await` の後やコールバックの中は、run がもう戻っているのでどのスコープにも属さない。入れたい場合は同期部分で `getCurrentScope()` を取っておき、その `run` で包む。
4. dispose は子スコープ、後始末関数（逆順）、所有ノード（作った順の逆）の順に破棄し、親スコープから自分を外す。二度目以降は何もしない。
5. dispose 済みのスコープで `run` すると warning を出し、`fn` は実行するが、その中で作られた Observable はどのスコープにも属さない（run の外と同じ）。

スコープ API と `dispose` は、アプリを書く利用者ではなく synstate-dom のような上に載るライブラリの作成者が使うものなので、JSDoc とドキュメントの見出しで作成者向けと示す。置き場所は `synstate` の通常の入口で、#2117 で決めた custom operator 用の factory と同じ。スコープは core 自身（生成時の登録や switchMap）が使うので、subpath に分けても相互依存が見えにくくなるだけだからである。

## 4. 定数と `Bindable`

### 4.1 型と `constant`

```ts
import { type Brand } from 'ts-type-forge';

export type Constant<T> = Brand<T, 'synstate-dom/Constant'>;

export type Bindable<T> = InitializedObservable<T> | Constant<T> | View<T>; // View は「7.3」

// ライブラリ内でこの 1 か所だけ型アサーションを使う
export const constant = <const T extends {}>(
    value: T extends Observable<unknown> ? never : T,
): Constant<T> => value as Constant<T>;
```

- `Constant<T>` は型の上だけのブランドで、`constant()` は値をそのまま返す。実行時のコストはない。
- ブランドは synstate 本体（`UpdateToken` など）と揃えて ts-type-forge の `Brand` で作る。`Brand` のキーは文字列のプロパティなので、他のライブラリのブランドと衝突しないよう `'synstate-dom/Constant'` と名前空間を付ける。このキーは型の上では `true` として読めるが、実行時には存在しないので参照しない。
- 素の値は `Constant<T>` に代入できない。`constant('btn')` の型は `Constant<'btn'>` でリテラル型を保つ。`Constant<T>` は `T` に代入できる。
- `null` と `undefined` は `T extends {}` で拒否する。制約が無いと `constant(maybeStr)` が `Constant<string>` になり `undefined` が黙って落ちる。属性が無いことは props の省略で、あったりなかったりする値は `InitializedObservable<T | undefined>` で表す。値が無い状態を定数で渡す必要は props の省略で常に代えられるので、`null` / `undefined` の定数は用意しない。そのため、ライブラリのコンポーネントは値が無いことを表す props を optional にする。
- `constant(obs$)` は条件型で拒否する。
- 残る穴は `constant(count$.getSnapshot().value)` だけで、明示的な呼び出しなので読めば分かり、検索でも見つかる。
- 自作コンポーネントが「初期値として一度だけ読む」props は `Constant<T>` で受ける（例: `initial: Constant<number>`）。呼び出し側は `initial={constant(0)}` と書くことになり、Observable も素の値も型エラーになるので、「一度だけ読む」ことが変数名の慣習ではなく型で表れる。受け取った側は `Constant<T>` をそのまま `T` として使える。
- `constant` の短い別名は公式には用意しない。短く書きたい利用者は `import { constant as c } from 'synstate-dom'` のように import 時に名前を変える。

**実行時の判定**: 実行時の `Constant` はただの値なので、束縛処理は「Observable でも `View` でもなければ定数として一度だけ書く」と判定する。`subscribe` メソッドの有無で判定すると、`subscribe` を持つ定数オブジェクトを取り違えるので、synstate が Observable に付ける symbol の目印（「3」）で判定する。判定関数 `isObservable` は synstate から import し、synstate-dom では定義しない。

### 4.2 `Bindable` を受け取る側の補助関数

自作コンポーネントが `label: Bindable<string>` を受け取ったとき、そのままでは `.pipe(map(...))` を書けないので用意する。

| 関数                          | 定数のとき                                                  | Observable のとき                                     | `View` のとき                                  |
| :---------------------------- | :---------------------------------------------------------- | :---------------------------------------------------- | :--------------------------------------------- |
| `mapBindable(b, f)`           | `f` を 1 回だけ適用して `Constant` を返す。ノードを作らない | `b.pipe(map(f))`                                      | 関数を合成した `View` を返す。ノードを作らない |
| `derive([a, b], (a, b) => …)` | すべて定数なら `f` を 1 回適用して `Constant` を返す        | 定数を `just` にして synstate の `derive`（1 ノード） | `toObservable` で Observable にしてから同じ    |
| `toObservable(b)`             | `just(b)` を返す                                            | そのまま返す                                          | `source.pipe(map(fn))`                         |

定数から派生した値は定数のままなので、静的な部分はグラフに一切入らない。`toObservable` は `switchMap` の中など Observable が本当に必要な場面に限る。

## 5. JSX の型

### 5.1 `Child` と `JSX` 名前空間

```ts
export type Child = JSX.Element | Bindable<string | number> | readonly Child[];

export declare namespace JSX {
    type Element = Mountable;

    type ElementChildrenAttribute = Readonly<{ children: unknown }>;

    interface IntrinsicElements extends GeneratedIntrinsicElements {}
}
```

テキストの子要素も `Bindable<string | number>` だけを受け付ける（#2131 検討事項の (a)）。TypeScript は JSX テキストを常に `string` として扱い `{s}` と区別できないので、`<p>big</p>` は TS2747 になり、`<p>{constant('big')}</p>` と書く。決定事項 4 と一貫し、エラーメッセージも分かりやすい。書き心地は「11. 未決事項」の別名の検討で補う。

### 5.2 `IntrinsicElements` の生成

手で書かず、`lib.dom.d.ts` の `HTMLElementTagNameMap`（と `SVGElementTagNameMap`）から mapped type で生成する。

```ts
type GeneratedIntrinsicElements = Readonly<{
    [K in keyof HTMLElementTagNameMap]: ElementProps<HTMLElementTagNameMap[K]>;
}>;

type ElementProps<E extends Element> = Readonly<
    {
        class?: Bindable<string>;
        style?: Bindable<string> | StyleProps;
        ref?: (el: E) => void;
        children?: Child;
    } & AttributeProps<E> &
        PropertyProps<E> &
        EventProps<E>
>;
```

- **属性とプロパティを区別する。** `value`・`checked`・`selected`・`indeterminate` など、ユーザー操作で属性と実体がずれるものはプロパティとして書く（`el[key] = v`）。それ以外は `setAttribute`。区別の一覧は 1 つの定数表に置き、型と実行時の両方がそれを読む。
- **イベント** は `on` + `HTMLElementEventMap` のキーを PascalCase にしたもの（`onClick`）。引数は `ev: HTMLElementEventMap[K] & Readonly<{ currentTarget: E }>`。値は関数のみで Observable は受け付けない（決定事項 4 の例外）。
- **`ref`** は要素を作った直後、子をマウントする前に 1 回呼ぶ。
- 真偽属性（`disabled` など）は `Bindable<boolean>` で受け、`false` で属性を外す。
- **イベントの props 名**は、イベント名が小文字の 1 語（`pointerdown`）で単語の境目が分からないので、イベント名から props 名（`onPointerDown`）への対応表を型で持つ。表が `HTMLElementEventMap` と `SVGElementEventMap` のキーをすべて覆うことはテストで確かめる。実行時は props 名を小文字にすればイベント名に戻るので、表を読まない。
- **SVG** の要素は `SVGElementTagNameMap` のうち HTML に無いタグを SVG の名前空間で作る。`a`・`script`・`style`・`title` は HTML にもあるので、どこに書いても HTML の要素になる。SVG のプロパティは `SVGAnimatedLength` などで属性の型を読み取れないので、受け付ける属性は一覧で持つ。

生成した型がエディタの補完と型検査で重すぎないかを、最初の実装で `tsc --extendedDiagnostics` で測る。

## 6. JSX ランタイムと `Mountable`

### 6.1 `Mountable`

```ts
declare const mountableTag: unique symbol;

export type Mountable = Readonly<{
    [mountableTag]: true;
    /** 現在のスコープの中で呼ばれ、DOM ノードを作って返す */
    mount: () => MountedNodes;
}>;

/** 1 つの記述がマウントした結果。制御構文はアンカー付きの範囲になる */
type MountedNodes = Node | readonly Node[];
```

- `Mountable` は**関数ではなくオブジェクト**にする。`If` の props 名 `then` が関数だと、props オブジェクトが Promise の解決で thenable として扱われるため（#2131 検討事項）。
- 同じ `Mountable` を 2 回マウントしてよい。毎回新しい DOM を作る（`For` の行や `If` の再表示で同じ記述を使い回すため）。

### 6.2 `jsx` / `jsxs` / `Fragment`

`synstate-dom/jsx-runtime` と `synstate-dom/jsx-dev-runtime` から export する。

- `jsx(type, props, key)` は `Mountable` を返すだけで、DOM もコンポーネントの呼び出しも行わない。
- `type` が文字列なら要素の記述、関数ならコンポーネントの記述。
- `jsx: react-jsx` の変換は `key` を props から外して第 3 引数で渡すので、コンポーネントには props に戻して渡す。`For` は `key` 関数を props で受けるためである。要素では使わない。
- `Fragment` は子を並べるだけの記述。

### 6.3 マウントの手順

`mount()` は常に呼び出し側のスコープの `run` の中で呼ばれる。

- **要素**: `document.createElement`（SVG は名前空間付き）→ `ref` → 属性・プロパティ・イベントの束縛（「7」）→ 子を順にマウントして append。要素ごとにスコープは作らない。
- **コンポーネント**: 関数を `props` で 1 回呼び、返った `Mountable` をマウントする。コンポーネントごとにスコープは作らない（「6.4」）。
- **子要素**: `Mountable` はマウント、`Bindable<string | number>` は Text ノード（「7.2」）、配列は平坦化して順に処理する。

### 6.4 スコープを作る場所

スコープを作るのは、破棄のタイミングが独立するところだけである。

| 作る場所                | 親スコープ                       | 破棄するとき                      |
| :---------------------- | :------------------------------- | :-------------------------------- |
| `render`                | なし（`createScope(undefined)`） | `render` が返した関数を呼んだとき |
| `If` / `Match` の各分岐 | `If` をマウントしたスコープ      | 分岐が切り替わったとき、親の破棄  |
| `For` の各行            | `For` をマウントしたスコープ     | キーが消えたとき、親の破棄        |

コンポーネントは 1 回しか評価されず、寿命は必ずそれを含む分岐・行・ルートと一致するので、コンポーネント単位のスコープは作らない。スコープの数と破棄の手間が減る。context は提供しない（決定事項 11）。

コンポーネントの中で effect の代わりに使う補助関数を `scope/` から公開する。どれも現在のスコープの `onScopeDispose` に後始末を登録する。

- `subscribeInScope(source, next)`: 購読し、スコープの破棄で解除する。束縛（「7.1」）が完了していない Observable を購読するのもこれで行う。
- `listenInScope(target, type, listener, options)`: `window` などコンポーネントが描く要素以外のイベントを、スコープの破棄まで聞く。要素のイベントの束縛（「7.2」）もこれで行う。
- `createAfterUpdate()`: 処理を microtask で実行する関数を返す。進行中の更新が終わり、DOM が書かれた後に実行されるので、状態に書き込める。最初のマウントの後に実行したい処理にも使う。それまでにスコープが破棄されていれば捨てる。

### 6.5 `render`

```ts
export const render = (
    app: () => JSX.Element,
    container: Element,
): (() => void) => {
    const root = createScope(undefined);

    const nodes = root.run(() => mountNodes(app()));

    container.append(...toArray(nodes));

    return () => {
        root.dispose();

        for (const n of toArray(nodes)) n.remove();
    };
};
```

`app` はコンポーネント（`() => JSX.Element`）を受け取り、`render(<App />, el)` ではなく `render(App, el)` と書く。どちらでも `App()` が `root.run` の中で 1 回だけ呼ばれる点は同じだが、関数で受けるほうが「ここで評価される」ことが読み取りやすい。

## 7. 束縛

### 7.1 共通規則

束縛関数は値の種類で 3 通りに振る舞う。

| 渡された値                             | 振る舞い                                                                       |
| :------------------------------------- | :----------------------------------------------------------------------------- |
| `Constant`                             | 1 回だけ書く。購読しない                                                       |
| 完了済み（`isCompleted`）の Observable | 現在値を 1 回だけ書く。購読しない（`just` など）                               |
| それ以外の `InitializedObservable`     | 購読し、値が来るたびに書く。解除を `onScopeDispose` で現在のスコープに登録する |

購読の初回同期通知で初期値を書く。同じ値の再書き込みは避けない（synstate 側の `skipIfNoChange` などに任せる）。

### 7.2 種類ごとの書き込み

| 対象       | 書き方                                                                                             |
| :--------- | :------------------------------------------------------------------------------------------------- |
| 属性       | `setAttribute(name, String(v))`。真偽属性は `true` で空文字、`false` で `removeAttribute`          |
| プロパティ | `el[name] = v`                                                                                     |
| テキスト   | 空の Text ノードを作り `node.data = String(v)`                                                     |
| `class`    | 文字列形式とオブジェクト形式のどちらか一方を受け付ける（下記）                                     |
| `style`    | `Bindable<string>` は `style.cssText`。オブジェクト形式は各キーを `style.setProperty` で個別に束縛 |
| イベント   | `listenInScope`（「6.4」）。開発ビルドの warning は下記                                            |

**制御された `checked` と `indeterminate`**: `<input>` の `checked` または `indeterminate` を束縛すると、`change` の後、次のフレームの描画前に要素を束縛中の値へ書き戻す。持ち主が変更を受け取らなかった（`onChange` で値を変えなかった）とき、ユーザーの切り替えが画面に残らないようにするためで、結果は React の制御されたコンポーネントと同じになる。ただし React は自分のイベント処理の終わりに同期的に戻すのに対し、こちらは次のフレームまで戻さない。クリックは `indeterminate` も外すので、同じく書き戻す。

- 書き戻しを次のフレームまで待つのは、祖先に委譲したハンドラも含めて、そのイベントのハンドラがすべてユーザーの変更を読めるようにするため。
- 書き戻しを予約する `change` のリスナーは capture で登録する。要素自身のハンドラより先に走るので、ハンドラが `stopImmediatePropagation` を呼んでも止まらない。
- ラジオボタンを選ぶと、同じグループ（同じ document か shadow root・同じ `name`・同じ form）のほかのボタンはイベント無しに外れる。そこで 1 つの `change` で、グループの束縛されたボタンをすべて書き戻す。束縛していないボタンを選んだときはリスナーが無いので書き戻さない。グループのボタンはすべて束縛する。
- 束縛せずにユーザーに切り替えさせるには `defaultChecked` を使う。
- `value` は書き戻さない。入力のたびに値を更新しない書き方（確定時にだけ反映する、など）が入力を妨げるため。

**イベントハンドラの中で作った Observable**: ハンドラが呼ばれる時点ではどのスコープの `run` も動いていないので、ハンドラの中で `a$.pipe(map(...))` を作るとどのスコープにも属さず、行や分岐が消えても計算され続ける（規則 3）。開発ビルドでは、synstate-dom が登録したハンドラの実行中に Observable が作られたら warning を出す。ハンドラを包んで実行中の目印を立て、synstate の生成時の登録処理がそれを見る。`await` の後は見分けられないので、README で「同期部分で `getCurrentScope()` を取っておき、その `run` で包む」書き方を示す。モジュールのトップレベルで作るストアは正しく所属なしなので、警告しない。

**`class` のオブジェクト形式**: `class` は `Bindable<string> | Readonly<Record<string, Bindable<boolean>>>` を受け付ける。

```tsx
<li class={{ item: constant(true), active: isActive$, done: isDone$ }} />
```

- オブジェクト形式では、キーごとに `classList.toggle(key, v)` を個別に束縛する。文字列を `derive` で組み立てずに済み、変わったクラスだけを書き換える。
- 1 つの要素では文字列形式とオブジェクト形式の一方だけを使う。文字列の `className` への書き込みはトグルしたクラスを消してしまうためで、Solid が `class` と `classList` を別の props に分けているのも同じ理由である。1 つの props の中でどちらかを選ぶ形にすれば、両方を同時に書けない。
- キーに空白を含む文字列（`'a b'`）は `classList.toggle` が例外を投げるので、開発ビルドで `console.error` を出す。

### 7.3 その場変換

入力が 1 つの軽い変換は、グラフのノードを作らずに束縛の購読者の中で行う。`view(obs, fn)` は「Observable と変換関数の組」を表すオブジェクトを返し、`Bindable` を受け付けるすべての場所（属性・プロパティ・テキスト・`class` のオブジェクト形式の値・ライブラリのコンポーネントの props）に渡せる。

```tsx
<span>{view(count$, (n) => `${n} 件`)}</span>
<button disabled={view(count$, (n) => n === 0)}>リセット</button>
```

```ts
declare const viewTag: unique symbol;

export type View<T> = Readonly<{
    [viewTag]: true;
    open: <R>(
        use: <A>(source: InitializedObservable<A>, fn: (value: A) => T) => R,
    ) => R;
}>;

export declare const view: <A, T>(
    source: InitializedObservable<A>,
    fn: (value: A) => T,
) => View<T>;
```

- 入力が 1 つなら購読者の中で変換しても不整合は起きず、ノード生成のコストを省ける。`map` と `pipe` を import して `count$.pipe(map(fn))` と書くより短い。
- 束縛処理は `open` で `source` と `fn` を取り出し、`source` を購読して、値が来るたびに `fn` を通してから書き込む。購読は束縛と同じくスコープに属する。
- `source` と `fn` をプロパティとして持たせると、`source` の値の型を消すために `fn` の引数を `never` にするしかなく、呼ぶ側で `as never` が要る。`open` に渡すコールバックを値の型について総称的にすれば、`source` と `fn` の型が対応したまま取り出せるので、型アサーションが要らない。
- `fn` は値が来るたびに呼ばれる。同じ `View` を 2 か所に渡すと 2 回呼ばれる（ノードを作らないので結果を共有しない）。重い変換や複数の束縛先で共有する値は `pipe(map(...))` でノードにする。
- `[obs, fn]` のタプルを直接渡す形は採らない（型検査を保てる方法がないことを確認して決定）。props の型は要素ごとに固定なので、タプルの第 0 要素の型から第 1 要素の引数の型を推論させられない。引数を `unknown` にすると `(n: number) => …` が代入できず、`never` にすると誤った型の関数も通ってしまう（TypeScript で確認済み）。関数 `view` なら型引数 `A` で 2 つを結び付けられる。

## 8. 制御構文

制御構文は JSX のコンポーネント（`<If>`・`<MatchOptional>`・`<MatchResult>`・`<For>`）だけを提供し、同じものの関数版（`when(cond$, a, b)` など別名の API）は用意しない。

- コンポーネントは `Mountable` を返すただの関数なので、`{If({ cond: c$, then: <A />, else: <B /> })}` と関数として呼んでも JSX と同じに動く。JSX の外で `Mountable` を組み立てるヘルパーはこの書き方で足りる。
- 関数版がよく求められる理由（分岐を `() => <A />` で遅延させる）は、`JSX.Element` 自体が遅延評価の記述なので（決定事項 7）この設計には当たらない。
- 同じものに 2 つの名前があると、ドキュメントと型定義が倍になり、検索しにくく、コードベースの書き方が揺れる。名前付き props は引数の位置を覚えずに読める。

### 8.1 位置の目印

`If`・`Match`・`For` はラッパー要素を作らず、範囲の終わりを示すコメントノード（アンカー）を置く。中身の挿入は `anchor.before(...)`、削除は範囲内のノードの `remove()` で行う。マウント結果は `[...中身, anchor]` になる。

分岐の中身のノードは、その分岐のスコープの `onScopeDispose` で外す。分岐の先頭に別の `If` があると中身のノードが後から入れ替わるので、外側がマウント時のノードの一覧を持っていても正しく外せないためである。親が持つ一覧には古いノードが残りうるが、外れたノードの `remove()` は何もしないので害はない。`For` は行を並べ替えるときに行の今のノードが要るので、行ごとに先頭のコメントノードを置き、そこから次の行の先頭（またはアンカー）の手前までを行のノードとする。

### 8.2 `If`

```tsx
<If
    cond={isBig$}
    then={<p>{constant('big')}</p>}
    else={<p>{constant('small')}</p>}
/>
```

- `cond: Bindable<boolean>`、`then: JSX.Element`、`else?: JSX.Element`。`else` を省略した側では何も描画しない。
- 記述は遅延評価なので、両方の分岐を props に書いてもマウントされるのは選ばれた側だけである。
- 真偽が変わったときだけ反応する（内部で直前の値と比べる）。反転したら前の分岐のスコープを dispose して DOM を外し、`createScope(マウント時のスコープ)` で新しい分岐をマウントする。
- `cond` が `Constant` なら分岐を 1 回だけマウントし、購読しない。
- `else` は予約語なので、実装では `({ cond, then, else: elseBranch })` と別名で受ける。

### 8.3 `Match` 系

```tsx
<MatchOptional
    value={user$}
    some={(u$) => <Profile user$={u$} />}
    none={<Login />}
/>
```

- `MatchOptional`（`Optional<T>`）と `MatchResult`（`Result<T, E>`）を用意する。ts-data-forge の型にそろえる。
- 子の関数には中身の型に絞った `InitializedObservable<T>` を渡す。タグ（Some / None、Ok / Err）が変わったときだけ分岐を作り直し、同じタグの間は渡した Observable に新しい中身を流す。この Observable は `For` の行と同じく `value` から派生させ（`filter` で同じタグの値だけを通して中身を取り出す）、伝播中に書き込まない。
- 汎用の `Match`（判別共用体の `type` で分ける）は、`MatchOptional` と `MatchResult` を作った後に形を決める。

### 8.4 `For`

```tsx
<For items={todos$} key={(t) => t.id}>
    {(todo$, index$) => <TodoRow todo$={todo$} index$={index$} />}
</For>
```

- `items: Bindable<readonly T[]>`、`key: (item: T, index: number) => unknown`（必須）、子は `(item$: InitializedObservable<T>, index$: InitializedObservable<number>) => JSX.Element`。
- 配列を渡す props は `items` とする。Solid は `each` だが、`<For each={todos$}>` は英語として「for each todos」と読めてしまうため、渡すものを表す名詞にした。
- `key` は React と同じく必須にする。位置で対応づけたいときは `key={(_, i) => i}` と明示する。位置で対応づける専用の `Index` は用意しない。
- `For` はマウント時のスコープで、`items` から「キー → `{ item, index }`」の Map を作るノード（`entries$`）を 1 つ作る。
- 行ごとに `createScope(マウント時のスコープ)` を作り、その `run` の中で `item$` と `index$` を `entries$` から派生させて（自分のキーの要素を取り出し、前回と同じなら流さない）、子の関数を 1 回呼ぶ。`item$` と `index$` はそれぞれ `entries$` の直接の子 1 つで作る。`index$` は子の関数が第 2 引数を宣言しているとき（`children.length >= 2`）だけ作る（Solid の `For` と同じ）。使わない行の `index$` も更新のたびに走り、行の作成と破棄の時間も増やすため。残り引数や `arguments` で読む関数には `undefined` が渡る。`map`・`filter`・`withInitialValue`・`skipIfNoChange` を重ねると行ごとに 8 ノードになり、行の作成と破棄の時間はほぼノード数で決まるため。行の中は細粒度のまま更新される。
- 配列が更新されたら（`For` は `entries$` を購読して行の増減と DOM を扱う）:
    1. 既存のキーの行は、`entries$` の子として通常の伝播で `item$` と `index$` が更新される。`For` は何もしない。子の関数も呼ばない。
    2. 新しいキーは上の手順で行を作る。
    3. 消えたキーの行はスコープを dispose し、DOM を外す。その行の `item$` / `index$` がこの更新で走っても、キーが見つからないときは前回の値のままにする（流さない）。
    4. DOM の並べ替えは最長増加部分列（LIS）で移動を最小にする。キーの並びが前回と同じなら並べ替えの計算自体を省く。
    5. 残るキーが 1 つもない（全消去や全置き換え）ときは、行のノードを 1 つの `Range` でまとめて外してから各行のスコープを dispose する。1 行ずつ外すより DOM 操作が少ない。
- `For` は伝播中に state へ書き込まない（`setItem` / `setIndex` のような行ごとの state は持たない）。伝播中の書き込みは synstate が warning を出す正しくない書き方なので（#2336）、synstate-dom 自身もそれをしない。1 回の更新で全行の `item$` / `index$` が走る計算量は O(n) で、行ごとに書き込む方式と同じ。
- 同じキーが配列に 2 つ以上ある場合は React にならい、`console.error` でキーを示す。動作は保証しないが、壊れないように 2 つ目以降は毎回新しい行として作り直す。

### 8.5 動作の時系列

価格付きの商品リストを表示し、商品が 0 件のときは代わりに案内文を出す（ライフサイクル仕様 7 節の例を、本書の JSX と `If`・`For` で書き直したもの）。利用者が書くのは次の 3 ファイルだけで、スコープを意識するコードは無い。

```tsx
// store.mts（アプリの状態。モジュールのトップレベルなのでどのスコープにも属さない）
export const [items$, setItems] = createState<readonly Item[]>([]);
export const [taxRate$, setTaxRate] = createState(0.1);

// app.tsx
const ItemRow = ({
    item$,
    index$,
}: Readonly<{
    item$: InitializedObservable<Item>;
    index$: InitializedObservable<number>;
}>): JSX.Element => (
    <li>
        {index$.pipe(map((i) => `${i + 1}. `))}
        {item$.pipe(map((i) => i.name.toUpperCase()))}
        {combine([item$, taxRate$]).pipe(
            map(([i, r]) => `${i.price * (1 + r)}`),
        )}
    </li>
);

export const App = (): JSX.Element => {
    // ビュー専用の派生はコンポーネントの中で作る（「8.7」）
    const hasItems$ = items$.pipe(map((items) => items.length > 0));

    return (
        <If
            cond={hasItems$}
            then={
                <ul>
                    <For items={items$} key={(item) => item.id}>
                        {(item$, index$) => (
                            <ItemRow item$={item$} index$={index$} />
                        )}
                    </For>
                </ul>
            }
            else={<p>{constant('商品がありません')}</p>}
        />
    );
};

// main.tsx
const unmount = render(App, document.querySelector('#root')!);

setItems([{ id: 'a', name: 'apple', price: 100 }]);
setItems([
    { id: 'a', name: 'apple', price: 100 },
    { id: 'b', name: 'banana', price: 80 },
]);
setTaxRate(0.08);
setItems([{ id: 'b', name: 'banana', price: 80 }]);
setItems([]);
unmount();
```

`main.tsx` の各行が、下の表の #5 以降に対応する。

| #   | きっかけ              | 起きること                                                                                                                                                                                                                                                                                                       | 現在のスコープ           |
| :-- | :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------- |
| 1   | `store.mts` を import | `items$` と `taxRate$` が作られる                                                                                                                                                                                                                                                                                | なし                     |
| 2   | `render(App, root)`   | root スコープを作り、その run で `App()` を 1 回呼ぶ。`hasItems$` が作られて root に属する。`If` の記述が返る。`then` と `else` は記述のままで、`<ul>` も `For` も `<p>` もまだ作られない                                                                                                                        | root                     |
| 3   | 記述のマウント        | `If` が root を保持して `hasItems$` を購読する。現在値は false なので S_else = `createScope(root)` を作り、その run で `<p>` をマウントする。`If` の購読解除は root に登録する                                                                                                                                   | root、S_else（run の間） |
| 4   | `render` が戻る       | `App` が再び呼ばれることはない                                                                                                                                                                                                                                                                                   | なし                     |
| 5   | `setItems([a])`       | `hasItems$` が true になる。`If` は `S_else.dispose()` で `<p>` を外し、S_then = `createScope(root)` の run で `<ul>` と `For` をマウントする。`For` は S_then を保持し、`items$` の現在値 `[a]` から S_a = `createScope(S_then)` の行を作る。行の `ItemRow` が作る map・combine と Text の購読解除は S_a に入る | S_then、S_a（run の間）  |
| 6   | `setItems([a, b])`    | `hasItems$` は true のままなので `If` は何もしない。a の `item$`・`index$` は `entries$` から通常の伝播で更新され（値が同じなので流れない）、b には #5 と同じ手順で S_b = `createScope(S_then)` を作る                                                                                                           | S_b（run の間）          |
| 7   | `setTaxRate(0.08)`    | 通常の伝播で両行の価格が更新される。スコープは関係しない                                                                                                                                                                                                                                                         | なし                     |
| 8   | `setItems([b])`       | b の `index$` が `entries$` から 0 を受け取り、番号が 1. になる。a は `S_a.dispose()` で Text の購読を外し、末端から dispose する。`taxRate$` は子を 1 つ失うだけで残る                                                                                                                                          | なし                     |
| 9   | `setItems([])`        | `hasItems$` が false になる。`If` は `S_then.dispose()` を呼ぶ。子スコープ S_b、`For` の `items$` 購読、`<ul>` がまとめて外れる。続いて新しい S_else で `<p>` をマウントする                                                                                                                                     | S_else（run の間）       |
| 10  | `unmount()`           | root が S_else、`If` の購読、`hasItems$` を破棄し、DOM を外す。`items$` と `taxRate$` は残る                                                                                                                                                                                                                     | なし                     |

表の #5 では、`items$` の伝播の途中で `If` が `For` をマウントし、`For` が `entries$` を作って購読する。伝播中に作られたノードと購読の扱いは #2138 で今と同じにしてあり、購読は現在値（`[a]`）を同期で受け取る。この順序をブラウザテストで固定する

### 8.6 `Portal`

```tsx
<If
    cond={isOpen$}
    then={
        <Portal target={document.body}>
            <Modal />
        </Portal>
    }
/>
```

- 子要素を、JSX の書かれた位置ではなく `target`（省略時は `document.body`）にマウントする。モーダル・ツールチップ・トーストを、親要素の `overflow: hidden` や `z-index` から逃がすために使う。
- マウントは現在のスコープの中で行い、子のノードを `target.append` して、`onScopeDispose` で外す。スコープは書かれた位置のものに属するので、囲む `If` の分岐が閉じれば中身も消える。
- 書かれた位置には何も置かない（空の配列を返す）。`target` は `Element` で、Observable は受け付けない（置き場所を動かす用途は見つかっていない）。

### 8.7 書き方のガイドライン

synstate の派生は遅延評価ではなく、親が更新されるたびに計算される。UI bind で「計算したのに誰も読まない」無駄が起きるのは、次の 2 つの形に限られると見ている（推論で、ベンチマークでは未確認）。

- ストアにグローバルに定義した派生を、今表示していないビューだけが使う。
- 分岐の両側を先に定義しておき、片方だけを表示する（`cond ? a$ : b$`）。

これを避けるため、次の 2 つをガイドラインとし、README の書き方の指針に載せる。守れば、表示されていないビューの派生はそもそも存在しない。

1. **ビュー専用の派生は、ストアではなくコンポーネントの中で作る。** 作った時点で束縛という読み手がいるので、遅延でも即時でも計算回数は変わらない。
2. **分岐の中身は、`If` / `Match` の分岐や switchMap の射影の中で作る。** 使われている側だけが存在する。

それでも残るのは「グローバルで重い派生を、たまにしか見ない」場合である。読み手のいない派生の計算を止める「休眠」は、親の現在値だけで値が決まる派生に限れば入れられるが、このガイドラインで避けられるので入れない。実際のアプリで問題になったら再検討する。

## 9. テスト計画

TDD で、テストを先に書いて失敗を確認してから実装する。

- **型テスト**（`expectType` と `@ts-expect-error`）: 素の値・`getSnapshot().value`・`null`・`undefined`・Observable を `constant` や `Bindable` スロットに渡すと型エラーになること。`constant('btn')` がリテラル型を保つこと。`<p>text</p>` が型エラーになること。イベントの `currentTarget` が要素の型に絞られること。
- **単体テスト**（Node、jsdom を使わずに済む部分）: `mapBindable` / `derive` が定数からノードを作らないこと。`jsx()` が DOM もコンポーネント呼び出しも行わないこと。
- **ブラウザテスト**（`test/browser/`、Vitest browser + Playwright）:
    - 束縛: 属性・プロパティ・テキスト・`class`・`style`・イベントの初期値と更新。`Constant` と完了済み Observable は購読しないこと。
    - props: 自作コンポーネントで props を分割代入しても、渡した Observable の更新が DOM に届くこと（「13」）。
    - `If`: 選ばれなかった分岐のコンポーネントが呼ばれないこと。切り替えで前の分岐のスコープが dispose されること。
    - `For`: 追加・削除・並べ替えで既存行の子の関数が再実行されず、DOM ノードが同一であること。LIS による移動回数。伝播中の書き込みの warning（#2336）が出ないこと。
    - リーク: マウントとアンマウントを繰り返しても、アンマウント後にグローバルな state を更新したとき、アプリが作った派生が 1 つも計算されないこと（`test/browser/leak.test.tsx`）。`hasChild` などは synstate の公開 API に無いので、派生の関数の呼び出し回数で確かめる。
- **ベンチマーク**: js-framework-benchmark の操作（1,000 / 10,000 行の作成、部分更新、入れ替え、削除）で Solid、VanJS、Preact + Signals と比べる。`apps/synstate-dom-benchmark` にある（CI では走らせない）。
- **遅延評価の要否の確認**: synstate の既存ベンチマークに「グローバルに定義したが束縛していない派生」と「コンポーネント内で作って束縛した派生」の 2 ケースを足し、「8.7」のガイドラインで MobX との差が消えるかを確かめる。

## 10. パッケージ構成

既存の `libs/*` にそろえる（`libs/synstate-preact-signals` を雛形にする）。

```text
libs/synstate-dom/
├── package.json
├── README.md
├── SPEC.md            # 本書。実装が追いついたら README とドキュメントに移して消す
├── LICENSE
├── eslint.config.mts
├── tsconfig.json
├── configs/           # tsconfig.build.json、vitest、typedoc
├── scripts/cmd/       # build.mts、gen-docs.mts、embed-examples.mts
├── samples/
├── src/
│   ├── entry-point.mts
│   ├── jsx-runtime.mts
│   ├── jsx-dev-runtime.mts
│   ├── constant/      # Constant、Bindable、mapBindable、derive、toObservable
│   ├── jsx/           # Mountable、jsx、Fragment、JSX 名前空間、IntrinsicElements
│   ├── bind/          # 属性・プロパティ・テキスト・class・style・イベント
│   ├── control/       # If、MatchOptional、MatchResult、For、Portal
│   ├── scope/         # subscribeInScope、listenInScope、createAfterUpdate
│   └── render.mts
└── test/
    └── browser/
```

- `package.json`: `exports` に `.`、`./jsx-runtime`、`./jsx-dev-runtime`。`synstate` と `ts-data-forge` は `peerDependencies`（利用者のアプリと同じインスタンスを使わないとスコープのモジュール変数が分かれるため）。`Constant` が公開型に `Brand` を含むので、`ts-type-forge` は `dependencies` に置く。開発時は `devDependencies` に `workspace:*`。
- `tsconfig.json`: `"jsx": "react-jsx"`、`"jsxImportSource": "synstate-dom"`、`lib` に `DOM`。`jsxImportSource` が自分自身を指すので、`paths` に自分の名前を置く（`samples/` と同じ扱い）。
- 初回の公開は手動（`libs/first-release.md`）。

### 実装の順序

1. synstate: スコープ API と生成時の登録（#2334）、switchMap の所有判定（#2335）、Observable の symbol 目印（「3」）。
2. synstate-dom の骨格（`package.json`、設定、空の entry point）。
3. `constant`・`Bindable`・補助関数と型テスト。
4. `Mountable`・`jsx-runtime`・`render`・要素のマウント。
5. `IntrinsicElements` の生成と、属性・プロパティ・テキスト・イベントの束縛。
6. `If`、`MatchOptional` / `MatchResult`。
7. `For`、`Portal`。
8. ブラウザテストのリーク検査、ベンチマーク、README とサンプル。

## 11. 未決事項

### synstate 側

- 約 1,000 段を超えるチェーンの complete でスタックが溢れる件（UI ではその深さにならないので後回し）。
- 伝播中の書き込みは queue にもバッチにもせず、即時に伝播させたうえで warning を出す（#2336）。書き込みは Observable の派生に書き換えるよう促す。

### synstate-dom 側

- **`Dynamic` と汎用の `Match`**（実装しながら決める）: 表示するコンポーネントやタグ名そのものを Observable で切り替えるコンポーネント（Solid の `<Dynamic component={...}>`）。たとえば `<Dynamic component={page$} />` で、ルーティングの結果に応じてページのコンポーネントを差し替える。`component` が変わるたびに古い中身のスコープを dispose して新しい中身をマウントするので、実装は `If` の分岐の切り替えと同じ仕組みで足りる。判別する値がコンポーネント関数そのものになる `Match` と見なせるので、`Match` の形を決めるときに一緒に決める。
- **デバッグ**: 依存が明示的なグラフなので、グラフ（DAG）を描画する DevTools を作れる。第 2 段階以降で作る。

## 12. 先行例

- **Solid**（`createRoot` / owner、`<For>`、`runWithOwner`）: 実行モデルとスコープの使い方が最も近い。依存の自動追跡と、`T | Accessor<T>` を受け付ける点が異なる。
- **Vue 3 の `effectScope`**: `run`・`getCurrentScope`・`onScopeDispose` の API と、モジュール変数を run の間だけ差し替える実装が同じ。
- **Cycle.js**: 一度だけ呼んで配線する点、依存が明示的な点が同じ。DOM への出力は `Stream<VNode>` で snabbdom の差分を取る。
- **VanJS、Voby、Sinuous、`solid-js/h`**: コンパイラなしで細粒度更新を実現しているが、どれも素の値を受け付けるので決定事項 4 で塞いだ穴を抱えている。
- **Leptos**（Rust）: props を `Signal<T>` と型で書き分ける点で発想が近い。

## 13. コンパイラなしで成り立つ理由（Solid との対比）

Solid は「signal を読む関数呼び出し」を依存の印にしている。そのため JSX の式を評価せずに関数のまま残す変換が要り、それを利用者に書かせないためにコンパイラを使う。synstate-dom は依存を Observable という値で持つので、同じ必要が生じない。Solid 側の記述は、Solid の JSX を変換する [babel-plugin-jsx-dom-expressions の README](https://github.com/ryansolid/dom-expressions/blob/main/packages/babel-plugin-jsx-dom-expressions/README.md) と、[`solid-js/h`](https://github.com/solidjs/solid/blob/main/packages/solid/h/README.md)・[`solid-js/html`](https://github.com/solidjs/solid/blob/main/packages/solid/html/README.md) の README で確かめた。

| Solid がコンパイラに任せていること                                                                                                                                           | synstate-dom で不要な理由                                                                                                                                                              |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **式を遅延させる。** `{count()}` を `insert(el, () => count())` のように包み、effect の中で再評価させる。コンパイラなしの `solid-js/h` では利用者が `{() => count()}` と書く | `count$` を渡した時点で遅延済みである。素の値を渡す誤りは、コンパイラが直す代わりに `Bindable<T>` の型エラーにする（決定事項 4）                                                       |
| **props を getter にする。** `<Comp v={count()} />` は `get v() { return count() }` になる。props を分割代入するとリアクティブでなくなるのはこのため                         | props には Observable がそのまま入るので getter 変換は要らず、分割代入しても失われない。ブラウザテストで固定する                                                                       |
| **`<Show>` などの children を遅延させる。** children も getter になり、選ばれた分岐だけが評価される                                                                          | `jsx()` は `Mountable` という記述を返すだけなので、`If` の両分岐を props に書いても選ばれた側しかマウントされない（決定事項 7、「8.2」）                                               |
| **静的な部分を最適化する。** 静的な HTML を `<template>` に抜き出して `cloneNode` し、動的な箇所だけを束縛する。属性・プロパティ・イベントの区別もコンパイル時に決める       | 静的か動的かは実行時に Observable の symbol で判定し、`Constant` と完了済みの Observable は一度書くだけで購読しない（「4.1」「7.1」）。属性とプロパティの区別は定数表で持つ（「5.2」） |

コンパイラを使わないことで払うコスト（推論で、ベンチマークは未実施）:

- テンプレートの複製をしないので、要素はノードごとの `createElement` で作る。初回描画は Solid より遅くなる可能性がある。「9」のベンチマークで確かめる。
- `count() * 2` のようにその場で式を書けず、`count$.pipe(map(...))` や `constant()` と明示的に書く分だけ記述が長くなる。その代わり、リアクティブかどうかが型に現れる。
