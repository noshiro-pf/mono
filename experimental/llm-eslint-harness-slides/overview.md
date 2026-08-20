# LLM × ESLint：ハーネスエンジニアリングで AI 出力精度を底上げする

> スライド本編（Marp）に入る前の骨子・素材まとめ。各セクションがスライド 1〜2 枚に相当する想定。
> 対象オーディエンス：Tier IV 社内エンジニア（TS/React 既知）。**ESLint 未経験者も含むため、AST／plugin の最低限の説明は本文中で行う**。

---

## 0. このトークの主張（最初に結論）

1. **LLM への自然言語指示は揮発する**。CLAUDE.md / プロンプトに規約を書き続けるのは持続しない。
2. 規律は **lint ルール** に焼き込んで、LLM を**エラー駆動で動かす**のが、長期的にコードを良好に保つ最短経路。
3. **ESLint は JS/TS でカスタムルールが書ける**ため、LLM 時代でも価値が高い。Biome は plugin 拡張がないため戦略的に弱い。**oxlint は 2026 年 3 月に JS plugins alpha を出し、ESLint 互換のまま 86% 高速化を実現したので有力な後継候補**。
4. **ルール実装は LLM にやらせれば限界費用がほぼゼロ**。「指示を増やす」のではなく「ハーネス（ルール）を増やす」方向に投資する。
5. ESLint で覆えない領域は、**自前 lint / codemod を LLM で書かせる**ことで静的検証を拡張していける。
6. ただし**タスクごとに LLM の効きやすさは違う**。実体験では、ESLint plugin は手動実装ゼロで動くものが出たが、ts-morph ベースの codemod (`convert-to-readonly`) は手動補正が多めに必要だった。**一方、テストケースの大量生成はどちらでも LLM が非常に効く**。

---

## 1. 問題提起：自然言語 prompt は揮発する

- LLM への「こう書いて」「これは禁止」は **その会話内でしか効かない**。次のセッション、別の人間のセッションでは消える。
- CLAUDE.md / agents.md に規約を積んでも、量が増えるほど追従精度が落ち、しかも**「守ったかどうか」を機械的に検証する手段がない**。
  - 守れていないことに気付くのはレビューワー or 本番。
  - レビューワーが毎回同じ指摘を入れる → 時間とトークンを溶かす。
- **ふんわりした規律は LLM 駆動開発のスケールに耐えない**。

→ 解：規律は**機械可読な形（lint ルール）**に落とす。LLM は lint エラー駆動で動かす。

---

## 2. ハーネスエンジニアリングという考え方

- **ハーネス** = LLM の自由出力を、望ましい方向に矯正する治具・検査ライン。
- 「自由作文 → 人間レビュー」ではなく、「自由作文 → 自動検査 → 自動修正 or LLM 再書き → 人間レビューは設計判断のみ」のループを作る。
- ハーネスを構成する主要な要素（既存スタックで揃うもの）：
  - 型システム（TypeScript strict / `noUncheckedIndexedAccess`）
  - **lint ルール ← 本資料の主役**
  - テスト（型レベル / 振る舞い両方）
  - フォーマッタ、generated index、cspell など
- lint は **AST 単位で対象を絞れる**ため、「型では表現しにくいが、組織のローカル規約として強制したい」ものに最適。

```
[Issue]
  → LLM が実装
  → eslint --fix（自動修正可能なものは消える）
  → 残ったエラーは LLM に渡して再修正
  → tsc / vitest が緑
  → 人間レビューは設計と意図だけ見る
```

---

## 3. ESLint の基礎（未経験者向け 1 枚補足）

- ESLint = JS/TS のソースを **AST（抽象構文木）** に変換し、**ノードごとに「検査関数」を呼ぶ**仕組み。
- カスタムルールは TypeScript で 1 ファイル数十〜200 行程度で書ける。
- 構造（最小例）：

  ```ts
  export const myRule: Rule.RuleModule = {
    meta: {
      type: "problem",
      docs: { description: "..." },
      messages: { violate: "..." },
      schema: [
        /* options の JSON Schema */
      ],
      fixable: "code",
    },
    create(context) {
      return {
        ImportDeclaration(node) {
          // node を見て context.report({...}) を呼ぶと違反になる
        },
      };
    },
  };
  ```

- `fixable: 'code'` を付け `fix: (fixer) => fixer.replaceText(...)` を返すと **`eslint --fix` で自動修正**される。
  - これが LLM 駆動ループとの相性が抜群。
- 型情報を使った高度なルール（型 X を持つ式は禁止、など）も `@typescript-eslint/parser` の services 経由で書ける。

---

## 4. なぜ ESLint なのか（biome / oxlint との比較）

| ツール     | カスタムルール拡張                                                                                          | 速度                                  | LLM 時代の評価                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| **ESLint** | JS/TS で plugin を書ける。AST + scope + 型情報フルアクセス                                                  | 標準                                  | ◎ 既存資産が最大。LLM にルールを書かせて即足せる                               |
| **Biome**  | プラグイン機構なし（GritQL ベースの限定的なものが進行中だが、TS で任意ロジックは書けない）                  | 速い                                  | △ 速度は魅力だが、**組織固有規約を機械化できない**のが致命的                   |
| **oxlint** | **2026/03 に JS plugins alpha 公開**。**ESLint v9+ plugin API と 99.5%+ 互換**。tsgolint で型情報も利用可能 | 非常に速い（JS で書いても Rust 並み） | ◎ 近い将来 ESLint 置き換え候補。**互換 plugin を流用しつつ高速化できる現実解** |

**主張**：plugin 拡張を持たない linter は LLM 駆動開発時代に**戦略的に採用しづらい**。速度よりも「規約を機械化できる柔軟性」のレバレッジのほうが大きい。

### 4.1 oxlint 2026 補足

- 2026/03 アルファで「**ESLint プラグインがほぼそのまま動く**」段階に到達。
- JS で書いた plugin が **raw transfer 技術で 86% 高速化**、Rust と比較可能な速度で動く。
- typescript-eslint の **型 aware ルール 61 個中 59 個** を `tsgolint`（typescript-go ベース）でカバー、ESLint 比でかなり高速。
- 多くのプロジェクトで **drop-in replacement 候補**として現実的になってきた。
- 結論：**いま新規に lint 基盤を立てるなら ESLint 互換を維持しつつ、将来 oxlint へ載せ替える前提**で投資する価値がある（ルール資産は移植可能）。

---

## 5. 事例 A：リポジトリ専用ローカル plugin

**場所**：`AutowareEvaluationDashboard/configs/eslint/plugins/`

このリポジトリの個別事情を AST レベルで強制する例。汎用 npm パッケージ化までする必要はないが、リポジトリ内に置いておくだけで十分価値が出る。

### 5.1 `use-alias-import`（fixable）

- **やること**：`src/components/shared` のような特定ディレクトリ配下を相対 import で参照していたら、**barrel 経由の alias `~/components/shared` に矯正**する。
- **なぜ必要**：
  - LLM はリポジトリ全体のパス構造を覚えていられず、`../../../shared/...` のような fragile な相対 import を生成しがち。
  - 移動・リネームで壊れる、レイヤ境界が読みづらくなる、import 行を見ても依存層が判らない。
- **ポリシー**：`tsconfig` の `paths` には barrel alias のみ登録、サブパス alias は許さない → ルール側もサブパスに連結せず alias 文字列そのものに置換。
- **効用**：barrel 経由しか公開しないアーキテクチャを **AST レベルで保証**。自然言語で繰り返し言わなくて済む。
- 規模感：**約 170 行 TS**。LLM に「こういう仕様で plugin 書いて」と依頼すれば 1 セッションで生成可能。

### 5.2 `import-layer-order`

- **やること**：レイヤー（依存階層）を線形配列で宣言し、**より高層から低層への import のみ許可**、逆方向（低層が高層に依存）を違反として報告する。
- 設定例：

  ```
  layers: [
    'src/utils',
    'src/core',
    'src/constants',
    ...
    'src/components/common',
    'src/components/shared',
    'src/components',
  ]
  ```

- 各ファイルは「prefix が最も長く一致するレイヤー」に所属、その index で大小比較。
- **なぜ必要**：LLM は雑に書くとレイヤー反転（utils → components など）を紛れ込ませる。レビューで気付いてから直すと手戻りが大きい。
- **効用**：アーキテクチャ違反をそもそも **AI に書かせない**ハード制約。
- 規模感：**約 200 行 TS**。`exemptFiles`（エントリポイントなど）も `in:` で除外できる柔軟性付き。

> どちらも「自然言語で何度も同じ指摘をする代わりに、ルール 1 個書いて永久に黙らせる」典型例。

---

## 6. 事例 B：コーディングスタイル系の汎用ルール（`react-coding-style`）

**場所**：`noshiro-pf/eslint-config-typed/src/plugins/react-coding-style/rules/`

「型では表現しきれないが、チームで統一したい記法」を 1 本ずつ AST ルール化したもの。
9 ルール構成：

- `component-name` — コンポーネント変数名の規約
- `component-var-type-annotation` — 変数宣言時の型注釈位置・形式
- `display-name` — `React.memo` でラップしたコンポーネントの `displayName` 必須化
- `props-type-annotation-style` — `Props` 型の宣言スタイルを統一（`Readonly<{...}>` 等）
- `react-memo-props-argument-name` — `React.memo` の引数名規約
- `react-memo-type-parameter` — `React.memo<Props>` の型パラメータ強制
- `import-style` — `import * as React from 'react'` のような import 形式の統一
- `use-memo-hook-style` — `useMemo` の宣言スタイル統一
- `ban-use-imperative-handle-hook` — `useImperativeHandle` の禁止

### 6.1 これらが LLM 観点で効く理由

- AI が出す React コードは「業界の平均的な書き方」になる。リポジトリ固有の流儀（memo 必須、props の型位置、import 形式等）からは**静かにズレる**。
- ルール化しておけば、生成直後に `eslint --fix` で**強制的に流儀に寄せられる**。
- ルールごとに `.test.mts` が併設されており、**ルール本体に対して TDD が回せる**：
  - LLM がルールを書く → テストが落ちる → LLM が直す、というループ。
  - 「コードを書くハーネス」自体を「テストというハーネス」で管理している構造。

---

## 6.5. 事例 C：型を Readonly に矯正する codemod（`convert-to-readonly`）

**場所**：`noshiro-pf/ts-codemod-lib/src/functions/ast-transformers/convert-to-readonly.mts`

ESLint plugin と並んで、もうひとつ重要なハーネスが **codemod**。lint は「警告して直させる」、codemod は「**既存コードを一括書き換える**」ツールで、型定義の Readonly 化のような **横断的・破壊的変更**に向く。

### 6.5.1 何をする codemod か

- TypeScript の型定義中の **mutable な型を Readonly 系に自動変換**するトランスフォーマ。
  - `T[]` → `readonly T[]`
  - `[A, B]` → `readonly [A, B]`
  - `{ x: number }` → `Readonly<{ x: number }>` または `DeepReadonly<{ ... }>`
  - union/intersection を貫通して内側も Readonly 化
- 実装は `ts-morph` ベース。`DeepReadonly` の type 名、`applyLevel`、`ignorePrefixes`（`mut_` 始まりは除外）、行コメントによる disable など、実運用で必要な escape hatch が一通り入っている。

### 6.5.2 なぜこれを書いたか（バグ予防の観点）

- TypeScript の型は **デフォルトで mutable**。`Array<T>` も `{}` も書き換え可能扱いになるため、関数引数として渡したつもりの値が呼ばれた先で書き換えられるバグが容易に発生する。
- 「**Readonly がデフォルト**」の規約を**型定義側で強制**しておけば、破壊的変更が起きた瞬間に `tsc` が落ちる。
- 既存リポジトリ全体を Readonly 化したい時に、人手で書き換えるのは現実的でない → codemod 一発で適用したい。

### 6.5.3 規模感と「LLM 効きにくさ」の正直な話

| 区分 | 行数 | コメント |
|---|---|---|
| 本体 `convert-to-readonly.mts` | **1,482 行** | union/intersection の正規化、parens 取り扱い、generic 再帰、行 disable コメント検出 …  AST 周りの細かい条件分岐が多い |
| テスト `convert-to-readonly.test.mts` | **3,959 行** | Before/After ペアを大量に並べたケースベーステスト |
| helpers (`readonly-transformer-helpers/`) | 約 250 行 | union のグルーピング、context、定数 |

- 一方、§5 の **ESLint plugin（`use-alias-import` ≒ 170 行、`import-layer-order` ≒ 200 行）は LLM 駆動でほぼ手動 0、1 セッションで動くものが出た**。
- この **codemod は LLM 駆動 100% では収束しなかった**。主な理由（推察）：
  - `ts-morph` の API 表面が広く、ノードの種類ごとに「親 parens を残すべきか取るべきか」「DeepReadonly に包むべきか中で readonly に落とすべきか」など**意味論を伴う判断**が連鎖する。
  - union/intersection の正規化、tuple と array の差、generic 引数の伝播など、**1 ファイル内に局所化されない不変条件**が多く、リファクタごとに既存ケースを壊しやすい。
  - ESLint のように「ノードに対する独立した検査 + 自動修正」という**疎結合な単位**に分解できず、トランスフォーマ全体の状態（`ReadonlyContext`）が効いてくる。
- 結果として、本体ロジックは手動実装が大半。**ただしテストケース生成は LLM が大いに効いた** — 「こういう Before/After のペアを 30 個出して」という指示に、Readonly のあらゆる組み合わせを網羅したケースを生成させられた。

### 6.5.4 教訓（実体験ベース）

- **LLM 駆動が効きやすいタスク**：
  - 単一ノードに閉じた検査（ESLint rule）
  - 規約が明確で、テストケースで Before/After が定義しやすい
  - 状態が小さい・無い
- **LLM 駆動が苦手なタスク**：
  - AST 全体に渡る意味論的整合性が必要な変換
  - 既存ケースを壊さずに新ケースを足す（リグレッション制御）
  - `ts-morph` のように API 表面が広く、選択肢が多いライブラリ
- **タスクの種類によらず効くこと**：
  - **テストケース生成**（網羅性を出す）
  - 小さなヘルパー関数や型定義の generation
  - ドキュメント・コメント生成

→ 投資する順序：**まず lint plugin から増やす**、codemod は「**自分が骨格を書いて LLM にテストを大量に書かせる**」ハイブリッドが現実的。

---

## 7. 推奨ワークフロー：ルール駆動の LLM 開発

```
1. Issue / 仕様
2. LLM が実装
3. eslint --fix           ← ローカル plugin + 汎用 plugin + 共有 config
4. 残ったエラーを LLM に渡す  ← 自然言語で説明しない、エラー文だけ渡す
5. tsc / vitest
6. 人間レビュー（規約遵守は見ない、設計と意図だけ見る）
7. 同じ指摘が 2 回出たら → ルール化（LLM に書かせる）
```

**運用 Tips**

- 人間の prompt 量を増やすのではなく、**ルール本数**を増やす方向に投資する。
- ルール追加コストは LLM のおかげで限界費用ほぼゼロ。「**規約 1 個 = ルール 1 個**」が成立する。
- 「レビューで 2 回同じことを言ったら 3 回目はルール化」を文化として定着させる。
- ルールに同居する `.test.mts` を必須にする → ルール自体が壊れたときに検出できる。

---

## 8. その先：自前で lint / codemod を書く

- ESLint で覆えない領域（Python, Rust, YAML, Protobuf, SQL, 社内 DSL …）も、AST パーサさえあれば自前 linter / codemod を構築可能。
- 「ゼロから lint ツールを書く」は従来は重い投資だったが、LLM 駆動なら**週末プロジェクト規模**に降りてきた。
- 想定される自前ツール例：
  - 社内シナリオ DSL（YAML 等）の静的検証ツール
  - 旧 API → 新 API の自動移行 codemod
  - リポジトリ横断の禁止 import スキャナ
  - protobuf スキーマの後方互換チェッカ
- **静的検証の自前増殖力こそが、LLM 駆動開発のスケーラビリティを決める**。
- ただし §6.5 のとおり、**書き換え系（codemod）はまだ人間の手が要るタスク**。投資配分は「lint plugin を量で増やす + codemod は骨格人間 / テスト LLM のハイブリッド」が現実解。

---

## 9. まとめ（伝えたい 3 点）

1. **LLM への指示は揮発する。規律は lint に焼き込め**。
2. **ESLint は plugin 拡張があるおかげで LLM 時代に強い**。Biome は plugin 拡張不在で戦略的に弱い。**oxlint は 2026/03 に ESLint 互換 plugin alpha を出し、ルール資産を保ったまま高速化できる現実解**になった。
3. **ルール実装は LLM にやらせれば限界費用ゼロ**。「自然言語で指示を増やす」のではなく「ハーネス（ルール）を増やす」発想に切り替える。
4. **タスクの性質を見極めよ**：ESLint plugin は LLM 駆動 100% で書ける、ts-morph codemod は骨格人間 + テスト LLM のハイブリッドが効く。**テスト生成はどんなタスクでも LLM の威力が出る**。

---

## 付録 A：スライド構成案（Marp、15〜17 枚想定）

1. タイトル
2. 結論 4 点（このトークの主張）
3. 問題提起：prompt は揮発する
4. ハーネスエンジニアリングという考え方
5. ESLint 基礎（AST + rule の最小構造）
6. ツール比較表（ESLint / Biome / oxlint）
7. oxlint 2026 補足
8. 事例 A-1：`use-alias-import`（コード抜粋 + Before/After）
9. 事例 A-2：`import-layer-order`（レイヤー図 + ルール宣言例）
10. 事例 B：`react-coding-style` ルール群俯瞰
11. 事例 B 抜粋：`display-name` / `props-type-annotation-style` の Before/After
12. 事例 C-1：`convert-to-readonly` codemod（何をする・なぜ）
13. 事例 C-2：「LLM 駆動が苦手だったタスク」の正直な話 + 教訓
14. 推奨ワークフロー図
15. 自前 lint / codemod への拡張
16. まとめ

---

## 付録 B：本編で使う想定のコード抜粋（参考リンク）

- `AutowareEvaluationDashboard/configs/eslint/plugins/use-alias-import.mts`
- `AutowareEvaluationDashboard/configs/eslint/plugins/import-layer-order.mts`
- `AutowareEvaluationDashboard/configs/eslint/plugins/local-plugin.mts`
- `noshiro-pf/eslint-config-typed/src/plugins/react-coding-style/rules/rules.mts`
- `noshiro-pf/eslint-config-typed/src/plugins/react-coding-style/rules/display-name.mts`
- `noshiro-pf/eslint-config-typed/src/plugins/react-coding-style/rules/props-type-annotation-style.mts`
- `noshiro-pf/ts-codemod-lib/src/functions/ast-transformers/convert-to-readonly.mts`
- `noshiro-pf/ts-codemod-lib/src/functions/ast-transformers/convert-to-readonly.test.mts`

---

## 付録 C：oxlint 補足リンク（2026/03 時点）

- [Oxlint JS Plugins Alpha (公式ブログ, 2026-03-11)](https://oxc.rs/blog/2026-03-11-oxlint-js-plugins-alpha)
- [JS Plugins ドキュメント](https://oxc.rs/docs/guide/usage/linter/js-plugins.html)
- [Type-Aware Linting (tsgolint)](https://oxc.rs/docs/guide/usage/linter/type-aware.html)
- [tsgolint リポジトリ](https://github.com/oxc-project/tsgolint)
- [Announcing Oxlint JavaScript Plugin Support (VoidZero)](https://voidzero.dev/posts/announcing-oxlint-js-plugins)
