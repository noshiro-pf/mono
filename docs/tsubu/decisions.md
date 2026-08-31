# 設計判断の決定ログ

各判断は ADR(Architecture Decision Record)形式で短く記録する。番号は D-1 からの連番。ステータスは `確定` / `提案`(ユーザー未承認)/ `破棄`。

## D-1: v1 は「合法 TS サブセット + 外部チェッカー」、transpiler は v2 で後付けする

- **ステータス**: 確定(2026-08-27)
- **判断**: v1 のすべての有効なプログラムは有効な TS であり、意味も TS と完全に一致する。チェッカーはプログラムを拒否するだけで、意味を変更しない。独自構文(パイプ演算子、パターンマッチ、`let mut`、`mutable` キーワード等)は v2 の transpiler として後付けする。
- **理由**:
    - 脱出ハッチが自明になる(チェッカーを外すだけ)。TS の普及要因「捨てて JS に戻れる」の再現。
    - LSP・シンタックスハイライト・Prettier・既存 linter がそのまま使える。言語実装で最もコストが高いのはコンパイラ本体ではなくツールチェーンであり、これを全部回避できる。
    - 前例: asm.js、TypeScript `--erasableSyntaxOnly`。
- **却下した代替案**:
    - 最初から transpile 方式(ReScript 型): ツールチェーン構築コストが莫大。また ReScript は出力 TS の品質が低く eject に耐えないという実体験があり、その品質要件を最初から満たすのは難しい。
    - 合法 TS だが意味を再解釈する方式: 同じコードが tsc とこの言語で違う意味を持つのは、脱出ハッチ要件と根本的に矛盾する。

## D-2: チェッカーは reject のみ。semantics の再解釈をしない

- **ステータス**: 確定(2026-08-27)
- **判断**: v1 チェッカーが加えるのは「TS として合法だがこの言語では違法」という追加エラーのみ。TS が拒否するものを受理したり、型の解釈を変えたりしない(例: 無注釈の `number[]` を readonly と解釈する、はやらない)。
- **理由**: 再解釈は「stricter な方向」であっても破綻する。例えば `number[]` を readonly と解釈すると、readonly 値を `number[]` 引数へ渡すコードを許したくなるが、それは tsc のエラーになる。コードは常に tsc を通らなければならない以上、チェッカーにできるのは追加拒否だけである。

## D-3: v2 構文に相当する情報は、識別子・型注釈・ディレクティブコメントの空間へエンコードし、機械的 codemod で v2 構文へ移行可能でなければならない

- **ステータス**: 確定(2026-08-27)
- **判断**: v1 では新構文を追加できないため、言語機能を TS の合法な空間に埋め込む。ただし埋め込み方は「v2 で本物の構文に一括変換できる」ことを条件とする。
- **例**:
    - mutation 許可マーカー: `mut_` prefix(v1)→ `let mut x`(v2)。識別子名からの機械変換は自明。
    - readonly-by-default: v1 では readonly 注釈を _全箇所で強制_ する → v2 で readonly をデフォルト化し `mutable` キーワードを導入する際、「注釈が全箇所にある」からこそ `readonly` の削除と `mutable` の付与が純粋に機械的になる([spec/readonly.md](./spec/readonly.md))。
- **理由**: この条件があると、v1 の規則設計の良し悪しを「v2 への移行が codemod で閉じるか」で客観的に判定できる。

## D-4: `--erasableSyntaxOnly` のサブセット制限を包含する

- **ステータス**: 確定(2026-08-27)
- **判断**: enum、runtime namespace、class parameter properties、`import =` など「型を消すだけでは JS にならない構文」を禁止する。言語の型レイヤーは常に消去可能(erasable)とする。
- **理由**: Node.js type stripping・エコシステムの潮流と一致する。また v2 transpiler の TS emit を単純化する(型層と値層が絡まない)。

## D-6: 標準ライブラリは strict-ts-lib + ts-data-forge(prelude)の二層とする

(D-5 は削除済み。番号は相互参照を保つため欠番とする。)

- **ステータス**: 提案
- **判断**: 組み込み層(`lib.d.ts` 相当)は strict-ts-lib、言語ネイティブに見せたいユーティリティ(`pipe` / `match` / `Optional` / `Result` 等)は ts-data-forge を prelude として扱う。v1 では ts-data-forge からの明示 import が必要(値の自動 import は transpiler なしでは不可能)。v2 で transpiler が prelude の import 文を自動挿入する。
- **理由**: [spec/stdlib.md](./spec/stdlib.md) 参照。型だけなら ts-type-forge 方式(global.d.mts)で v1 から global にできるが、実行時の値はモジュールから来るしかない。

## D-7: compilerOptions は言語仕様の一部として一意に固定する

- **ステータス**: 確定(2026-08-27)
- **判断**: 厳密化オプションを有効にした一つの構成を言語仕様として定め、プロジェクト側で緩める余地を残さない。tsconfig は「プロジェクト設定」ではなく「言語定義」になる。型チェック関連の値は mono の `tools/configs/tsconfig/tsconfig.type-check.json` の現行値を採用する — 特に **`exactOptionalPropertyTypes` は有効化しない**(2026-08-27 決定)。
- **理由**: TS の「同じ構文でも tsconfig 次第で意味と安全性が変わる」こと自体が負の遺産(モジュール解決の選択肢の多さと同根)。[spec/compiler-options.md](./spec/compiler-options.md) 参照。

## D-8: 言語開発は新トップレベル `languages/` に置く(改訂 2026-08-29)

- **ステータス**: 確定(2026-08-28、2026-08-29 改訂)
- **判断**: 言語開発用のトップレベル `languages/` を新設し、1 言語 = 1 ディレクトリでその配下にその言語の開発用パッケージを置く。本言語は `languages/tsubu/`(仮名。言語名決定後にリネーム)で、適合性コーパスは `languages/tsubu/conformance`。workspace glob は `languages/*/*`。ディレクトリ名は既存トップレベル(libs / apps / tools)に合わせて複数形。
- **理由**: リポジトリの分類基準 — libs = npm 公開パッケージ / tools = リポジトリ開発ツール / docs = 文書 — のどれにも該当しないため(先例は strict-lib)。`languages/` とすることで、今後別の言語や本言語の v2/v3 段階を開発する場合の置き場所に悩まない。docs 配下は CI diff ゲートの ignore 対象のため、フィクスチャ変更で code-checks が走らない問題もこれで回避される。
- **検討して不採用**: `experimental/` — 本来は実験的コードの置き場(「遺産置き場」は一時的な使い方)だが、構造的に pnpm workspace の外・全チェック対象外であることが同ディレクトリの提供する保証(依存更新で壊れない等)そのものであり、CI でゲートされ続けることが存在意義である適合性コーパスとは要件が正反対のため。
- **補足**: 将来の専用チェッカーは npm 公開するので libs/ へ置く(Phase 2)。`languages/` に置くのは公開しない開発資産のみ。

## D-9: 適合性フィクスチャはルート `.prettierignore` で除外する

- **ステータス**: 確定(2026-08-28)
- **判断**: `languages/tsubu/conformance/fixtures` をルート `.prettierignore` に追加し、フィクスチャを byte-for-byte で保存する(パッケージ内にも同内容の `.prettierignore` を併置 — package cwd からの fmt は root の ignore を読まないため。CLAUDE.md に例外として注記済み)。
- **理由**: フィクスチャは検査対象のコードそのものであり、フォーマッタの書き換え(例: `<T,>` の trailing comma 除去)は検査対象を消してしまう。Prettier の除外はルートの `.prettierignore` のみ有効(CLAUDE.md)。

## D-10: Phase 1 の subset ESLint preset は独立パッケージにする

- **ステータス**: 確定(2026-08-28)
- **判断**: eslint-config-typed 内の新 preset ではなく、独立パッケージとして実装する。
- **理由**: 言語プロジェクトの独立性を優先する(ユーザー決定)。eslint-config-typed のルール定義・オプションは依存として再利用する。

## D-11: v2 のファイル拡張子は 1 つだけ新設し、常時 JSX 文法とする

- **ステータス**: 確定(2026-08-29)
- **判断**: `.mts` / `.ts` / `.tsx` のような拡張子の複数化はしない。v2 の独自拡張子は 1 つだけ(名称は言語名とともに決定)で、その文法は常に JSX を含む(tsx 相当)。
- **理由**: 複数拡張子に意味がない。TS が `.ts` / `.tsx` を分けた原因は文法の曖昧性 — `.ts` の angle-bracket 型アサーション `<T>x` と、`.tsx` の arrow ジェネリクス `<T>(...)` が、それぞれ JSX 要素と衝突する — だが、この言語は angle-bracket アサーションを文法から除去し(`as` のみ。unsafe なものはそもそも禁止)、arrow ジェネリクスに `<T,>` を強制する([spec/jsx.md](./spec/jsx.md))ため、**単一の JSX 込み文法に曖昧性が残らない**。
- **補足**: v1 は合法 TS なので従来どおり `.mts` / `.tsx` を使う。`<T,>` を拡張子非依存で常時強制しておくことが、v2 での単一拡張子移行を機械的にする(D-3 と同型)。

## D-12: class は全面禁止する(classes.md 選択肢 1)

- **ステータス**: 確定(2026-08-29)
- **判断**: class 構文(宣言・式・`extends`・`this`)を言語から除去し、closure ベースの factory 関数 + 構造的 interface + tagged union に一本化する。
- **理由**: synstate core の全面書き換え実験([#1703](https://github.com/noshiro-pf/mono/pull/1703)、マージ済み)で closure 置き換えがシンプルかつ汎用に機能することを確認した。leaf 実装は簡潔になり(−184 行)、「未完成 `this` の漏れ」も構造的に消える。
- **帰結**: `this` は全面禁止(functions.md の「class 内のみ許可」条項は消滅)。`#` private・`protected`・getter/setter の class 文脈の論点も消滅し、getter/setter に残るのは plain object の遅延評価ユースケースのみ。外部 class ライブラリ(DOM、`Error` 等)の消費・カスタム Error の扱いは境界の論点として残る([spec/classes.md](./spec/classes.md))。

## D-13: オーバーロードを許容し、named function はオーバーロード時のみ許可する

- **ステータス**: 確定(2026-08-29)
- **判断**: 関数オーバーロードは言語機能として許容する。`function` 宣言は「オーバーロードシグネチャを伴う場合のみ」合法とし、それ以外は arrow function に統一する。チェッカーに条件付き許可ルールを実装して記法の一意性(同じものを書く方法が 1 つ)を担保する。
- **理由**: `arguments` と `this` を禁止した状態では、named function と arrow function の安全性の差はほぼ消える。一方 arrow ではオーバーロード宣言が書きづらい(実装シグネチャの型付けが緩む)。

## D-14: mutability prefix は `mut_` の一種類のみ

- **ステータス**: 確定(2026-08-29)
- **判断**: 現行 eslint-config-typed の 4 パターン(`^mut_` / `^_mut_` / `^#mut_` / `^draft`)を `^mut_` の 1 つに統一する。
- **理由**: `_` prefix は unused parameter 用だが、使わない引数は readonly で問題なく `_mut_*` の存在意義がない。`#mut_` は class 内でのみ出現し、class 禁止(D-12)で不要。immer の draft は `mut_draft` を強制しても痛くない。

## D-15: コンストラクタ関数の静的呼び出しを全面禁止する

- **ステータス**: 確定(2026-08-29)
- **判断**: `Boolean(x)` / `Number(x)` / `String(x)` / `Array(x)` などコンストラクタ関数の関数呼び出し(new なし)をすべて禁止し、代替の生成関数を ts-data-forge(prelude)から提供する。
- **理由**: これらは暗黙変換の関数形であり、意図(パース・変換・判定)が名前に現れない。専用の生成関数(例: 既存の `Num.safeParseInt` 系)に置き換えることで、変換の失敗が `Result`/`Optional` として型に現れる。
- **TODO**: ts-data-forge 側の生成関数の網羅(`Boolean`/`String`/`Array` 代替)は未実装 — [spec/stdlib.md](./spec/stdlib.md) のギャップに追加。

## D-16: 言語名は Tsuba、拡張子は `.tsb`

- **ステータス**: 確定(2026-08-29)
- **判断**: 言語名を **Tsuba(鍔)**、v2 の単一拡張子(D-11)を **`.tsb`** とする。
- **理由**: 刀の鍔 = 手を守る防具で「TS を守る言語」の隠喩。綴りが ts- で始まり ts-data-forge / ts-fortress / strict-ts-lib と揃う。`.tsb` は著名言語・形式・略語と衝突しない(候補比較は [README.md](./README.md) の言語名節)。「唾」との同音は認識の上でユーザー決定。
- **帰結**: 仮名 subset-ts からのリネーム — `languages/tsubu/`、`docs/tsubu/`、パッケージ `tsubu-conformance`、期待診断マーカー `@tsubu-expect`、CLI 名 `tsubu`(実施済み)。

## D-17: 予約語 `fn` を採用し、v1 から識別子 `fn` を予約する

- **ステータス**: 確定(2026-08-29)
- **判断**: v2 の関数宣言キーワードとして `fn` を採用する([spec/future-syntax.md](./spec/future-syntax.md) 候補 8)。v1 チェッカーは**宣言名としての識別子 `fn`**(変数・関数・パラメータ・型名・import 別名)を予約語として禁止する。
- **理由**: `fn` は TS では合法な識別子のため、v1 コードに存在すると v2 の文法導入時に衝突する。v1 で先行予約しておけば移行が機械的になる(D-3 と同型)。
- **補足**: プロパティ名(`obj.fn` / `{ fn: ... }`)は予約の対象外 — member 位置のキーワードは v2 文法でも曖昧にならない(TS が `obj.if` を許すのと同じ)。ただし分割代入で `fn` という束縛名が生まれるケース(`const { fn } = obj`)は宣言名として禁止し、リネーム(`const { fn: fnValue }`)を要求する。

## D-18: generator は許可する(2026-08-27 の禁止を撤回)

- **ステータス**: 確定(2026-08-29)
- **判断**: generator(`function*` / `async function*`)をユーザーコードで許可する。arrow function に generator 形は存在しないため、`function*` の宣言・式は D-13(オーバーロード時のみ named function)の**例外として常に合法**とする。
- **理由**: ユーザー決定。実際上も、v1 の `?` 代替である `Result.safeTry(function* () { ... })` はユーザーコードに generator 式を要求するため、「prelude 内部のみ」という以前の整理は成立していなかった。
- **帰結**: banned-syntax の generator 行を撤回。`yield` / `yield*` も合法(generator 本体内のみ、は TS の文法どおり)。

## D-19: global 定義名はすべて予約し、shadow を禁止する

- **ステータス**: 確定(2026-08-29)
- **判断**: 実行環境の global に定義されている名前(`undefined` / `NaN` / `Infinity` / `Array` / `JSON` / `Promise` …、および prelude が global に置く型名 — ts-type-forge の `DeepReadonly` 等)を**宣言名として使用禁止**にする(値空間・型空間とも)。プロパティ名は対象外(D-17 と同じ理屈)。
- **理由**: `undefined` が JS の予約語ではなく内側スコープで shadow できる(`let undefined = 1` が合法)という問題の一般化。global 名の上書きは読み手の前提を破壊する。undefined 一本化([spec/null-undefined.md](./spec/null-undefined.md))は `undefined` という名前が常に本物を指すことを暗黙の前提にしており、この決定がその前提を明文化する。
- **実装ノート**: v1 近似は `no-shadow-restricted-names`(undefined/NaN/Infinity/eval/arguments)+ `no-shadow` 系の `builtinGlobals: true` + `no-global-assign`。環境プロファイル(node/browser)ごとの global 集合は、専用チェッカー(Phase 2)では TS の global scope のシンボル列挙から導出できる。型空間の shadow 検査は新規実装。

## D-20: パイプ演算子は F# スタイルを採用する

- **ステータス**: 確定(2026-08-29)
- **判断**: v2 のパイプ演算子(候補 1)は **F# スタイル**(`x |> f` = `f(x)`、右辺は単項関数に評価される式)とする。TC39 が Hack スタイルを選び F# を却下した経緯は理解した上での決定([spec/future-syntax.md](./spec/future-syntax.md) 候補 1 に詳細)。F# スタイルを好むユーザー層の取り込みも狙いに含む。
- **理由(却下理由が Tsubu では成立しないこと)**:
    1. **ステップごとのクロージャ生成の性能懸念**(エンジン実装者の反対理由)は、ネイティブ実装ではなく transpiler の emit には当てはまらない。さらに prelude(ts-data-forge)が直接形とカリー化形の**二本立て API** を持つため、`xs |> Arr.map(double)` を `Arr.map(double)(xs)` ではなく**直接形 `Arr.map(xs, double)` へ最適化 emit** でき、カリー化のアロケーション自体を消せる。
    2. **エコシステム分裂懸念**(カリー化・tacit スタイルの奨励が JS 全体を割る)は、カリー化 API を標準に据えた Tsubu では分裂ではなく**言語の同一性**である。
    3. **await の構文問題**は残る(下記、未定)。
- **リスク**: 将来 TS/JS に Hack 版 `|>` が入ると、「独自構文は TS の構文エラーである字面を選ぶ」原則と衝突する。提案は 2021 年の Hack 選定後も Stage 2 で停滞しており発生確率は低いと評価するが、発生時はトークン変更か原則の明示的例外化を再決定する。eject への影響はない(emit に `|>` は現れない)。

## D-21: 素の number 系 global を削除し、`Number` 配下に一択化する

- **ステータス**: 確定(2026-08-29)
- **判断**: 素の global の `NaN` / `Infinity` / `parseInt` / `parseFloat` / `isNaN` / `isFinite` を v1 から使用禁止にし、`Number.NaN` / `Number.POSITIVE_INFINITY` / `Number.parseInt` / `Number.parseFloat` / `Number.isNaN` / `Number.isFinite` に一択化する。
- **理由**: ユーザーが参照すべき定義は一択である方が混乱が少ない。加えて global の `isNaN` / `isFinite` は引数を暗黙の数値変換にかける **`Number.*` とは意味の違う別物**(`isNaN('foo') === true`)であり、削除は暗黙変換の排除でもある(`parseInt` / `parseFloat` は ES2015 で `Number.*` に同一関数が alias されており純粋な重複)。
- **一般原則**: 「素の global と namespace 配下の重複は namespace 側に一択化する」。今回は number 系へ適用。他の重複(`encodeURIComponent` 系は既に別途制限済み)も同原則で個別に判断していく。
- **実装ノート**: v1 は `no-restricted-globals`(現行 config は `Infinity` / `isNaN` / `isFinite` を含む — `NaN` / `parseInt` / `parseFloat` を追加)+ `unicorn/prefer-number-properties`(構成要確認)。将来的には Tsubu の lib 構成(strict-lib)側で素の宣言自体を落とし、lint ではなく型エラーにする案がある([spec/compiler-options.md](./spec/compiler-options.md) の lib 節と接続)。
- **備考**: prelude はさらに Result を返す `Num.safeParseInt` / `Num.safeParseFloat` を提供しており、plugin ルール(`ts-data-forge/prefer-num-safe-parse-int` 等)が `Number.parseInt` からの移行も誘導する。「Number.* を残す」と「Num.safeParse* へ誘導する」の段階関係は stdlib 側で要整理。

## D-22: throw しうる stdlib API は Result ラッパーに一択化し、素の形を禁止する

- **ステータス**: 確定(2026-08-29)
- **判断**: 標準ライブラリの「値依存で throw しうる」API は、prelude(ts-data-forge)の Result 返しラッパーに一択化し、素の形の使用を禁止する(D-21 の一般原則「参照すべき定義は一択」の throw 系への適用)。将来的には Tsubu の lib 構成側で素の宣言を落とし、lint ではなく型エラーにする。
- **理由**: 失敗が型(`Result`)に現れる形へ寄せる(exceptions.md の方針)。`Number.parseInt` vs `Num.safeParseInt` の「どちらが最終一択か」も本決定で解決 — **最終一択は prelude 側**。
- **規模**: [throwing-stdlib-survey.md](./throwing-stdlib-survey.md) に調査済み。型・immutability・既存禁止で到達不能な throw を除外すると、コアの新規ラップ対象は約 17、family(TypedArray 系・Intl)込みで 100 前後(Temporal 除く)。
- **次の枠**: 番兵値で失敗を返す API(`indexOf` の -1、`parseInt` の NaN 等)への同原則の適用は別途棚卸し。

## D-23: Temporal をサポートする

- **ステータス**: 確定(2026-08-29)
- **判断**: Temporal を Tsubu の標準ライブラリに含める(lib 構成に含め、値依存 throw のラップ対象 family に昇格)。
- **理由**: Date の実質的後継であり、Node 26 / esnext lib に既に存在する。値依存 throw が設計の一部(`from` / `with` / 算術 overflow)なので、D-22 のラップ方針とはむしろ相性が良い(Result 化の対象が明確)。
- **帰結**: [throwing-stdlib-survey.md](./throwing-stdlib-survey.md) の Temporal 行を「別枠」から「要ラップ family」へ変更。ラッパーの粒度(全 from/with を個別に包むか、境界モジュールか)は実装時に決定。

## D-24: safe stdlib wrapper は一方向依存の新ライブラリとする

- **ステータス**: 確定(2026-08-29)
- **判断**: D-22 のラッパー群は ts-data-forge に追加し続けるのではなく、新ライブラリ(仮名 **ts-std-forge**、`libs/`)に実装する。依存は **ts-std-forge → ts-data-forge の一方向のみ**。
- **理由**: ts-data-forge は ADT コア(Result/Optional/pipe)とデータ構造の両方を持つため、分割時の相互依存が懸念されたが、「**ts-data-forge は境界の実装者として、自身の内部では素の stdlib を直接使ってよい**」と定義すれば wrapper への逆依存は構造的に発生しない。歴史的に ts-data-forge にある `Json.*` / `Num.safeParse*` は当面動かさず、新 lib の re-export facade で一択の入口を作る(実体移動は将来の major)。
- **実施**: scaffold は [#1709](https://github.com/noshiro-pf/mono/pull/1709)(`Regex.create` / `SafeDate.toISOString` を TDD で実装済み)。パッケージ名は初回 publish(手動 — libs/first-release.md)まで仮。

## D-25: v1 preset は `languages/tsubu/eslint-config`(パッケージ名 tsubu-eslint-config)、dogfood 第一対象は ts-std-forge

- **ステータス**: 確定(2026-08-31)
- **判断**:
    - Phase 1 の subset ESLint preset(D-10 の独立パッケージ)は `languages/tsubu/eslint-config` に置き、パッケージ名は **tsubu-eslint-config**(仮名。非公開)とする。仕様に属する新規 lint ルール(enforcement-map の 🆕)も同パッケージに eslint-plugin として同梱する。
    - dogfood の第一対象は **ts-std-forge**(最小・新規・こちらで完全に制御可能)。第二候補: octokit-safe-types(小規模で型付きルールの効きが見える)、synstate(class-less 化済みで言語の想定スタイルに最も近いが中規模)。
- **理由**: 公開は当面しないため languages/ 配下(D-8 の区分どおり)。公開する段になれば libs/ へ移す(D-8 補足)。

## D-26: ラッパーの失敗は「型 refine で排除 → 検証ファースト tagged union → 保守的 fallback」の三段構え

- **ステータス**: 確定(2026-09-01、引数型 refine はレビュー反映で同日改訂)
- **判断**: ts-std-forge のラッパーは `Result<T, Error>`(catch した Error をそのまま返す)をやめ、次の優先順で設計する。
    1. **引数型 refine による全域化**: throw 条件が有限の引数範囲なら、strict-ts-lib と同じリテラル範囲型(`toFixed` の `UintRange<0, 101>`、`toString` の `UintRange<2, 37>` 等)で仮引数を型付けし、素の値を返す。ランタイムチェックは置かない — 型が契約で、`normalize`(form union)の全域化と同じ扱い。`99.1` のような浮動小数点入力はユースケースとして考慮しない(呼び出し側が `Math.trunc` 等で明示的に丸めてから渡す)。`repeat` の count は `SafeUint | SmallUint`(`Num.div` の分母と同じ「branded | 小リテラル union」パターンで、小さいリテラルは無キャストで書ける)。
    2. **検証ファースト tagged union**: 引数域が型で表現できない失敗(`fromCodePoint` の 0–0x10FFFF、`Date` の有効性)は、ECMAScript 仕様が定める throw 条件をラッパー自身が呼び出し前に検査し、関数ごとの plain tagged union(例: `{ kind: 'invalid-code-point', codePoint, index }`)で返す。検査は仕様の強制変換・判定順序まで鏡写しにする。
    3. **保守的 fallback**: 既知の(仕様が規定する)エラー条件のみに固有 kind を振り、それ以外の throw はすべて `Result.fromThrowable` backstop で受けて共通型 `UnexpectedError = { kind: 'unexpected', cause: Error }` に写す。`new RegExp` は仕様上 parse 失敗を SyntaxError と規定するが、それ以外の throw(リソース系等)を排除できないため、catch した SyntaxError だけを `'invalid-regexp'` に分類し、他は `'unexpected'` に落とす。
- **理由**: 仕様が固定するのは throw の**条件**であって**メッセージ**ではないため、catch 後の分類はエンジン依存のメッセージ解析にしかならず移植不能。型で排除できる失敗は排除するのが最も強く(コンパイル時)、できないものだけ事前検証で分類する。exceptions.md のクラスレス・エラー方針(Err payload は plain tagged union がデフォルト)とも一致する。
- **残課題(言語側)**: 型 refine は `as` による嘘に対して無防備。`as` キャストの正しさをランタイム検証する言語機能、または ts-fortress のような validator ライブラリの使用強制(`as` が紛れ込みうるコード文脈を言語として限定する)を v3 の検討事項として TODO に記録。
- **却下した代替案**: catch した Error の message / name による事前分類なしの推定(エンジン依存)。refine 済み引数へのランタイム二重チェック(全域化して素の値を返した経緯と不整合)。
