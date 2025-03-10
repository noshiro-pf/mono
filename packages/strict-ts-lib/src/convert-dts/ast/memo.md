```ts
interface IArray<T> {
    readonly length: number;
    toString(): string;
    every<S extends T>(
        predicate: (value: T, index: number, array: readonly T[]) => value is S,
        thisArg?: unknown,
    ): this is readonly S[];
    every(
        predicate: (value: T, index: number, array: readonly T[]) => unknown,
        thisArg?: unknown,
    ): boolean;
    some(
        predicate: (value: T, index: number, array: readonly T[]) => unknown,
        thisArg?: unknown,
    ): boolean;
    filter<S extends T>(
        predicate: (value: T, index: number, array: readonly T[]) => value is S,
        thisArg?: unknown,
    ): readonly S[];
    filter(
        predicate: (value: T, index: number, array: readonly T[]) => unknown,
        thisArg?: unknown,
    ): readonly T[];
}
```
