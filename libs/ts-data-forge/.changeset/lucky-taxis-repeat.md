---
'ts-data-forge': minor
---

Make the curried `Optional.map`, `Result.map` and `Result.mapErr` usable from
a caller that is itself generic over the container.

Each curried overload used to fix its parameter to the container spelled in
terms of the mapper's input — `(optional: Optional<S>) => …`,
`<E>(result: Result<S, E>) => …`, `<S>(result: Result<S, E>) => …`. Because
`S` (resp. `E`) is bound when the mapper is passed, a caller generic over the
container ends up needing `O` to be assignable to `Optional<Unwrap<O>>`, which
TypeScript cannot show for a bare `O extends UnknownOptional` — even though
every concrete instantiation satisfies it. The curried form was therefore
unreachable from such a caller, which had to fall back to the direct, two-argument
`Optional.map(a, mapFn)`.

The returned function is now generic over the whole container, mirroring the
direct overload:

```ts
export function map<S, S2>(
    mapFn: (value: S) => S2,
): <O extends UnknownOptional>(
    optional: Unwrap<O> extends S ? O : never,
) => Optional<S2>;
```

The conditional preserves the check — mapping a `(s: string) => …` over an
`Optional<number>` is still an error — at the cost of a worse message for that
case (`not assignable to 'never'` rather than naming the two optionals).
Ordinary curried usage is unaffected and still infers the result precisely.
