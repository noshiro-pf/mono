<!-- cspell:ignore rescript POPL -->

# Sumi(澄)— TypeScript サブセット言語 仕様書

JS の負の遺産を引き継がず、TypeScript のサブセットだけを持つ、より安全な言語 **Sumi** の設計ドキュメント(言語名・拡張子は D-16)。

## 目的

TypeScript は「JS のスーパーセットである」ことで JS 資産を最大限活用でき、かつ「最悪の場合捨てて JS に戻れる」ことが JS → TS 移行のハードルを下げた。2026 年現在、依存も含めて TS 製コードで完結しているプロジェクトが多くなった今、「JS のスーパーセットである」という要件にこだわる必要は薄れている。そこで同じ戦略を一段上で繰り返す:

- **TS のサブセットであり、JS の負の遺産(暗黙の型変換、`var`、`==`、mutation、null と undefined の二重存在、モジュール解決の複雑さ…)を持たない。**
- **最悪の場合この言語を捨てて TS のコードに戻れる。** これは仕様の非機能要件であり、すべての設計判断がこの要件で検証される。

## 大原則

1. **Sumi lint のすべての有効なプログラムは、有効な TS プログラムであり、TS としての意味と完全に一致する。**
   チェッカーはプログラムを _拒否_ するだけで、意味を _変更_ しない。したがって「言語を捨てる」= チェッカーを外すだけで、コードは一切書き換え不要。前例: [asm.js](http://asmjs.org/)(JS として有効・同一セマンティクスな JS サブセット + 専用ツール)、TypeScript 自身の `--erasableSyntaxOnly`(Node.js の type stripping に対応する TS サブセット)。
2. **セマンティクスの変更(readonly-by-default、null の排除、独自構文)は Sumi sugar の transpiler 導入まで持ち込まない。**
   ただし Sumi lint の段階から「Sumi sugar でその変更を _機械的 codemod だけで_ 導入できる形」に Sumi lint の規則を設計する([decisions.md](./decisions.md) の D-3)。
3. **transpiler を導入する場合、出力 TS は人間が保守できる品質でなければならない。**
   ReScript を捨てられなかった教訓(出力コードの品質が eject に耐えない)の裏返し。コメント保存・名前保存・フォーマット済み・最小ランタイムが Sumi sugar transpiler の受け入れ条件になる([future-syntax.md](./spec/future-syntax.md))。

## ロードマップ

| 段階         | 形態                                                     | 具象構文            | 実装                                                                    |
| :----------- | :------------------------------------------------------- | :------------------ | :---------------------------------------------------------------------- |
| Sumi lint    | 合法 TS サブセット + 外部チェッカー                      | TS と完全に同じ     | oxlint preset(D-43)を `sumi check` が native tsc と直列に走らせる(D-46) |
| Sumi sugar   | 独自構文を transpiler で TS に変換(Sumi lint を包含する) | TS + 少数の拡張構文 | parser + 高品質 TS emit                                                 |
| Sumi refined | 型検査の変更(ネイティブ `Int` 等。TS に対応物なし)       | Sumi sugar と同じ   | 独自型検査器                                                            |

三層の区分と、Sumi sugar 構文を Sumi lint + ライブラリと一対一対応させる方針は D-37、呼び名は D-38([decisions.md](./decisions.md))。

この monorepo は eslint-config-typed(構文制限)+ strict-ts-lib(標準ライブラリの安全化)+ ts-type-forge / ts-data-forge(型・データユーティリティ)で、この言語の Sumi lint の 7〜8 割をすでにプロトタイプしている。Sumi lint とは、この蓄積を一つの仕様書と単一のチェッカーとして形式化したものである。

## 仕様書の構成

各機能領域につき 1 ファイル。各項目は **許可する形 / 禁止する形 / 理由 / 強制手段 / TS へ戻るときの影響** を記述する。ステータスは `確定` / `提案` / `未定` で示す。

- 残タスクの要約は issue [#1753](https://github.com/noshiro-pf/mono/issues/1753)。個々の論点は各 spec ファイルの「未解決の論点」が正典
- [decisions.md](./decisions.md) — 設計判断の決定ログ(ADR)
- [related-work.md](./related-work.md) — 先行研究・関連プロジェクトと採否(asm.js、Safe TypeScript、Refined TypeScript ほか)
- [overload-survey.md](./overload-survey.md) — オーバーロード代替の言語間コード比較(候補 8 / D-13 の設計材料)
- [throwing-stdlib-survey.md](./throwing-stdlib-survey.md) — throw しうる標準ライブラリ API の棚卸し(D-22 の基礎、Node 実測込み)
- [implementation-plan.md](./implementation-plan.md) — Sumi lint 実装計画(Phase 0: 対応表とコーパス → Phase 1: oxlint preset + `sumi check` で dogfood → Phase 2: 単一パス専用チェッカー → Phase 3: Sumi sugar parser)
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
- [spec/future-syntax.md](./spec/future-syntax.md) — Sumi sugar 独自構文の候補(パイプ、パターンマッチ、Optional 適用、`?` 伝播)

### 残タスク

残タスクの要約は issue [#1753](https://github.com/noshiro-pf/mono/issues/1753) で確認する(TODO.md は廃止)。深掘り待ちの仕様論点(不健全性カタログ等)は各 spec ファイルの「未解決の論点」に記録している。型レベル機能の方針(2026-08-27 確定)は「**TS の表現力は維持**し、健全性を犠牲にする機能が特定された時点で個別に検討」。

## 言語名・ファイル拡張子(決定 2026-09-07 — D-16)

**言語名は Sumi、Sumi sugar の拡張子は `.sumi`。npm パッケージは org `sumi-lang`(`@sumi-lang/*`)に置く(D-50、2026-09-08)。**

- Sumi lint は合法 TS なので拡張子は `.mts` / `.tsx` のままでよい。**Sumi sugar の独自拡張子は 1 つだけ新設し、常時 JSX 文法(tsx 相当)とする**(D-11 — angle-bracket アサーションの除去と `<T,>` 強制により単一文法で曖昧性が消えるため)。
- 命名は先行研究・既存プロジェクトとの衝突を避ける。特に **Safe TypeScript**(Microsoft Research による、TypeScript に健全な gradual typing を与える先行研究。POPL 2015 "Safe & Efficient Gradual Typing for TypeScript")が既にこの系統の名前を使っている。方向性が近い(TS の不健全性の排除)ため、命名の回避対象であると同時に設計の参考文献でもある。
