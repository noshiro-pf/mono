<!-- cspell:ignore Koka Wantedly -->

# 例外と throw

## 規則(確定 2026-08-27)

**`throw` は禁止し、エラーは `Result` 型と関連メソッドの使用に統一する。**

- 失敗しうる関数は `Result<S, E>`(非同期なら `Promise<Result<S, E>>`)を返す。
- 例外を投げる外部 API(組み込み・サードパーティ)は境界で `Result.fromThrowable` / `Result.fromPromise` に包んで Result 化する。null の境界正規化([null-undefined.md](./null-undefined.md))と同じ「境界で潰す」パターン。

## panic 経路の位置づけ

`throw` を禁止しても、プログラムが停止する経路は残る:

- `Optional.unwrapThrow` / `Result.unwrapThrow` / `expectToBe` — これらは「ここで失敗するのはバグである」という表明であり、Rust の `unwrap()` / `expect()` / `panic!` に対応する。**回復可能なエラーは `Result`、回復不能なバグの検出は unwrap 系**、という Rust と同じ二分法を言語の公式な整理とする。
- 言語仕様としては「ユーザーコードに `throw` 文は現れない。停止は prelude の unwrap 系関数を通してのみ起こる」となり、停止箇所が grep 可能になる。

## 境界の設計: ネイティブ API と外部ライブラリ

### ネイティブ関数・メソッド(方針 2026-08-27)

**throw しうる組み込み API はすべて prelude 層で Result に包み、エラーは `kind` で分類できる tagged union として整備する。** ts-data-forge の `Json.parse`(`Result` を返す)が既存例であり、これを throw しうるネイティブ API 全体へ網羅的に広げる。

- strict-lib(型の差し替え)では throw の事実は消せないため、ここは型ではなく**ラッパー関数群**の仕事になる。null の境界正規化([null-undefined.md](./null-undefined.md))と同じ「境界で潰す」パターンだが、null と違い throw は `?? undefined` のような式単位の後置正規化ができないので、prelude がラッパーを提供するのが主手段。
- どのネイティブ API が throw しうるかの網羅リストは **[throwing-stdlib-survey.md](../throwing-stdlib-survey.md) に調査済み**(コア約 26・新規ラップ対象約 17、family 込み 100 前後)。素の形の禁止と prelude 一択化は D-22。

### 外部ライブラリ(JS 製)

外部ライブラリは throw するかどうかが型に現れないため悩ましい。**throwable を型で区別する仕組みが可能ならそうしたい**(方針)。TS には throws 節がない([microsoft/TypeScript#13219](https://github.com/microsoft/TypeScript/issues/13219) — 長年の未解決 issue)ため、段階案で整理する:

1. **v1(保守的規則)**: この言語の Result 規約に従わない外部モジュールからの関数呼び出しは、すべて throwable とみなし `fromThrowable` / `fromPromise` 越しでのみ許可する。「throw しうるか」は静的に判定不能なので、健全なデフォルトはこれしかない。ただし実際には throw しない純粋関数まで包む過剰包装になる。
2. **v1 の緩和(許可リスト)**: パッケージ/関数単位で「throw しない」とチェッカー設定に人手で宣言し、1 の規則から除外する。宣言は自己責任の境界であり、`@ts-expect-error` と同格の明示的エスケープとして扱う。
3. **v3(理想形)**: 関数型に throws 効果を載せる独自型検査器拡張。先行例: Swift の `throws` / `try` マーキング、Koka などの effect system、Java の checked exceptions(悪評も含めて教訓 — 効果の伝播が全署名を汚染する問題への解を要検討)。[future-syntax.md](./future-syntax.md) 候補 7 と同じく「独自型検査器(v3)」の動機リストに加える。

## Err ペイロードとスタックトレース — class なしで JS ネイティブ Error 同等を実現できるか(検証 2026-08-29)

class 全面禁止(D-12)の下で、`extends Error` によるカスタムエラーが作れない。参考記事
[JavaScript のカスタムエラー実装ガイド(Wantedly)](https://www.wantedly.com/companies/wantedly/post_articles/492456)
は `class MyError extends Error` + static block での `name` 初期化(minify 対策)+ `cause` 連鎖を推奨し、「class なら Error コンストラクタが自動でスタックを収集するので `captureStackTrace` は不要」と整理している。本言語ではこれを **class なしの factory パターン**で置き換える。Node 26 での実測検証の結果:

```ts
const createHttpError = (
    status: HttpStatus,
    message: string,
    options?: Readonly<{ cause?: unknown }>,
): HttpError =>
    Object.assign(new Error(message, options), {
        name: 'HttpError', // 文字列リテラルなので minify で崩れない
        kind: 'http',
        status,
    } as const);
```

- **`instanceof Error` ✓ / ネイティブ stack ✓ / `cause` 連鎖 ✓ / `String(err)` と stack 先頭行の `HttpError: not found` 表示 ✓** — Error クラス継承と観測上同等。監視ツールや `console.error` は Error インスタンスとして扱う。
- 記事が static block で対策していた「minify で class 名が崩れて `name` が変わる」問題は、**class を使わないことで問題自体が消える**(`name` も `kind` も文字列リテラル)。
- 判別は `instanceof MyError` ではなく `kind` タグ(本言語の既定方針と一致)。
- `Error.captureStackTrace(mut_err, createHttpError)` で factory フレームをスタックから隠せることを確認。V8 由来 API だが
  [Firefox 138 / Safari 17.2 で対応済み](https://caniuse.com/mdn-javascript_builtins_error_capturestacktrace)(2025 年にクロスブラウザ化。global 93%超)。それ以前のブラウザを考慮する場合は feature-detect。
- **`Object.freeze` との相互作用**: freeze 済みオブジェクトへの `captureStackTrace` は TypeError。freeze 後の `.stack` 読み出しは可。→ factory 内は `mut_` 変数で組み立ててから返す(freeze するなら最後)。
- **コスト実測**(N=100k, stackTraceLimit=10): plain tagged record ≈ 0.05µs / `new Error` ≈ 1.3µs / `.stack` 文字列化まで ≈ 3.9µs per 件。**Error ベースは plain record の約 25 倍**。

**仕様への帰結(提案)**:

1. `Result` の Err ペイロードの既定は **plain tagged union(stack なし)** — hot path で Err を返す関数のコストを plain record に保つ。
2. **境界(外部 API のラップ)と panic 経路(unwrapThrow)では上記 factory の Error ベースエラー**を使う — スタックと監視ツール連携が要る場所に限定して 25 倍のコストを払う。`fromThrowable` が捕捉する例外はもともと Error インスタンスであり、そのまま Err ペイロードに載る。
3. `Error('msg')`(new なしの関数呼び出し)は D-15 のコンストラクタ静的呼び出し禁止に含め、生成は `new Error` か prelude の factory に統一する。
4. dev ビルドで plain Err にも stack を付与する opt-in は、将来の checked モード([related-work.md](../related-work.md) の Safe TS 由来案)と同系の拡張として記録。

## `try..catch` の扱い(提案)

`throw` を書けないなら、ユーザーコードで `try..catch` が必要なのは外部 API の境界だけであり、それは `fromThrowable` / `fromPromise` が担う。したがって **`try..catch` 構文自体も禁止**し、例外の捕捉手段を prelude の 2 関数に一本化することを提案する([banned-syntax.md](./banned-syntax.md))。

- `finally` 相当(リソース解放)は `using` / explicit resource management(TC39 / TS 5.2+)が受け皿になりうる — `using` を言語に入れるかは未定。

## TS へ戻るときの影響

なし。Result ベースの API は TS としてもそのまま有効で、むしろ throw する API より型情報が多い。

## 未解決の論点

- `Err` ペイロードの設計規範は上記「仕様への帰結」1〜2 で骨格が決まった(既定 plain tagged union / 境界・panic は Error ベース factory)。残るのはエラーの合成(`mapErr` / union が増えていく問題)の指針と、factory 群を prelude(ts-data-forge)にどう載せるか。
- `using` / Explicit Resource Management を採るか。
- process 境界(uncaught rejection、`process.exit`)の扱い。
