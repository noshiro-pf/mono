# 調査結果

ご想像のとおり、`pipe` の型定義のバグでした。`src/functional/pipe.mts` を修正済みです。

## 根本原因

`Pipe<A>` が分配的（distributive）な conditional type だったことが原因です。

```ts
type Pipe<A> = A extends UnknownOptional ? PipeWithMapOptional<A> : PipeBase<A>;
```

裸の型引数 `A` に対する `A extends ...` はユニオンに対して分配されます。
`numberBranded.decode` のチェーンでは、先頭の `.map(number.decode)` が `D | undefined` というブランド付きユニオンを生み、そこで `Pipe<D | undefined>` が `Pipe<D> | Pipe<undefined>` という「pipe オブジェクトのユニオン」に分解されます。

その状態のユニオンに対して次の `.mapNullable` を呼ぶと、TypeScript が各メンバのメソッドシグネチャを合成しようとして、ジェネリックなブランド `D` を制約の `number` までワイドニングしてしまいます。結果として `Result.unwrapOk(...)` の戻りが `number | undefined` に化け、`.value` が `D | undefined` になりませんでした。

`probe` で各段階の型を確認し、「先頭の `.map` で `D | undefined`（ブランド付きユニオン）が出る形」が引き金であることを特定しました。コメントアウト版（`tsfType.validate` を直接呼ぶ）はユニオン分配を経由しないため、型が一致していました。

## 修正

`Pipe<A>` を「`value` / `map` / `mapNullable` を持つ `PipeBase<A>` は常に持たせ、conditional は `mapOptional` の追加だけを担う」形に変更しました。

```ts
type Pipe<A> = PipeBase<A> &
    ([A] extends [UnknownOptional] ? PipeMapOptional<A> : unknown);
```

ポイントは 2 つです。

1. `[A] extends [UnknownOptional]`（1 要素タプルで包む）
   分配を止め、ユニオン値が単一の pipe オブジェクトのまま流れるため、ブランドが保持されます。
2. `value: A` を conditional の外（`PipeBase<A>`）に出す
   未解決ジェネリック `A` のとき、deferred conditional で `UnknownOptional` 側に絞られて `.value` が `(A & UnknownOptional) | A` になるノイズを避けます。

これで各段階が `D | undefined -> Result<D, unknown> | undefined -> D | undefined` とクリーンに通り、明示的な型注釈も不要になります。

## 検証

- パッチした `dist` を使い、ダッシュボードの `numberBranded.decode` を以下のクリーンな形でエラーなく通ることを確認。

```ts
decode: (input) =>
    pipe(input)
        .map(localStorageSerializer.number.decode)
        .mapNullable(tsfType.validate)
        .mapNullable((r) => Result.unwrapOk(r));
```

- `ts-data-forge` 本体で `tsc --noEmit` エラー 0。
- `functional/` テスト 304 件全パス。
- ESLint / Prettier クリーン。
- `pipe.test.mts` の `typing when used with generics` を、実際にバグを再現する形（先頭 `.map` でブランド付きユニオンを作る）に更新。旧（分配版）では型エラー、修正版では通ることを確認。

## mapNullable を条件付きで含めるのがうまくいかない理由

// これが失敗する理由：

```ts
type Pipe<A> = PipeBase<A> &
    ([undefined] extends [A] ? PipeMapNullable<A> : unknown) &
    ([null] extends [A] ? PipeMapNullable<A> : unknown);
```

根本原因: ジェネリック引数の「deferred conditional evaluation」

`decodeBranded<D extends number>` のようなジェネリック関数の中で、例えば:

```ts
const v = pipe(input)
.map((s): D | undefined => ...) // ← ここで D | undefined が出現
.mapNullable(...) // ← ここで mapNullable が見えるべき
```

このとき、TypeScript は `D` の具体値が決まっていないため：

- `[undefined] extends [D | undefined]` を判定しようとしても
- `D` がまだ未解決なため、conditional が「deferred」（判定が遅延）される
- 遅延中は、ルール `[undefined] extends [A]` の結果が確定しない

結果として、`Pipe<D | undefined>` を構成するときに、TypeScript が：

1. 両方の分岐を検討する（`PipeMapNullable` ありと なし）
2. 2つを合成しようとして、型が 曖昧になる
3. その中でジェネリック `D` が制約 `number` にワイドニングされる

これが「typing when used with generics」テストを失敗させます。

現在の修正版が成功する理由:

```ts
type Pipe<A> = PipeBase<A> &
    PipeMapNullable<A> & // ← 常に含める（条件なし）
    ([A] extends [UnknownOptional] ? PipeMapOptional<A> : unknown);
```

- `PipeMapNullable` を常に含めるので、conditional の分岐が1つ減る
- `[A] extends [UnknownOptional]` の non-distributive conditional だけが残り、deferred の複雑さが回避される
- ジェネリック `D | undefined` が単一の `pipe` オブジェクトのまま保持され、ワイドニングが防げる
