<!-- cspell:ignore bivariance Tsubu -->

# 設計判断の決定ログ

各判断は ADR(Architecture Decision Record)形式で短く記録する。番号は D-1 からの連番。ステータスは `確定` / `提案`(ユーザー未承認)/ `破棄`。

## D-1: Sumi lint は「合法 TS サブセット + 外部チェッカー」、transpiler は Sumi sugar で後付けする

- **ステータス**: 確定(2026-08-27)
- **判断**: Sumi lint のすべての有効なプログラムは有効な TS であり、意味も TS と完全に一致する。チェッカーはプログラムを拒否するだけで、意味を変更しない。独自構文(パイプ演算子、パターンマッチ、`let mut`、`mutable` キーワード等)は Sumi sugar の transpiler として後付けする。
- **理由**:
    - 脱出ハッチが自明になる(チェッカーを外すだけ)。TS の普及要因「捨てて JS に戻れる」の再現。
    - LSP・シンタックスハイライト・Prettier・既存 linter がそのまま使える。言語実装で最もコストが高いのはコンパイラ本体ではなくツールチェーンであり、これを全部回避できる。
    - 前例: asm.js、TypeScript `--erasableSyntaxOnly`。
- **却下した代替案**:
    - 最初から transpile 方式(ReScript 型): ツールチェーン構築コストが莫大。また ReScript は出力 TS の品質が低く eject に耐えないという実体験があり、その品質要件を最初から満たすのは難しい。
    - 合法 TS だが意味を再解釈する方式: 同じコードが tsc とこの言語で違う意味を持つのは、脱出ハッチ要件と根本的に矛盾する。

## D-2: チェッカーは reject のみ。semantics の再解釈をしない

- **ステータス**: 確定(2026-08-27)
- **判断**: Sumi lint チェッカーが加えるのは「TS として合法だがこの言語では違法」という追加エラーのみ。TS が拒否するものを受理したり、型の解釈を変えたりしない(例: 無注釈の `number[]` を readonly と解釈する、はやらない)。
- **理由**: 再解釈は「stricter な方向」であっても破綻する。例えば `number[]` を readonly と解釈すると、readonly 値を `number[]` 引数へ渡すコードを許したくなるが、それは tsc のエラーになる。コードは常に tsc を通らなければならない以上、チェッカーにできるのは追加拒否だけである。

## D-3: Sumi sugar 構文に相当する情報は、識別子・型注釈・ディレクティブコメントの空間へエンコードし、機械的 codemod で Sumi sugar 構文へ移行可能でなければならない

- **ステータス**: 確定(2026-08-27)
- **判断**: Sumi lint では新構文を追加できないため、言語機能を TS の合法な空間に埋め込む。ただし埋め込み方は「Sumi sugar で本物の構文に一括変換できる」ことを条件とする。
- **例**:
    - mutation 許可マーカー: `mut_` prefix(Sumi lint)→ `let mut x`(Sumi sugar)。識別子名からの機械変換は自明。
    - readonly-by-default: Sumi lint では readonly 注釈を _全箇所で強制_ する → Sumi sugar で readonly をデフォルト化し `mutable` キーワードを導入する際、「注釈が全箇所にある」からこそ `readonly` の削除と `mutable` の付与が純粋に機械的になる([spec/readonly.md](./spec/readonly.md))。
- **理由**: この条件があると、Sumi lint の規則設計の良し悪しを「Sumi sugar への移行が codemod で閉じるか」で客観的に判定できる。

## D-4: `--erasableSyntaxOnly` のサブセット制限を包含する

- **ステータス**: 確定(2026-08-27)
- **判断**: enum、runtime namespace、class parameter properties、`import =` など「型を消すだけでは JS にならない構文」を禁止する。言語の型レイヤーは常に消去可能(erasable)とする。
- **理由**: Node.js type stripping・エコシステムの潮流と一致する。また Sumi sugar transpiler の TS emit を単純化する(型層と値層が絡まない)。

## D-6: 標準ライブラリは strict-ts-lib + ts-data-forge(prelude)の二層に、境界ラッパー ts-std-forge を加えた三層とする(改訂 2026-09-05)

(D-5 は削除済み。番号は相互参照を保つため欠番とする。)

- **ステータス**: 確定(2026-09-05 — D-27 で承認)
- **判断**: 組み込み層(`lib.d.ts` 相当)は strict-ts-lib、言語ネイティブに見せたいユーティリティ(`pipe` / `match` / `Optional` / `Result` 等)は ts-data-forge を prelude として扱う。Sumi lint では ts-data-forge からの明示 import が必要(値の自動 import は transpiler なしでは不可能)。Sumi sugar で transpiler が prelude の import 文を自動挿入する。これに D-24 で確定した **ts-std-forge**(throw する / null を返す stdlib API の Result / Optional ラッパー)を第 3 の層として加え、標準ライブラリは **strict-ts-lib(組み込み層)+ ts-data-forge(prelude)+ ts-std-forge(境界ラッパー)の三層**とする。
- **理由**: [spec/stdlib.md](./spec/stdlib.md) 参照。型だけなら ts-type-forge 方式(global.d.mts)で Sumi lint から global にできるが、実行時の値はモジュールから来るしかない。

## D-7: compilerOptions は言語仕様の一部として一意に固定する

- **ステータス**: 確定(2026-08-27)
- **判断**: 厳密化オプションを有効にした一つの構成を言語仕様として定め、プロジェクト側で緩める余地を残さない。tsconfig は「プロジェクト設定」ではなく「言語定義」になる。型チェック関連の値は mono の `tools/configs/tsconfig/tsconfig.type-check.json` の現行値を採用する — 特に **`exactOptionalPropertyTypes` は有効化しない**(2026-08-27 決定)。
- **理由**: TS の「同じ構文でも tsconfig 次第で意味と安全性が変わる」こと自体が負の遺産(モジュール解決の選択肢の多さと同根)。[spec/compiler-options.md](./spec/compiler-options.md) 参照。

## D-8: 言語開発は新トップレベル `languages/` に置く(改訂 2026-08-29)

- **ステータス**: 確定(2026-08-28、2026-08-29 改訂)
- **判断**: 言語開発用のトップレベル `languages/` を新設し、1 言語 = 1 ディレクトリでその配下にその言語の開発用パッケージを置く。本言語は `languages/sumi/`(仮名。言語名決定後にリネーム)で、適合性コーパスは `languages/sumi/conformance`。workspace glob は `languages/*/*`。ディレクトリ名は既存トップレベル(libs / apps / tools)に合わせて複数形。
- **理由**: リポジトリの分類基準 — libs = npm 公開パッケージ / tools = リポジトリ開発ツール / docs = 文書 — のどれにも該当しないため(先例は strict-lib)。`languages/` とすることで、今後別の言語や本言語の Sumi sugar / Sumi refined 段階を開発する場合の置き場所に悩まない。docs 配下は CI diff ゲートの ignore 対象のため、フィクスチャ変更で code-checks が走らない問題もこれで回避される。
- **検討して不採用**: `experimental/` — 本来は実験的コードの置き場(「遺産置き場」は一時的な使い方)だが、構造的に pnpm workspace の外・全チェック対象外であることが同ディレクトリの提供する保証(依存更新で壊れない等)そのものであり、CI でゲートされ続けることが存在意義である適合性コーパスとは要件が正反対のため。
- **補足**: 将来の専用チェッカーは npm 公開するので libs/ へ置く(Phase 2)。`languages/` に置くのは公開しない開発資産のみ。

## D-9: 適合性フィクスチャはルート `.prettierignore` で除外する

- **ステータス**: 確定(2026-08-28)
- **判断**: `languages/sumi/conformance/fixtures` をルート `.prettierignore` に追加し、フィクスチャを byte-for-byte で保存する(パッケージ内にも同内容の `.prettierignore` を併置 — package cwd からの fmt は root の ignore を読まないため。CLAUDE.md に例外として注記済み)。
- **理由**: フィクスチャは検査対象のコードそのものであり、フォーマッタの書き換え(例: `<T,>` の trailing comma 除去)は検査対象を消してしまう。Prettier の除外はルートの `.prettierignore` のみ有効(CLAUDE.md)。

## D-10: Phase 1 の subset ESLint preset は独立パッケージにする

- **ステータス**: 確定(2026-08-28)
- **判断**: eslint-config-typed 内の新 preset ではなく、独立パッケージとして実装する。
- **理由**: 言語プロジェクトの独立性を優先する(ユーザー決定)。eslint-config-typed のルール定義・オプションは依存として再利用する。

## D-11: Sumi sugar のファイル拡張子は 1 つだけ新設し、常時 JSX 文法とする

- **ステータス**: 確定(2026-08-29)
- **判断**: `.mts` / `.ts` / `.tsx` のような拡張子の複数化はしない。Sumi sugar の独自拡張子は 1 つだけ(名称は言語名とともに決定)で、その文法は常に JSX を含む(tsx 相当)。
- **理由**: 複数拡張子に意味がない。TS が `.ts` / `.tsx` を分けた原因は文法の曖昧性 — `.ts` の angle-bracket 型アサーション `<T>x` と、`.tsx` の arrow ジェネリクス `<T>(...)` が、それぞれ JSX 要素と衝突する — だが、この言語は angle-bracket アサーションを文法から除去し(`as` のみ。unsafe なものはそもそも禁止)、arrow ジェネリクスに `<T,>` を強制する([spec/jsx.md](./spec/jsx.md))ため、**単一の JSX 込み文法に曖昧性が残らない**。
- **補足**: Sumi lint は合法 TS なので従来どおり `.mts` / `.tsx` を使う。`<T,>` を拡張子非依存で常時強制しておくことが、Sumi sugar での単一拡張子移行を機械的にする(D-3 と同型)。

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

## D-16: 言語名は Tsubu(粒)、拡張子は `.tsb`(2026-09-07 に D-44 で Sumi へ改名)

- **ステータス**: 確定(2026-08-29)
- **判断**: 言語名を **Tsuba(鍔)**、Sumi sugar の単一拡張子(D-11)を **`.tsb`** とする。
- **理由**: 刀の鍔 = 手を守る防具で「TS を守る言語」の隠喩。綴りが ts- で始まり ts-data-forge / ts-fortress / strict-ts-lib と揃う。`.tsb` は著名言語・形式・略語と衝突しない(候補比較は [README.md](./README.md) の言語名節)。「唾」との同音は認識の上でユーザー決定。
- **帰結**: 仮名 subset-ts からのリネーム — `languages/sumi/`、`docs/sumi/`、パッケージ `sumi-conformance`、期待診断マーカー `@sumi-expect`、CLI 名 `sumi`(実施済み)。

## D-17: 予約語 `fn` を採用し、Sumi lint から識別子 `fn` を予約する

- **ステータス**: 確定(2026-08-29)
- **判断**: Sumi sugar の関数宣言キーワードとして `fn` を採用する([spec/future-syntax.md](./spec/future-syntax.md) 候補 8)。Sumi lint チェッカーは**宣言名としての識別子 `fn`**(変数・関数・パラメータ・型名・import 別名)を予約語として禁止する。
- **理由**: `fn` は TS では合法な識別子のため、Sumi lint コードに存在すると Sumi sugar の文法導入時に衝突する。Sumi lint で先行予約しておけば移行が機械的になる(D-3 と同型)。
- **補足**: プロパティ名(`obj.fn` / `{ fn: ... }`)は予約の対象外 — member 位置のキーワードは Sumi sugar 文法でも曖昧にならない(TS が `obj.if` を許すのと同じ)。ただし分割代入で `fn` という束縛名が生まれるケース(`const { fn } = obj`)は宣言名として禁止し、リネーム(`const { fn: fnValue }`)を要求する。

## D-18: generator は許可する(2026-08-27 の禁止を撤回)

- **ステータス**: 確定(2026-08-29)
- **判断**: generator(`function*` / `async function*`)をユーザーコードで許可する。arrow function に generator 形は存在しないため、`function*` の宣言・式は D-13(オーバーロード時のみ named function)の**例外として常に合法**とする。
- **理由**: ユーザー決定。実際上も、Sumi lint の `?` 代替である `Result.safeTry(function* () { ... })` はユーザーコードに generator 式を要求するため、「prelude 内部のみ」という以前の整理は成立していなかった。
- **帰結**: banned-syntax の generator 行を撤回。`yield` / `yield*` も合法(generator 本体内のみ、は TS の文法どおり)。

## D-19: global 定義名はすべて予約し、shadow を禁止する

- **ステータス**: 確定(2026-08-29)
- **判断**: 実行環境の global に定義されている名前(`undefined` / `NaN` / `Infinity` / `Array` / `JSON` / `Promise` …、および prelude が global に置く型名 — ts-type-forge の `DeepReadonly` 等)を**宣言名として使用禁止**にする(値空間・型空間とも)。プロパティ名は対象外(D-17 と同じ理屈)。
- **理由**: `undefined` が JS の予約語ではなく内側スコープで shadow できる(`let undefined = 1` が合法)という問題の一般化。global 名の上書きは読み手の前提を破壊する。undefined 一本化([spec/null-undefined.md](./spec/null-undefined.md))は `undefined` という名前が常に本物を指すことを暗黙の前提にしており、この決定がその前提を明文化する。
- **実装ノート**: Sumi lint 近似は `no-shadow-restricted-names`(undefined/NaN/Infinity/eval/arguments)+ `no-shadow` 系の `builtinGlobals: true` + `no-global-assign`。環境プロファイル(node/browser)ごとの global 集合は、専用チェッカー(Phase 2)では TS の global scope のシンボル列挙から導出できる。型空間の shadow 検査は新規実装。

## D-20: パイプ演算子は F# スタイルを採用する

- **ステータス**: 確定(2026-08-29)
- **判断**: Sumi sugar のパイプ演算子(候補 1)は **F# スタイル**(`x |> f` = `f(x)`、右辺は単項関数に評価される式)とする。TC39 が Hack スタイルを選び F# を却下した経緯は理解した上での決定([spec/future-syntax.md](./spec/future-syntax.md) 候補 1 に詳細)。F# スタイルを好むユーザー層の取り込みも狙いに含む。
- **理由(却下理由が Sumi では成立しないこと)**:
    1. **ステップごとのクロージャ生成の性能懸念**(エンジン実装者の反対理由)は、ネイティブ実装ではなく transpiler の emit には当てはまらない。さらに prelude(ts-data-forge)が直接形とカリー化形の**二本立て API** を持つため、`xs |> Arr.map(double)` を `Arr.map(double)(xs)` ではなく**直接形 `Arr.map(xs, double)` へ最適化 emit** でき、カリー化のアロケーション自体を消せる。
    2. **エコシステム分裂懸念**(カリー化・tacit スタイルの奨励が JS 全体を割る)は、カリー化 API を標準に据えた Sumi では分裂ではなく**言語の同一性**である。
    3. **await の構文問題**は残る(下記、未定)。
- **リスク**: 将来 TS/JS に Hack 版 `|>` が入ると、「独自構文は TS の構文エラーである字面を選ぶ」原則と衝突する。提案は 2021 年の Hack 選定後も Stage 2 で停滞しており発生確率は低いと評価するが、発生時はトークン変更か原則の明示的例外化を再決定する。eject への影響はない(emit に `|>` は現れない)。

## D-21: 素の number 系 global を削除し、`Number` 配下に一択化する

- **ステータス**: 確定(2026-08-29)
- **判断**: 素の global の `NaN` / `Infinity` / `parseInt` / `parseFloat` / `isNaN` / `isFinite` を Sumi lint から使用禁止にし、`Number.NaN` / `Number.POSITIVE_INFINITY` / `Number.parseInt` / `Number.parseFloat` / `Number.isNaN` / `Number.isFinite` に一択化する。
- **理由**: ユーザーが参照すべき定義は一択である方が混乱が少ない。加えて global の `isNaN` / `isFinite` は引数を暗黙の数値変換にかける **`Number.*` とは意味の違う別物**(`isNaN('foo') === true`)であり、削除は暗黙変換の排除でもある(`parseInt` / `parseFloat` は ES2015 で `Number.*` に同一関数が alias されており純粋な重複)。
- **一般原則**: 「素の global と namespace 配下の重複は namespace 側に一択化する」。今回は number 系へ適用。他の重複(`encodeURIComponent` 系は既に別途制限済み)も同原則で個別に判断していく。
- **実装ノート**: Sumi lint は `no-restricted-globals`(現行 config は `Infinity` / `isNaN` / `isFinite` を含む — `NaN` / `parseInt` / `parseFloat` を追加)+ `unicorn/prefer-number-properties`(構成要確認)。将来的には Sumi の lib 構成(strict-lib)側で素の宣言自体を落とし、lint ではなく型エラーにする案がある([spec/compiler-options.md](./spec/compiler-options.md) の lib 節と接続)。
- **備考**: prelude はさらに Result を返す `Num.safeParseInt` / `Num.safeParseFloat` を提供しており、plugin ルール(`ts-data-forge/prefer-num-safe-parse-int` 等)が `Number.parseInt` からの移行も誘導する。「Number.* を残す」と「Num.safeParse* へ誘導する」の段階関係は stdlib 側で要整理。

## D-22: throw しうる stdlib API は Result ラッパーに一択化し、素の形を禁止する

- **ステータス**: 確定(2026-08-29)
- **判断**: 標準ライブラリの「値依存で throw しうる」API は、prelude(ts-data-forge)の Result 返しラッパーに一択化し、素の形の使用を禁止する(D-21 の一般原則「参照すべき定義は一択」の throw 系への適用)。将来的には Sumi の lib 構成側で素の宣言を落とし、lint ではなく型エラーにする。
- **理由**: 失敗が型(`Result`)に現れる形へ寄せる(exceptions.md の方針)。`Number.parseInt` vs `Num.safeParseInt` の「どちらが最終一択か」も本決定で解決 — **最終一択は prelude 側**。
- **規模**: [throwing-stdlib-survey.md](./throwing-stdlib-survey.md) に調査済み。型・immutability・既存禁止で到達不能な throw を除外すると、コアの新規ラップ対象は約 17、family(TypedArray 系・Intl)込みで 100 前後(Temporal 除く)。
- **次の枠**: 番兵値で失敗を返す API(`indexOf` の -1、`parseInt` の NaN 等)への同原則の適用は別途棚卸し。

## D-23: Temporal をサポートする

- **ステータス**: 確定(2026-08-29)
- **判断**: Temporal を Sumi の標準ライブラリに含める(lib 構成に含め、値依存 throw のラップ対象 family に昇格)。
- **理由**: Date の実質的後継であり、Node 26 / esnext lib に既に存在する。値依存 throw が設計の一部(`from` / `with` / 算術 overflow)なので、D-22 のラップ方針とはむしろ相性が良い(Result 化の対象が明確)。
- **帰結**: [throwing-stdlib-survey.md](./throwing-stdlib-survey.md) の Temporal 行を「別枠」から「要ラップ family」へ変更。ラッパーの粒度(全 from/with を個別に包むか、境界モジュールか)は実装時に決定。

## D-24: safe stdlib wrapper は一方向依存の新ライブラリとする

- **ステータス**: 確定(2026-08-29)
- **判断**: D-22 のラッパー群は ts-data-forge に追加し続けるのではなく、新ライブラリ(仮名 **ts-std-forge**、`libs/`)に実装する。依存は **ts-std-forge → ts-data-forge の一方向のみ**。
- **理由**: ts-data-forge は ADT コア(Result/Optional/pipe)とデータ構造の両方を持つため、分割時の相互依存が懸念されたが、「**ts-data-forge は境界の実装者として、自身の内部では素の stdlib を直接使ってよい**」と定義すれば wrapper への逆依存は構造的に発生しない。歴史的に ts-data-forge にある `Json.*` / `Num.safeParse*` は当面動かさず、新 lib の re-export facade で一択の入口を作る(実体移動は将来の major)。
- **実施**: scaffold は [#1709](https://github.com/noshiro-pf/mono/pull/1709)(`Regex.create` / `SafeDate.toISOString` を TDD で実装済み)。パッケージ名は初回 publish(手動 — libs/first-release.md)まで仮。

## D-25: Sumi lint preset は `languages/sumi/eslint-config`(パッケージ名 sumi-eslint-config)、dogfood 第一対象は ts-std-forge

- **ステータス**: 確定(2026-08-31)
- **判断**:
    - Phase 1 の subset ESLint preset(D-10 の独立パッケージ)は `languages/sumi/eslint-config` に置き、パッケージ名は **sumi-eslint-config**(仮名。非公開)とする。仕様に属する新規 lint ルール(enforcement-map の 🆕)も同パッケージに eslint-plugin として同梱する。
    - dogfood の第一対象は **ts-std-forge**(最小・新規・こちらで完全に制御可能)。第二候補: octokit-safe-types(小規模で型付きルールの効きが見える)、synstate(class-less 化済みで言語の想定スタイルに最も近いが中規模)。
- **理由**: 公開は当面しないため languages/ 配下(D-8 の区分どおり)。公開する段になれば libs/ へ移す(D-8 補足)。

## D-26: ラッパーの失敗は「型 refine で排除 → 検証ファースト tagged union → 保守的 fallback」の三段構え

- **ステータス**: 確定(2026-09-01、引数型 refine はレビュー反映で同日改訂)
- **判断**: ts-std-forge のラッパーは `Result<T, Error>`(catch した Error をそのまま返す)をやめ、次の優先順で設計する。
    1. **引数型 refine による全域化**: throw 条件が有限の引数範囲なら、strict-ts-lib と同じリテラル範囲型(`toFixed` の `UintRange<0, 101>`、`toString` の `UintRange<2, 37>` 等)で仮引数を型付けし、素の値を返す。ランタイムチェックは置かない — 型が契約で、`normalize`(form union)の全域化と同じ扱い。`99.1` のような浮動小数点入力はユースケースとして考慮しない(呼び出し側が `Math.trunc` 等で明示的に丸めてから渡す)。refine は**リテラル範囲型まで**とし、branded number 型(`SafeUint` 等)は ts-std-forge では使わない — 通常の呼び出しごとに brand キャストを要求するのはユーザーには遠回りで、Sumi sugar のネイティブ整数型が入れば不要になる書き換えを今強いることになるため。よって `repeat` の count は素の `number` のまま②で扱う。
    2. **検証ファースト tagged union**: 引数域がリテラル範囲型で表現できない失敗(`fromCodePoint` の 0–0x10FFFF、`repeat` の count、`Date` の有効性)は、ECMAScript 仕様が定める throw 条件をラッパー自身が呼び出し前に検査し、関数ごとの plain tagged union(例: `{ kind: 'invalid-code-point', codePoint, index }`)で返す。検査は仕様の強制変換・判定順序まで鏡写しにする。
    3. **保守的 fallback**: 既知の(仕様が規定する)エラー条件のみに固有 kind を振り、それ以外の throw はすべて `Result.fromThrowable` backstop で受けて共通型 `UnexpectedError = { kind: 'unexpected', cause: Error }` に写す。`new RegExp` は仕様上 parse 失敗を SyntaxError と規定するが、それ以外の throw(リソース系等)を排除できないため、catch した SyntaxError だけを `'invalid-regexp'` に分類し、他は `'unexpected'` に落とす。
- **理由**: 仕様が固定するのは throw の**条件**であって**メッセージ**ではないため、catch 後の分類はエンジン依存のメッセージ解析にしかならず移植不能。型で排除できる失敗は排除するのが最も強く(コンパイル時)、できないものだけ事前検証で分類する。exceptions.md のクラスレス・エラー方針(Err payload は plain tagged union がデフォルト)とも一致する。
- **残課題(言語側)**: 型 refine は `as` による嘘に対して無防備。`as` キャストの正しさをランタイム検証する言語機能、または ts-fortress のような validator ライブラリの使用強制(`as` が紛れ込みうるコード文脈を言語として限定する)を Sumi refined の検討事項として TODO に記録。
- **却下した代替案**: catch した Error の message / name による事前分類なしの推定(エンジン依存)。refine 済み引数へのランタイム二重チェック(全域化して素の値を返した経緯と不整合)。

## D-27: 2026-09-05 時点の `提案` 節を一括承認する

- **ステータス**: 確定(2026-09-05)
- **判断**: 次の `提案` を `確定` に昇格する。[spec/modules.md](./spec/modules.md) の 3 節(許可する import 形 / 禁止する形 / モジュール解決)、[spec/exceptions.md](./spec/exceptions.md) の `try..catch` 禁止と「仕様への帰結」4 項目、[spec/booleans-and-logic.md](./spec/booleans-and-logic.md) の規則表と論理演算子の式文禁止、[spec/null-undefined.md](./spec/null-undefined.md) の Sumi lint 規則、[spec/variables-and-mutation.md](./spec/variables-and-mutation.md) の Sumi lint 規則と外部境界規定、[spec/banned-syntax.md](./spec/banned-syntax.md) の「既存運用の昇格」11 項目、[spec/compiler-options.md](./spec/compiler-options.md) の固定構成(`allowJs` / `checkJs` false を含む)、D-6、ユーザー変数同士の shadowing 全面禁止。
- **理由**: いずれも現行 eslint-config-typed / mono の tsconfig の運用と一致しており、仕様への追認である。
- **帰結**: preset 追補(`functional/no-try-statements` の on、import 系 allow リストの精査)と、`提案` 確定待ちだった適合性フィクスチャの整備が着手可能になる。残る `未定` は [spec/future-syntax.md](./spec/future-syntax.md) のパイプ内 await / ts-pattern 採否、[spec/modules.md](./spec/modules.md) の barrel `export *` / `import.meta` で、いずれも Sumi sugar 設計時まで保留。

## D-28: modules の残論点 — dynamic import と `#` imports は許可、default export は全面禁止、`import * as` は現行ルールを追認

- **ステータス**: 確定(2026-09-05)
- **判断**:
    1. dynamic `import()` は**無制限で許可**する(TS と同じ。specifier の制限も置かない)。
    2. `#` subpath imports(package.json の `imports` フィールド)は **Sumi lint から許可**する。`exports` と同じく package.json が定める解決規則であり、「解決規則は一つ」に反しない。
    3. default export は**設定ファイルも含め全面禁止**する。`export default …` と `export { x as default }` の両形が対象。default export を要求するツールへの接続は D-36。
    4. `import * as ns` は**許可**し、非 tree-shakable な使用(ns オブジェクトを値として持ち回る等)のみ禁止する — 現行 `tree-shakable/import-star` の挙動の追認。
    5. barrel `export * from` は**保留**(未定のまま)。「生成物のみ許可」「`export *` と明示 export の混在のみ禁止」「全面禁止」を検討したが決定を見送った。
- **理由**: (1)(2) は禁止に見合う害がなく、code splitting と `paths` 代替という実需がある。(3) は「export の書き方を増やしてブレる」ことを避けるため(ユーザー決定)。(5) の背景: `export *` 同士の名前衝突は tsc が TS2308 で報告するが、同じ barrel の**明示 export が同名の `export *` を無警告で隠す**(2026-09-05 実測)。
- **帰結**: enforcement-map の `import-x/no-default-export` の `*.config.*` 例外は言語では採らない。`export { x as default }` は現行 `no-restricted-exports` の `restrictedNamedExports: ['default']` が既に塞いでいる。

## D-29: 論理代入演算子 `&&=` / `||=` / `??=` は `mut_` 変数に限り 3 つとも許可する

- **ステータス**: 確定(2026-09-05)
- **判断**: 代入先が `mut_` 変数であれば 3 つとも許可する。`&&=` / `||=` のオペランドは `&&` / `||` と同じ boolean 厳密化([spec/booleans-and-logic.md](./spec/booleans-and-logic.md))の対象。`??=` は値の合体なので boolean 制約の対象外。
- **理由**: `x &&= y` は `x = x && y` と同義で、boolean 厳密化の下では純粋な boolean の畳み込みにすぎない。本来の用途(`opts ||= {}` 等の truthiness idiom)はオペランド型の制約で既に違法になる。現行 config は `logical-assignment-operators: "always"` + `unicorn/logical-assignment-operators` で**論理代入形をむしろ強制**しており、禁止すると現行運用と衝突する。
- **帰結(実装)**: `@typescript-eslint/strict-boolean-expressions` が検査するのは `LogicalExpression` / 条件位置 / `!` のみで、`AssignmentExpression`(`&&=` / `||=`)のオペランドは**検査しない**(2026-09-05 実測、typescript-eslint 8.67)。したがって `&&=` / `||=` の両オペランドの boolean 限定は 🆕 ルール。

## D-30: `using` / `await using` は Sumi lint では禁止し、Sumi sugar で再検討する

- **ステータス**: 確定(2026-09-05)
- **判断**: explicit resource management(TS 5.2+)は Sumi lint の言語に含めない。`try..catch` 禁止で `finally` も書けなくなるが、Sumi lint のリソース解放は `fromThrowable` に渡すコールバック内で明示的に書く。採否は Sumi sugar で再検討する。
- **理由**: 受け皿が必要なのは確かだが、構文を増やす判断は transpiler の設計と一緒に行う(ユーザー決定)。

## D-31: 「値がない」は最終的に `Optional<T>` へ一本化し、`undefined` もユーザーコードの宣言型から排除する(段階導入)

- **ステータス**: 確定(2026-09-05、方針)
- **判断**: 最終目標を `{null, undefined}` → `Optional<T>` とする。**Sumi lint は null の排除のみ**。`undefined` の排除は、`T | undefined` を返す stdlib API を Optional 化する ts-std-forge のラッパー層が揃った段階(Sumi sugar 以降)で導入する。Sumi lint では `Optional<T>` と `T | undefined` の使い分け指針は置かず、方向性だけを記述する。`{ x?: T }` と `{ x: T | undefined }` のスタイル規定も置かない。
- **理由**: `noUncheckedIndexedAccess` の添字、`Map.get`、`find`、optional 引数 / プロパティ(JSX props を含む)など TS のあらゆる API が `T | undefined` を返すため、ラッパー層なしに宣言型から `undefined` を禁止すると境界正規化(`Optional.fromNullable`)が至る所に必要になる。
- **帰結**: [spec/null-undefined.md](./spec/null-undefined.md) の目標を書き換える。ts-std-forge の Optional ラッパー(TODO の並行ワークストリーム)がこの方針の前提条件になる。

## D-32: 外部 API へ `null` を渡す必要は ts-std-forge のラッパーで吸収する

- **ステータス**: 確定(2026-09-05)
- **判断**: `null` を要求する外部 API(`JSON.stringify(v, null, 2)` の replacer、React の `useRef(null)` 等)には ts-std-forge 側でラッパーを用意し(例: indent オプションを取る `stringify`)、ユーザーコードには `null` の字面を書かない。対象外の API は必要になった時点で個別に追加する。
- **却下した代替案**: prelude に `Null` 定数を置く(null の別名を増やすだけ)。境界行での `null` リテラル例外(抜け穴になる)。

## D-33: getter / setter は両方禁止する

- **ステータス**: 確定(2026-09-05)
- **判断**: object literal の `get x() {}` / `set x(v) {}` を禁止する。遅延評価は明示的な関数プロパティ(`x: () => …`)か ts-data-forge の memoize で書く。
- **理由**: プロパティアクセスが関数呼び出しになる暗黙の制御フロー。setter は mutation でもある。class 文脈は D-12 で既に消滅している。
- **実装**: `no-restricted-syntax`(`Property[kind='get']` / `Property[kind='set']`)。

## D-34: 言語バージョンと TS バージョンの対応は preset / チェッカーの peerDependencies で固定する

- **ステータス**: 確定(2026-09-05)
- **判断**: 対応表は書かない。言語のバージョンはツール(sumi-eslint-config、将来の `sumi check`)のバージョンであり、対応する TS の範囲はそのツールの package.json の `peerDependencies` が単一の真実。
- **理由**: `strict` の中身が TS のバージョンで増える問題は「どの TS で検査したか」をツールが固定すれば解決し、手書きの表は乖離する。

## D-35: Sumi sugar の `let mut x` は `let mut_x` として emit する

- **ステータス**: 確定(2026-09-05)
- **判断**: Sumi sugar transpiler は `let mut x` を TS の `let mut_x`(宣言と全参照)に落とす。`let x` は `const x` に落とす。
- **理由**: eject した出力が Sumi lint 規則を満たす合法 Sumi lint コードになり、可変性の情報が TS 側でも読める。Sumi lint → Sumi sugar(`mut_` 除去)と Sumi sugar → Sumi lint(`mut_` 付与)の codemod が可逆になる(D-3)。

## D-36: default export を要求するツールへは Sumi sugar transpiler が default export を emit して接続する(Sumi lint は言語外のアダプタ)

- **ステータス**: 確定(2026-09-05)
- **判断**: ソースの export 形は named 一択(D-28)。ESLint flat config / Vite / Vitest / Rollup 等が要求する default export は、**Sumi sugar では transpiler が `export default` を emit** して作る。emit の指示は **transpiler の設定ファイル(パスパターン → default にする named export 名)を第一候補**とし、ファイル内ディレクティブは次点。Sumi lint には transpiler がないため、暫定として設定の本体を Sumi の通常モジュール(named export)で書き、ツールが読むファイルは検査対象外の 1 行アダプタ(`export { config as default } from './configs/eslint.config.mjs';`)とする。
- **理由**: 書き方を増やしてブレるのを避けるため、ソース側では default export を完全に禁止し、必要な形は出力側で作る(ユーザー決定)。設定ファイル方式を推す理由: ソースに特別な記法が一切入らず、Sumi lint のアダプタ(ファイル → シンボル名)と Sumi sugar の設定エントリが同じ情報なので機械的に相互変換できる(D-3 と同型)。ディレクティブはコメントの形をした「二つ目の export の書き方」になる。
- **却下した代替案**: 設定ファイル全体を言語の対象外にする(設定の中身は本物のコードであり、保護を失う)。**特定の構文を使えるファイルをパス指定で許可する一般機構**(現行 eslint-config-typed の `*.config.*` 例外の一般化)— 同じコードの合法性がプロジェクト設定次第で変わることになり、compilerOptions を固定して設定の自由度を消した D-7 と逆向き。境界の例外は prelude だけに `declare global` を許すのと同じく、仕様が列挙する固定の規定に限る。
- **帰結**: 設定ファイル / ディレクティブの具体形は Sumi sugar 設計時に決める。アダプタファイルは Sumi lint preset でファイル単位の除外として扱う。

## D-37: 言語は「制限 / 糖衣構文 / 型検査の変更」の三層に分け、糖衣構文は Sumi lint + ライブラリと一対一対応させる(emit の最適化・正規化はしない)

- **ステータス**: 確定(2026-09-05)
- **判断**:
    1. **三層**: 第 1 層(Sumi lint)= lint 等のチェックツールで実現できる TS 構文の**制限**のみ。第 2 層(Sumi sugar)= パイプ演算子・`match`・`Result` / `Optional` 等の**独自構文(糖衣)**。第 3 層(Sumi refined)= ネイティブ `Int` や `typeof` narrowing の refine、bivariance の根本解決など**型検査の変更**(TS + ライブラリに対応物がなく、eject は型が弱くなる方向で不可逆)。
    2. **一対一対応**: 第 2 層の構文は、Sumi lint + ライブラリ(ts-data-forge、ts-std-forge 等)の書き方と一対一に対応させられる(させやすい)範囲で定義し、ツールで**双方向に自動変換**できるようにする。対応相手のない構文は第 2 層に入れない(第 3 層か却下)。D-3 の「Sumi lint → Sumi sugar の機械的移行」を双方向へ強める。
    3. **ライブラリ形が先**: 第 2 層の構文を設計する前に、その Sumi lint 側の API(ts-data-forge / ts-std-forge)を先に整備し、構文はその糖衣として定義する。パターンマッチなら `match` / タグ付き `switch` で書ける範囲、`?` 伝播なら `safeTry` 系が先。
    4. **emit の最適化・正規化はしない**: Sumi sugar → Sumi lint の変換は書き方を保存する。パイプ演算子は ts-data-forge の `pipe` にそのまま対応させ、同じ意味の複数の書き方(`pipe(x).map(f).value` と `f(x)` 等)は TS 側でも Sumi lint 側でも維持する。「既知のカリー化呼び出しを直接形へ最適化 emit する」という以前の案([spec/future-syntax.md](./spec/future-syntax.md) 候補 1)は**撤回**。
- **理由**: 同じ意味の書き方を出力時に一つへ潰す最適化・正規化は多対一の変換であり、Sumi lint → Sumi sugar の逆変換を不可能にする。ReScript ではカリー化周りの `.ts` 出力時にまさにこれが起きており、「言語移行後に eject で TS に戻ってこれる」という望ましい性質を壊していた。往復変換は日常的に使い、eject は言語をやめるときにしか使わないので、往復忠実性を既定にする。三層に分けるのは、構文の話と型検査の話が同じ候補リストに並んでいたことが判断のブレの原因だったため。
- **帰結**: 第 2 層の各候補に「Sumi lint ライブラリ形」と「両向きの codemod」を明記する。適合性コーパスに対する「Sumi lint → Sumi sugar → Sumi lint が(整形を除き)恒等」の往復プロパティテストが transpiler の主要な回帰テストになる。
- **呼び名**: D-38 で **Sumi lint / Sumi sugar / Sumi refined** に決定。

## D-38: 三層の呼び名は Sumi lint / Sumi sugar / Sumi refined

- **ステータス**: 確定(2026-09-06。第 3 層は同日 `refined` で確定)
- **判断**: D-37 の三層を連番ではなく「TS からの距離」が分かる語で呼ぶ。第 1 層(制限のみ、lint で実現)は **Sumi lint**、第 2 層(糖衣構文、transpiler)は **Sumi sugar**。第 3 層(型検査の変更、独自型検査器)は **Sumi refined** — 中身がネイティブ `Int` や narrowing 先の絞り込みという refinement type そのものであり、「sugar → refined」は精製の連想でも続く。却下: `native`(strict-ts-lib の plain 版の呼び名と衝突)、`subset`(TS の subset であって Sumi の subset ではない)、`types`(型定義集の印象)、`retyped`(手段の説明で、何が良くなるかが読めない)、`checked` / `strict`(lint や TS の `--strict` と紛れる)。
- **理由**: 連番は間に層を挟みたくなったときに困る。名前がその層に必要なツール(lint / transpiler / 型検査器)を示すので説明が要らない。
- **帰結**: 文書中の Sumi lint / Sumi sugar / Sumi refined を Sumi lint / Sumi sugar / Sumi refined に一括置換した(2026-09-06)。

## D-39: strict-ts-lib は plain(native number)版を言語標準にする

- **ステータス**: 確定(2026-09-06)
- **判断**: 組み込み層の型定義は strict-ts-lib の plain 版(`libs/`、number は素の `number`)を言語標準とし、branded 版(`libs-branded/`)は使わない。
- **理由**: D-26 で ts-std-forge が branded number 型を使わないと決めたのと同じ理由 — 通常の呼び出しごとに brand キャストを要求するのはユーザーには遠回りで、数値型の分類は第 3 層のネイティブ `Int`(候補 7)で行う。branded 版は第 3 層の設計材料として残す。

## D-40: compilerOptions は「完全固定」ではなく「言語が拘束する項目の限定」とする(D-7 改訂)

- **ステータス**: 確定(2026-09-06)
- **判断**: D-7 の「ユーザーが書く tsconfig は存在しない」を改め、**言語が値を拘束する項目**(型検査の厳密度・サブセット制約・モジュール解決・標準ライブラリの差し替え)と、**ユーザーが自由に決める項目**(`lib` / `types` / `target` / `jsxImportSource` / 出力・プロジェクト構成)を分ける。拘束項目の一覧と draft config は [spec/compiler-options.md](./spec/compiler-options.md)。
- **理由**: 実行環境(`dom` の有無、`target`、JSX ランタイム)は言語の意味に関わらず、固定すると環境別プロファイルを言語側で定義する羽目になる(旧・未解決論点「`lib` に `dom` を含めるか」)。`lib` を自由項目にすることでこの問題は生じない。
- **強制手段**: Sumi lint preset が base tsconfig を配布し、プロジェクトの実効 compilerOptions(`tsc --showConfig`)が拘束項目と一致することをチェッカーで検証する。拘束項目を上書きした tsconfig での検査結果は言語の検査結果ではない(D-7 の趣旨は維持)。

## D-41: コンストラクタ静的呼び出し(D-15)の代替 API は ts-std-forge に置き、対象は「`new` 形と関数形の両方を持つ組み込み」に限る

- **ステータス**: 確定(2026-09-06)
- **判断**:
    1. D-15 の代替生成関数は ts-data-forge(prelude)ではなく **ts-std-forge** に置く。D-15 の TODO(「ts-data-forge 側の生成関数の網羅」)はこれで置き換える。
    2. 禁止の対象は、`new X()` と `X()` の両方を持ち関数形が暗黙変換(または別の意味)になる組み込み: `Boolean` / `Number` / `String` / `Object` / `Array` / `Date` / `RegExp` / `Error` 系 / `Function`。**`Symbol()` と `BigInt()` は対象外**(`new` 形を持たず、関数呼び出しが唯一の生成手段)。`BigInt(x)` の throw(非整数)は Tier 2 のラッパー対象。
    3. 代替の対応表([spec/stdlib.md](./spec/stdlib.md)): `Number(str)` → `SafeNumber.parse`(ts-data-forge の `Num.safeParseFloat` と同じ実装のコピー。有限値のみ Ok、空文字・末尾不正・`NaN`・`Infinity` は tagged Err)/ `Number.parseInt(str, 10)` → `SafeNumber.parseInteger`(`Num.safeParseInt` のコピー + 有限性チェック。`parseInt` という宣言名は global を shadow するため D-19 に反する)/ `String(x)` → `SafeString.fromPrimitive`(template literal が受けない `symbol` / `bigint` / `undefined` を含む primitive の文字列化)/ `RegExp(p, f)` → `Regex.create` / `Error('msg')` → `new Error('msg')`(`new` 形は許可)/ `Array(n)` → 配列リテラル・`Arr.newArray` / `Arr.seq`(ts-data-forge)/ `Date()` → `new Date()` / `Boolean(x)` → 代替なし(真偽は明示的な比較で書く — [spec/booleans-and-logic.md](./spec/booleans-and-logic.md))/ `Object(x)` / `Function(...)` → 代替なし。
- **理由**: `Number(x)` / `String(x)` は stdlib API そのものであり、「throw / 番兵値を返す stdlib API を Result / Optional 化する」ts-std-forge の守備範囲。ts-data-forge は ADT コアとデータ構造に留め、依存を一方向(ts-std-forge → ts-data-forge)に保つ(D-24)。既存の `Num.safeParseInt` / `safeParseFloat`(ts-data-forge)の実装を正とし、ts-std-forge には**依存ではなくコピー**として同等の実装を置く(2026-09-06 ユーザー決定)。ts-data-forge の次の major で ts-std-forge 側に一元管理し、`Num` から落とすことを視野に入れる。 ただし戻り値は `FiniteNumber` / `Int` の brand ではなく**素の `number`**(D-26 / D-39 — ts-std-forge は brand 型を使わない)。ts-type-forge から import してよいのはリテラル範囲型のみで、ts-std-forge の ESLint 設定(`@typescript-eslint/no-restricted-imports` の allowlist)で強制する。
- **実装時に判明した差異**: `Num.safeParseInt('1e400')` は `Number` 側が `Infinity`、`parseInt` 側が `1` で両者とも非 NaN のため、`Infinity` を `Int` として Ok で返す。ts-std-forge のコピーは有限性チェックを足して Err にした。ts-data-forge 側の修正は別途(TODO)。

## D-42: 仕様が沈黙する点は現行 eslint-config-typed の運用を正とする(残る Sumi lint の未決定事項の一括解決)

- **ステータス**: 確定(2026-09-06)
- **判断**: 仕様書に明示の規定がない点は、**現行 eslint-config-typed / mono の運用を言語仕様とみなす**。個別には:
    1. `exports` を持たないパッケージへの依存は合法(nodenext の `main` / `types` 解決に従う)。何も export しない script は import できない — 副作用 import の禁止と、名前付き import の型エラーで担保され、追加規則は不要([spec/modules.md](./spec/modules.md))。
    2. JSX ランタイムは D-40 で解決(`jsx: "react-jsx"` 拘束、`jsxImportSource` 自由)。現行 React/JSX ルール群は「型情報が要る / 誤りが実行時の不正動作になる」ものを言語仕様、a11y・props spread・inline 関数・命名をスタイル規定(ESLint に残す)とする([spec/jsx.md](./spec/jsx.md))。
    3. 関数の明示的戻り値型は強制。default 引数・分割代入引数は TS 通り許可([spec/functions.md](./spec/functions.md))。
- **理由**: 現行 config は言語の 7〜8 割を既にプロトタイプしている([README.md](./README.md))。沈黙している点を個別に議論するより、運用実績を既定にして逸脱だけを仕様に書く方が速く、dogfood で問題が出た点を再検討すればよい。
- **帰結**: Sumi lint 開発を止める未決定事項は無くなった。残る `未定`(パイプ内 await / ts-pattern / `import.meta` / barrel `export *` / 第 3 層の名前)はいずれも Sumi lint 実装に影響しない。

## D-43: Sumi lint のエンジンは oxlint(native ルール + tsgolint の type-aware + sumi JS plugin)とし、ESLint preset は移行期のブリッジに格下げする

- **ステータス**: 確定(2026-09-07)
- **判断**: Phase 1 のエンジンを ESLint から **oxlint** に切り替える。構成は (1) oxlint の native ルール、(2) `oxlint-tsgolint` による type-aware ルール(typescript-eslint の type-aware 群の native 実装)、(3) native に無い言語ルールを載せる **sumi JS plugin**(`languages/sumi/oxlint-config/src/plugin/`)の三つ。preset パッケージは `languages/sumi/oxlint-config`(sumi-oxlint-config、非公開)で、`oxlintrc.jsonc`(全 category off、仕様の行だけを明示的に有効化)、plugin、**中立ルール ID ← oxlint 診断コードの対応表**、runner ヘルパを持つ。適合性コーパスはこの対応表で診断を正規化してマーカーと照合する(runner 接続は 2026-09-07 に稼働)。D-25 の sumi-eslint-config は、oxlint に載せられない独自 type-aware ルールが必要になった場合のブリッジとして残す。
- **理由**: ESLint の遅さは Sumi のルール数では呑めない可能性がある(ユーザー判断)。[docs/research-eslint-alternative-tools.md](../research-eslint-alternative-tools.md) の結論どおり oxlint が最有力で、実測(2026-09-07、oxlint 1.80.0)で次を確認した — ESLint 互換の JS plugin API で esquery 選択子・scope 解析が動く / Node 26 では `.mts` の plugin も直接読めるが `.mjs` 指定子の解決が無いため dist 経由にする / tsgolint は package ディレクトリを cwd にすれば動き、`strict-boolean-expressions` 等がそのまま使える / eslint-plugin-functional のような既存 ESLint plugin もエントリファイル指定で読める(ただし自前の小ルールの方が依存が軽い)/ `no-restricted-syntax` は native に無いので選択子ルールは plugin 側に書く / JSON 出力は `{ diagnostics: [{ code: "<plugin>(<rule>)", filename, labels[0].span.line }] }`。
- **制約(既知)**: oxlint はカスタム type-aware ルールを書けない(2026-09 時点)。型情報が要る 🆕 ルール(宣言への null 型禁止、境界 `?? undefined` 強制、`castMutable` 乱用、論理代入のオペランド、readonly 強制)は tsgolint の既存ルールで賄えるものを除き、**TS API 上の薄いチェッカー(Phase 2 の `sumi check` の前倒し)か ESLint ブリッジ**で実装する。どちらにするかは readonly 強制の実装方針(TODO)と併せて決める。
- **コーパス側で判明した差分**: `no-sequences` は ESLint / oxlint とも既定 `allowInParentheses: true` で `(a, b)` を許す — 言語は全面禁止なので `false` を指定する(ESLint preset にも同じ穴があり、enforcement-map に 🔧 として反映)。デコレータ付き class の報告行はエンジン依存(class の span がデコレータから始まるか)なので、フィクスチャはデコレータと class を同一行に置く。`fn` を仮引数名にした valid フィクスチャは D-17 の「宣言名」に該当し invalid だった(修正)。

## D-44: 言語名を Tsubu から Sumi に改名する

- **ステータス**: 確定(2026-09-07)
- **判断**: 言語名を **Sumi** とする(ユーザー決定)。仕様書(`docs/sumi/`)、開発パッケージ(`languages/sumi/` — sumi-conformance / sumi-eslint-config / sumi-oxlint-config)、コーパスのマーカー(`@sumi-expect`)、JS plugin 名(`sumi/<rule>`)、preset の API 名(`sumiRules` / `eslintConfigForSumi`)を一括で改名した。D-16 と README の命名検討の記録は当初の名前(Tsubu)のまま残す。
- **未定**: Sumi sugar のファイル拡張子。`.tsb` は Tsubu 由来なので再決定する(候補: `.sumi`)。
