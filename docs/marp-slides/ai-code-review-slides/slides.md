---
marp: true
theme: default
paginate: true
size: 16:9
header: 'コードを生成するコードを書かせる'
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

<!-- cspell:ignore atrule hljs Marp monokai -->

<!-- _class: title -->

# コードではなく、コードを生成するコードを書かせる

## AI の書いたコードのレビューがしんどい問題への、ひとつの答え

<br>

変換そのものを AI にやらせるとうまくいかない。
変換ツールの実装を AI にやらせるとうまくいく。
なぜそうなるのかを、事例と要因分析で。

<br>

<span class="small">2026 — LLM 勉強会</span>

---

# このトークの流れ

1. **問題** — AI で速くなったのは実装だけ。律速はレビューへ移った。
2. **やったこと** — コードの変換そのものではなく、**変換ツールの実装**を AI にやらせた。
   自分がレビューしたのは **出力だけ**。スクリプトは読んでいない。
3. **なぜうまく行ったのか** — 要因を 5 つに分解する。
   一番効いたのは <span class="accent">誤りの分布がランダム誤差から系統誤差に変わること</span>。
4. **一般化** — 要因を並べ直すと「実装とレビューの非対称性」の 4 つの源泉になる。
5. **どこで崩れるか** — この型が効かない場所を先に言っておく。

---

<!-- _class: section-break -->

# 1. 問題

## AI で速くなったのは実装だけ

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

# 1.2 律速はレビューへ移った

**1 人日で実装する規模のタスク**を例に（数字は説明用の仮のもの）：

| 工程         | AI 導入前  | AI 導入後  |
| ------------ | ---------- | ---------- |
| 実装         | 480 分     | 30 分      |
| 自己レビュー | 30 分      | 90 分      |
| 他者レビュー | 60 分      | 90 分      |
| **合計**     | **570 分** | **210 分** |

- 実装は **16 倍速**。しかし全体では約 **2.7 倍**にしかならない。
- <span class="accent">実装時間が 0 になっても、上限は 3.2 倍。</span>アムダールの法則そのもの。
- **時間の内訳が反転する。** レビューの占める割合は **16% → 86%**。
- **自分で書いていないコードは自己レビューが重い。**
  しかも実際は、レビュー **対象の本数** も増える。

<br>

> 「実装が速くなった」＝「開発が速くなった」ではない。**工程全体で見る。**

---

# 1.3 「レビューを頑張る」は解にならない

- **レビューの検出率は、掛けた時間に比例しない。**
  diff が大きくなるほど 1 行あたりの注意力は落ちる。読み飛ばしは線形には増えない。
- **理解していないコードのレビューは、書くより難しいことがある。**
  書くときは自分の意図が既にあるが、読むときは **意図を復元するところから始まる**。
- 「理解していないコードは merge しない」を貫くと、**AI の速度をほとんど捨てる**ことになる。

<br>

> レビューの努力量を増やす方向に勝ち筋は薄い。
> **タスクの形を変えるしかない。**

---

<!-- _class: section-break -->

# 2. やったこと

## コードを生成するコードを書かせる

---

# 2.1 何を AI に渡し、何をレビューしたか

<div class="two-col">

<div>

**❌ 最初に考えること**

「この変換を AI にやらせよう」

```
入力 ──[ AI ]──> 出力
```

レビュー対象は **出力**。
ただし **毎回** 出力を全部見る。

</div>

<div>

**✅ 実際にやったこと**

「この変換を **やるツール** を AI に書かせよう」

```
AI ──> 変換ツール
入力 ──[ ツール ]──> 出力
```

レビュー対象は **出力だけ**。
<span class="accent">ツールの中身は読んでいない。</span>

</div>

</div>

<br>

- 有限のコードを変換・生成するだけでよい場合、**結果コードだけ確認すれば十分**だった。
- **生成スクリプトの実装内容は理解できていなくても全く問題ない。**
- 以下、同じ形でうまく行った 3 つの事例。

---

<!-- _class: compact -->

# 2.2 事例 1：OpenSCENARIO XML スキーマ → TypeScript

- 対象：[ASAM OpenSCENARIO XML v1.3.1 のスキーマ](https://publications.pages.asam.net/standards/ASAM_OpenSCENARIO/ASAM_OpenSCENARIO_XML/v1.3.1/generated/RenderedXsdOutput.html)。
- **もともとは手作業**で XML のモデル定義を TypeScript の型定義に翻訳していた。
  XSD は読み方がやや複雑で、**人間がやるとミスが出る**。
- AI に書かせたのは **その翻訳を行うスクリプト**。出てきたのは型定義ファイル一式。
- 自分が読んだのは **型定義のほうだけ**。スクリプトの AST 処理は読んでいない。

<br>

> 手作業を AI に代行させたのではなく、**手作業を機械化するコードを AI に書かせた**。
> 差はこの一点。

---

# 2.3 事例 2：OpenAPI / swagger yaml → バリデータ生成

- 既製の generator が多い領域だが、**自前の型規約・バリデータ規約に合わせたい**とき自作が効く。
- ここでも AI に渡したのは「yaml を読んでバリデータを吐くスクリプト」。
- レビューしたのは生成されたバリデータと、それが通す / 弾く実データ。

<br>

> 「スキーマ → コード」は、**入力が既に機械可読な仕様である**という点で特にやりやすい。
> 仕様の解釈を人間がやり直す必要がない。

---

<!-- _class: compact -->

# 2.4 外部事例：600 万ステップの COBOL → Java

**北國銀行、2027 年 1 月稼働予定の次期勘定系システム。製造と単体テストを 4 カ月。**

- 当初は **変換そのものに LLM を使い、失敗している。** PoC を何度やっても期待するコードが出ない。
    - **怠惰** — 生成 AI が勝手に一部を省略してしまう。
    - **ゆらぎ** — 1 回目と 2 回目で変換結果が異なる。
- 突破口は発想の転換だった。
  **変換作業ではなく「COBOL を入力すると Java を出力するツール」の開発に AI を使う。**
  約 2 カ月でツールの大枠が完成、最終的に **87% のアプリで変換率 97%**。残りは手作業。

<br>

> 規模も分野もまったく違うのに、**同じ転回で解けている。**
> しかも失敗の理由が「怠惰」と「ゆらぎ」— 次章の要因分析にそのまま対応する。

<span class="small">出典：[日経クロステック — 北國銀行の次期勘定系システム](https://xtech.nikkei.com/atcl/nxt/column/18/03444/021700009/)</span>

---

<!-- _class: section-break -->

# 3. なぜうまく行ったのか

## 要因を分解する

---

# 3.1 要因① レビュー対象が「スクリプト」から「出力」へ移った

- スクリプトは 1000 行の込み入った AST 処理でも、出力は「読めば正しさが分かる型定義 300 行」だったりする。
- **レビューすべきは後者だけ。** 前者を理解する必要がない。
- なぜ理解しなくてよいかというと、**出力が有限で、全量を目視できるから**。

<br>

> これが効く条件は「**出力が読み切れる量であること**」。
> 逆に言えば、出力が数千行を超えたらこの要因は消える（5 章で戻ってくる）。

---

<!-- _class: compact -->

# 3.2 要因② 誤りがランダム誤差から系統誤差に変わった

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
- つまりツール化は、速いだけでなく **レビューの効率を構造的に上げている**。
  <span class="accent">誤りの分布が変わること、それ自体が価値。</span>
- 2.4 の「変換率 97%」という数字が出せるのも同じ理由。**残りを見積もれる。**

---

# 3.3 要因③ 決定的にすると「ゆらぎ」と「怠惰」が消える

- **ツールは決定的。** 同じ入力なら同じ出力。→ 2.4 の **ゆらぎ** が消える。
- **ツールは入力を全部処理するか、できなければ落ちる。** → **怠惰**（黙って省略）が原理的に起きない。
- そのうえで運用上のキモが 2 つ：
    - **生成物をリポジトリにコミットし、diff をレビュー対象にする。**
      再生成したとき **レビュー対象が「差分」に縮む**。gitignore していると毎回全量を読み直す。
    - CI で **「再生成して差分が出たら落とす」** チェックを入れる。生成器と生成物の乖離を防ぐ。
- 前提として **生成スクリプト自体を決定的に書く**（実行のたびに順序が変わらない、
  タイムスタンプを埋め込まない）。非決定的だと diff がノイズだらけでレビューが機能しない。

<br>

> 生成物をコミットしていない生成器は、**レビューを一度先送りしただけ**。

---

# 3.4 要因④ 検証器が外から手に入った

自分で正しさを判定しなくてよかった。既にあるものが判定してくれた。

- **型検査**：生成した型で既存の呼び出し側コードが `tsc` を通るか。
- **実データ**：実際の `.xosc` / レスポンス JSON を生成バリデータに流して通るか。
- **既存の統合テスト**が緑のままか。
- 他に強いもの：**参照実装との差分（differential）**、**往復変換** `parse(print(x)) === x`、
  **メタモルフィックテスト**（正解が分からなくても入出力の関係だけは書ける）。

<br>

> 移行系タスクで differential が極めて強いのは、**旧実装という参照実装が手元にあるから**。
> 2.4 の COBOL → Java はまさにその状況。

---

# 3.5 要因④の落とし穴：検証器の独立性

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

<!-- _class: compact -->

# 3.6 要因⑤ 間違っても被害が小さいものもある

ここまでの 3 事例とは **別の要因** で成立しているケースもある。

| 壊れたときの範囲           | 例                                             | レビュー方針                     |
| -------------------------- | ---------------------------------------------- | -------------------------------- |
| **小**（壊れても自分だけ） | 使い捨てスクリプト、実験コード、ローカル解析   | ほぼ見ない。動けばよい           |
| **中**（壊れると CI/開発） | lint ルール、codemod、ビルドツール、社内ツール | 挙動だけ確認。実装は流し読み     |
| **大**（壊れると顧客）     | 本番ロジック、課金、認証、データ破壊操作       | 通常レビュー。もしくは人間が書く |

- **ESLint ルールを AI に実装させる**のはこの型。任意の入力コードに対して動くので
  「出力を読めば終わり」は成立しないが、**誤検知で壊れるのは CI であって顧客ではない**。
- 経験上、**AST ベースの局所的な一対一変換ならほぼ一発で期待通りに動く**。
- <span class="accent">一律のレビュー深度をやめる。</span>これ自体がレビュー総量を減らす施策。

<span class="small">詳細は姉妹資料「LLM × ESLint — ハーネスエンジニアリング」</span>

---

# 3.7 要因を取り違えない

> 「AI に書かせたのは **生成スクリプト** で、本番では動かないから気楽」は **誤り**。

- 生成スクリプト自体は確かに本番では動かない。**しかし、その出力は本番で動く。**
  2.2 の型定義も 2.3 のバリデータも、そのまま製品のコードになる。
- そこで効いているのは **被害の小ささ（要因⑤）ではなく、有限の出力（①）＋ 外部の検証器（④）**。
- **ESLint ルールだけが被害の小ささの話。** あれは出力が製品に入らない。

<br>

<span class="accent">なぜこのタスクが安全なのかを、要因の言葉で言えるようにしておく。</span>
言えないなら、それはたぶん安全ではない。

---

<!-- _class: section-break -->

# 4. 一般化

## 実装とレビューの非対称性

---

# 4.1 見ていたのは「検証コスト ≪ 実装コスト」だった

- ここまでの要因はすべて、**「作るのは大変だが、正しさの確認は安い」** に寄せる工夫だった。
- 比喩は NP の構造：**解を作るのは大変、解が正しいことの確認は安い**。
  数独、因数分解、経路探索。
- <span class="accent">AI コーディングは、実装とレビューに非対称性があるタスクに特に有効。</span>
- 逆に言えば、非対称性のないタスクに AI を投入しても、
  **しんどさが実装からレビューへ移動するだけ**。

<br>

> そして重要なのは、**この非対称性は与えられるものではなく、設計できる**ということ。
> 3 章でやっていたのは、まさにその設計。

---

<!-- _class: compact -->

# 4.2 要因を並べ直すと、4 つの源泉になる

| 3 章の要因                                         | 一般化すると              | 正しさを誰が保証するか         |
| -------------------------------------------------- | ------------------------- | ------------------------------ |
| ① 出力が読み切れた                                 | **A. 出力が有限**         | **人間が全部読む**             |
| ④ `tsc` / 実データ / 統合テスト                    | **B. 独立した検証器**     | **機械が判定する**             |
| ⑤ 壊れても CI だけ                                 | **C. 爆発半径が小さい**   | **誰も保証しない**             |
| <span class="accent">（今回の経験には無い）</span> | **D. 統計的に網羅できる** | **機械が入力も作って判定する** |

- **A → B → D は「検証の担い手を人間から機械へ移す」一本の軸。** C だけ直交で、賭け金の話。
- **D だけが自分の経験から出ていない。** 出力や入力空間が有限でなくなったときに必要になる源泉で、
  fuzzing / property-based / differential / metamorphic。詳細は姉妹資料 `test-oracle-slides` へ。
- **要因②③は源泉ではない。** ② 系統誤差は A を選んだことの副産物（ただし実務的には一番効く）、
  ③ 決定性と生成物のコミットは、A を初回だけで終わらせないための運用条件。
- <span class="accent">網羅性は主張しない。</span>1 つの成功体験から、いま見えているのが 4 つ。

---

<!-- _class: compact -->

# 4.3 まとめ表：どのタスクにどの源泉が効くか

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

- 実務では **重ねる**。1 つでも効くが、2 つ重なると一気に楽になる。

---

<!-- _class: section-break -->

# 5. どこで崩れるか

---

# 5.1 この型が崩れる 2 つの例外

- **任意の入力コードに対する変換ツールとして公開する場合**
  → 入力空間が有限でなくなる。「出力を読めば終わり」が成立しない。
  → **源泉 D（テスト網羅）に切り替える**必要がある。
- **生成結果の行数が膨大でレビューが困難な場合**
  → 生成ロジック側をレビューしたほうがマシなことがある。
  → 実際の対処は「全量目視を諦めて **外部の検証器（源泉 B）を用意する**」。

<br>

> どちらも **要因①（出力が読み切れる）が失われる**ケース。
> 3 章の要因を名指しできていれば、崩れたことに気づける。

---

# 5.2 4 つの源泉がどれも使えない領域

- **ビジネスロジック**：正しさの基準が外の世界（仕様、顧客の期待）にあり、コードに閉じない。
- **UX / 表示**：不変量が書けない。人間が見るしかない。
- **性能**：測れはするが、「なぜ速いか」の理解が要る。
- **セキュリティ境界**：失敗が非可逆。爆発半径を小さくできない。

<br>

ここでの方針は「AI に書かせない」ではなく——

> **AI に書かせる前に、人間が受け入れ条件を機械可読な形で決める。**
> 型 → スキーマ検証 → 不変量 → テストケース → lint ルール、の順で強い。

---

# 6. まとめ

1. **コードの変換そのものではなく、変換ツールの実装を AI にやらせる。**
   レビュー対象がスクリプトから出力に移り、スクリプトは読まなくてよくなる。
2. **決定的なツールにすると「ゆらぎ」と「怠惰」が消える。** 生成物をコミットすれば
   レビューは差分に縮む。していなければ、レビューを先送りしただけ。
3. <span class="accent">一番効くのは、誤りがランダム誤差から系統誤差に変わること。</span>
   1 箇所直せば全部直り、抜き取りで見つかり、残りを見積もれる。
4. **要因を並べ直すと、実装とレビューの非対称性の 4 つの源泉になる。**
   有限の出力 / 独立した検証器 / 小さい爆発半径 / 統計的網羅。
5. **崩れるのは、出力が読み切れなくなったとき。** そこは検証器かテスト網羅に切り替える。

<br>

> **「AI にどう書かせるか」より前に、「どうすればレビューが安くなるか」を問う。**

---

<!-- _class: compact -->

# 7. 議論したいこと

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

- ASAM, [OpenSCENARIO XML v1.3.1 スキーマ](https://publications.pages.asam.net/standards/ASAM_OpenSCENARIO/ASAM_OpenSCENARIO_XML/v1.3.1/generated/RenderedXsdOutput.html)
- 日経クロステック, [北國銀行の次期勘定系システム（COBOL → Java 移行）](https://xtech.nikkei.com/atcl/nxt/column/18/03444/021700009/)
- 姉妹資料：`docs/marp-slides/test-oracle-slides/`（テストのオラクルをどこから調達するか — 源泉 D の詳細）
- 姉妹資料：[`llm-eslint-harness-slides`（LLM × ESLint — ハーネスエンジニアリング）](https://github.com/noshiro-pf/mono/blob/282de895074789a85912c618d6ae69ac49c2730d/docs/marp-slides/llm-eslint-harness-slides/slides.md)

</div>
