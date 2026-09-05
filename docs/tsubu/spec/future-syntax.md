<!-- cspell:ignore neverthrow bivariance -->

# v2 独自構文の候補

v1 は transpile なしで設計し、独自構文は v2 の transpiler として後付けする(D-1)。このファイルは候補のカタログと、各候補の「v1 での関数版」「TC39 での関連 proposal」「emit 案」を記録する。

## v2 transpiler の受け入れ条件(確定方針)

ReScript の教訓(出力 TS が eject に耐える品質ではなかった)から、transpiler 本体より先に**出力品質を仕様として固定**する:

1. **コメント保存**: 入力のコメント(TSDoc 含む)は位置を保って出力される。
2. **名前保存**: 識別子は改名されない(mangle なし、gensym は衝突回避の最小限)。
3. **構造保存**: 独自構文を使っていない部分は文字単位で同一の TS が出る(idempotent)。
4. **フォーマット済み**: 出力はこのリポジトリの Prettier 設定に適合する。
5. **最小ランタイム**: emit が挿入してよい依存は ts-data-forge の import のみ。ヘルパー関数のインライン生成はしない。
6. **eject コマンド**: `eject` 一発で全ソースが TS に変換され、以後 transpiler なしでビルド・保守できる。これを CI で常時検証する(全テストを eject 後のコードでも実行する)。

実装アプローチとしては「TS の fork parser + CST(concrete syntax tree)ベースの変換」が必要(通常の AST はコメント・空白を落とすため 1〜3 を満たせない)。候補技術の調査は TODO。

## 候補 1: パイプ演算子(F# スタイル採用 — 確定 2026-08-29、D-20)

- **v1**: ts-data-forge の `pipe(x).map(f).value`(fluent ラッパー)。
- **決定**: **F# スタイル** — `x |> e` は `e(x)`。右辺は単項関数に評価される式。左結合。非 unary のステップは arrow で明示する(`x |> (y) => y + 1`)。

### TC39 の経緯(理解した上での決定)

[pipeline operator proposal](https://github.com/tc39/proposal-pipeline-operator) は 2021 年に Hack スタイル(`x |> f(%)`、topic reference)を選定し、F# スタイルを却下した。却下理由は主に 3 つ:

1. **性能(メモリ)** — F# では各ステップが「関数に評価される式」なので、エンジン実装者(ブラウザベンダ)がステップごとの一時クロージャ生成を懸念した。
2. **`await` の構文** — F# では `x |> await f` のような特別扱いが必要になり、ad-hoc だと批判された(Hack は `await f(%)` が式としてそのまま書ける)。
3. **エコシステム分裂懸念** — F# パイプはカリー化・tacit スタイルを奨励し、メソッド/多引数中心の JS エコシステムを二分するという懸念。

選定後も topic トークン論争等で **Stage 2 のまま長年停滞**している。

### なぜ Tsubu では前提が覆るか

- (1) は**ネイティブ実装の制約**であり、transpiler には当てはまらない。さらに prelude が直接形 + カリー化形の二本立てなので、**既知のカリー化呼び出しは直接形へ最適化 emit できる**: `xs |> Arr.map(double) |> Arr.sum` → `Arr.sum(Arr.map(xs, double))`(カリー化のアロケーションゼロ、可読な TS)。未知の式は素直に `e(x)` の入れ子へ展開。
- (3) はカリー化 API を標準に据えた Tsubu では「分裂」ではなく言語の同一性そのもの。[overload-survey.md](../overload-survey.md) 例 1 の「カリー化形二本立ての需要がパイプで縮む」接続も、直接形最適化 emit により「二本立ては人間向け API として残し、pipe 経由は直接形に落ちる」で整合する。
- (2) **await の扱いだけは Tsubu でも残る論点(未定)**: 案 a = パイプ内 await 禁止(await は文で書く。最小)/ 案 b = F# 提案と同じ `|> await` 特別形を採用。案 a から始めるのが安全。

### リスク(D-20 に記録)

将来 TS/JS に Hack 版 `|>` が入ると「独自構文は TS の構文エラーである字面」原則(候補 3)と衝突する。停滞状況から確率は低いと評価し、発生時にトークン変更か原則の明示的例外化を再決定する。

## 候補 2: パターンマッチ

- **v1**: `switch` + 判別タグ + 網羅性チェック(`switch-exhaustiveness-check`)、`match`(文字列テーブル引き)、または ts-pattern(採用するかは未定)。
- **TC39**: pattern matching proposal(`match (x) { when ... }`、Stage 1)。
- **設計論点**: Optional / Result / TernaryResult のようなタグ付き union の分解・ガード・ネスト分解をどこまで入れるか。TC39 案は大きいので、Rust の `match` 式の最小サブセット(タグ判別 + フィールド束縛 + 網羅性)から始めるのが現実的。
- **emit 案**: 判別タグの `switch` 文 + ブロックスコープ束縛へ展開。式位置では IIFE を避けたい(可読性条件 3 に反する)ため、文脈により文へ持ち上げる変換が要る — emit 品質の最初の試金石。

## 候補 3: nullable / Optional への関数適用

`mapOptional` / `mapNullable` 相当の構文化。ユーザー案: `f(v?)`、`v?.map(f)`。

- **`v?.map(f)` は採れない**: `?.` は合法 TS の構文で、既に「v が nullish でなければ `.map` プロパティを呼ぶ」という意味を持つ。`v` が配列なら `Array.prototype.map` の呼び出しとして型検査も通ってしまい、「合法 TS の字面に別の意味を与えない」(D-2 の精神は v2 の独自構文にも適用する: **独自構文は必ず TS として構文エラーになる字面を選ぶ**)に反する。
- **`f(v?)` は有望**: 引数位置の後置 `?` は TS では構文エラーなので衝突しない。意味: `v: T | undefined` に対し `f(v?)` = `v === undefined ? undefined : f(v)`。emit は `mapNullable(v, f)` あるいは条件式への展開。
- **拡張**: `Optional` にも同じ字面を使うか(`f(o?)` が `Optional.map(o, f)` になる)は、`T | undefined` と `Optional` の使い分け指針([stdlib.md](./stdlib.md))とセットで決める。同じ構文が型によって別の関数に落ちる「型主導 emit」は transpiler が型情報を持つことを要求する(構文変換だけで済まなくなる)ため、コストが一段上がることに注意。
- **TC39 関連**: optional chaining(ES2020、propagation の前例)、pipeline との合成(`v? |> f(%)` 的な組み合わせの整合性)。

## 候補 4: `?` によるエラー伝播(Rust の `?` 演算子)

```text
const parsed = Json.parse(text)?;   // Err ならこの関数から即 return Err
```

- **v1**: generator ベースの `safeTry`(neverthrow 方式)を ts-data-forge に追加して橋渡し([stdlib.md](./stdlib.md) ★★★)。
- **emit 案**: 関数全体を `safeTry(function* () { ... yield* r; ... })` へ包む変換、または早期 return の明示展開(`const _r = Json.parse(text); if (Result.isErr(_r)) return _r; const parsed = _r.value;`)。後者の方が eject 品質(可読性)は高い。
- **TC39 関連**: try expressions / Safe Assignment Operator(`?=`)として議論されている系統(Stage 0〜1 相当、流動的)。
- **論点**: 後置 `?` を候補 3(nullable 適用)と両方に使うと曖昧になる。Rust は `?` = Result/Option 伝播で統一している。候補 3 と 4 を「nullish/Err の伝播」として一つの構文に統合できるかが設計の勘所。

## 候補 5: prelude の auto-import

構文追加ではないが transpiler 機能として: `Optional` / `Result` / `pipe` 等を import なしで使え、emit 時に import 文が挿入される([stdlib.md](./stdlib.md))。独自構文(候補 1〜4)の emit が ts-data-forge の関数を参照する際もこの機構に乗る。

## 候補 6: `let mut` / `mutable`(既出)

- `let mut`: [variables-and-mutation.md](./variables-and-mutation.md)
- `mutable` 型修飾子: [readonly.md](./readonly.md)

## 候補 7: ネイティブ `Int` と数値型の分類

`number` 一種類しかない数値型を、`Int` / `Int32` / `NonZeroNumber` 等に分類してネイティブ型として扱う。

- **目指す挙動**: `Number.isInteger(x)` の型ガードで `x` が `number` ではなく `Int` に narrowing される、`0`/`1` などの整数リテラルが最初から `Int` である、など。
- **v1 / 現状**: ts-data-forge・ts-fortress が brand 型で部分的に実現している(`asUint32` 等)。strict-ts-lib の branded 版(`libs-branded`)もこの系統([compiler-options.md](./compiler-options.md) の未解決論点)。
- **brand 型の限界**: literal 型との間に期待する subtype 関係が成り立たない — `1` は `Int & 1` ではないので、`Int` を要求する位置に literal を直接渡せず cast が要る。詳細:
  [TypeScript の branded type `Int` と literal の相性問題](https://zenn.dev/noshiro_piko/articles/typescript-branded-type-int#branded-type-%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%9F%E3%82%B3%E3%83%BC%E3%83%89%E3%81%AE%E5%BC%8A%E5%AE%B3)、[microsoft/TypeScript#53923](https://github.com/microsoft/TypeScript/issues/53923)。
- **含意**: この改善は構文の追加(transpiler)では実現できず、**型検査器の拡張が必要**になる — bivariance の根本解決([classes.md](./classes.md))と同じく「v3: 独自型検査器」という段階を示唆する最初の具体的動機。仕様上は「brand 型による v1 近似」と「ネイティブ型としての理想形」を分けて記述していく。
- **接続**: bitwise 演算子の再導入条件([banned-syntax.md](./banned-syntax.md) — `Int32` 導入後に厳密化して解禁)。
- **`typeof` の narrowing 先も絞る(v2 以降)**: TS の `typeof x === 'number'` は `x` を `number` にしか絞れない。v2 以降では、`typeof` の結果を `number` ではなく `Int` 等のより厳しい型へ絞る機能も付ける(2026-09-05 追記)。実行時の `typeof` は `'number'` 一種類しか返さないので、`Int` への narrowing は transpiler が `Number.isInteger` 等の追加検査を emit する(意味の変更 — v2 以降でのみ可能)か、型検査器側の narrowing 規則を差し替える(v3)かのどちらかで実現する。どちらを採るかは候補 7 の設計時に決める。

## 候補 8: 関数宣言構文 `fn` とオーバーロード記法

### `fn` キーワード(採用確定 2026-08-29 — D-17)

JS/TS は第一級関数を持つため v2 でも `const f = (x) => ...` で足りるが、Rust の `fn` は短く宣言意図が明確で、**1:1 対応で transpile できる**:

```text
fn add(a: number, b: number): number {
  return a + b;
}
// emit: const add = (a: number, b: number): number => { return a + b; };
```

- 利点: 短い。hoisting なし(const 束縛へ emit)。「関数を宣言している」ことが構文に現れる。オーバーロード記法(下記)の載せ物になる。
- 代償: 予約語が 1 つ増える。**v1 のコードに識別子 `fn` があると v2 移行で衝突する**ため、v1 チェッカーで識別子 `fn` を先行予約(禁止)する — D-3(v1 の規則が v2 移行を機械化する)と同型のパターン。
- **採用確定(D-17)**。v1 チェッカーは宣言名としての識別子 `fn` を予約する(プロパティ名は対象外 — D-17 補足)。残る未定は arrow(式)と `fn`(宣言)の使い分け規範。

### オーバーロード記法 — 他言語調査

| 言語                             | 方式                                                                                                  |
| :------------------------------- | :---------------------------------------------------------------------------------------------------- |
| TypeScript                       | シグネチャ列挙 + **単一実装**(実装が全ケースを捌く。実装シグネチャとの突き合わせが緩いのが既知の弱点) |
| Swift / Kotlin / C# / Java / C++ | 同名関数を並べ、**実装もシグネチャごとに分離**。各実装が自分の型で完全に検査される                    |
| Elixir / Erlang                  | multiple function clauses — 同名 `def` をパターン + guard 付きで並べる。実装分離の最も宣言的な形      |
| Rust / Haskell / OCaml           | オーバーロードなし(trait / 型クラスによるアドホック多相、または別名関数)                              |

TS の「関数型を `&` で結ぶ」「interface にメソッド記法で並べる」はいずれも読みにくく、method 記法は bivariance の温床でもある([classes.md](./classes.md))。**言語間で同一の関数を書き比べたコード例は [overload-survey.md](../overload-survey.md) にまとめた。**

### Tsubu v2 の設計案

1. **案 A(最小)**: `fn` にシグネチャ列挙を統合した専用記法。実装は TS と同じく 1 つで、emit は TS のオーバーロード宣言 + 実装へ **1:1**。記法だけの改善なのでランタイム生成なし・emit 品質問題なし。
2. **案 B(実装分離)**: Swift/Elixir 形 — 同名 `fn` を複数書き、各 clause が自分のシグネチャで**完全に型検査**される。emit は transpiler が判別 dispatch(`typeof` / arity 分岐)を**生成**する。TS オーバーロードの「実装検査が緩い」弱点を根本から消せるが、(a) transpiler が意味を持つコードを生成する最初のケースになり(生成 dispatch の可読性 = eject 品質が課題)、(b) clause 間が**実行時に判別可能**(arity か runtime タグで分岐できる)という制約が必要(型引数の違いだけのオーバーロードは dispatch 不能)。
3. 推奨順: まず案 A で記法を確定し、案 B は「clause の実行時判別可能性」の条件を詰めてから別判断。案 B の型検査部分(clause ごとの厳密検査)だけを v3 の checker で先取りする道もある。

v1 との接続: D-13(named function はオーバーロード時のみ)により、v1 の `function` 宣言の出現箇所 = オーバーロード関数だけになっている。v2 で `fn` を導入すれば、この出現箇所がそのまま `fn` 化の対象になり移行が機械的。

## 導入順(提案)

依存関係と費用対効果から: 候補 5(構文変更なし・transpiler の骨格作り)→ 候補 6(トークン置換に近い低リスク変換)→ 候補 1(式の局所変換)→ 候補 4(制御フロー変換 — emit 品質の本丸)→ 候補 2(最大の構文追加)→ 候補 3(型主導 emit が必要なら最後)。候補 7 は transpiler ではなく型検査器の拡張(v3)なのでこの順序の外に置く。
