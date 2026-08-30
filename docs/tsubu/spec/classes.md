<!-- cspell:ignore monomorphization bivariance -->

# class の扱い

## 現状の整理

- class method の bivariance をはじめとする型システムの不健全性の根本解決は型検査器の自作が必要なため**後回し**(v1 の対象外)。
- ただし bivariance に限っては、後述のとおり**構文制限だけで v1 から塞げる**。
- class / 継承をそもそも言語に含めるかは、synstate core の実態評価(後述)を踏まえて判断する。

## bivariance は v1 で塞げる

TS では `strictFunctionTypes` 有効時でも、**メソッド短縮記法**で宣言された関数の引数だけは bivariant に検査される(互換性のための意図的な仕様)。プロパティ形式の関数型は正しく contravariant に検査される:

```ts
interface A {
    method(x: number | string): void; // 引数が bivariant(不健全)
    prop: (x: number | string) => void; // 引数が contravariant(健全)
}
```

class のメソッド宣言も同様にメソッド記法なので bivariant。したがって:

- **規則(提案)**: interface / type / class において、メソッド短縮記法を禁止し、プロパティ形式の関数型・arrow function プロパティのみ許可する。class を書く場合、メソッドは `f = (x: A): B => ...` の形。
- 代償: arrow プロパティは prototype ではなくインスタンスごとに関数が確保される(メモリ・生成コスト)。大量インスタンス化する型では問題になりうる。ただし後述の「closure ベース factory」へ寄せるなら、そもそも同じコスト構造なので新たな代償ではない。
- 既存ルール: `@typescript-eslint/method-signature-style`(型側)がこの目的に使える。class 実装側は `class-methods-use-this` 等ではなく専用ルールが必要(要調査)。

これで「メソッド経由の引数型の不健全性」は v1 で消える。残る不健全性(`any` の伝播、型アサーション、配列共変性など)は別途カタログ化する(TODO)。

## 他言語は「class 相当」をどう実現しているか

class が束ねている機能を分解すると: (1) データの束(record)、(2) 振る舞いの束(メソッド)、(3) カプセル化、(4) インターフェース(部分型付け)、(5) 実装継承、(6) open recursion(`this` 経由の仮想ディスパッチ、`override` / `super`)。各言語はこれらを**別々の機構に分解**しており、(5)(6) はどの言語も提供しないか、避けている。

### Rust

- (1)(2): `struct` + `impl` ブロック。データ定義と振る舞い定義が構文的に分離している。
- (3): カプセル化の単位は class ではなく**モジュール**(`pub` の有無)。同一モジュール内なら private フィールドに触れる。
- (4): `trait`。静的ディスパッチ(ジェネリクス + monomorphization)が既定で、動的ディスパッチは `dyn Trait`(trait object)として明示的にオプトイン。
- (5): **実装継承は存在しない**。コード再利用は (a) trait のデフォルトメソッド、(b) 合成(フィールドに持って委譲)。
- (6): open recursion もない。trait のデフォルトメソッドは同 trait の他メソッドを呼べる(これが「オーバーライド可能な骨格実装」の代替)が、下位型が上位実装を `super` 的に呼ぶ機構はない。

### OCaml / ReScript

- OCaml には実は本格的なオブジェクトシステム(構造的部分型、row polymorphism)があるが、**イディオムとしてほぼ使われない**。実務は module + record + variant で回る。
- (1): record。(2): モジュール内の関数(`M.f x` スタイル — ts-data-forge の `Optional.map` 等はまさにこの形)。
- (3): カプセル化は**モジュールシグネチャによる抽象型**(`type t` の実装を隠す = opaque type)。TS での対応物は branded type + 非公開コンストラクタ。
- (4): 動的ディスパッチが必要なら「関数のレコード」(record of functions)を渡す。
- (5)(6): variant + パターンマッチで**閉じた階層**として表現する(サブクラス追加で拡張するのではなく、ケース追加でコンパイラが網羅性エラーを出す)。ReScript は OCaml のオブジェクトシステムをほぼ捨て、record / variant / module に限定した。
- 拡張性の軸が OO と直交する(「型を増やすのが楽(OO)」vs「操作を増やすのが楽(variant)」= expression problem)。UI 部品のような「型が増える」ドメインでは record of functions、状態機械や AST のような「操作が増える」ドメインでは variant が選ばれる。

### Haskell / Elm

- Haskell: 代数的データ型 + 型クラス。部分型付けそのものが存在しない。型クラスは Rust の trait の源流で、アドホック多相(同名関数の型ごとの実装)を担う。
- Elm: record + 関数**のみ**。型クラスすらない。それでも実用アプリが書けることは「(5)(6) はもちろん (4) の動的ディスパッチさえ、多くのドメインで必須ではない」ことの実証になっている。

### まとめ: TS サブセット内での対応表

| class の機能         | 代替(合法 TS 内)                                                               |
| :------------------- | :----------------------------------------------------------------------------- |
| データ + メソッド束  | closure ベース factory 関数が interface を実装した readonly オブジェクトを返す |
| private 状態         | closure 変数(言語保証)                                                         |
| 公開インターフェース | `interface`(構造的部分型 — これは TS の強みなので残す)                         |
| 動的ディスパッチ     | interface を満たすオブジェクト(= record of functions)                          |
| 閉じた階層 + 網羅性  | tagged union(`kind` 判別子)+ `switch` / 将来のパターンマッチ                   |
| 実装継承             | 合成 + 委譲(内側の factory を呼び、そのメソッドを包んで拡張)                   |
| `instanceof`         | 判別タグ / brand シンボル + 型ガード                                           |
| opaque type          | branded type(ts-type-forge)+ コンストラクタ非公開                              |

## synstate core の評価

synstate core は 31 class・3〜4 段の継承階層を持つが、調査の結果、**消費者向け API はすでに class 非依存**であり、class 機能の実質的な依存は 2 点に絞られる:

- 消費者は factory 関数(`source()`, `map(fn)`, …)しか呼ばず、`new` も `extends` も外部からは使われていない。公開型も構造的 interface(`Observable<A>` 等)。5 つの基底 class の export は実装詳細の漏れ(下流 4 パッケージが再 export しているため、削除は破壊的変更)。
- `abstract` なし、`static` なし、ライブラリ型への `instanceof` なし(判別は `kind` 文字列タグ)。private 状態は `#` フィールドで、closure 変数に 1:1 で移せる。
- `InitializedSyncChildObservableClass` の `getSnapshot`/`pipe` override は型の narrowing のためだけの override(runtime 上は同じ)で、factory 化するとむしろ消える。

**本質的に class に依存している 2 点:**

1. **`protected setNext` の縫い目** — 基底が `#mut_currentValue` と subscriber 管理を独占し、サブクラス(約 22 箇所)に特権的な mutator `setNext` だけを渡す。closure 化する場合は「内部ハンドル」パターン(`createObservableBase()` が `{ public, internal: { setNext } }` を返し、operator factory が internal を受け取る)になる。実現可能で、境界はむしろ明示的になるが、「protected」が言語保証から『internal 型を export しない』という規約へ落ちる。
2. **`super.complete()` の連鎖(10 箇所)と `this.complete()` の仮想ディスパッチ** — 基底のコードが「最派生の `complete`」を呼ぶことに依存している(open recursion)。closure 化では、各層が内側の `complete` を close over して包む明示的な委譲チェーンになるが、「基底から最派生を呼ぶ」向きは self 参照の後付け(patch)か、最終 `complete` を基底に注入する形が必要。ここだけは prototype の late binding が実際に働いている箇所。

**評価(確定 2026-08-28 — 全面書き換え実験 [#1703](https://github.com/noshiro-pf/mono/pull/1703) の結果)**:
core 全体(31 class)を class なしで書き換え、既存テスト 273 件 + 下流 hooks 4 パッケージ 43 件がすべて green のまま完了した。**class が「本質的に」必要な箇所は無かった**。定量: leaf 27 ファイルは `this.#mut_x` → closure 変数化で **−184 行**・可読性向上、基底機構は 549 → 800 行(**+251 行**。増分の大半は factory パターンの説明コメントと tools/config 型定義)。新規 eslint-disable は cast 1 箇所のみ。

ただし、class が言語機能として吸収していた複雑さが**設計パターン(= 規約)側へ移った**箇所が 3 つあり、これが言語仕様判断の核心になる:

1. **open recursion と初期化順序の循環** — 「leaf の teardown を含む最終 `complete` を基底が呼ぶ」×「その teardown は leaf 初期化の産物」という循環を、(a) teardown を値としてconfig で渡す、(b) 継承 3 段固定を利用して `complete` を閉じて合成する、で消せた。これは**派生の深さと override 点が既知だから可能**だった。未知のサブクラスが任意メソッドを override する開放的な設計を closure でやるなら mut_ self スロットが要り、可読性は class より落ちる。
2. **「構築中に自分の complete が呼ばれ得る」エッジ**(`takeUntil` の notifier 既完了ケース)— class では prototype 解決が自然に処理するが、closure 版は「配線は構築後」「`complete` は init 前に完全合成」という**型で強制できない初期化順序規約**で守ることになる。「未完成 `this` の漏れ」が構造的に不可能になる代わりに、別の暗黙知が生まれるトレードオフ。
3. **getter を持つオブジェクトは spread で拡張できない**(getter が値に凍結される)— leaf の追加メンバー(`next`/`start`)は generic な Extension 合成として factory に渡し込む設計になり、class の「宣言的にメンバーを足すだけ」の素直さに対応する機構が object 合成には無い。ここが最大の冗長ポイント。

**言語仕様への含意**: 継承が浅く閉じているライブラリなら class を禁止しても書ける(そして leaf 側はむしろ改善する)。**開放的な継承 API を提供するライブラリでは代替パターンの強制はかなり高コスト** — 「class を残すなら継承なし・arrow メソッドのみ(選択肢 2)」の判断材料として、この非対称性を踏まえる。

## 言語仕様への含意(確定 2026-08-29 — D-12)

**選択肢 1 を採用: class は全面禁止。** closure ベースの factory 関数 + 構造的 interface + tagged union に一本化する。synstate 実験([#1703](https://github.com/noshiro-pf/mono/pull/1703))で closure 置き換えがシンプルで汎用性が高いことを確認したことによる。

- `this` も全面禁止([functions.md](./functions.md))。
- class 文脈の getter/setter・`#` private・`protected`・bivariant メソッドの論点はすべて消滅する。メソッド短縮記法の禁止は type/interface に対して残る(bivariance — 上記)。
- class メソッドの arrow プロパティ化(旧選択肢 2)の検討は不要になった。

## 未解決の論点

- 外部 class ライブラリ(DOM の `EventTarget` 系、Error サブクラス等)の**消費**の規定(`new` を境界でどう扱うか)。カスタム Error 型(`extends Error`)は class 禁止下では作れないため、エラーは tagged union で表現する([exceptions.md](./exceptions.md) の Err ペイロード設計と統合)。
- getter/setter は class 文脈が消滅し、残る論点は plain object での遅延評価ユースケースのみ([banned-syntax.md](./banned-syntax.md) 深掘り中)。
