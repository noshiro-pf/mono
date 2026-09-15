# 関数

## 規則

- **arrow function に統一する(確定 2026-08-27)。** `function` 式・宣言は原則禁止で、例外は 2 つ: **オーバーロードシグネチャを伴う `function` 宣言**(D-13、下記)と **generator(`function*`)**(D-18)。
- **`arguments` は禁止(確定)。** rest パラメータで代替。
- **`this` は全面禁止(確定 2026-08-29)。** class の全面禁止(D-12 — [classes.md](./classes.md))に伴い、「class 内のみ許可」の条項は消滅した。`arguments` と `this` を禁止した状態では、named function と arrow function の安全性の差はほぼ無い — これが D-13 のオーバーロード時 named function 許容の前提でもある。
- **async/await は残す(確定)。** 非同期は言語の一級市民。エラーを持つ非同期は `Promise<Result<S, E>>`(将来的には `ResultAsync` 相当 — [stdlib.md](./stdlib.md) ★★★)と組み合わせる。
- **generator(`function*` / `async function*`)は許可(確定 2026-08-29 — D-18。当初の禁止を撤回)。** arrow に generator 形が存在しないため、`function*` の宣言・式は D-13 の例外として常に合法(オーバーロード不要)。`Result.safeTry(function* () { ... })` をユーザーコードで書くための実際上の必要もある。
- **識別子 `fn` は予約(確定 2026-08-29 — D-17)。** Sumi sugar の関数宣言キーワードとして採用が決まったため、Sumi lint から宣言名としての使用を禁止する(プロパティ名は対象外)。

## オーバーロードと named function(確定 2026-08-29 — D-13)

> **2026-09-16 注**: この節の根拠(「arrow では書きづらい」)と下の例は D-13 当時のもの。根拠は D-58 で「戻り値が引数に従うオーバーロードは関数式では `as` 無しに書けない」に差し替わり、下の例の型(呼び出しシグネチャのメンバー)と、それを注釈にした関数式はどちらも現在は禁止(下の「オーバーロードの記法」)。

arrow function ではオーバーロードの宣言が書きづらい。型としては call signature の交差で表現できるが、実装側の型付けが緩くなりがち:

```ts
type F = {
    (a: string): string;
    (a: number): number;
};
// 実装シグネチャを個別に検査できず、内部で widening が必要になる
const f: F = (a: string | number): string | number =>
    typeof a === 'string' ? a : a;
```

named function 宣言なら実装シグネチャとオーバーロードシグネチャを言語機能として書ける。

**決定**: オーバーロードを許容し、**named function は「オーバーロードシグネチャを伴う場合のみ」合法**とする。チェッカーは「オーバーロードシグネチャを伴わない `function` 宣言」を拒否する条件付き許可ルールを実装し、**記法の一意性**(同じものを書く方法が 1 つ)を担保する。既存 lint(`prefer-arrow-functions` / `func-style`)ではこの条件付き許可を表現できないため、Sumi lint の新規実装ルールになる。

**実装済み**(`sumi/prefer-arrow-function`、中立 ID `functions/prefer-arrow-function`)。同名の `TSDeclareFunction` が兄弟にあるかを見て条件付きで許可し、`export` で包まれた形も辿る。generator は無条件で許可(D-18)。コーパスの `functions/prefer-arrow-function/valid/arrow-overload-generator.mts` が export 付きオーバーロードと generator を固定している。

なお `func-style` が mono で off になっている理由が「オーバーロードでの誤検出」だったことは、この論点の実在の実運用側の裏付けである([enforcement-map.md](../enforcement-map.md))。

## オーバーロードの記法(確定 2026-09-15 — D-58 判断 3 / 4 の改訂)

**書き方は値に 1 つ、型に 1 つ。** どちらも「呼び出しシグネチャを並べる」形を 1 か所にしか残さない。

値の側の書き方の中身 — 節ごとの関数に分け、`function` 宣言を公開面にし、節から宣言への向きで代入検査する — は [overload-design.md](../overload-design.md)「オーバーロードが必要なときの書き方」にある。lint が現在強制するのは下の表の記法までで、検査行の有無はまだ強制していない。検査行を要求するルールは [#1953](https://github.com/noshiro-pf/mono/issues/1953)(判定は tsc に任せ、lint は行の有無と向きだけを見る)。**振り分け(分岐)の正しさはどちらでも保証しない。** narrowing により節の引数型に合わない呼び出しは型エラーになるが、TypeScript のオーバーロード解決と実行時の分岐が同じ節を選ぶことや、変換を挟んで別の節を呼ぶ誤りは検査されない。

| 書く場所           | 合法な記法                                                       | 禁止する記法                                                                                  | 強制                                                                                                     |
| :----------------- | :--------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| 値(実装)           | `function` 宣言のシグネチャ列挙(記法 (1))                        | 呼び出しシグネチャを 2 本以上持つ型を文脈型にした関数式 — 型リテラル、交差型、alias、`typeof` | `functions/no-overloaded-function-expression`(checker)                                                   |
| 型                 | 関数型の交差 `((a: string) => string) & ((a: number) => number)` | 型リテラル / interface の呼び出しシグネチャ・構築シグネチャのメンバー                         | `functions/no-call-signature-member`                                                                     |
| 呼び出し可能 + 値  | `((v: number) => string) & Readonly<{ label: string }>`          | `{ (v: number): string; readonly label: string }`                                             | 同上                                                                                                     |
| オーバーロード集合 | 隣接し、1 つのシグネチャで言い換えられないもの                   | 間に文を挟む / 戻り値型が同じで 1 引数の型か省略可能性だけが違う組                            | `functions/adjacent-overload-signatures` / `functions/unified-signatures`                                |
| 〃(意味の条件)     | 節が実行時に判別可能で互いに素                                   | 精密化(本体が 1 つしかありえないもの)                                                         | `functions/no-refinement-overload`(**未実装** — [#1952](https://github.com/noshiro-pf/mono/issues/1952)) |

```ts
// ✅ 値: function 宣言
export function parse(value: number): number;
export function parse(value: string): string;
export function parse(value: number | string): number | string {
    return value;
}

// ✅ 型: 交差型。プロパティの型にもそのまま書ける
export type Parse = ((value: number) => number) & ((value: string) => string);
export type Codec = Readonly<{
    encode: ((value: string) => string) & ((value: number) => number);
}>;

// ❌ 型: シグネチャのメンバー
export type ParseLiteral = { (value: number): number; (value: string): string };

// ❌ 値: 複数シグネチャの型に対して関数式を書く(交差型でも)
export const describe: Describe = (value: string | readonly string[]): string => …;
```

**値の側で関数式を例外なく禁じる理由**(実測、TypeScript 7.0.2 / 6.0.3 で同結果):

- **受理される関数式は、自分のシグネチャだけで足りる。** 関数式が複数シグネチャの型に代入できるのは、自分のシグネチャが**各シグネチャに代入可能**なときだけで、それは「どの呼び出しも受け付け、戻り値はどのシグネチャより粗くない」ことを意味する。つまり集合は単一シグネチャ(必要なら rest タプルの union)で書ける精密化であり、D-58 判断 1 によりそう書く。`panic` の `(message: string): never` / `(error: Error): never` がその例で、`typescript/unified-signatures` も報告する。
- **オーバーロードが本当に要る形 — 戻り値が引数に従う — は関数式では `as` 無しに書けない**(`(a: string | number) => string | number` はどちらのシグネチャにも代入不可)。書けるものは要らず、要るものは書けない。
- **検査が最も弱い。** 型リテラルが相手だと型引数が `any` に消去される(D-58 の測定)。交差型なら消去されないが、上の 1 点目によって交差型を注釈にする意味自体が無い。

**型の側でシグネチャのメンバーを例外なく禁じる理由**:

- **交差型が全部を書ける。** D-58 の当初の判断 3 は「`method-signature-style: "property"` の下でオーバーロードされたメンバーを書く唯一の手段」として型の中の呼び出しシグネチャを残したが、**これは誤りだった**。プロパティの型に交差型を書けば同じ解決順序・同じ `Parameters<>` / `ReturnType<>`(最後のシグネチャ)で呼べる(実測)。呼び出し可能な値にプロパティが付く形も交差型で書ける。
- **交差型の方が厳密**(判断 4 の消去の差)。相互代入可能で、generic HOF への推論結果も同じ(どちらも最後のシグネチャから推論 — 実測)。
- **型リテラルが「レコード」だけになる。** `Readonly<>` などの mapped type はプロパティしか写さないので、シグネチャを持つ型を包むと呼べなくなる(#1881)。**これは交差型でも同じ**(`Readonly<F1 & F2>` も TS2349 — 実測)なので、この危険は記法 (2) 固有ではない。ただし readonly 化の codemod と `readonly/require-readonly-type` が包むのは型リテラルであって関数型の交差ではないので、メンバーを禁じれば包まれる型リテラルにシグネチャが入り込む経路が無くなる。
- **interface も対象**(呼び出しシグネチャを持つ interface は型リテラルと同じ問題を持つ)。declaration merging で既存の呼び出し可能な型を拡張する用途は Sumi のコードには無い([modules.md](./modules.md) — `.d.mts` / `.d.sumi` の領分)。

## TS へ戻るときの影響

なし。

## 決定済みの論点(2026-09-06 — D-42)

- **関数の明示的戻り値型は強制**する(`explicit-function-return-type`、現行 lint 運用の追認)。
- default 引数・分割代入引数は **TS 通り許可**(制限しない)。

## 未解決の論点

- **(解決済み — D-58、上の「オーバーロードの記法」)オーバーロードの書き方が 2 つある(2026-09-09、ts-std-forge の `panic` で判明)。** D-13 は named function 宣言を「オーバーロードを書く手段」として許可したが、**arrow でオーバーロードを書く道を塞いでいない**。呼び出しシグネチャを並べたオブジェクト型を注釈にすれば書けてしまう:

    ```ts
    // (1) named function 宣言 — D-13 が想定した形
    export function panic(message: string): never;
    export function panic(error: Error): never;
    export function panic(reason: Error | string): never {
        /* ... */
    }

    // (2) 呼び出しシグネチャのオブジェクト型を注釈した arrow — 現在どのルールも禁止していない
    export const panic: {
        (message: string): never;
        (error: Error): never;
    } = (reason: Error | string): never => {
        /* ... */
    };
    ```

    D-13 の目的が**記法の一意性**である以上、(2) を放置するのはその目的に反する。どちらを正典にするか、あるいは (2) をどこまで許すかが未決。

- **(2) には具体的な危険がある。** `Readonly<T>` などの mapped type は**プロパティだけを写す**ので、呼び出しシグネチャしか持たないオブジェクト型を包むと**呼び出し可能性が黙って消える**。`Readonly<{ (x: string): never }>` は呼べない型になり、利用側が `TS2349: This expression is not callable` になる。実際に mono の `convert-to-readonly` codemod が (2) の注釈を自動で `Readonly<...>` に包み、`panic` を 1 コミットのあいだ壊した(codemod 側の欠陥として [noshiro-pf/mono#1881](https://github.com/noshiro-pf/mono/issues/1881) に記録。型検査を codemod の前に走らせていると緑のまま通る)。(1) にはこの危険が無い。

- **決定(D-58、2026-09-10。型の中の扱いは 2026-09-15 に改訂 — 上の「オーバーロードの記法」)**: (1) を正典として (2) を関数値の型注釈で禁止する。~~ただし**型の中**の呼び出しシグネチャは禁止しない(`method-signature-style: "property"` の下でオーバーロードされたメンバーを書く唯一の手段のため)。~~ → 交差型で書けるので唯一の手段ではなかった。型の中のシグネチャのメンバーも禁止し、値の側は交差型の注釈を含めて関数式を禁止する。あわせて、オーバーロードで書いてよいのは**節が実行時に判別可能で互いに素**なものだけとし、精密化は単一シグネチャで書く。関数**型**を書く場所では呼び出しシグネチャの列挙より交差型を使う。根拠は [overload-design.md](../overload-design.md)。以下は決定前の検討の記録。

- ~~**推奨は (1) を正典として (2) を禁止すること。**~~ 「関数値の型注釈に呼び出しシグネチャを持つオブジェクト型リテラルを書かない」という構文ルールで表せる。ただし呼び出しシグネチャとプロパティを併せ持つ型(関数オブジェクト)を扱う道を同時に塞ぐので、その必要性と併せて決める。

**設計検討は [overload-design.md](../overload-design.md) にまとめた**(TS の実装 4 方式の健全性実測、このリポジトリのオーバーロードの分類(19 個の標本 — 母集団は 157 個)、Sumi sugar の複数節構文の提案)。以下はその材料になった (1) / (2) の測定。

### (1) と (2) の実測(2026-09-10、TypeScript 7.0.2 / 6.0.3 で同結果)

**「(1) で書けるものは (2) に常に書き直せるか」= いいえ。**「解決順序は同じか」= はい。

- **解決順序は完全に同じ。** どちらの記法も**宣言順で最初にマッチしたシグネチャ**を選ぶ。`(a: string | number): 'A'` と `(a: string): 'B'` をこの順で並べて `f('x')` を呼ぶと両記法とも `'A'`、順序を入れ替えると両記法とも `'B'`。`Parameters<>` / `ReturnType<>` がどちらも**最後の**シグネチャを取る点も同じ。
- **書き直せない中核ケース: 戻り値が引数の型で変わるオーバーロード。** `{ (a: string): string; (a: number): number }` に対して実装 `(a: string | number): string | number` は**代入不可**(TS2322)。(2) の実装は**全シグネチャに代入可能**でなければならず、(1) の実装シグネチャ検査(TS2394、各オーバーロードとの緩い互換性)より厳しい。オーバーロードを書く動機そのものが「戻り値が引数で変わる」ことなので、これは例外ケースではなく本丸である。
    - **`<A extends string | number>(a: A): A` のような generic 実装で救えるのは恒等的な形だけ。** 条件型の戻り値(`A extends string ? number : string`)は制約側で評価されて `string | number` になり、代入検査を通らない。
    - **必須引数の数も制約になる。** 実装の必須引数は**最小アリティのシグネチャ以下**でなければならない。`{ (a: string, options: O): void; (a: number): void }` は実装の `options` を optional にしないと書けず、そこで実装側の型が緩む。
    - 全シグネチャの戻り値が同一なら書ける。`panic`(すべて `never`)が (2) で書けていたのはそのため。
- **(2) は「素の引数」では書けない。** 注釈から実装引数への contextual typing は次の順で決まる: (a) 対象の呼び出しシグネチャのうち**アリティが arrow の宣言引数数より小さくないもの**へ絞る、(b) 1 本だけ残ればそれを使う、(c) 複数残れば**各引数位置の union** を取った交差シグネチャを使う。結果:
    - `= (arg1, options) => {}` は TS2322 で落ちる — アリティ 2 のシグネチャだけが残って `options` が**必須**になり、アリティ 1 のシグネチャを満たせなくなる。
    - `= (arg1, options?) => {}` は通るが、両シグネチャが残るため `arg1: string | number`、**`options: unknown`**(2 本目にその位置の引数が無いため)になる。型注釈を書いた意味がほぼ消える。
    - つまり (2) を使うなら実装引数に union 注釈を明示する以外になく、`explicit-function-return-type` と併せて**注釈を 2 度書く**ことになる。
- **健全性は一長一短で、どちらも穴がある。**
    - **(1) は本体を検査しない。** 実装シグネチャとの互換性しか見ないので、`function f(a: string): string; function f(a: number): number;` の実装が両方について**逆の型を返しても通る**(実測)。
    - **(2) は非 generic なら本体側の嘘を捕まえる**(上の代入検査がそのまま効く)。
    - **ただし (2) は generic かつシグネチャが 2 本以上のとき検査が抜ける。** 対象が複数の呼び出しシグネチャを持つ場合 TypeScript は**型引数を `any` に消去して**比較するため(`getErasedSignature`)、`{ <A>(a: A): A; <A>(a: A, b: A): A }` に対して実装 `<A,>(a: A, b?: A): number` が**通る**。シグネチャが 1 本なら同じ実装は TS2322 で落ちる。generic オーバーロードでは (1) と同じく無防備になる。
- **その他の非型的な差**: `function` 宣言は巻き上げられるが `const` は TDZ に入る(モジュール評価時に前方参照すると TS2448 / TS2454)。`this` 引数・generic シグネチャ・`erasableSyntaxOnly` はどちらも問題なく書ける。
- **`Readonly<>` の危険(既出)は (2) 固有。**(2026-09-15 訂正: 固有ではない。関数型の交差も `Readonly<>` で包むと呼べなくなる — 上の「オーバーロードの記法」。) ただし危険なのは**呼び出しシグネチャの型そのものを mapped type で包む**場合に限る。`Readonly<{ find: { (a: string): X; (a: number): Y } }>` のようにプロパティ越しなら `find` の型は写されないので壊れない — `method-signature-style: "property"` の下でオーバーロードされた**メンバー**を書く唯一の手段はこの形なので、(2) の記法を型の中で全面禁止することはできない。
- **リポジトリの現況(2026-09-10 実測)**: (1) は 17 ファイル・31 シグネチャ(2026-09-16 注: 数え漏れ。`libs/` だけで 157 関数)。(2) は **0 件**(`panic` は #1881 のあと (1) に戻っている)。今 (2) を禁止しても既存コードへの影響は無い。
