# Prior Art Research: Static Dependency Graph + One-Time Topological Sort

SynState の中核アイデア — 「依存関係グラフのトポロジーは静的であり、伝搬順序はグラフ構築時に一度だけ計算できる」 — に関する先行研究の調査結果。

調査日: 2026-03-24

---

## 結論

SynState のアイデアは **既出の概念** である。個々の構成要素（静的依存グラフ、トポロジカルソートによるグリッチ回避、静的グラフなら順序を事前計算可能という観察）はすべて学術文献に記載されており、最も古いものは 1987 年に遡る。OSS としても Topologica 等が同様のアプローチを実装している。

ただし、多くの現代 JS ライブラリ（Angular Signals, Preact Signals, SolidJS, MobX, Vue, Jotai）が**動的**依存グラフを採用する中で、静的グラフの利点（O(n) 伝搬、グリッチフリー保証、ゼロランタイムオーバーヘッド）を意識的に選択した設計判断として SynState を位置づけることはできる。

---

## 1. 学術論文での先行研究

### 1.1 Lee & Messerschmitt — "Static Scheduling of Synchronous Data Flow Programs" (1987)

- **最も直接的な先行研究。** Synchronous Dataflow (SDF) において、各ノードが生成・消費するデータ量が事前に指定される場合、「SDFノードのスケジューリングは実行時ではなくコンパイル時（静的に）行える。したがって実行時オーバーヘッドは消滅する」と明言。これは SynState の洞察そのもの。
- IEEE Transactions on Computers, vol. C-36, no. 1, pp. 24-35, January 1987
- URL: https://www.semanticscholar.org/paper/Static-Scheduling-of-Synchronous-Data-Flow-Programs-Lee-Messerschmitt/840546d540c4f090851c426fe823dc5b655002f9

### 1.2 Bainomugisha et al. — "A Survey on Reactive Programming" (2013)

- リアクティブプログラミングの包括的サーベイ。静的 vs 動的依存グラフを明確に区別: "In some reactive languages, the graph of dependencies is static, i.e., the graph is fixed throughout the program's execution. In other languages, the graph can be dynamic."
- グリッチ回避は「式をトポロジカルソートし、その順序で値を更新する」ことで達成されると記述。
- FrTime, Flapjax, Scala.React をトポロジカル順序でグリッチフリー伝搬を行うシステムとして紹介。
- URL: https://dl.acm.org/doi/10.1145/2501654.2501666

### 1.3 Cooper & Krishnamurthi — "Embedding Dynamic Dataflow in a Call-by-Value Language" (ESOP 2006)

- FrTime は各ノードに依存関係より高い**高さ**を割り当て、高さ順の**優先度キュー**で伝搬。ただし FrTime は**動的**グラフをサポートするため、「グラフ構造の一部が変化したとき、動的にソート順序を再計算」する必要がある。
- これは SynState の洞察の裏返しの証明: 動的グラフでは順序の再計算が必要 = 静的グラフでは不要。
- URL: https://cs.brown.edu/~sk/Publications/Papers/Published/ck-frtime/paper.pdf

### 1.4 Czaplicki & Chong — "Asynchronous Functional Reactive Programming for GUIs" (PLDI 2013)

- Elm の初期 FRP モデルはプログラム初期化時に決定される**静的シグナルグラフ**を使用。型システムによりリアクティブプリミティブを制限し、固定グラフ構造での効率的実行を保証。SynState の静的トポロジーの主張と密接に関連。
- URL: https://people.seas.harvard.edu/~chong/pubs/pldi13-elm.pdf

### 1.5 Maier & Odersky — "Deprecating the Observer Pattern with Scala.React" (2012)

- Scala.React がトポロジカル順序に基づく伝搬サイクルの2フェーズでオブザーバーが不整合データを観測しないことを保証する方法を記述。
- URL: https://infoscience.epfl.ch/record/176887

### 1.6 Burchett, Cooper & Krishnamurthi — "Lowering: A Static Optimization Technique for Transparent Functional Reactivity" (PEPM 2007)

- 依存グラフの**静的解析**によりグラフサイズを削減する最適化を実証。コンパイル時のグラフ解析により「速度とメモリ使用量の両方で劇的な改善」を示す。
- URL: https://dl.acm.org/doi/10.1145/1244381.1244393

### 1.7 Salvaneschi et al. — Distributed REScala (OOPSLA 2014)

- 「素直な解決策はトポロジカルソートで時変値を依存順に並べ、その順序で更新すること」とグリッチフリーについて言及。ただし REScala は**動的**依存グラフをサポートし、分散環境ではより洗練されたアプローチが必要。
- URL: https://dl.acm.org/doi/10.1145/2660193.2660240

### 1.8 Ritschel — "A Meta Representation for Reactive Dependency Graphs" (UBC Master's Thesis)

- リアクティブシステムにおける静的 vs 動的依存グラフの詳細な分析を提供。
- URL: https://www.cs.ubc.ca/~ritschel/files/masterthesis.pdf

---

## 2. GitHub 上の OSS での先行実装

### 2.1 静的グラフ + 事前計算トポロジカルソート（SynState に近い）

#### Topologica (datavis-tech)

- **SynState に最も近い OSS。** トポロジカルソートに基づくリアクティブデータフロープログラミングのミニマルライブラリ。依存関係は構築時に宣言。伝搬はトポロジカルソートを使用し、各ノードが更新サイクルごとに1回だけ設定されることを保証。
- URL: https://github.com/datavis-tech/topologica

#### ReactiveModel / Model.js (datavis-tech / ZJONSSON)

- Topologica の前身。「依存データグラフ上の明示的なトポロジカルソートアルゴリズムで変更を処理する。」完全な「ダイジェスト」の後、変更されたプロパティに推移的に依存するすべてのリアクティブ関数が適切な順序で実行済みとなる。
- URL: https://github.com/datavis-tech/reactive-model

#### Storm.NET

- "Simple Topologically Ordered Reactive Model" — 依存グラフのトポロジカル順序評価を保証し、比較ベースの更新スキップを実装。
- URL: https://github.com/StormDotNet/Storm.NET

### 2.2 動的グラフを採用（SynState とは異なるアプローチ）

| ライブラリ          | 依存追跡                                   | グリッチ回避手法                                                                         |
| ------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **Angular Signals** | 動的（計算実行時に追跡、実行間で変化可能） | 2フェーズ push/pull（push で無効化、遅延 pull で再計算）                                 |
| **Preact Signals**  | 動的（バージョン番号付きノード/エッジ）    | Push/pull ハイブリッド: 積極的に dirty マーク、遅延再計算                                |
| **MobX**            | 動的（2パス eager アルゴリズム）           | 更新が必要な親の数をカウント                                                             |
| **SolidJS**         | 動的                                       | 「ソートよりもノード状態のチェックで反復する方が高速で、タイムスライシングの中断も容易」 |
| **Scala.Rx**        | 動的                                       | グリッチを既知の制限として許容                                                           |
| **Vue**             | 動的（Proxy ベース）                       | トポロジカルソートに基づかない                                                           |
| **Jotai**           | 動的（`get` 関数呼び出しで追跡）           | 依存変更時に自動再購読                                                                   |

---

## 3. 先行研究の要約表

| SynState の主張                               | 先行研究                                                | 年代   |
| --------------------------------------------- | ------------------------------------------------------- | ------ |
| 依存グラフは静的にできる                      | Lee & Messerschmitt (SDF), Elm FRP, Bainomugisha survey | 1987+  |
| トポロジカルソートでグリッチを防止            | FrTime, Flapjax, Bainomugisha survey, Wikipedia         | 2006+  |
| 静的グラフなら順序を一度だけ事前計算可能      | Lee & Messerschmitt (SDF), Topologica, ReactiveModel    | 1987+  |
| これら3つをリアクティブライブラリで組み合わせ | Topologica, ReactiveModel, Storm.NET                    | ~2016+ |

---

## 4. 多くの現代ライブラリが動的グラフを採用する理由と、その再評価

多くの現代 UI フレームワークのリアクティブシステム（Angular Signals, Preact Signals, SolidJS, MobX, Vue, Jotai）は**動的**依存グラフを採用している。しかし、動的グラフが提供する利点として一般に挙げられるパターンを精査すると、いずれも静的グラフで等価に実装可能であり、動的グラフの採用は計算能力の必然ではなく **API デザインの選択** であることがわかる。

### 4.1 動的グラフの「利点」とされるパターンの再検証

#### 条件分岐による依存関係の変化

```js
// Jotai: 動的に依存を切り替える
const temperatureAtom = atom((get) => {
    const mode = get(modeAtom);
    if (mode === 'celsius') return get(celsiusAtom);
    else return get(fahrenheitAtom);
});
```

SynState では静的グラフのまま等価に実装できる:

```ts
// SynState: 全ソースを combine し map で選択
const temperature$ = combine([mode$, celsius$, fahrenheit$]).pipe(
    map(([mode, c, f]) => (mode === 'celsius' ? c : f)),
);
```

`fahrenheit$` が変化しても celsius モードなら map の出力値は同じであり、SynState の等値比較により下流に伝搬しない。「過剰購読」のコストは **関数呼び出し1回 + 等値比較** のみ。一方、動的追跡の維持には毎回の評価時に依存セットの差分計算・購読の付け替えが必要であり、そのオーバーヘッドの方が大きい。

#### 動的コレクション

Jotai の atoms-in-atom パターンでは、各アイテムが独立した atom を持ち、1つのアイテムの更新が他のアイテムのコンポーネントを再レンダリングしない:

```tsx
// Jotai: atoms-in-atom パターン — 各 Todo が独立した atom
const todosAtom = atom([atom('Todo 1'), atom('Todo 2')]);

const TodoItem = ({ todoAtom }: { todoAtom: PrimitiveAtom<string> }) => {
    const [todo, setTodo] = useAtom(todoAtom);
    // この atom が変化したときだけ、この TodoItem が再レンダリングされる
    return <input value={todo} onChange={(e) => setTodo(e.target.value)} />;
};

const TodoList = () => {
    const [todos, setTodos] = useAtom(todosAtom);
    const addTodo = () => setTodos((prev) => [...prev, atom('')]);
    return (
        <div>
            {todos.map((todoAtom, i) => (
                <TodoItem key={i} todoAtom={todoAtom} />
            ))}
            <button onClick={addTodo}>Add</button>
        </div>
    );
};
```

SynState では、コレクション全体を1つの Observable として扱い、同じアプリケーションを構築できる:

```tsx
// SynState: コレクション全体を1つの Observable で管理
const [todos$, setTodos] = createState<readonly string[]>(['Todo 1', 'Todo 2']);

const TodoItem = ({ index }: { index: number }) => {
    const todo = useObservableValue(
        // useMemo で各アイテム用の derived observable をキャッシュ
        useMemo(() => todos$.pipe(map((todos) => todos[index] ?? '')), [index]),
    );
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTodos((prev) =>
            prev.map((t, i) => (i === index ? e.target.value : t)),
        );
    };
    return <input value={todo} onChange={handleChange} />;
};

const TodoList = () => {
    const todosLength = useObservableValue(
        useMemo(() => todos$.pipe(map((todos) => todos.length)), []),
    );
    const addTodo = () => setTodos((prev) => [...prev, '']);
    return (
        <div>
            {Array.from({ length: todosLength }, (_, i) => (
                <TodoItem key={i} index={i} />
            ))}
            <button onClick={addTodo}>Add</button>
        </div>
    );
};
```

Jotai では各アイテムが独立した atom を持つためコンポーネント単位の再レンダリング制御が自然に得られる。SynState では `todos$.pipe(map(todos => todos[index]))` で各アイテム用の derived observable を作り、等値比較により他のアイテムが変化しても当該コンポーネントは再レンダリングされない。コレクションの配列走査（map 内の `todos[index]`）は O(1) のインデックスアクセスであり、コストは無視できる。

動的コレクションの追加・削除についても、SynState ではコレクション Observable の値を更新するだけであり、グラフの動的な再構築は不要である。`TodoList` が `todosLength` の変化のみを購読しているため、既存アイテムの編集で `TodoList` 自体が再レンダリングされることもない。

#### 副作用を伴うソース（非同期 fetch 等）

```js
// Jotai: 読まれたときだけ fetch が走る
const userDataAtom = atom(async (get) => fetchUser(get(authAtom).id));
```

SynState では `switchMap` + `fromAbortablePromise` でグラフ**内**に非同期処理を組み込める:

```ts
// SynState: 静的グラフのまま条件付き fetch を表現
const userData$ = auth$.pipe(
    switchMap((auth) =>
        auth
            ? fromAbortablePromise((signal) => fetchUser(auth.id, signal))
            : of(guestData),
    ),
);
```

`auth$` が `null` になれば前の fetch は abort され `guestData` が流れる。グラフ構造は構築時に確定しており、動的な依存の付け替えは不要。むしろ abort 制御が `switchMap` のセマンティクスとして組み込まれている分、SynState の方がリソース管理が明確である。

### 4.2 Weststrate の「oversubscription」論の再評価

Michel Weststrate（MobX 作者）は「最小かつ一貫した購読セットは、購読が実行時に決定される場合にのみ達成できる」と主張しているが、実際のコスト比較は以下の通り:

|              | 静的グラフの「過剰購読」コスト         | 動的追跡の維持コスト                                            |
| ------------ | -------------------------------------- | --------------------------------------------------------------- |
| 条件分岐     | combine 発火 + map 1回 + 等値比較      | Proxy trap 発火、Set への add/delete、依存 diff、古い依存の解除 |
| コレクション | map で全要素走査（集約計算では不可避） | observable.map の Proxy、per-key tracking                       |

「過剰購読を避ける」ための動的追跡オーバーヘッドが、過剰購読のコスト自体を上回るケースが多い。SynState のベンチマーク結果はこの分析と一致する。

### 4.3 React 統合: 動的グラフは不要

Jotai/Recoil の設計は「React のコンポーネントツリーが動的だから、状態管理のグラフも動的でなければならない」という前提に基づくように見えるが、**この前提は成立しない**。

SynState の `synstate-react-hooks` は `useSyncExternalStore` を使用して React コンポーネントから Observable を購読する。この構成では:

- グラフ側に**何の制約も発生しない**（静的グラフのまま）
- コンポーネントが `subscribe`/`unsubscribe` するだけで動的な購読管理が完結
- React ツリーの動的な性質はすべて購読レイヤーで吸収される

```
[静的グラフ (SynState)] → Observable
        ↓
[useSyncExternalStore] → コンポーネントが subscribe/unsubscribe
        ↓
[React コンポーネントツリー] → マウント/アンマウントは React が管理
```

Jotai/Recoil は状態の計算グラフと UI の購読管理を単一のリアクティブモデルに統合しているため、動的追跡が**必然的に**要求される。しかしこれは「動的グラフが必要だったから融合した」のではなく、「融合した API を選んだから動的グラフが必要になった」という因果関係である。

### 4.4 React ユーザーとの mental model の親和性

Jotai の `atom((get) => { get(atomA); ... })` パターンは一見 React に馴染むように見えるが、実際には React の依存管理モデルとは異なる。React は `useMemo(() => ..., [dep1, dep2])` のように**依存を明示的に宣言する**モデルであり、暗黙的な自動追跡は行わない。

SynState の `pipe(map(...))` / `combine([a$, b$])` は、React の「依存を宣言的に記述する」モデルとのアナロジーがより直接的である:

| React                               | SynState                                         |
| ----------------------------------- | ------------------------------------------------ |
| `useMemo(() => count * 2, [count])` | `count.pipe(map(n => n * 2))`                    |
| `useMemo(() => a + b, [a, b])`      | `combine([a$, b$]).pipe(map(([a, b]) => a + b))` |
| 依存配列で明示的に宣言              | `combine` / `pipe` で明示的に宣言                |

SynState のドキュメント（guides/why-reactive）ではこのアナロジーを具体的に示した上で、React との差異を明確にしている:

- React の `useMemo` はコンポーネントの再レンダリングサイクル内でのみ動作する計算キャッシュ
- SynState の Observable はコンポーネントライフサイクルから独立したグローバルなリアクティブグラフ
- React は `useMemo` なしでは全式が毎レンダリング再評価されるが、SynState は push ベースで入力が変化した値のみ再計算

つまり SynState は React ユーザーが既に理解している「依存を明示的に宣言し、システムが自動で伝搬する」という mental model を、コンポーネントのスコープを超えてグローバル状態に拡張したものであり、Jotai の暗黙的追跡よりもむしろ React との親和性が高い。

### 4.5 動的グラフを選択する真の動機

以上の分析から、Jotai/Recoil/MobX が動的グラフを採用した動機は以下のように整理される:

- **計算能力**: 静的グラフで表現できないユースケースは確認されていない
- **パフォーマンス**: 動的追跡のオーバーヘッド分だけ不利（SynState のベンチマーク結果と一致）
- **React 統合**: `useSyncExternalStore` による購読レイヤーで十分であり、グラフ側の動的性は不要
- **React との mental model**: SynState の明示的依存宣言の方が React の `useMemo` モデルとの親和性が高い
- **実際の動機**: オペレーターの知識なしに普通の関数内で `get()` を呼ぶだけで依存が宣言できる **DX（開発者体験）** — つまりリアクティブプログラミングの学習コストを下げることが主目的

SynState はオペレーターの学習コストを対価として、ランタイムコストゼロの静的グラフによるグリッチフリー O(n) 伝搬を実現している。これは「動的グラフの利点を諦めるトレードオフ」ではなく、「動的グラフが解決するとされる問題が実際には存在しないことを踏まえた、合理的な設計選択」と位置づけられる。

---

## 参考文献

- Lee, E.A. & Messerschmitt, D.G. (1987). Static Scheduling of Synchronous Data Flow Programs. IEEE Trans. Computers.
- Bainomugisha, E. et al. (2013). A Survey on Reactive Programming. ACM Computing Surveys.
- Cooper, G.H. & Krishnamurthi, S. (2006). Embedding Dynamic Dataflow in a Call-by-Value Language. ESOP.
- Czaplicki, E. & Chong, S. (2013). Asynchronous Functional Reactive Programming for GUIs. PLDI.
- Maier, I. & Odersky, M. (2012). Deprecating the Observer Pattern with Scala.React. EPFL.
- Salvaneschi, G. et al. (2014). Distributed REScala. OOPSLA.
- Weststrate, M. (2016). The Fundamental Principles Behind MobX. https://hackernoon.com/the-fundamental-principles-behind-mobx-7a725f71f3e8
- Topologica: https://github.com/datavis-tech/topologica
- Storm.NET: https://github.com/StormDotNet/Storm.NET
- Jotai: https://github.com/pmndrs/jotai
- MobX: https://github.com/mobxjs/mobx
