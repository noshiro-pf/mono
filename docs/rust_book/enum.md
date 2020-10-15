# 6 Enum とパターンマッチング

## 6.1 [Enum を定義する](https://doc.rust-jp.rs/book-ja/ch06-01-defining-an-enum.html#enum%E3%82%92%E5%AE%9A%E7%BE%A9%E3%81%99%E3%82%8B)

定義

```rust
enum IpAddrKind {
    V4,
    V6,
}
```

使用

```rust
let four = IpAddrKind::V4;
let six = IpAddrKind::V6;
```

関数の仮引数

```rust
fn route(ip_type: IpAddrKind) { }
```

呼び出し

```rust
route(IpAddrKind::V4);
route(IpAddrKind::V6);
```

現状では、どんな**種類**であるかを知っているだけであり、実際の IP アドレスの**データ**を保持する方法が無い。

構造体を使って次のように解決することはできるが…

```rust
enum IpAddrKind {
    V4,
    V6,
}

struct IpAddr {
    kind: IpAddrKind,
    address: String,
}

let home = IpAddr {
    kind: IpAddrKind::V4,
    address: String::from("127.0.0.1"),
};

let loopback = IpAddr {
    kind: IpAddrKind::V6,
    address: String::from("::1"),
};
```

各 enum の列挙子に直接データを格納して、enum を構造体内に使うというよりも enum だけを使って、 同じ概念をもっと簡潔な方法で表現することができる。

```rust
enum IpAddr {
    V4(String),
    V6(String),
}

let home = IpAddr::V4(String::from("127.0.0.1"));

let loopback = IpAddr::V6(String::from("::1"));
```

この新しい`IpAddr`の定義は、`V4`と`V6`列挙子両方に`String`値が紐付けられていることを述べている。
enum の各列挙子にデータを直接添付できるので、余計な構造体を作る必要は全くない。

---

構造体よりも enum を使う別の利点：各列挙子に紐付けるデータの型と量は異なっても良い

```rust
enum IpAddr {
    V4(u8, u8, u8, u8), // V4のアドレスは、4つのu8型の値として格納
    V6(String), // V6のアドレスは引き続き、単独のString型に
}

let home = IpAddr::V4(127, 0, 0, 1);

let loopback = IpAddr::V6(String::from("::1"));
```

---

実際には、IpAddr 型は標準ライブラリに用意されている。
[Enum std::net::IpAddr](https://doc.rust-lang.org/std/net/enum.IpAddr.html)

以下のように定義されている。

```rust

struct Ipv4Addr {
    // 省略
}

struct Ipv6Addr {
    // 省略
}

enum IpAddr {
    V4(Ipv4Addr),
    V6(Ipv6Addr),
}
```

これを見ると分かるように、enum 列挙子内にはいかなる種類のデータでも格納できる。
（文字列、数値型、構造体だけでなく、**他の enum**も！）

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

構造体を使って似たことをしようとすると

```rust
struct QuitMessage; // ユニット構造体
struct MoveMessage {
    x: i32,
    y: i32,
}
struct WriteMessage(String); // タプル構造体
struct ChangeColorMessage(i32, i32, i32); // タプル構造体
```

のようになるが、これらは各々それ自身の型があるので、これらの種のメッセージいずれもとる関数を簡単に定義することができない。

---

impl を使って構造体にメソッドを定義できるのと全く同様に、 enum にもメソッドを定義することができるのです。

```rust
impl Message {
    fn call(&self) {
        // method body would be defined here
        // メソッド本体はここに定義される
    }
}

let m = Message::Write(String::from("hello"));
m.call();
```

構造体のとき：

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };

    println!(
        "The area of the rectangle is {} square pixels.",
        rect1.area()
    );
}
```

## [Option](https://doc.rust-jp.rs/book-ja/ch06-01-defining-an-enum.html#option-enum%E3%81%A8null%E5%80%A4%E3%81%AB%E5%8B%9D%E3%82%8B%E5%88%A9%E7%82%B9) enum と Null 値に勝る利点

enum の代表例

null の開発者であるトニー・ホーア(Tony Hoare)の 2009 年のプレゼンテーション、 "Null References: The Billion Dollar Mistake"(Null 参照: 10 億ドルの間違い)では、こんなことが語られています。

> 私はそれを 10 億ドルの失敗と呼んでいます。その頃、私は、オブジェクト指向言語の参照に対する、 最初のわかりやすい型システムを設計していました。私の目標は、 どんな参照の使用も全て完全に安全であるべきことを、コンパイラにそのチェックを自動で行ってもらって保証することだったのです。 しかし、null 参照を入れるという誘惑に打ち勝つことができませんでした。それは、単純に実装が非常に容易だったからです。 これが無数のエラーや脆弱性、システムクラッシュにつながり、過去 40 年で 10 億ドルの苦痛や損害を引き起こしたであろうということなのです。

null 値の問題は、null の値を null でない値のように使用しようとしたら、何らかの種類のエラーが出ることである。しかし null が表現しようとしている概念自体は有用である。
問題は、全く概念にあるのではなく、特定の実装にある。

Rust には null は無いが、代わりに値が存在するか不在かという概念をコード化する enum として`Option<T>`が存在する。以下のように標準ライブラリに定義されている。

```rust
enum Option<T> {
    Some(T),
    None,
}
```

これらはあまりにも当たり前に使うので明示的にスコープに導入する必要がない。

例：

```rust
let some_number = Some(5);
let some_string = Some("a string");

let absent_number: Option<i32> = None;
```

`Option<T>`値は確実に有効な値かのようには使用できない：

```rust
let x: i8 = 5;
let y: Option<i8> = Some(5);

let sum = x + y;
```

```
error[E0277]: the trait bound `i8: std::ops::Add<std::option::Option<i8>>` is
not satisfied
(エラー: `i8: std::ops::Add<std::option::Option<i8>>`というトレイト境界が満たされていません)
 -->
  |
5 |     let sum = x + y;
  |                 ^ no implementation for `i8 + std::option::Option<i8>`
  |
```

## 6.2 [match](https://doc.rust-jp.rs/book-ja/ch06-02-match.html#match%E3%83%95%E3%83%AD%E3%83%BC%E5%88%B6%E5%BE%A1%E6%BC%94%E7%AE%97%E5%AD%90)フロー制御演算子

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
```

TS だったら

```ts
function plusOne(x: number | undefined): number | undefined {
    if (x === undefined) return undefined;
    return x + 1;
}

const five = 5;
const six = plusOne(five); // 6
const none = plusOne(undefined); // undefined
```

一般的な enum に対する match 式

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u32 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

```rust

fn value_in_cents(coin: Coin) -> u32 {
    match coin {
        Coin::Penny => {
            println!("Lucky penny!");
            1
        },
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

### マッチは包括的

全パターン網羅する必要がある

ダメな例：

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        Some(i) => Some(i + 1),
    }
}
```

```
error[E0004]: non-exhaustive patterns: `None` not covered
(エラー: 包括的でないパターン: `None`がカバーされてません)
 -->
  |
6 |         match x {
  |               ^ pattern `None` not covered
```

`_`というプレースホルダー

```rust
let some_u8_value = 0u8;
match some_u8_value {
    1 => println!("one"),
    3 => println!("three"),
    5 => println!("five"),
    7 => println!("seven"),
    _ => (),
}
```

## 6.3 [if let](https://doc.rust-jp.rs/book-ja/ch06-03-if-let.html#if-let%E3%81%A7%E7%B0%A1%E6%BD%94%E3%81%AA%E3%83%95%E3%83%AD%E3%83%BC%E5%88%B6%E5%BE%A1)で簡潔なフロー制御

先ほどの例で 1 つのケースしか扱わないとき

```rust
let some_u8_value = Some(0u8);
match some_u8_value {
    Some(3) => println!("three"),
    _ => (),
}
```

これは以下のように書くことができる：

```rust
let some_u8_value = Some(0u8);
if let Some(3) = some_u8_value {
    println!("three");
}
```

`else`も普通に使える

```rust
let mut count = 0;
if let Coin::Quarter(state) = coin {
    println!("State quarter from {:?}!", state);
} else {
    count += 1;
}
```
