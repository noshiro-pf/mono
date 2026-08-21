---
marp: true
theme: default
paginate: true
size: 16:9
header: 'AI の書いたコードのレビューがしんどい問題'
footer: 'LLM 勉強会 / noshiro-pf'
style: |
    section {
      font-size: 26px;
      padding: 60px 70px;
    }
    section.title {
      background: linear-gradient(135deg, #1f2937 0%, #0f172a 100%);
      color: #f8fafc;
      text-align: left;
      padding: 100px 90px;
    }
    section.title h1 {
      font-size: 56px;
      color: #f8fafc;
      border-bottom: none;
    }
    section.title h2 {
      font-size: 28px;
      color: #94a3b8;
      font-weight: 400;
    }
    section.title a { color: #93c5fd; }
    section.title .small { color: #cbd5e1; }
    section.title strong { color: #fbbf24; }
    section.title code { background: #1e293b; color: #e2e8f0; }
    section.title .refs li { color: #cbd5e1; font-size: 0.88em; line-height: 1.6; }
    section.section-break {
      background: #0f172a;
      color: #f8fafc;
      text-align: center;
    }
    section.section-break h1 {
      font-size: 64px;
      color: #f8fafc;
      border-bottom: none;
    }
    section.section-break h2 { color: #94a3b8; font-weight: 400; }
    section.section-break a { color: #93c5fd; }
    section.section-break code { background: #1e293b; color: #e2e8f0; }
    section.compact { font-size: 22px; padding: 40px 60px; }
    section.compact pre { font-size: 0.72em; line-height: 1.35; padding: 12px; }
    section.compact table { font-size: 0.78em; }
    section.compact h1 { font-size: 30px; margin-bottom: 16px; }
    section.compact p, section.compact li { line-height: 1.45; }
    h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
    h2 { color: #1e3a8a; }
    strong { color: #b91c1c; }
    /* inline code: light bg in light slides */
    code { background: #f1f5f9; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-size: 0.92em; }
    /* code blocks: monokai-ish */
    pre {
      background: #272822;
      color: #f8f8f2;
      border-radius: 8px;
      padding: 16px;
      font-size: 0.78em;
      line-height: 1.5;
    }
    pre code { background: transparent; color: #f8f8f2; padding: 0; }
    /* Prism token colors (monokai) */
    .hljs, code[class*="language-"], pre[class*="language-"] { background: #272822; color: #f8f8f2; }
    .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #75715e; font-style: italic; }
    .token.punctuation { color: #f8f8f2; }
    .token.namespace { opacity: 0.7; }
    .token.property, .token.tag, .token.constant, .token.symbol, .token.deleted { color: #f92672; }
    .token.boolean, .token.number { color: #ae81ff; }
    .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #e6db74; }
    .token.operator, .token.entity, .token.url, .token.variable { color: #f8f8f2; }
    .token.atrule, .token.attr-value, .token.function, .token.class-name { color: #a6e22e; }
    .token.keyword { color: #66d9ef; font-style: italic; }
    .token.regex, .token.important { color: #fd971f; }
    .token.italic { font-style: italic; }
    /* highlight.js (marp-core uses highlight.js) — Monokai */
    .hljs-comment, .hljs-quote { color: #75715e; font-style: italic; }
    .hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-tag, .hljs-name { color: #f92672; }
    .hljs-built_in, .hljs-type, .hljs-title.class_, .hljs-class .hljs-title { color: #66d9ef; font-style: italic; }
    .hljs-string, .hljs-template-string, .hljs-regexp { color: #e6db74; }
    .hljs-number, .hljs-symbol, .hljs-meta, .hljs-link { color: #ae81ff; }
    .hljs-title, .hljs-section, .hljs-title.function_, .hljs-function .hljs-title { color: #a6e22e; }
    .hljs-attr, .hljs-property { color: #f8f8f2; }
    .hljs-attribute, .hljs-addition { color: #a6e22e; }
    .hljs-params, .hljs-variable { color: #fd971f; font-style: italic; }
    .hljs-deletion { color: #f92672; }
    table { font-size: 0.85em; border-collapse: collapse; }
    th { background: #1e3a8a; color: #fff; padding: 8px 12px; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    blockquote { border-left: 4px solid #1e3a8a; background: #eff6ff; padding: 12px 18px; color: #334155; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
    .small { font-size: 0.82em; color: #475569; }
    .accent { color: #b91c1c; font-weight: bold; }
---

<!-- cspell:ignore atrule hljs Marp METR monokai -->

<!-- _class: title -->

# AI の書いたコードのレビューがしんどい

## 実装とレビューの「非対称性」を設計する

<br>

速くなったのは実装だけで、レビューは速くなっていない。
ならばレビューが安く済む形にタスクを変換すればよい。

<br>

<span class="small">2026 — LLM 勉強会</span>

---

# このトークの主張

1. **AI で速くなったのは実装だけ。律速はレビューへ移った。**
2. 理解しきれていないコードが、資産ではなく **負債** として積み上がる。
3. 打ち手は「レビューを速くする」ではなく、**レビューが軽くて済む形にタスクを変換する**こと。
4. 鍵は **実装コストとレビューコストの非対称性**。しかもこれは **設計できる**。
5. 源泉は 4 つ：**有限の出力 / 独立した検証器 / 小さい爆発半径 / 統計的網羅**。
6. どうしても非対称にできない領域では、**受け入れ条件を先に機械可読な形で決める**。

---

<!-- _class: section-break -->

# 1. 何がしんどいのか

---

# 1.1 実感していること

- アイデアを一瞬で実装してくれるのは便利。しかし **レビューの頻度と量が跳ね上がった**。
- 自分の手で書いたコードほどには深く理解しきれていないコード断片が、
  ソースコードに **どんどん蓄積されていく**。
- そして本題：

<br>

> **AI の書いたコードのレビューに、自分の手で実装するのと
> 同じくらい時間を掛けてしまっては意味がない。**

---

<!-- _class: compact -->

# 1.2 算数：律速はレビューへ移った

| 工程     | AI 導入前  | AI 導入後 |
| -------- | ---------- | --------- |
| 実装     | 100 分     | 10 分     |
| レビュー | 30 分      | 30 分     |
| **合計** | **130 分** | **40 分** |

<span class="small">※ 数字は説明用の仮のもの</span>

- 実装を **10 倍速**にしても、全体は **3.25 倍** にしかならない。アムダールの法則そのもの。
- ここからさらに実装を速くしても、ほとんど効かない。**次に効くのはレビュー側**。
- しかも実際は、レビュー **対象の本数** も増える。レビュー側は 30 分のままでは済まない。

<br>

> 「実装が速くなった」＝「開発が速くなった」ではない。**工程全体で見る。**

---

# 1.3 体感は当てにならない

METR の RCT（2025/07）— 熟練 OSS 開発者が **慣れたリポジトリ** で作業したとき：

<div class="two-col">

<div>

**実測**

AI 利用可の条件のほうが
**19% 遅かった**

</div>

<div>

**本人の事後見積り**

AI で
**20% 速くなった**

</div>

</div>

<br>

- 扱いには注意：被験者 16 名 / 246 タスク、2025 年 2〜6 月、当時のツール。
  **METR 自身が「historical な結果」と注記している。**
- ここで使いたいのは数値ではなく **「速くなった感覚は当てにならない」の一点**。

<span class="small">出典：[METR — Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)</span>

---

# 1.4 「レビューを頑張る」は解にならない

- **検出率は掛けた時間に比例しない。** diff が大きいほど 1 行あたりの注意力は落ちる。
- **理解していないコードのレビューは、書くより難しいことがある。**
  書くときは意図が手元にあるが、読むときは **意図の復元から始まる**。
- **AI に AI のコードをレビューさせる**のも万能ではない。
  生成器と検証器が同じモデル・同じ文脈だと **誤りが相関する**（同じ勘違いを両方がする）。
- 「理解していないコードは merge しない」を貫くと、**AI の速度をほとんど捨てる**ことになる。

<br>

> **努力量を増やす方向には勝ち筋が薄い。タスクの形を変える。**

---

<!-- _class: section-break -->

# 2. 中心の主張

## 実装とレビューの非対称性

---

# 2.1 非対称なタスクを選ぶ

目指すのは **「検証コスト ≪ 実装コスト」** のタスクだけを AI に渡すこと。

- 比喩は NP の構造：**解を作るのは大変、解が正しいことの確認は安い**。
  数独、因数分解、経路探索。
- <span class="accent">AI コーディングは、実装とレビューに非対称性があるタスクに特に有効。</span>
- 逆に言えば、非対称性のないタスクに AI を投入しても、
  **しんどさが実装からレビューへ移動するだけ**。

<br>

> そして重要なのは、**この非対称性は与えられるものではなく、設計できる**ということ。

---

<!-- _class: compact -->

# 2.2 非対称性の 4 つの源泉

| 源泉                      | 何が安くなるか                 | 典型例                                     |
| ------------------------- | ------------------------------ | ------------------------------------------ |
| **A. 出力が有限**         | 全量を目視できる。読めば終わる | コード生成スクリプト、スキーマ翻訳         |
| **B. 独立した検証器**     | 正しさを機械が判定してくれる   | 型検査、スキーマ検証、参照実装との差分     |
| **C. 爆発半径が小さい**   | 間違ったときの被害が小さい     | 開発ツール、使い捨てスクリプト、実験コード |
| **D. 統計的に網羅できる** | 入力空間をマシンが埋める       | fuzzing、property-based testing            |

<br>

- 実務では **重ねる**。1 つでも効くが、2 つ重なると一気に楽になる。
- **4 つとも使えないタスク** が、人間が設計を持つべきタスク（後述）。

---

<!-- _class: section-break -->

# 源泉 A

## 出力が有限 — 生成スクリプトを書かせる

---

# 3.1 基本形

コード自動生成を行うスクリプトをコーディングエージェントに実装させるのは、
**非常に良いユースケースだった。**

- 有限のコードを変換・生成するだけでよい場合、**結果コードだけ確認すれば十分**。
- **生成スクリプトの実装内容は理解できていなくても全く問題ない。**
  レビュー対象はスクリプトではなく **出力**。

<br>

> 500 行の込み入った AST 処理でも、出力が「読めば正しさが分かる型定義 300 行」なら、
> **レビューすべきは後者だけ**。これが非対称性。

---

# 3.2 運用のキモ：生成物をコミットする

- **生成物をリポジトリにコミットし、diff をレビュー対象にする。**
    - スキーマが更新されて再生成したときも、**レビュー対象が「差分」に縮む**。
    - 生成物が gitignore されていると、毎回全量を読み直すことになり、
      **非対称性が初回だけで消える**。
- **生成スクリプトを決定的にする。**
  実行順が変わる / タイムスタンプを埋める、だと diff がノイズだらけでレビューが機能しない。
- CI で **「再生成して差分が出たら落とす」** チェックを入れる。
  生成物と生成器の乖離を防ぐ。

<br>

> 生成物をコミットしていない生成器は、**レビューを一度先送りしただけ**。

---

<!-- _class: compact -->

# 3.3 事例：OpenSCENARIO XML スキーマ → TypeScript

- 対象：[ASAM OpenSCENARIO XML v1.3.1 のスキーマ](https://publications.pages.asam.net/standards/ASAM_OpenSCENARIO/ASAM_OpenSCENARIO_XML/v1.3.1/generated/RenderedXsdOutput.html)。
- **もともとは手作業**で XML のモデル定義を TypeScript の型定義に翻訳していた。
  XSD は読み方がやや複雑で、**人間がやるとミスが出る**。
- 生成スクリプト化すると：
    - 出力は有限（型定義ファイル一式）→ **読めば終わる**（源泉 A）
    - 実データの `.xosc` を流して通す、既存コードが `tsc` を通る → **機械が判定**（源泉 B）
    - さらに、**人間の手作業より誤りを見つけやすくなる**。← 次スライド

<br>

> 注意：この生成物は **本番で動く**。ここで効いているのは「本番で動かないから気楽」ではない。

---

<!-- _class: compact -->

# 3.4 系統誤差 vs ランダム誤差 — 一番言いたいこと

<div class="two-col">

<div>

**人間の手作業**

誤りは **ランダムに散る**

```
300 箇所のうち、
どこか 3 箇所が間違っている
```

→ **全数チェックしないと見つからない**
→ 見落とすと本番まで残る

</div>

<div>

**生成スクリプト**

誤りは **系統的**

```
ロジックの誤りは
同じパターン全部に等しく現れる
```

→ **抜き取りで見つかる**
→ **1 箇所直せば全部直る**

</div>

</div>

<br>

- 「**同じ誤りが 100 箇所**」は「**100 種類の誤りが 100 箇所**」よりはるかに安い。
- つまり生成スクリプト化は、速いだけでなく **レビューの効率を構造的に上げている**。
  <span class="accent">誤りの分布が変わること、それ自体が価値。</span>

---

# 3.5 事例：OpenAPI / swagger yaml → バリデータ生成

- 既製の generator が多い領域だが、**自前の型規約・バリデータ規約に合わせたい**とき自作が効く。
- 検証手段が豊富（源泉 B と重ねやすい）：
    - 生成した型で **既存の呼び出し側が `tsc` を通る**か。
    - **実際のレスポンス JSON** を生成バリデータに流して通るか。
    - **既存の統合テスト**が緑のままか。

<br>

> 「スキーマ → コード」は非対称性がほぼ最大化される形。
> **入力が機械可読な仕様である**というのが効いている。

---

# 3.6 このパターンが崩れる例外

- **任意の入力コードに対する変換を行うツールとして公開する場合**
  → 入力空間が有限でなくなる。「出力を読めば終わり」が成立しない。
  → **源泉 D（テスト網羅）に切り替える**必要がある。
- **生成結果のコード行数が膨大でレビューが困難な場合**
  → 生成ロジック側をレビューしたほうがマシなことがある。
  → 実際の対処は「全量目視を諦めて **検証器（源泉 B）を用意する**」。
- **生成スクリプト自体が長期保守対象になった場合**
  → 一度きりの移行なら使い捨てでよい。四半期ごとにスキーマが更新されるなら、
  そのスクリプトは **実質プロダクションコード**。理解しないままにはしておけない。

---

<!-- _class: section-break -->

# 源泉 B

## 独立した検証器を持つ

---

# 4.1 正しさを機械が判定できる形に落とす

- **型検査**：strict TypeScript、`noUncheckedIndexedAccess`、readonly 徹底。
- **スキーマ検証**：生成した型 / バリデータに、実データを流して通す。
- **参照実装との差分（differential testing）**：
  既存実装と新実装に同じ入力を流して出力を比較。**移行系タスクで極めて強い**。
- **往復変換（round-trip）**：`parse(print(x)) === x`、`decode(encode(x)) === x`。
  codemod・シリアライザ・フォーマッタ系。
- **メタモルフィックテスト**：正解が分からなくても
  「入力をこう変えたら出力はこう変わるはず」なら書ける。**オラクル問題の回避策**。

---

# 4.2 落とし穴：検証器の独立性

<div class="two-col">

<div>

**❌ 危ない**

同じセッションで、同じモデルに
実装とテストを同時に書かせる

→ **実装の勘違いがテストにもコピーされる**
→ 緑になっても意味が薄い

</div>

<div>

**✅ 独立性を作る**

- 仕様から **別文脈で** 実装と検証器を作る
- 検証器は人間が書く / 既存のものを使う
- **もともと存在する外部の検証器**を使う

</div>

</div>

<br>

- 一番強いのは `tsc`、既存の統合テスト、参照実装、実データ。
  これらは **定義上 AI と独立**。
- 「テストが通りました」の価値は、**そのテストが誰と独立に書かれたか** で決まる。

---

<!-- _class: section-break -->

# 源泉 C

## 爆発半径を小さくする

---

<!-- _class: compact -->

# 5.1 レビューの深さを、賭け金に比例させる

| 爆発半径                   | 例                                             | レビュー方針                     |
| -------------------------- | ---------------------------------------------- | -------------------------------- |
| **小**（壊れても自分だけ） | 使い捨てスクリプト、実験コード、ローカル解析   | ほぼ見ない。動けばよい           |
| **中**（壊れると CI/開発） | lint ルール、codemod、ビルドツール、社内ツール | 挙動だけ確認。実装は流し読み     |
| **大**（壊れると顧客）     | 本番ロジック、課金、認証、データ破壊操作       | 通常レビュー。もしくは人間が書く |

- **プロダクションで直接動かないコードを書かせる** のは有力な回避策。
- 可逆性も同じ軸：**消せるか / ロールバックできるか / feature flag で切れるか**。
- <span class="accent">一律のレビュー深度をやめる。</span>これ自体がレビュー総量を減らす施策。

---

# 5.2 事例：ESLint ルールを実装させる

- これは **「有限の出力だけ見ればよい」ユースケースではない**（任意の入力コードに対して動く）。
- 効いているのは **源泉 C**：実装されたもの自体は **開発ツールであり、
  本番環境で直接動くコードではない** という気楽さ。
    - 誤検知が出ても、壊れるのは **CI であって顧客ではない**。
- さらに lint ルールは **1 ルール = 1 テストファイル**が書きやすい → 源泉 D にも寄せられる。
- 経験上、**AST ベースの局所的な一対一変換ならほぼ一発で期待通りに動く**。

<span class="small">詳細は姉妹資料「LLM × ESLint — ハーネスエンジニアリング」</span>

---

# 5.3 注意：源泉を取り違えない

> 「生成コードだから本番で動かないので気楽」は **誤り**。

- OpenSCENARIO の型定義も、OpenAPI のバリデータも **本番で動く**。
- そこで効いているのは **爆発半径（C）ではなく、有限の出力（A）＋ 独立した検証器（B）**。
- ESLint ルールだけが爆発半径の話。

<br>

<span class="accent">なぜこのタスクが安全なのかを、源泉の言葉で言えるようにしておく。</span>
言えないなら、それはたぶん安全ではない。

---

<!-- _class: section-break -->

# 源泉 D

## 統計的に網羅する

---

<!-- _class: compact -->

# 6.1 人間が読む代わりに、マシンに入力を作らせる

**fuzzing（ファジング）** — [Chromium の libFuzzer 運用](https://chromium.googlesource.com/chromium/src/+/main/testing/libfuzzer/README.md)、OSS-Fuzz

- 強いのは **オラクルが無料** な点。クラッシュ / ハング / UB / assertion 失敗は
  「明らかに間違い」なので、**期待値を書かなくてよい**。
- 逆に、**「クラッシュしないが答えが違う」は見つからない**。
  パーサ、デコーダ、サニタイザ向き。

**property-based testing**（fast-check 等）

- 人間が書くのは **不変量だけ**。入力はマシンが作る。
    - `sort` の結果は昇順、かつ元と同じ multiset
    - codemod は AST の意味を変えない
    - バリデータは自身が生成した値を必ず受理する
- <span class="accent">レビュー対象が「実装」から「性質」に縮む。</span>性質は数行で書けて、しかも仕様そのもの。

---

# 6.2 統計的網羅の限界

- **オラクル（あるいは不変量）を書けない領域には使えない。**
  「この UI が使いやすいか」には効かない。
- カバレッジは入力空間の網羅を意味しない。fuzzing が到達しない分岐は残る。
- 実行コストがかかる。CI に載せるなら時間予算の設計が要る。

<br>

> それでも、**不変量を 3 行書くだけで実装 500 行を読まずに済む** なら、
> 費用対効果は圧倒的。**まず不変量が書けないかを考える。**

---

<!-- _class: compact -->

# 7. まとめ表：どのタスクにどの源泉が効くか

| タスク                      | A 有限 | B 検証器 | C 半径 | D 網羅 | 総評             |
| --------------------------- | ------ | -------- | ------ | ------ | ---------------- |
| スキーマ → 型定義の生成     | ◎      | ◎        | △      | ○      | AI 駆動 100% 可  |
| OpenAPI → バリデータ生成    | ◎      | ◎        | △      | ○      | AI 駆動 100% 可  |
| ESLint ルール実装           | ×      | ○        | ◎      | ◎      | AI 駆動 100% 可  |
| 一度きりの移行 codemod      | ◎      | ○        | ○      | ○      | AI 駆動しやすい  |
| 公開する汎用 codemod ツール | ×      | △        | △      | ◎      | テスト網羅が必須 |
| 分析・実験スクリプト        | ○      | ×        | ◎      | ×      | ほぼ見なくてよい |
| 本番のビジネスロジック      | ×      | △        | ×      | △      | 人間が設計を持つ |
| 認証・課金・データ削除      | ×      | △        | ×      | △      | 通常レビュー必須 |

---

<!-- _class: section-break -->

# 8. 非対称にできないとき

---

# 8.1 4 つの源泉がどれも使えない領域

- **ビジネスロジック**：正しさの基準が外の世界（仕様、顧客の期待）にあり、コードに閉じない。
- **UX / 表示**：不変量が書けない。人間が見るしかない。
- **性能**：測れはするが、「なぜ速いか」の理解が要る。
- **セキュリティ境界**：失敗が非可逆。爆発半径を小さくできない。

<br>

ここでの方針は「AI に書かせない」ではなく——

> **AI に書かせる前に、人間が受け入れ条件を決める。**

---

<!-- _class: compact -->

# 8.2 仕様駆動 = 受け入れ条件を先に機械可読にする

順序を変えるだけで非対称性は作れる。
**実装 → レビュー** ではなく、**受け入れ条件 → 実装 → 条件が満たされたかの確認**。

強い順：

1. **型** — 表現できるものは型で表現する。`tsc` が通ることが仕様の証明になる。
2. **スキーマ / 境界バリデーション** — 外部入力は境界で検証（`ts-fortress` 等）。
3. **不変量（property）** — 性質を数行書けば、実装を読まずに済む。
4. **テストケース** — 具体例。**大量生成は AI が得意。ただし期待値は独立に決める。**
5. **lint ルール** — 型で表せない組織固有の規約。

<br>

> **自然言語の規約（CLAUDE.md / AGENTS.md）は揮発する。**
> 量が増えるほど追従精度が落ち、しかも守ったかを機械検証できない。

---

<!-- _class: compact -->

# 8.3 ビジネスロジックの静的検証はどこまで可能か

銀の弾丸はないが、実務で効くもの：

- **状態機械として書き、遷移表を網羅テストする。**
  取りうる状態が有限なら、**源泉 A と D の両方**が使えるようになる。
- **不正な状態を型で表現不能にする。** union 型 + 網羅性チェック。
  「バリデーションする」より「**不正な状態を作れなくする**」。
- **事前 / 事後条件を assert として埋める（Design by Contract 的に）。**
  これは同時に **fuzzing のオラクル**になる。
- 形式手法（TLA+ 等）は、対象が絞れていれば選択肢。ただしコストは高い。

<br>

> 共通しているのは、**「レビューで確認していたこと」を「機械が確認できる形」へ移す**こと。

---

<!-- _class: compact -->

# 9. 運用チェックリスト — タスクを AI に渡す前に

1. **このタスクは非対称にできるか？** 4 つの源泉のどれが使えるか。
2. **非対称な形に変換できないか？**
    - 繰り返し作業 → **生成スクリプト** に変換できないか
    - 手で直す修正 → **codemod** に変換できないか
    - レビューで毎回言うこと → **lint ルール** に変換できないか
3. **生成物はコミットするか？** diff をレビュー対象にできているか。
4. **検証器は AI と独立か？** 実装とテストを同じ文脈で書かせていないか。
5. **爆発半径はどこか？** それに見合ったレビュー深度になっているか。
6. **理解していないコードの割合は許容範囲か？**
   「**明日これを消せるか / 直せるか**」を自問する。

---

# 10. まとめ

1. **AI で速くなったのは実装だけ。律速はレビューへ移った。**
2. **レビューを頑張る方向には勝ち筋がない。** タスクの形を変える。
3. **鍵は実装とレビューの非対称性。そしてそれは設計できる。**
   有限の出力 / 独立した検証器 / 小さい爆発半径 / 統計的網羅。
4. **生成スクリプト化は、誤りの分布を変える。**
   ランダム誤差が系統誤差になり、レビューが構造的に効くようになる。
5. **非対称にできない領域では、受け入れ条件を先に機械可読にする。**

<br>

<span class="accent">→ 「AI にどう書かせるか」より前に、「どうすればレビューが安くなるか」を問う。</span>

---

<!-- _class: compact -->

# 11. 議論したいこと

- **生成スクリプト自体の負債化**
  一度きりのつもりが定常運用になったとき、誰も読んでいないスクリプトをどうするか。
- **「理解していないコード」の総量に上限を設けるべきか。**
  設けるとしたら、何で測るか。
- **AI レビュアーの独立性はどう担保するか。**
  別モデル？ 別文脈？ それで十分と言えるか。
- **非対称性を作るコスト（検証器の整備）は、いつ払うべきか。**
  プロジェクトのどの段階で回収できるか。

---

<!-- _class: title -->

# Thank you

## Questions?

<br>

**参考**

<div class="refs">

- METR, [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- Chromium, [libFuzzer integration](https://chromium.googlesource.com/chromium/src/+/main/testing/libfuzzer/README.md)
- ASAM, [OpenSCENARIO XML v1.3.1 スキーマ](https://publications.pages.asam.net/standards/ASAM_OpenSCENARIO/ASAM_OpenSCENARIO_XML/v1.3.1/generated/RenderedXsdOutput.html)
- 姉妹資料：`llm-eslint-harness-slides`（LLM × ESLint — ハーネスエンジニアリング）

</div>
