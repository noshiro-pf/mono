今回の記事を書くきっかけになったのは、以下のような TypeScript のコードを書いたときに遭遇した型エラーです。

```ts
// 例1：エラーにならない例

type T =
  | ['type01']
  | ['type02']
  ...

  | ['type25'];

type S = ['type01' | 'type02' | ... | 'type25'];

declare let t: T;
declare let s: S;

t = s; // これは通る
```

```ts
// 例2：エラーになる例

type T =
  | ['type01']
  | ['type02']
  ...

  | ['type26']; // 追加

type S = ['type01' | 'type02' | ... | 'type26']; // 追加


declare let t: T;
declare let s: S;

// @ts-expect-error
t = s; // Type 'S' is not assignable to type 'T'.
```

[TS Playground - An online editor for exploring TypeScript and JavaScript](https://www.typescriptlang.org/play?#code/C4TwDgpgBAygjFAvFA2gKClAPlA5KSABjlw2zwIkICZTMd9wqBmO8xokshymtnpoVbcKggCz9RRAKySOVAGxzeAdmWCAHOqIBObRDiF9cLvSkHaI+XGFnrEq5TizHTOEteQ4azwa2+4PV9qI2DTdkpqSztI2wimagcYhJcAXQBuNDRKKAAVBEQRFHliXFSiktpys2LeVmryWvEyit5ZBpwmoiUO1BK1Xq6qLUGSvVGnIwm3EmmvKta3esWvCTmDdpWDHq3vFprrEd3xrZD9xvlqWdOFg9jzzsu10820ABMIAGMAGwBDACdoN8IMAoABnOAALlgcEyHx+AKBIKgwCheVhWVRSHBGOyTFg1Gx6GSnH0fF8QjJ4QERGi8SIcRpVCS9KoLhJijJPg5hH8PKCHMMxmp5jgdKZNmMLIl7NZ7mM3LlfLlAtZZzC+iimsZ5kSmtlTOoHgymPxuUJhTugmuVtpDz6dXtQ0Iz1tbKdJR2bsIAy2vI9vBObqF6xMAbctwuTmWwddUbcm2DXvjXl9waOwaDKYgZ3WV3DkC1eZj2b1ecTpZ6mXeXz+gKgwNBYOo0Jg1DhtcRDeRwBbeXbWQA9IOoAABYBggC0EAAHpBPsBp-9-gB7f7ZC3ggdAA)

それぞれの例における `T` と `S` は、見た目は異なるものの同等の型を表しているはずで、実際 `t = s` や `s = t` という代入文は、要素数が少ないうちは普通に型チェックは通ります。

ところが、この例の `S` を 25 要素から 26 要素の Union に増やした瞬間、 `t = s` という代入文が型エラーになってしまう、というのが冒頭に示した例の内容です。

いくつか関連する issue も見つけたのですが、今回はこの原因を TypeScript のソースコードを読んでより詳しく探ってみることにします（といっても、自分は TypeScript のコンパイラ実装を読むのは初めてなので、断片的な理解しかできませんでしたが…）。

-   https://github.com/microsoft/TypeScript/issues/40803
-   https://github.com/microsoft/TypeScript/issues/43283

---

TypeScript の型チェックのロジックは

[https://github.com/microsoft/TypeScript/blob/v4.4.3/src/compiler/checker.ts](https://github.com/microsoft/TypeScript/blob/v4.4.3/src/compiler/checker.ts)

に書かれているようです（本記事では v4.4.3 のものを参照しました）。

冒頭の例の

```ts
t = s;
```

という代入文の型チェックがどのように走るかトレースしてみると、

```txt
checkBinaryLikeExpressionWorker
 -> checkAssignmentOperator
 -> checkTypeAssignableToAndOptionallyElaborate
 -> checkTypeRelatedToAndOptionallyElaborate
 -> checkTypeRelatedTo
 -> isRelatedTo
 -> recursiveTypeRelatedTo
 -> structuredTypeRelatedTo
 -> structuredTypeRelatedToWorker
```

という順に関数が呼ばれることが分かります。

関数名に "is related to" という述語が頻繁に現れていますが、これについての説明は `checkTypeRelatedTo` 関数のドキュメントに以下のように書いてあります。

```ts
/**
 * Checks if 'source' is related to 'target' (e.g.: is a assignable to).
 * @param source The left-hand-side of the relation.
 * @param target The right-hand-side of the relation.
 * @param relation The relation considered. One of 'identityRelation', 'subtypeRelation', 'assignableRelation', or 'comparableRelation'.
 * Used as both to determine which checks are performed and as a cache of previously computed results.
 * @param errorNode The suggested node upon which all errors will be reported, if defined. This may or may not be the actual node used.
 * @param headMessage If the error chain should be prepended by a head message, then headMessage will be used.
 * @param containingMessageChain A chain of errors to prepend any new errors found.
 * @param errorOutputContainer Return the diagnostic. Do not log if 'skipLogging' is truthy.
 */
```

どうやら、`checkTypeRelatedTo` 関数は `source` と `target` の 2 つの型について、 `identityRelation` , `subtypeRelation` , `assignableRelation` , `comparableRelation` の 4 つのうちいずれかの型関係を判定する関数のようです。代入文のチェックでは `assignableRelation` になるんでしょうか。

`t = s` という代入文における `s` の型が `source` 、 `t` の型が `target` のようです。

余談ですが、最初自分が読んだ時、`@param source` の `The left-hand-side of the relation` という説明を見て`t = s` という代入文における左辺のことかと勘違いして混乱していました。これは "is assignable to" などの型関係における左辺という意味であって、ソースコード中の位置関係とは必ずしも一致していません（代入文などでは左右反転しますが、たとえば `A extends B` のような条件型では同じ位置関係になります）。

試しに、

```ts
type A = 1 | 2 | 3;
type B = 1 | 2;
export declare let a: A;
export declare let b: B;
a = b; // ok
```

というコードを tsc に投げて dump してみると以下のようになり、 `source` が代入文の右辺、`target` が左辺であることが確認できました。

```ts
source: Type {
  flags: 1048576,
  id: 84,
  objectFlags: 65536,
  types: [ [Type], [Type] ],
  origin: undefined,
  aliasSymbol: Symbol {
    flags: 524288,
    escapedName: 'B',
    declarations: [Array],
    valueDeclaration: undefined,
    id: 9,
    mergeId: undefined,
    parent: undefined,
    isReferenced: 788968
  },
  aliasTypeArguments: undefined
},

target: Type {
  flags: 1048576,
  id: 83,
  objectFlags: 65536,
  types: [ [Type], [Type], [Type] ],
  origin: undefined,
  aliasSymbol: Symbol {
    flags: 524288,
    escapedName: 'A',
    declarations: [Array],
    valueDeclaration: undefined,
    id: 8,
    mergeId: undefined,
    parent: undefined,
    isReferenced: 788968
  },
  aliasTypeArguments: undefined
}
```

先へ進み、 `structuredTypeRelatedToWorker` の中を見てみると、 `source` と `target` の型の種類によって様々な分岐が行われています。

冒頭の例 1 や例 2 では `s` と `t` が

```ts
type T =
  | ['type01']
  | ['type02']
  ...

  | ['type25'];

type S = ['type01' | 'type02' | ... | 'type25'];
```

という型なので

```ts
// If S is an object type and T is a discriminated union, S may be related to T if
// there exists a constituent of T for every combination of the discriminants of S
// with respect to T. We do not report errors here, as we will use the existing
// error result from checking each constituent of the union.
if (
    source.flags & (TypeFlags.Object | TypeFlags.Intersection) &&
    target.flags & TypeFlags.Union
) {
    const objectOnlyTarget = extractTypesOfKind(
        target,
        TypeFlags.Object | TypeFlags.Intersection | TypeFlags.Substitution
    );
    if (objectOnlyTarget.flags & TypeFlags.Union) {
        const result = typeRelatedToDiscriminatedType(
            source,
            objectOnlyTarget as UnionType
        );
        if (result) {
            return result;
        }
    }
}
```

という分岐に入り、ここで関数 `typeRelatedToDiscriminatedType` が呼ばれます。

関数 `typeRelatedToDiscriminatedType` には以下のようなコメントが書かれています。

```txt
1. Generate the combinations of discriminant properties & types 'source' can satisfy.
   a. If the number of combinations is above a set limit, the comparison is too complex.
2. Filter 'target' to the subset of types whose discriminants exist in the matrix.
   a. If 'target' does not satisfy all discriminants in the matrix, 'source' is not related.
3. For each type in the filtered 'target', determine if all non-discriminant properties of 'target' are related to a property in 'source'.

NOTE: See ~/tests/cases/conformance/types/typeRelationships/assignmentCompatibility/assignmentCompatWithDiscriminatedUnion.ts for examples.
```

1-a. の "If the number of combinations is above a set limit, the comparison is too complex." という説明が関係していそうです。

コードを読んでいくと、

```ts
// Though we could compute the number of combinations as we generate
// the matrix, this would incur additional memory overhead due to
// array allocations. To reduce this overhead, we first compute
// the number of combinations to ensure we will not surpass our
// fixed limit before incurring the cost of any allocations:
let numCombinations = 1;
for (const sourceProperty of sourcePropertiesFiltered) {
    numCombinations *= countTypes(getNonMissingTypeOfSymbol(sourceProperty));
    if (numCombinations > 25) {
        // We've reached the complexity limit.
        tracing?.instant(
            tracing.Phase.CheckTypes,
            'typeRelatedToDiscriminatedType_DepthLimit',
            { sourceId: source.id, targetId: target.id, numCombinations }
        );
        return Ternary.False;
    }
}
```

というコードが見つかります。

試しにこの `25` という数値を `26` に書き換えて tsc を実行すると、先ほどの例で型エラーが消えることが確認できました。今回の型エラーは結局この Union 型の複雑度チェックで弾かれるのが原因であることが分かりました。

コメントにあった `tests` 配下の `assignmentCompatWithDiscriminatedUnion.ts` も見てみると、以下のようなテストケースが書かれています。

```ts
// Maximum discriminant combinations
namespace Example5 {
    // NOTE: The maximum number of discriminant type combinations is currently 25.
    //       3 discriminant properties with 3 types a piece
    //       is 27 possible combinations.
    type N = 0 | 1 | 2;
    type S = { a: N; b: N; c: N };
    type T =
        | { a: 0; b: N; c: N }
        | { a: 1; b: N; c: N }
        | { a: 2; b: N; c: N }
        | { a: N; b: 0; c: N }
        | { a: N; b: 1; c: N }
        | { a: N; b: 2; c: N }
        | { a: N; b: N; c: 0 }
        | { a: N; b: N; c: 1 }
        | { a: N; b: N; c: 2 };
    declare let s: S;
    declare let t: T;

    // S *should* be assignable but the number of
    // combinations is too complex.
    t = s;
}
```

おそらくですが、右辺 `S` が Union 型を含むレコード型やタプル型などの場合、 `S` が「そのまま」左辺 `T` に代入できる形ではない場合は、Union が一番外に来る標準形のようなもの（ ↓ に示したようなもの）への展開を考えて、それらがすべて `T` に代入可能か調べる必要があるのですが、その展開した Union 型のサイズが掛け算で増えてしまうため、展開後のサイズが 25 を超える場合は展開しないように type checker が制限しているようです。

`assignmentCompatWithDiscriminatedUnion.ts` の例では、`t = s` のチェックは `S` を展開した型である

```ts
  { a: 0, b: 0, c: 0 }
| { a: 0, b: 0, c: 1 }
| { a: 0, b: 0, c: 2 }
| { a: 0, b: 1, c: 0 }
| { a: 0, b: 1, c: 1 }
| { a: 0, b: 1, c: 2 }
| { a: 0, b: 2, c: 0 }
| { a: 0, b: 2, c: 1 }
| { a: 0, b: 2, c: 2 }
| { a: 1, b: 0, c: 0 }
| { a: 1, b: 0, c: 1 }
| { a: 1, b: 0, c: 2 }
| { a: 1, b: 1, c: 0 }
| { a: 1, b: 1, c: 1 }
| { a: 1, b: 1, c: 2 }
| { a: 1, b: 2, c: 0 }
| { a: 1, b: 2, c: 1 }
| { a: 1, b: 2, c: 2 }
| { a: 2, b: 0, c: 0 }
| { a: 2, b: 0, c: 1 }
| { a: 2, b: 0, c: 2 }
| { a: 2, b: 1, c: 0 }
| { a: 2, b: 1, c: 1 }
| { a: 2, b: 1, c: 2 }
| { a: 2, b: 2, c: 0 }
| { a: 2, b: 2, c: 1 }
| { a: 2, b: 2, c: 2 }
```

の各要素（`a` とします）について `isRelatedTo(a, T)` を呼び出して and を取ることで `S` が `T` へ代入可能か判定できますが、そのときに `S` のサイズが 27 なので制限を超えてしまうということです。

[TS Playground - An online editor for exploring TypeScript and JavaScript](https://www.typescriptlang.org/play?#code/C4TwDgpgBAclC8UAMUA+UCMaoCYDcAUAaJFAMoJQDeUAhgFywA0UARozCwMYdQC+hYuGgAVBASjYaDZC3bMoPWPwlS6jDHI7defVemmMcWhUrh7JB9QvlIdyi2pmc2G++f3VrL+ccW7PQxttf2QVSy9nExclLEcrKNdTI35CABMILgAbWgAnaCyIYCgAZ0YydMyc-KhC4uBGEUFixBLCIA)

この例を色々いじってみると分かるのですが、 `N = 0 | 1` のようにしてサイズを小さくすれば 25 以下チェックにひっかからないのでエラーになりませんし、 `T` の Union のメンバーに `{ a: N, b: N, c: N }` を追加してみると型チェックが通ったりするので、中身の Union 型を展開するまでもなく代入可能であると判定できる場合については Union 型の展開を避けて比較できるようになっていることも分かります（賢い！）。

さっきは読み飛ばしましたが、 `numCombinations` のチェックは `source` に対してのみ行われています。これは自然なことで、ここでの Union 型の展開は `source` に対してのみ行えばよく、 `target` は（少なくともここでは）展開しなくてよいからです。

---

`t = s` はダメだけど `s = t` は通るのはなぜか、も気になるので調べてみます。

こちらは `typeRelatedToDiscriminatedType` 関数が呼ばれておらず、同じ関数 `structuredTypeRelatedToWorker` の中の一つ手前の分岐

```ts
// Even if relationship doesn't hold for unions, intersections, or generic type references,
// it may hold in a structural comparison.
// In a check of the form X = A & B, we will have previously checked if A relates to X or B relates
// to X. Failing both of those we want to check if the aggregation of A and B's members structurally
// relates to X. Thus, we include intersection types on the source side here.
if (
    source.flags & (TypeFlags.Object | TypeFlags.Intersection) &&
    target.flags & TypeFlags.Object
) {
    // Report structural errors only if we haven't reported any errors yet
    const reportStructuralErrors =
        reportErrors &&
        errorInfo === saveErrorInfo.errorInfo &&
        !sourceIsPrimitive;
    result = propertiesRelatedTo(
        source,
        target,
        reportStructuralErrors,
        /*excludedProperties*/ undefined,
        intersectionState
    );
    if (result) {
        result &= signaturesRelatedTo(
            source,
            target,
            SignatureKind.Call,
            reportStructuralErrors
        );
        if (result) {
            result &= signaturesRelatedTo(
                source,
                target,
                SignatureKind.Construct,
                reportStructuralErrors
            );
            if (result) {
                result &= indexSignaturesRelatedTo(
                    source,
                    target,
                    sourceIsPrimitive,
                    reportStructuralErrors,
                    intersectionState
                );
            }
        }
    }
    if (varianceCheckFailed && result) {
        errorInfo = originalErrorInfo || errorInfo || saveErrorInfo.errorInfo; // Use variance error (there is no structural one) and return false
    } else if (result) {
        return result;
    }
}
```

に入っているようです。力尽きてしまったのでここも中を細かく読めていませんが、先ほどの `typeRelatedToDiscriminatedType` は呼ばれておらず、Union 型の展開を避ける形での比較をしていそうです。

## まとめ

-   TypeScript において、Union 型を内部に含むタプルやレコード型などの Union 型を展開すると巨大になってしまうとき、代入できるはずのところで代入できないと判定されることがある。これは型チェッカーの意図的な制限である。
-   Union 型を展開しなくても比較可能な場面では、TypeScript が賢く Union 型の展開を回避している場合がある（このため、この制限に遭遇することは結構少ない）。

以上、 [noshiro](https://twitter.com/noshiro_piko) が書きました。
