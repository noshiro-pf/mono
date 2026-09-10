<!-- cspell:ignore Kotlin GADT foldl foldr -->

# オーバーロードの設計(TS 実装の堅牢化と Sumi sugar の構文)

[overload-survey.md](./overload-survey.md)(他言語比較)と
[spec/functions.md](./spec/functions.md) の「未解決の論点」を受けた設計検討。
**過去の決定(D-13 / D-17 / 候補 8)を前提に置かず、実測から設計を組み直す。**
測定はすべて TypeScript 7.0.2 と 6.0.3 の両方で行い、結果は一致している。

## 結論

1. **TS のオーバーロードの弱点は「1 つの本体が N 個のシグネチャを名乗る」ことに尽き
   る。** 堅牢な実装方式とは例外なく「本体を 1 シグネチャ 1 つに戻す」やり方である。
2. **このリポジトリの 19 個のオーバーロードのうち、引数の実行時の型で分岐するもの
   は `panic` の 1 個だけ。** 残りは arity(カリー化)か、**分岐の無い戻り値型の精密
   化**である。「オーバーロード」という一語が 3 つの別物を指している。
3. したがって **Sumi sugar に「オーバーロード」機能を作るべきではない。** 代わりに
   (a) **複数節関数**(節ごとに本体を持ち、実行時に判別可能な場合のみ)と、
   (b) **精密化は単一シグネチャで書かせる**、の 2 つに分解する。**判別可能性と互い
   に素であることが、この 2 つを分ける唯一の判定条件**になる。
4. Sumi lint(今日の TS)では、記法 (1)(named function 宣言)を正典とし、関数**型**
   を書く必要がある場所では **呼び出しシグネチャの列挙ではなく交差型**を使う。理由は
   下記の消去(erasure)の実測。

## 実測 1: TS の 4 方式の健全性

| 方式                                         | 本体の検査                     | 解決順序 | generic |
| :------------------------------------------- | :----------------------------- | :------- | :------ |
| (1) `function` 宣言のシグネチャ列挙          | **しない**                     | 宣言順   | 可      |
| (2a) `const f: { (…): X; (…): Y }`           | する(ただし generic は消去)    | 宣言順   | 可      |
| (2b) `const f: ((…) => X) & ((…) => Y)`      | **する(消去されない)**         | 宣言順   | 可      |
| (3) 節ごとの関数 + dispatch + 適合性アサート | **する(型引数越しの嘘を除く)** | 宣言順   | 可      |

- **解決順序はどの方式でも同一**(宣言順で最初にマッチしたものが勝つ)。
  `Parameters<>` / `ReturnType<>` がどれも**最後の**シグネチャを取る点も同じ。
- **(1) は本体をまったく検査しない。** 2 つのオーバーロードについて**両方とも逆の型
  を返す**実装が通る(実測)。
- **(2a) の generic は消去される。** 対象が呼び出しシグネチャを 2 本以上持つとき
  TypeScript は型引数を `any` に置換して比較するため(`getErasedSignature`)、
  `{ <A>(a: A): A; <A>(a: A, b: A): A }` に実装 `<A,>(a: A, b?: A): number` が**通る**。
  シグネチャが 1 本なら同じ実装は TS2322 で落ちる。
- **(2b) の交差型は消去されない。** 上と同じ組を `(<A>(a: A) => A) & (<A>(a: A, b: A) => A)`
  と書くと**拒否される**。構造的には (2a) と相互代入可能で、解決順序も同じ。
  **関数型を書くなら交差型が厳密に優れている。**
- **(3) の適合性アサートの限界**: `const _: typeof arm1 & typeof arm2 = f;` は宣言が
  節と食い違えば落ちるが、**型引数を通した嘘は素通しする**(source 側が 2 本以上の
  シグネチャを持つため、ここでも消去が効く)。`function f<E>(xs: readonly E[]): E` が
  実際には `number` を返す、という嘘は捕まらない。

### (1) → (2) への書き直しは常にはできない

**戻り値が引数の型で変わるオーバーロード** — つまりオーバーロードを使う動機そのもの —
は (2) で書けない。`{ (a: string): string; (a: number): number }` に実装
`(a: string | number): string | number` は代入不可。`<A extends string | number>(a: A): A`
のような generic 実装で救えるのは恒等的な形だけで、条件型の戻り値は制約側で評価されて
union になり通らない。**必須引数の数**も制約で、実装の必須引数は最小アリティのシグネ
チャ以下でなければならない。

素の引数(`= (a, options) => …`)も書けない。contextual typing は
「アリティが arrow の宣言引数数より小さくないシグネチャに絞り、1 本ならそれを、複数
なら各引数位置の union を取った交差シグネチャを使う」ため、`(a, options) =>` は
`options` が必須になってアリティ 1 のシグネチャを満たせず TS2322、`(a, options?) =>`
は通るが `options: unknown` になる。

## 実測 2: このリポジトリのオーバーロードは何をしているか

17 ファイル・31 シグネチャ・**19 個の関数**を分類した。

| 種別                                 | 個数 | 例                                                      | 実行時分岐 |
| :----------------------------------- | ---: | :------------------------------------------------------ | :--------- |
| **A. arity / データ第一 + カリー化** |    6 | `count` `countBy` `foldl` `foldr` `source` `expectToBe` | 引数の個数 |
| **B. 省略可能引数の条件付き**        |    5 | `min` `max` `minBy` `maxBy` `fromPromise`               | 引数の有無 |
| **C. 戻り値型の精密化のみ**          |    4 | `unwrap` `unwrapOk`×2 `pipe`                            | **無し**   |
| **A+C 混在**                         |    3 | `useObservableValue`×3                                  | 引数の個数 |
| **D. 引数の実行時の型による分岐**    |    1 | `panic(string) / panic(Error)`                          | `typeof`   |

**「オーバーロード」が古典的に意味するもの(D)は 19 個中 1 個。** C は分岐が一切なく、
本体は 1 つで、オーバーロードは「入力が `Some` と分かっているなら戻り値から
`undefined` を落とす」という**型レベルの主張**にすぎない。A はカリー化形の提供という
TS 固有の事情から来ている。

## 堅牢な TS 実装レシピ(種別ごと)

### C(精密化) — オーバーロードをやめて単一シグネチャにする

2 つのオーバーロード + 本体の `as` は、**条件型の戻り値を持つ単一シグネチャ + 同じ
`as`** と**呼び出し側の挙動が完全に一致する**(実測)。後者は「TS が一切検査しない
宣言」が 2 本消え、`as` が 1 か所に残るだけになる。検査されない主張が**明示され、
grep できる**形になるのが本質的な改善。

**さらに良いのは、精密化が成り立つようにデータ側を作り直すこと。** 射影が全域になれば
TypeScript が自分で証明するので、条件型も `as` も要らなくなる。**C の正しい解決は言語機能
ではなくデータ設計**である。ただし実物に当てると `Optional` と `Result` で答えが割れる。

#### `Optional`: ほぼ無償で成立する(推奨)

現状は `None` が `value` を持たないので `unwrap` は 2 本のオーバーロード + `as` になる。
**`None` の型に省略可能プロパティを 1 つ足すだけ**で射影が全域になる:

```ts
export type None = Readonly<{
    $$tag: 'ts-data-forge::Optional.none';

    /** 常に不在。`Optional.unwrap` の射影を全域にするためだけの型上の宣言。 */
    value?: undefined;
}>;

// 2 本のオーバーロードと 1 個の `as` と eslint-disable が、これ 1 行に置き換わる
export const unwrap = <const O extends UnknownOptional>(
    optional: O,
): O['value'] => optional.value;
```

**`?:` にするのが要点**で、これで `無駄なプロパティ` の懸念は消える:

- **ランタイムは 1 バイトも変わらない。** `none` は今までどおり `{ $$tag: … }` のままで、
  `value` キーは**存在しない**。`?:` は「不在または `undefined`」を意味するので、型は
  実物を正確に述べている(嘘ではない)。`Object.keys(none)`、`'value' in none`、
  `deepStrictEqual(none, { $$tag: … })` の結果はどれも現状と同じ。
- **`as` も要らない。** `const none: None = { $$tag: NoneTypeTagName }` は今の字面のまま通る。
  必須プロパティ(`value: undefined`)にすると逆に定義側で `value: undefined` を書く必要が
  生じるので、そちらは採らない。
- **型の精密化は現状と完全に同値**(実測): `Some<number>` なら `number`、
  `Optional<number>` なら `number | undefined`。`Unwrap<O>` を使った現状の推論と一致する。
- **破壊的変更ではない。** 公開 API の増分は「`None` 型の値に `.value` と書くと `undefined`
  になる」だけで、既存のコードは 1 行も壊れない。
- 代償は 2 つ: (a) `Optional.unwrap` を使わず `.value` を直接読む書き方が型として可能になる
  (`Some` については元から可能だったので、増えるのは `None` の側だけ)、(b) `exactOptionalPropertyTypes`
  を将来 `true` にする場合の再確認 — 現在は Sumi の拘束 compilerOptions で `false` に固定
  されているので今日の問題ではない。

#### `Result`: 同じ手は使えない(現状維持を推奨)

`Ok<S>` と `Err<E>` は**どちらも `value` を持っている**(`Err.value` はエラー値)。したがって
`r.value` は `S | E` であって、`unwrapOk` が欲しい `S | undefined` にはならない。全域にするには
**キーを分ける**しかない:

```ts
export type Ok<S> = Readonly<{ $$tag: '…ok'; value: S; error?: undefined }>;
export type Err<E> = Readonly<{ $$tag: '…err'; error: E; value?: undefined }>;
// unwrapOk = (r) => r.value   → R['value'] = S | undefined
// unwrapErr = (r) => r.error  → R['error'] = E | undefined
```

概念的にはこちらが正しい(Err が抱えているのは「値」ではなく「エラー」である)。しかし
**`Err.value` は公開 API として実際に使われている** — ts-std-forge の JSDoc の例だけでも
`assert.deepStrictEqual(errResult.value, { kind: 'invalid-number', … })` の形が多数あり、
これは README とドキュメントに出る面である。`value` → `error` の改名は published パッケージの
破壊的変更で、得られるのは `unwrapOk` 系 2 個(Result / TernaryResult)のオーバーロード解消に
とどまる。**割に合わない。**

`Ok` に `okValue` を増やす等の非破壊案は**ペイロードを実体として二重に持つ**ことになり、
ここでは本当に無駄なプロパティなので採らない(`Optional` の `?:` が無償なのは、増えるのが
型だけでランタイムに何も増えないからである)。

したがって **`Result` の `unwrapOk` は C の一般解 — 条件型の戻り値を持つ単一シグネチャ +
1 個の `as` — に留める。** オーバーロード宣言 2 本が消えて、検査されない主張が 1 か所に
明示されるところまでは同じように得られる。

### B(省略可能引数) — 条件付き rest タプルで単一シグネチャにする

```ts
type CmpRest<Ar extends readonly unknown[]> = Ar extends readonly number[]
    ? readonly [comparator?: Cmp<Ar[number]>]
    : readonly [comparator: Cmp<Ar[number]>];

export const min = <const Ar extends readonly unknown[]>(
    array: Ar,
    ...rest: CmpRest<Ar>
): Ar[number] | undefined => {
    // 本体では `Ar` が未解決なので条件型が両枝の union に潰れる。`as` はここだけ。
    const comparator = rest[0] as Cmp<Ar[number]> | undefined;
    /* … */
};
```

呼び出し側の挙動は 2 本のオーバーロードと同じ(数値配列なら省略可、それ以外は必須。
実測)。代償は本体で `rest[0]` を取り出す 1 か所の `as`。

**`readonly` は問題なく書ける(2026-09-10 訂正)。** この文書の初版は「rest 引数のタプルは
mutable に正規化されるので `readonly` にできず D-45 と衝突する」と書いたが**誤りだった**。
上のとおり両枝を `readonly` で書いた形は宣言も呼び出しも通り、`sumi/require-readonly-type`
も報告しない(preset を実際に走らせて確認)。mutable で書けば同ルールが両枝を報告するので、
**ルールの言うとおりに `readonly` を付ければ正しくなる**。初版が見ていた失敗は別物で、
**実装を別の関数に切り出して alias に代入する形**でだけ起きる — その形では実装側の rest が
普通の省略可能引数へ正規化され、`readonly` タプルとの variance が合わない。**実装を直接
書く限り摩擦は無い。**

### A(arity) — パイプ演算子で需要ごと消す

データ第一形とカリー化形の二本立ては「TS に自動カリー化が無い」ことへの補償であり、
カリー化形の主用途は `pipe` への部分適用渡しである([overload-survey.md](./overload-survey.md)
の例 1)。**候補 1(パイプ演算子)が入れば A の 6 個 + 混在 3 個、つまり 19 個中 9 個
のオーバーロードが不要になる。** 記法を設計するより先に測るべき接続。

#### Sumi lint での答え: `pipe` に引数を渡せるメソッドを足す(構文不要)

パイプ演算子は sugar の機能なので、Sumi lint(合法 TS)には別の答えが要る。**カリー化形が
何のために存在するかを見ると、答えは構文ではなくライブラリにある。**

`pipe` は可変長の `pipe(f, g, h)` ではなく **fluent builder**(`pipe(x).map(f).value`)である。
`.map` は関数を 1 つ取るので、そこへ `Arr.count(pred)` のような**部分適用済みの関数**を渡す
ためにカリー化形が要る(使用箇所 20 か所、`ts-restrictions/prefer-curried-call` が推奨しても
いる)。つまり**カリー化形の存在理由は `.map` が引数を 1 つしか渡せないこと**に尽きる。

そこで `.map` の隣に「残りの引数も一緒に渡す」メソッドを 1 つ足す:

```ts
mapWith: <const Rest extends readonly unknown[], B>(
    fn: (a: A, ...rest: Rest) => B,
    ...rest: Rest
) => Pipe<B>;
// pipe(x).mapWith(f, ...rest) === pipe(f(x, ...rest))
```

```ts
// before(カリー化形のオーバーロードが要る)
pipe(xs).map(Arr.count((x) => x > 1)).value;

// after(データ第一形だけで足りる)
pipe(xs).mapWith(Arr.count, (x) => x > 1).value;
```

実測: `Rest` の推論は効き、**コールバック引数 `(x) => x > 1` の `x` も文脈から推論される**
(注釈不要)。チェーンも従来どおり。したがって **A のカリー化オーバーロードは新構文を待たず
今日そのまま削除できる。**

これは D-37 が要求する「sugar 構文の Sumi lint ライブラリ形」そのものでもある:

| 層         | 書き方                                           |
| :--------- | :----------------------------------------------- |
| Sumi lint  | `pipe(xs).mapWith(Arr.count, pred).value`        |
| Sumi sugar | `xs \|> Arr.count(^, pred)`(記法は候補 1 で確定) |

両向きの codemod は機械的(`.mapWith(f, ...args)` ↔ `f(^, ...args)`)。**パイプ演算子の採否
を待たずに `mapWith` を先に入れれば A の 9 個は先に消える**ので、複数節構文の必要性は D の
1 個だけを相手に判断すればよくなる。

### D(実行時分岐) — 節ごとの関数 + narrowing dispatch

`as` を一切使わずに書ける唯一の形:

```ts
const showString = (s: string): string => s;
const showNumber = (n: number): number => n;

export function show(a: string): string;
export function show(a: number): number;
export function show(a: number | string): number | string {
    return typeof a === 'string' ? showString(a) : showNumber(a);
}

// 宣言と節の食い違いを捕まえる 1 行(型引数越しの嘘は捕まらない — 上記の限界)
const showConforms: typeof showNumber & typeof showString = show;
```

各節が自分のシグネチャで完全に検査され、**dispatch の取り違えは narrowing が型エラー
にする**。残る穴は「宣言の戻り値型と節の戻り値型の食い違いのうち、型引数を通したもの」
だけ — これは**同じシグネチャを 2 か所に書いていること**に由来するので、**片方から
もう片方を生成すれば消える**。それが sugar の仕事になる。

### 使えなかった方式: dispatch コンビネータ

`overload(arm(guard, fn), …)` で公開型を節から**導出**する形も作って測った。導出型は
嘘をつきようがないので構成的に健全だが、**generic な節の型引数が失われる**
(`head([1,2,3])` が `unknown` になる)。条件型は型引数を捕捉して再量化できないため、
どう書いても回避できない。このリポジトリのオーバーロードはほぼ全部 generic なので**不採用**。

## 他言語調査からの含意

[overload-survey.md](./overload-survey.md) の 3 分類に、上の測定を重ねると:

- **Swift / Kotlin / C# / C++ の「実装分離オーバーロード」は D にしか効かない。** 各実装が
  自分の型で検査されるという長所は、本体が 1 つしかない B / C には持ち込めない。
- **Elixir / Erlang の複数節も同じく D 向け**だが、`when` guard を構文に持つ点が重要で、
  「判別可能性」を言語が要求している。Sumi が採るべきはこの厳しさの方である。
- **Haskell / OCaml の自動カリー化は A の需要を消す。** パイプ演算子はその部分的な代替。
- **型クラス / trait は open なアドホック多相**で、D の閉じた分岐とは別物。非目標のままでよい。
- **どの言語も C(戻り値型の精密化)をオーバーロードで解いていない。** Haskell なら
  GADT / 型族、Rust なら関連型の領分で、いずれも「関数を複数書く」話ではない。
  **C をオーバーロードで書くのが TS 固有の歪み**であることが、言語間比較から裏付けられる。

## Sumi sugar の構文(提案)

### 原則: 「1 つの本体が N 個のシグネチャを名乗る」形を書けなくする

これが TS の不健全性の発生源そのものなので、**構文として不可能にする**。帰結:

- **実行時に分岐するもの(D)は、節ごとに本体を書く。**
- **本体が 1 つのもの(B / C)は、シグネチャも 1 つ。**

### 複数節関数

```text
fn panic(message: string) -> never {
  panic(Error(message))
}

fn panic(error: Error) -> never {
  markAsPanic(error)
  throw error
}
```

チェッカーが要求する条件:

1. **同名の節は隣接**していること(間に他の宣言を挟まない)。
2. **実行時に判別可能**であること。判別手段は (i) 引数の個数、(ii) 引数の `typeof`、
   (iii) 判別可能 union のタグ、(iv) 明示的な `when <guard>` のいずれか。
3. **節どうしが互いに素**であること。

条件 3 は TS より**厳しくする**意図的な選択である。TS の「最初にマッチしたものが勝つ」
は、重なり合うシグネチャを書いたときに**順序が黙って意味を持つ**ことを許す。互いに素を
要求すれば順序は意味を失い、この種のバグが構文レベルで消える。

そして **条件 2 と 3 は、D と B / C を分ける判定条件そのもの**である。`min` の 2 本
(`readonly number[]` ⊂ `readonly unknown[]`)も `useObservableValue` の
`InitializedObservable` ⊂ `Observable` も、判別不能かつ互いに素でないので**複数節では
書けない** — 単一シグネチャへ誘導される。この設計は「精密化をオーバーロードで書く」
という歪みを構文で塞ぐ。

### emit

節の本体を dispatcher の各枝に**インライン展開**する。人が書くのと同じ形になり、
各枝の本体は narrowing 後の型で tsc が検査する:

```ts
export function panic(message: string): never;
export function panic(error: Error): never;
export function panic(reason: Error | string): never {
    if (typeof reason === 'string') {
        return panic(new Error(reason));
    }

    markAsPanic(reason);
    throw reason;
}
```

tsc が検査しないのは「宣言ごとの戻り値型」だけで、そこは **Sumi のチェッカーが節ごと
に検査済み**である(大原則 1 — チェッカーは拒否するだけで意味を変えない — と整合)。
節ごとの関数へ切り出す emit(上の「D のレシピ」)は tsc だけで全部検査できるが、
生成名(`panic_string` 等)が出るぶん eject 品質が落ちる。**検査は Sumi 側が持つので、
読みやすい方を採る。**

### 精密化(B / C)には構文を足さない

- **C**: 単一シグネチャ + 条件型の戻り値。**推奨はデータ側を直して射影を全域にすること**
  (`None` に `value: undefined` を持たせる)。これは ts-std-forge の設計課題であって
  言語機能ではない。残る `as` は Sumi refined で「宣言された有限個のケースごとに本体を
  検査する」ことで初めて消える — **TS が拒む「本体を N 回検査する」を自前検査器がやる**
  というのが筋の通った最終形。
- **B**: 条件付き rest タプル。`readonly` にできない問題は D-45 の例外として仕様化が要る。

### Sumi lint(今日)への帰結

1. **記法 (1) を正典、(2) は関数値の型注釈で禁止。** 理由は `Readonly<>` の危険だけでは
   なく、戻り値が変わるオーバーロードを表現できないこと・generic で検査が消去されること。
   ただし**型の中の呼び出しシグネチャは禁止できない** — `method-signature-style: "property"`
   の下でオーバーロードされたメンバーを書く唯一の手段だからである。
2. **新規ルール候補 `functions/prefer-intersection-call-signature`**: 関数型を書くとき、
   呼び出しシグネチャの列挙より交差型を要求する。消去の差ぶん厳密になる。
3. **新規ルール候補 `functions/no-refinement-overload`**(高価値): オーバーロード集合が
   **実行時に判別可能でない**とき — つまり本体が 1 つしかありえないとき — 拒否し、単一
   シグネチャへ誘導する。現状 19 個中 12 個が該当し、Sumi sugar の複数節構文への移行が
   そのぶん機械的になる。
4. D-13 の「named function はオーバーロード時のみ」は維持でよい。ただし**根拠が変わる**:
   「arrow ではオーバーロードが書きにくいから」ではなく、「実行時分岐のオーバーロードは
   (1) でしか `as` 無しに書けないから」である。

## 決定と残タスク(2026-09-10)

決定は **D-58** に記録した。この文書が正典として残すのは測定と根拠である。

実装の残タスク(いずれも独立に着手できる):

1. **`pipe` に `mapWith` を足す**(ts-std-forge)。カリー化オーバーロード 9 個の削除は
   その後の別作業で、`ts-restrictions/prefer-curried-call` の去就も併せて決める。
2. **`None` に `value?: undefined` を足し、`Optional.unwrap` を単一シグネチャにする**
   (ts-std-forge)。ランタイム変更なし・破壊的変更なし。
3. **`Result` / `TernaryResult` の `unwrapOk` を条件型の単一シグネチャへ**。`Err.value` の
   改名はしない。
4. **`min` / `max` / `minBy` / `maxBy` を条件付き rest タプルへ**(ts-data-forge)。
5. **`functions/no-refinement-overload` の実装**。1〜4 が終われば対象は `panic` 以外ほぼ
   無くなるので、**新規の逆行を止めるための番人**という位置づけになる。
6. **`functions/prefer-intersection-call-signature` の実装**。現状の違反は 0 件。

未決のまま残るもの:

- Sumi sugar の複数節構文を**そもそも入れるか**。1〜4 のあと実行時分岐のオーバーロードが
  `panic` の 1 個だけになるなら、構文を足す価値があるかは改めて判断する(D-58 の判断 2 は
  「入れるならこの形」であって「入れる」ではない)。
- パイプ演算子(候補 1)の記法そのもの — プレースホルダの字面は候補 1 の担当。
