<!-- cspell:ignore rescript POPL Tsuba Tsubu Togi Hagane Sunao Whet Kezuri Kanna Tsuzuri Streng romaji Klar Sauber -->

# Tsubu(粒)— TypeScript サブセット言語 仕様書

JS の負の遺産を引き継がず、TypeScript のサブセットだけを持つ、より安全な言語 **Tsubu** の設計ドキュメント(言語名・拡張子 `.tsb` は 2026-08-29 決定 — D-16)。

## 目的

TypeScript は「JS のスーパーセットである」ことで JS 資産を最大限活用でき、かつ「最悪の場合捨てて JS に戻れる」ことが JS → TS 移行のハードルを下げた。2026 年現在、依存も含めて TS 製コードで完結しているプロジェクトが多くなった今、「JS のスーパーセットである」という要件にこだわる必要は薄れている。そこで同じ戦略を一段上で繰り返す:

- **TS のサブセットであり、JS の負の遺産(暗黙の型変換、`var`、`==`、mutation、null と undefined の二重存在、モジュール解決の複雑さ…)を持たない。**
- **最悪の場合この言語を捨てて TS のコードに戻れる。** これは仕様の非機能要件であり、すべての設計判断がこの要件で検証される。

## 大原則

1. **v1 のすべての有効なプログラムは、有効な TS プログラムであり、TS としての意味と完全に一致する。**
   チェッカーはプログラムを _拒否_ するだけで、意味を _変更_ しない。したがって「言語を捨てる」= チェッカーを外すだけで、コードは一切書き換え不要。前例: [asm.js](http://asmjs.org/)(JS として有効・同一セマンティクスな JS サブセット + 専用ツール)、TypeScript 自身の `--erasableSyntaxOnly`(Node.js の type stripping に対応する TS サブセット)。
2. **セマンティクスの変更(readonly-by-default、null の排除、独自構文)は v2 の transpiler 導入まで持ち込まない。**
   ただし v1 の段階から「v2 でその変更を _機械的 codemod だけで_ 導入できる形」に v1 の規則を設計する([decisions.md](./decisions.md) の D-3)。
3. **transpiler を導入する場合、出力 TS は人間が保守できる品質でなければならない。**
   ReScript を捨てられなかった教訓(出力コードの品質が eject に耐えない)の裏返し。コメント保存・名前保存・フォーマット済み・最小ランタイムが v2 transpiler の受け入れ条件になる([future-syntax.md](./spec/future-syntax.md))。

## ロードマップ

| 段階 | 形態                                              | 具象構文            | 実装                                                               |
| :--- | :------------------------------------------------ | :------------------ | :----------------------------------------------------------------- |
| v1   | 合法 TS サブセット + 外部チェッカー               | TS と完全に同じ     | ESLint ルール群(既存の eslint-config-typed が土台)+ 専用チェッカー |
| v2   | 独自構文を transpiler で TS に変換(v1 を包含する) | TS + 少数の拡張構文 | parser + 高品質 TS emit                                            |

この monorepo は eslint-config-typed(構文制限)+ strict-ts-lib(標準ライブラリの安全化)+ ts-type-forge / ts-data-forge(型・データユーティリティ)で、この言語の v1 の 7〜8 割をすでにプロトタイプしている。v1 とは、この蓄積を一つの仕様書と単一のチェッカーとして形式化したものである。

## 仕様書の構成

各機能領域につき 1 ファイル。各項目は **許可する形 / 禁止する形 / 理由 / 強制手段 / TS へ戻るときの影響** を記述する。ステータスは `確定` / `提案` / `未定` で示す。

- [TODO.md](./TODO.md) — 残タスクの生きたリスト
- [decisions.md](./decisions.md) — 設計判断の決定ログ(ADR)
- [related-work.md](./related-work.md) — 先行研究・関連プロジェクトと採否(asm.js、Safe TypeScript、Refined TypeScript ほか)
- [overload-survey.md](./overload-survey.md) — オーバーロード代替の言語間コード比較(候補 8 / D-13 の設計材料)
- [throwing-stdlib-survey.md](./throwing-stdlib-survey.md) — throw しうる標準ライブラリ API の棚卸し(D-22 の基礎、Node 実測込み)
- [implementation-plan.md](./implementation-plan.md) — v1 実装計画(Phase 0: 対応表とコーパス → Phase 1: ESLint dogfood → Phase 2: 単一パス専用チェッカー → Phase 3: v2 parser)
- [enforcement-map.md](./enforcement-map.md) — 仕様→強制手段の対応表(Phase 0 成果物)
- [conformance-corpus.md](./conformance-corpus.md) — 適合性コーパスの形式定義(Phase 0 成果物)
- [spec/modules.md](./spec/modules.md) — モジュール、import/export、モジュール解決
- [spec/variables-and-mutation.md](./spec/variables-and-mutation.md) — 変数宣言と mutation
- [spec/readonly.md](./spec/readonly.md) — readonly-by-default 戦略
- [spec/banned-syntax.md](./spec/banned-syntax.md) — 禁止構文カタログ
- [spec/null-undefined.md](./spec/null-undefined.md) — null の排除
- [spec/booleans-and-logic.md](./spec/booleans-and-logic.md) — boolean 厳密化と論理演算子
- [spec/compiler-options.md](./spec/compiler-options.md) — compilerOptions の固定(strict / noUncheckedIndexedAccess 等を言語仕様として常時有効化)
- [spec/functions.md](./spec/functions.md) — 関数(arrow 統一、this、オーバーロード、async/await)
- [spec/exceptions.md](./spec/exceptions.md) — 例外と throw(Result への統一)
- [spec/jsx.md](./spec/jsx.md) — JSX(`<T,>` 強制ほか)
- [spec/classes.md](./spec/classes.md) — class の扱い、他言語での代替手段の調査
- [spec/stdlib.md](./spec/stdlib.md) — 標準ライブラリ(strict-lib + ts-data-forge prelude)、Optional/Result のギャップ分析
- [spec/future-syntax.md](./spec/future-syntax.md) — v2 独自構文の候補(パイプ、パターンマッチ、Optional 適用、`?` 伝播)

### 残タスク

生きたタスクリストは [TODO.md](./TODO.md)。深掘り待ちの仕様論点(getter/setter の粒度、不健全性カタログ等)は各 spec ファイルの「未解決の論点」に記録している。型レベル機能の方針(2026-08-27 確定)は「**TS の表現力は維持**し、健全性を犠牲にする機能が特定された時点で個別に検討」。

## 言語名・ファイル拡張子(決定 2026-08-29 — D-16)

**言語名 Tsubu(粒)、v2 拡張子 `.tsb`** に決定。以下は検討の記録。

- v1 は合法 TS なので拡張子は `.mts` / `.tsx` のままでよい。**v2 の独自拡張子は 1 つだけ新設し、常時 JSX 文法(tsx 相当)とする**(D-11 — angle-bracket アサーションの除去と `<T,>` 強制により単一文法で曖昧性が消えるため)。
- 候補(2026-08-29 検討。拡張子は 3 文字以内・著名言語/形式・既存略語と非衝突が条件):
    - **Tsubu(粒)/ `.tsb`(次点 `.tsu`)** — 「**粒ぞろい**」= 選び抜いた粒だけを残す、というサブセットの隠喩そのもの。綴りが ts- で始まり ts-data-forge / ts-fortress / strict-ts-lib と揃う。日本語名 OSS の成功例(Hono)と同路線。目立つ衝突なし。(第 1 案だった Tsuba(鍔)は「唾」と同音のため置換。)
    - Togi(研ぎ)/ `.tgi` — 研ぎ澄ました TS。`.tgi` は The Sims の TGI リソース形式と軽微衝突。
    - Hagane(鋼)/ `.hgn` — 堅牢の隠喩。ts 綴りは失われる。
    - Sunao(素直)/ `.sna` — 暗黙変換や罠のない素直な意味論。`.sna` は旧 ZX Spectrum スナップショットと軽微衝突。
    - **Whet / `.whet`** — 砥石(whetstone)で研ぐ。英語圏に自然な動詞で、4 文字拡張子。目立つ衝突なし。
    - Kezuri(削り)/ `.kzr` — 「TS を削り出す」直球。衝突なしだが romaji 読みが英語圏に非自明。
    - Kanna(鉋)/ `.kna` — 鉋で薄く削る職人道具。Swift の HTML パーサ Kanna と中程度の衝突。
    - 不採用: **Hew**(hew to = 規範に従う、の二重義で有力だったが「Hew Language」という VS Code 拡張つきの言語が既存)、**Tsuzuri(綴り)**(同名の日本語執筆アプリ tsuzuri.ink・Canon 綴プロジェクト等で混雑)。
    - 英語名は他はほぼ全滅(Sound=SoundScript/V8、Lean=定理証明器、Strait は `.srt`=字幕・`.sts`=Spring Tool Suite と拡張子難)。ドイツ語も Klar=Firefox Klar、Fest=FEST(Java テスト lib)、Sauber=F1 と衝突し、残る Streng(厳格)は拡張子が難。
    - ts+1 文字の拡張子で空いているのは `.tsb` / `.tsu` / `.tsz` 程度(`.tsc`=コンパイラ名、`.tss`=Titanium、`.tsp`=TypeSpec、`.tsq`=tree-sitter 旧クエリ、`.tsl`=Three.js Shading Language、`.tst`/`.tsr`/`.tsn` は既存略語)。
- 命名は先行研究・既存プロジェクトとの衝突を避ける。特に **Safe TypeScript**(Microsoft Research による、TypeScript に健全な gradual typing を与える先行研究。POPL 2015 "Safe & Efficient Gradual Typing for TypeScript")が既にこの系統の名前を使っている。方向性が近い(TS の不健全性の排除)ため、命名の回避対象であると同時に設計の参考文献でもある。
