<!-- cspell:ignore defimpl defprotocol -->

# オーバーロード代替の言語間比較(調査)

[spec/future-syntax.md](./spec/future-syntax.md) 候補 8(`fn` とオーバーロード記法)・D-13 の設計材料。**同じ関数を各言語で書き比べる**ことで、「オーバーロード」という一つの構文が実際には何に分解されているかを確認する。

結論を先に: オーバーロードの需要は 3 種類に分解され、言語ごとに担う機構が違う。

1. **arity 差**(直接形とカリー化形の二本立てなど)— 自動カリー化を持つ言語では**需要そのものが消える**。
2. **引数型による閉じた分岐** — union + narrowing でも書ける。オーバーロードは可読性の選択。
3. **open なアドホック多相**(後から対応型を追加できる)— trait / 型クラス / protocol の領分で、TS のオーバーロードはこれを持たない。

## 例 1: arity オーバーロード — 直接形 + カリー化形

ts-data-forge の全 API が持つ二本立て(`Optional.map(o, f)` / `Optional.map(f)`)の最小化: `add(a, b)` と `add(a)`(部分適用を返す)。

### TypeScript(シグネチャ列挙 + 単一実装)

```ts
function add(a: number, b: number): number;
function add(a: number): (b: number) => number;
function add(
    ...args: readonly [a: number, b: number] | readonly [a: number]
): number | ((b: number) => number) {
    switch (args.length) {
        case 2:
            return args[0] + args[1];
        case 1:
            return (b) => args[0] + b;
    }
}
```

実装が 1 つで全ケースを捌く。実装シグネチャはオーバーロード列との突き合わせが緩く、`args.length` の分岐と宣言の対応は検査されない(ts-data-forge の実装が複雑になる根源)。

### Elixir(multiple function clauses — arity は名前の一部)

```elixir
def add(a, b), do: a + b
def add(a), do: fn b -> a + b end
```

Elixir では関数は `add/2` と `add/1` という**別名の関数**であり、clause ごとに完全に独立。dispatch は言語が行う。Tsubu 案 B(実装分離)が生成したい形はこれと同型。

### Swift(実装分離オーバーロード)

```swift
func add(_ a: Int, _ b: Int) -> Int { a + b }
func add(_ a: Int) -> (Int) -> Int { { b in a + b } }
```

各実装が自分のシグネチャで完全に型検査される。Kotlin / C# / C++ も同じ形。

### Haskell / OCaml(自動カリー化 — **需要が消える**)

```haskell
add :: Int -> Int -> Int
add a b = a + b

-- add 1 がそのまま「カリー化形」。宣言は 1 つで両方の使い方ができる
inc = add 1
```

```ocaml
let add a b = a + b
let inc = add 1
```

「区別がつかない」のではなく**区別が不要**: すべての関数が常にカリー化されているため、直接形とカリー化形の二本立てという需要自体が存在しない。ts-data-forge の二本立ては「TS に自動カリー化がない」ことへの補償だと分かる。

### Rust(オーバーロードなし — クロージャで足りる)

```rust
fn add(a: i32, b: i32) -> i32 { a + b }

// カリー化形は宣言しない。使用側でクロージャを作る:
let inc = |b| add(1, b);

// どうしても関数として返すなら:
fn add_curried(a: i32) -> impl Fn(i32) -> i32 { move |b| a + b }
```

**教訓(例 1)**: arity オーバーロードは「自動カリー化なし + 部分適用を API として提供したい」という TS 固有の条件から生まれる。Tsubu v2 で仮にパイプ演算子(候補 1)が入りカリー化形の主用途(`pipe` への部分適用渡し)が構文で置き換わると、この需要自体が縮む可能性がある — 記法設計の前に確認する価値がある接続。

## 例 2: 型オーバーロード — `show`(値を表示文字列へ)

Haskell の `Show` に相当する関数を各言語で。ここでの本題は**閉じた分岐か open な多相か**。

### TypeScript(閉じたオーバーロード。union + narrowing でも同じ)

```ts
function show(value: number): string;
function show(value: boolean): string;
function show(value: boolean | number): string {
    return typeof value === 'number'
        ? value.toString()
        : value
          ? 'true'
          : 'false';
}
```

対応型を増やすには**この宣言自体を編集する**しかない(closed)。

### Swift / Kotlin(実装分離オーバーロード — こちらも closed)

```swift
func show(_ value: Int) -> String { String(value) }
func show(_ value: Bool) -> String { value ? "true" : "false" }
```

### Haskell(型クラス — open)

```haskell
class Show a where
  show :: a -> String

instance Show Bool where
  show True  = "true"
  show False = "false"
```

### Rust(trait — open)

```rust
trait Show { fn show(&self) -> String; }

impl Show for i32  { fn show(&self) -> String { self.to_string() } }
impl Show for bool { fn show(&self) -> String { self.to_string() } }
```

### Elixir(protocol — open、動的 dispatch)

```elixir
defprotocol Show do
  def show(value)
end

defimpl Show, for: Integer do
  def show(n), do: Integer.to_string(n)
end
```

### OCaml(どちらも持たない — 別名関数)

```ocaml
(* オーバーロードなしの帰結として有名な標準ライブラリの形 *)
string_of_int : int -> string
string_of_bool : bool -> string
```

**教訓(例 2)**: 型クラス / trait / protocol は「定義後に対応型を**外から**追加できる」(open)点でオーバーロードと本質的に異なる。TS のオーバーロードは closed な構文糖であり、open にしたければ interface + 構造的型で別の設計をする。OCaml の別名関数方式は最も原始的だが、名前に意図が現れるという美点もある(D-15 の「生成関数を名前で分ける」方針はこの系)。

## Tsubu への含意

- **v1**: TS の閉じたオーバーロード(単一実装)を D-13 の条件付きで許容。ts-data-forge の二本立て API がそのまま書ける。
- **v2 案 A**: `fn` にシグネチャ列挙を統合(記法改善のみ、1:1 emit)。
- **v2 案 B**: Elixir/Swift 型の実装分離 clause。emit は例 1 の TS コード(`args.length` switch)を transpiler が生成する形になり、**ts-data-forge が手書きしている dispatch がまさに生成対象のテンプレート**になる。clause が実行時判別可能(arity か `typeof`/タグ)という制約はこの例で言えば「`[number, number]` と `[number]` は length で判別可」。
- **open なアドホック多相(型クラス級)は非目標**: 構造的型 + union が部分代替であり、導入すると型検査器の大工事(v3 でも大きい)。例 2 の closed で足りる場面に限って overload を使う、という線引きを保つ。
- パイプ演算子(候補 1)導入時に**カリー化形二本立ての需要が縮む**可能性を、記法確定前に再評価する。
