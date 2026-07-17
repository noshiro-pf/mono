# 配列長制約型の軽量化・再設計レポート

対象リポジトリ: ts-type-forge / ts-data-forge / ts-fortress(3 リポジトリとも同名ブランチで同時変更)

## 改訂履歴

- **第1版**: 巨大な要素型 `T` に対する型チェックのメモリ枯渇問題(型付き ESLint の OOM)の調査と、brand 方式の軽量な配列長制約型ファミリーの新設。
- **第2版(本版)**: (1) 小さな N(上限 10)では `noUncheckedIndexedAccess` 下の添字アクセスが `T | undefined` にならない性質を維持するハイブリッド構造化、(2) 構造的タプル版ファミリーの `*Tuple` への改名による命名規則の統一(**major version upgrade**)。

## TL;DR

- 長さ制約を「literal `0` のタプル / uint literal union の brand」で表現する配列型ファミリー
  `FixedLengthArray` / `MinLengthArray` / `MaxLengthArray` / `BoundedLengthArray` を新設。
  型チェックコストが要素型 `T` の大きさから分離され、型付き ESLint での実測で長さ制約由来の
  ピークメモリ増分が約 1.4 倍軽量、実行時間が約 2 倍高速(合成ベンチマーク、§5)。
- brand に加えて **`min(N, 10)` 要素の構造的タプル接頭辞**を交差させるハイブリッド構造により、
  ガードで narrowing した後の `xs[0]` 〜 `xs[min(N,10)-1]` へのアクセスは `T | undefined` ではなく
  `T` になる。`FixedLengthArray<N, T>`(N ≤ 10)ではさらに `length` が literal `N` になる。
  clamp は単調なので **brand による長さ包含関係(部分型関係)は閾値をまたいでも保たれる**。
- 従来の構造的(ナイーヴ)実装は削除せず、`{Fixed,Min,Max,Bounded}LengthTuple` に改名して存続。
  命名は `{Fixed,Min,Max,Bounded}Length × {String,Array,Tuple}` の直積で統一した(§4)。

## 1. 背景と原因分析: タプル版はなぜ重いか

従来のタプル版ファミリーの表現(旧名 → 新名):

| 旧名                           | 新名                              | 表現                                      |
| ------------------------------ | --------------------------------- | ----------------------------------------- |
| `ArrayOfLength<N, T>`          | `FixedLengthTuple<N, T>`          | `readonly [T, T, ..., T]`(N 要素のタプル) |
| `ArrayAtLeastLen<N, T>`        | `MinLengthTuple<N, T>`            | `readonly [T×N, ...T[]]`                  |
| `ArrayAtMostLen<N, T>`         | `MaxLengthTuple<N, T>`            | 長さごとのタプルの union(N+1 個)          |
| `ArrayBoundedLen<Min, Max, T>` | `BoundedLengthTuple<Min, Max, T>` | 同上(Max − Min + 1 個)                    |

重くなる要因:

1. **タプルの union の爆発** — `MaxLengthTuple<N, T>` は N+1 個のタプル型を生成し、型オブジェクト数が
   O(N²) で増える。代入可能性チェックのたびに union メンバーを走査し、各メンバーで要素比較が走る。
2. **文脈型付け(contextual typing)** — 配列リテラルを union-of-tuples に代入すると、各要素が union の
   各メンバーの要素型と照合され、`T` が巨大だと freshness チェックを含む比較コストが
   要素数 × union メンバー数分かかる。
3. **インスタンス化数の超線形増加** — ベンチマークで、制約長のセットを {8,16,32,64} → {16,32,64,96} に
   上げると、タプル版のインスタンス化数は 59,501 → 116,825 とほぼ倍増(brand 版はほぼ一定)。
4. **typescript-eslint はプログラム全体の型を実行終了まで保持する**ため、「作られた型の総量」が
   そのままピークメモリに効く。
5. 付随する制限として、`MaxLengthTuple` / `BoundedLengthTuple` は内部再帰(`TuplePrefixesDownTo`)の
   深さ制限により N ≳ 100 で TS2589(Type instantiation is excessively deep)になる。

なお、タプルの各スロットは同一 `T` への参照なので「N 個のディープコピー」が起きるわけではないが、
union 化・文脈型付け・マップ型適用が絡むと `T` の比較・展開が長さに比例して繰り返される。

## 2. brand 方式のエンコーディング

文字列版(`MaxLengthString` / `MinLengthString`)と完全に対称:

```ts
type MaxLengthArray<MaxLength extends number, Elm = unknown> = readonly Elm[] &
  Brand<{ MaxLength: UintRangeInclusive<0, MaxLength> }>; // 0 | 1 | ... | MaxLength

type MinLengthArray<MinLength extends number, Elm = unknown> =
  MinLengthTuple<ClampToPrefixCap<MinLength>, Elm> & // §3 のハイブリッド部分
  Brand<{ MinLength: MinLengthTuple<MinLength, 0> }>; // readonly [0, ..., ...0[]]

type BoundedLengthArray<Min, Max, Elm> = MaxLengthArray<Max, Elm> & MinLengthArray<Min, Elm>;

type FixedLengthArray<Length, Elm> = BoundedLengthArray<Length, Length, Elm> &
  (Length が 10 以下 ? FixedLengthTuple<Length, Elm> : unknown); // §3
```

ポイント:

- brand の中身は literal `0` のタプルと uint literal union だけで、`T` を一切含まない。
  同じ N に対する brand 型はプロジェクト全体で 1 回だけ作られ、すべての `T` で共有される。
- 部分型関係は自然に保存される: `M <= N` なら `MaxLengthArray<M> <= MaxLengthArray<N>`、
  `M >= N` なら `MinLengthArray<M> <= MinLengthArray<N>`。`Elm` についても共変。
- brand キー(`MaxLength` / `MinLength`)は文字列版と同名だが、ベース型(`string` vs 配列)が
  異なるため相互代入は起きない(テストで担保)。
- 再帰深度制限と無縁で、N = 1000 以上でも動作する(N=1000/2000 のテストあり)。
- 長さ型引数は `SupportedLength`(`0 | 1 | ... | 2048`、上限は exported な
  `SupportedLengthCap = 2048`)に制約した。brand のエンコーディングが依存するタプル型の
  コンパイラ上限(10,000 要素)に達する前に、超過リテラルや非リテラル `number` を読みやすい
  制約エラーで弾くため。制約 union はプログラム全体で 1 回だけ構築・キャッシュされ、
  インスタンス化ごとの追加コストは union メンバーシップ判定 1 回のみ(実測で使用回数比例の
  コスト増なし・一回限りの固定コスト約 +7k types のみ)。この cap は**文字列 family
  (`MaxLengthString` 等)にも適用**し、境界定義を 3 リポジトリで共通化した:
    - ts-type-forge: `SupportedLengthCap` / `SupportedLength` / `StructuralPrefixCap`
      (構造的タプル接頭辞化と `readonly Elm[]` フォールバックの境界 = 10)を export。
    - ts-data-forge: `is*` / `as*` の長さ引数制約を `SupportedLength` に統一(配列・文字列とも)。
    - ts-fortress: branded バリデータの長さ制約を `SmallUint`(≤39)から `SupportedLength`(≤2048)へ
      拡大。`string()` の brand エンコード可能範囲も `SmallInt<'>0'>`(1..39)から
      `1..2048` に拡大(範囲判定は `infer M extends SupportedLengthLiteral` で行い、
      TS7(native)の複雑度制限 TS2859 を回避)。構造的タプル版バリデータの上限は
      `SmallUint`(≤39)をやめ、ts-type-forge が export する
      `StructuralPrefixLength`(`0..10` = `StructuralPrefixCap` 以下)に統一
      (「N をタプル展開するか `readonly T[]` で済ませるか」の境界を 3 リポジトリで一本化)。
- cap の実上限の根拠はテストで固定した: `MakeTuple` は **N = 9999 まで成功し、N = 10000 で
  TS2799**(tuple type too large)になる(TS6 / TS7(native) とも同一。
  `make-tuple.test.mts` に境界の型テストを追加)。`SupportedLengthCap = 2048` は
  この実上限に対して十分な余裕を持つ。なお下流の条件型でこの union を使う場合、
  TS7 の複雑度制限(TS2859)が別途効きうる点に注意(ts-fortress `string()` で実例あり)。

## 3. ハイブリッド構造(第2版): 添字アクセスの `undefined` 除去

brand 単独では `xs[0]` が `T | undefined` になる(`noUncheckedIndexedAccess`)。
これを解決するため、brand に **構造的タプル接頭辞**を交差させる:

- `MinLengthArray<N, Elm>` の構造部分は `readonly Elm[]` ではなく
  `MinLengthTuple<min(N, 10), Elm>`。これにより添字 `0 .. min(N,10)-1` へのアクセスは `Elm` になる。
- `FixedLengthArray<N, Elm>`(N ≤ 10)はさらに正確なタプル `FixedLengthTuple<N, Elm>` を交差。
  `length` は literal `N` になり、`FixedLengthTuple<N, Elm>` へそのまま代入もできる。
- 接頭辞長の上限(`StructuralPrefixCap = 10`)は**単調な clamp** なので、
  `MinLengthArray<12> <= MinLengthArray<5>` のような**閾値をまたぐ包含関係も壊れない**
  (「N ≤ 10 のときだけタプル、それ以外は `readonly Elm[]`」という単純な場合分けだと
  大きい N → 小さい N の代入が壊れる。ここが設計の要点)。
- 正確な N の区別(例: `MinLengthArray<12>` ≠ `MinLengthArray<15>`)は引き続き brand が担う。
  構造部分だけでは 10 超の制約が同一型に潰れてしまうため、brand は必須。
- 接頭辞は高々 10 スロット・union なしなので、`T` が巨大でもコスト増はごく僅か(§5 で実測)。

## 4. 命名規則の統一(第2版・破壊的変更)

3 ファミリーを `{Fixed,Min,Max,Bounded}Length × {String,Array,Tuple}` の直積で統一した:

| 制約             | 文字列(brand)         | 配列(brand+接頭辞)   | タプル(構造的・ナイーヴ)                   |
| ---------------- | --------------------- | -------------------- | ------------------------------------------ |
| 長さ = N         | `FixedLengthString`   | `FixedLengthArray`   | `FixedLengthTuple`(旧 `ArrayOfLength`)     |
| 長さ ≥ N         | `MinLengthString`     | `MinLengthArray`     | `MinLengthTuple`(旧 `ArrayAtLeastLen`)     |
| 長さ ≤ N         | `MaxLengthString`     | `MaxLengthArray`     | `MaxLengthTuple`(旧 `ArrayAtMostLen`)      |
| Min ≤ 長さ ≤ Max | `BoundedLengthString` | `BoundedLengthArray` | `BoundedLengthTuple`(旧 `ArrayBoundedLen`) |

- `Mutable*` 変種も同様に改名(`MutableArrayOfLength` → `MutableFixedLengthTuple` など)。
- ts-data-forge のガード関数・ts-fortress のバリデータ関数も同じ規則に統一
  (タプル版: `isFixedLengthTuple` / `fixedLengthTuple` 等、brand 版: `isFixedLengthArray` /
  `fixedLengthArray` 等)。文字列版ガード(`isMinLengthString` 等)は元から本規則で公開済み。
- 検討した代替案と不採用理由:
    - `TupleOfLength` 等の `Tuple○○` 語順 → `FixedLengthString` と語順が揃わない。
    - `ArrayAtLeastLenNaive` のような `Naive` 接尾辞 → 実装品質でなく型の性質で命名すべき。
    - 新設側への `~Brand` 接尾辞 → 文字列 brand 型(`MaxLengthString` 等)に接尾辞がないことと不整合。
    - 「可変長に Tuple は不自然」という懸念について: `readonly [T, T, ...T[]]` は TypeScript の型システム上
      正式に tuple type(先頭固定要素 + rest 要素)なので、`MinLengthTuple` は用語として正確。
- 解消した不統一: `Len` 略記(`ArrayAtLeastLen`)と `Length`(`MaxLengthString`)の混在、
  `Of` / `AtLeast` / `AtMost` / `Bounded` と `Fixed` / `Min` / `Max` / `Bounded` の混在。
- 残した不統一(意図的): `NonEmptyArray` は構造的(≡ `MinLengthTuple<1, A>`)、`NonEmptyString` は
  brand。`NonEmptyArray` は利用箇所が非常に多く、brand 化はさらに大きな破壊的変更になるため今回は
  見送り。brand 版が必要な場合は `MinLengthArray<1, A>` を使う。

## 5. ベンチマーク結果

合成ベンチマーク(生成コード)。要素型は「80 変種の判別 union × 各 15 プロパティ(ネスト含む)」の
巨大型を複数使用し、宣言・弱化代入・関数適用・配列リテラルの文脈型付け・map/spread を両方式で
同一構造になるよう生成。

### 5.1 tsc --extendedDiagnostics(TypeScript 6.0.3、巨大型 6 種 × 制約長 {16,32,64,96})

| 指標           | タプル版 | brand 版(第1版) | brand+接頭辞版(第2版) |
| -------------- | -------: | --------------: | --------------------: |
| Instantiations |  116,825 |          40,896 |                44,364 |
| Types          |   38,174 |          32,453 |                33,319 |
| Memory used    |  ~195 MB |         ~147 MB |               ~143 MB |
| Check time     | 1.6–2.2s |            1.2s |                  1.6s |

- 制約長セットを {8,16,32,64} → {16,32,64,96} に増やすと、タプル版のインスタンス化数は
  59,501 → 116,825 とほぼ倍増するのに対し、brand 版はほぼ一定。
- ハイブリッド化(第2版)のコスト増はインスタンス化 +3.5k 程度で、メモリはほぼ不変。

### 5.2 型付き ESLint のピークメモリ(typescript-eslint 8.62.1 / ESLint 9.39.4)

型情報を使うルール 4 つで 1 ファイルを lint した際のピーク RSS(VmHWM)。
巨大型 12 種 × 制約長 {8..96}:

| 構成                   | ピーク RSS | 実行時間 |
| ---------------------- | ---------: | -------: |
| タプル版               | 992–993 MB |   22–31s |
| brand 版(第1版)        |     832 MB |    11.6s |
| brand+接頭辞版(第2版)  |     834 MB |    15.7s |
| ベースライン(制約なし) |     389 MB |     2.2s |

ベースラインを差し引いた「長さ制約由来の増分」: タプル版 +603 MB に対し brand 版 +443〜445 MB
(約 1.4 倍軽量)。実行時間は約 2 倍高速。
※ 合成ベンチのため実アプリでの削減幅は使用パターン次第。`MaxLengthTuple` / `BoundedLengthTuple`
(union of tuples)を大きな N・巨大 T で多用している箇所、配列リテラルを直接それらに代入している
箇所ほど効果が大きい。ESLint プロセスは全ファイルの型を保持し続けるため、ファイル数が多いほど
差は拡大する。

### 5.3 再帰深度制限

- タプル版 `MaxLengthTuple<120, T>`: TS2589 でコンパイル不能(N ≳ 100)。
- brand 版 `MaxLengthArray<1000, T>` / `BoundedLengthArray<100, 1000, T>`: 問題なし。

## 6. 実装内容(3 リポジトリ)

### ts-type-forge(major)

- 新設: `src/branded-types/predefined-arrays/length-constrained-array.mts`
  (`MaxLengthArray` / `MinLengthArray` / `BoundedLengthArray` / `FixedLengthArray`、
  ハイブリッド構造 §3、型テスト付き)。
- 改名(破壊的): `ArrayOfLength` → `FixedLengthTuple`、`ArrayAtLeastLen` → `MinLengthTuple`、
  `ArrayAtMostLen` → `MaxLengthTuple`、`ArrayBoundedLen` → `BoundedLengthTuple`(+ `Mutable*` 変種)。
  旧名のエイリアスは残していない。
- ファイル構成も型名に追随: タプル版 family は `src/tuple-and-list/array.mts` から
  `src/tuple-and-list/length-constrained-tuple.mts` へ分離
  (`length-constrained-string.mts` / `length-constrained-array.mts` と対称)。
  `array.mts` には `NonEmptyArray` / `ArrayElement` 等の汎用配列型のみが残る。
- `index.mts` / `global.mts` / README の型一覧は生成スクリプトで再生成。

### ts-data-forge(major)

- 新設: `src/guard/is-length-bounded-array.mts`
  (`isMinLengthArray` / `isMaxLengthArray` / `isBoundedLengthArray` / `isFixedLengthArray`)。
  narrowing 結果はハイブリッド型との交差なので、ガード成立後の添字アクセスは `undefined` を含まない
  (テストで担保)。
- 既存のタプル版ガードも型名に合わせて改名(major のため関数名も同時に統一):
  `isArrayOfLength` → `isFixedLengthTuple`、`isArrayAtLeastLength` → `isMinLengthTuple`、
  `isArrayAtMostLength` → `isMaxLengthTuple`、`isArrayBoundedLength` → `isBoundedLengthTuple`。
  対応する JSDoc 用サンプルファイル(`samples/src/array/`)も改名。

### ts-fortress(major)

- 新設: `src/array/length-constrained-array.mts`
  (`fixedLengthArray` / `minLengthArray` / `maxLengthArray` / `boundedLengthArray` バリデータ。
  ランタイム検証・エラー details・`fill` / `prune` はタプル版と同等)。
- タプル版バリデータも型名に合わせて改名: `arrayOfLength` → `fixedLengthTuple`、
  `arrayAtLeastLength` → `minLengthTuple`、`arrayAtMostLength` → `maxLengthTuple`、
  `arrayBoundedLength` → `boundedLengthTuple`(ソースファイル名も
  `fixed-length-tuple.mts` 等へ改名)。デフォルト `typeName` 文字列(エラーメッセージに現れる)も
  新型名に追随(例: `ArrayOfLength<2, EvenRange>` → `FixedLengthTuple<2, EvenRange>`)。
  内部の `Arr.isArrayOfLength` 等の呼び出しも新ガード名へ追随。

### 使い分けガイド

| ユースケース                                             | 推奨                              |
| -------------------------------------------------------- | --------------------------------- |
| `T` が巨大 / N が大きい / ESLint・tsc のメモリが気になる | brand 版(`*LengthArray`)          |
| 位置ごとに異なる型を持つ固定形状、網羅的な分割代入が必要 | タプル版(`*LengthTuple`)          |
| 添字アクセスの `undefined` 除去だけが目的                | brand 版で足りる(N ≤ 10 の接頭辞) |

brand 版の値の構築はガード(`isFixedLengthArray` 等)・ランタイム検証付きキャスト
(`asFixedLengthArray` / `asMinLengthArray` / `asMaxLengthArray` / `asBoundedLengthArray`。
長さ違反時は `TypeError`)・バリデータ(`fixedLengthArray` 等)のいずれかで行う
(`MaxLengthString` と同じ運用)。配列リテラルの直接代入は不可。

## 7. ローカル検証手順(node_modules パッチ)

publish 前の下流検証は、pnpm の store(ハードリンク)を壊さないよう symlink 先の `dist` を
rm → cp で差し替える方法で実施:

```bash
cd ts-type-forge && pnpm run build
cd ../ts-data-forge   # ts-fortress も同様
target=$(realpath node_modules/ts-type-forge)
rm -rf "$target/dist"
cp -r ../ts-type-forge/dist "$target/dist"
pnpm run type-check && pnpm run lint && pnpm run test
```

- `rsync` の in-place 書き込みはハードリンク経由で pnpm のグローバル store を書き換えるため使わないこと。
- 型名改名後は ts-fortress の `node_modules/ts-data-forge` も(公開版が旧型名を参照しているため)
  同様にビルド済み dist へ差し替えて検証した。
- 検証結果: 3 リポジトリとも type-check / lint / 全テスト成功
  (ts-data-forge 3,090 件、ts-fortress 1,546 件)。

## 8. リリース手順と注意

- **すべて major release**(semantic-release 運用のため、コミットは `feat!:` + `BREAKING CHANGE`)。
- publish 順序: `ts-type-forge` → `ts-data-forge` → `ts-fortress`。
    - ts-data-forge のブランチ CI は新 ts-type-forge の publish + 依存更新まで型エラーで失敗する。
    - ts-fortress は新 ts-type-forge に加えて(公開版 ts-data-forge が旧型名を参照するため)
      **新 ts-data-forge も必要**。
- 利用アプリの移行: 旧タプル版の型名・関数名を新名に機械的に置換
  (型: `ArrayOfLength` → `FixedLengthTuple` 等 / 関数: `isArrayOfLength` → `isFixedLengthTuple`、
  `arrayOfLength` → `fixedLengthTuple` 等)。ESLint メモリ問題のある箇所は brand 版へ移行。

## 9. その他の軽量化アイデア(brand 化以外・参考)

1. `MaxLengthTuple` / `BoundedLengthTuple`(union of tuples)の使用箇所から優先的に置き換える。
2. 巨大 union 型の各腕を named interface にして展開を抑える。
3. 配列リテラルを制約型へ直接文脈型付けさせず、いったん `readonly T[]` に束縛してからガードで絞る。
4. 長さ保証が不要な内部処理では `readonly T[]` に widen して引き回す。
5. typescript-eslint 側の設定調整(型使用ルールの対象絞り込み等)や TS7(ネイティブ実装)への移行は
   メモリ問題全般に効くが、typescript-eslint は現状 TS6 の JS API に依存
   (各リポジトリが `typescript` 6.x と `typescript-native` を併存させているのはこのため)。
