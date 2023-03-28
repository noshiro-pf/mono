#!/bin/bash

###### copy original definitions ######

rm -rf ./unchanged
mkdir -p ./unchanged
cp -r ../../../node_modules/typescript/lib/lib*.d.ts ./unchanged

rm -f ./dist/lib.*
cp unchanged/lib.* ./dist/

###### replace ######

for file in "./dist"/*; do
    sed -i.bak -r 's@/// <reference no-default-lib="true"/>@/// <reference no-default-lib="true"/>\n/// <reference path="./utils.d.ts" />@g' "${file}"
    sed -i.bak -r 's@/// <reference lib="(.+)" />@/// <reference path="./lib.\1.d.ts" />@g' "${file}"
    sed -i.bak -e 's/declare var /declare const /g' "${file}"
    sed -i.bak -e 's/  var /  const /g' "${file}"
done

### change Set.has() and Map.has() to accept widen literal types (lib.es2015.collection.d.ts)

# lib.es2015.collection.d.ts
sed -i.bak -e 's/has(key: K): boolean;/has(key: K | (WidenLiteral<K> \& {})): key is K;/g' "dist/lib.es2015.collection.d.ts"
sed -i.bak -e 's/has(value: T): boolean;/has(value: T | (WidenLiteral<T> \& {})): value is T;/g' "dist/lib.es2015.collection.d.ts"

# lib.es2016.array.include.d.ts
sed -i.bak -e 's/includes(searchElement: T, fromIndex?: number): boolean;/includes(searchElement: T | (WidenLiteral<T> \& {}), fromIndex?: number): searchElement is T;/g' "dist/lib.es2016.array.include.d.ts"

for file in "./dist"/*; do
    sed -i.bak -e 's/radix?: number/radix?: UintRange<2, 36>/g' "${file}"
    sed -i.bak -e 's/fractionDigits?: number/fractionDigits?: UintRange<0, 20>/g' "${file}"
    sed -i.bak -e 's/precision?: number/precision?: UintRange<1, 21>/g' "${file}"
done

rm -rf "dist"/*.bak

###### eslint fix ######

yarn autofix

###### replace  ######

### require predicate function to return boolean

# lib.es5.d.ts
sed -i.bak -e 's/predicate: (value: T, index: number, array: readonly T\[\]) => unknown/predicate: (value: T, index: number, array: readonly T[]) => boolean/g' "dist/lib.es5.d.ts"
sed -i.bak -e 's/predicate: (value: number, index: number, array: Int8Array) => unknown/predicate: (value: number, index: number, array: Int8Array) => boolean/g' "dist/lib.es5.d.ts"
sed -i.bak -e 's/predicate: (value: number, index: number, array: Int16Array) => unknown/predicate: (value: number, index: number, array: Int16Array) => boolean/g' "dist/lib.es5.d.ts"
sed -i.bak -e 's/predicate: (value: number, index: number, array: Int32Array) => unknown/predicate: (value: number, index: number, array: Int32Array) => boolean/g' "dist/lib.es5.d.ts"
sed -i.bak -e 's/predicate: (value: number, index: number, array: Uint8Array) => unknown/predicate: (value: number, index: number, array: Uint8Array) => boolean/g' "dist/lib.es5.d.ts"
sed -i.bak -e 's/predicate: (value: number, index: number, array: Uint16Array) => unknown/predicate: (value: number, index: number, array: Uint16Array) => boolean/g' "dist/lib.es5.d.ts"
sed -i.bak -e 's/predicate: (value: number, index: number, array: Uint32Array) => unknown/predicate: (value: number, index: number, array: Uint32Array) => boolean/g' "dist/lib.es5.d.ts"
sed -i.bak -e 's/predicate: (value: number, index: number, array: Float32Array) => unknown/predicate: (value: number, index: number, array: Float32Array) => boolean/g' "dist/lib.es5.d.ts"
sed -i.bak -e 's/predicate: (value: number, index: number, array: Float64Array) => unknown/predicate: (value: number, index: number, array: Float64Array) => boolean/g' "dist/lib.es5.d.ts"

#lib.es2015.core.d.ts
sed -i.bak -e 's/predicate: (value: T, index: number, obj: readonly T\[\]) => unknown/predicate: (value: T, index: number, obj: readonly T[]) => boolean/g' "dist/lib.es2015.core.d.ts"


# lib.es2015.iterable.d.ts
# sed -i.bak -e 's/from<T>(iterable: Iterable<T> | ArrayLike<T>): readonly T\[\];/from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];/g' "dist/lib.es2015.iterable.d.ts"

# lib.es2020.bigint.d.ts
sed -i.bak -e 's/predicate: (value: bigint, index: number, array: BigInt64Array) => unknown/predicate: (value: bigint, index: number, array: BigInt64Array) => boolean/g' "dist/lib.es2020.bigint.d.ts"
sed -i.bak -e 's/predicate: (value: bigint, index: number, array: BigUint64Array) => unknown/predicate: (value: bigint, index: number, array: BigUint64Array) => boolean/g' "dist/lib.es2020.bigint.d.ts"

# remove readonly (lib.es5.d.ts)
sed -i.bak -e 's/  readonly \[n: number\]: T;/  [n: number]: T;/g' "dist/lib.es5.d.ts"
sed -i.bak -e 's/  readonly prototype: readonly unknown\[\];/  readonly prototype: unknown[];/g' "dist/lib.es5.d.ts"
sed -i.bak -e 's/  readonly prototype: readonly unknown\[\];/  readonly prototype: unknown[];/g' "dist/lib.es5.d.ts"
sed -i.bak -e 's/readonly \[P in keyof T\]?: T\[P\];/[P in keyof T]?: T[P];/g' "dist/lib.es5.d.ts"

sed -i.bak -e 's/): ReadonlyMap<unknown, unknown>;/): Map<unknown, unknown>;/g' "dist/lib.es2015.collection.d.ts"
sed -i.bak -e 's/): ReadonlyMap<unknown, unknown>;/): Map<unknown, unknown>;/g' "dist/lib.es2015.iterable.d.ts"
sed -i.bak -e 's/null): ReadonlyMap<K, V>;/null): Map<K, V>;/g' "dist/lib.es2015.collection.d.ts"
sed -i.bak -e 's/null): ReadonlyMap<K, V>;/null): Map<K, V>;/g' "dist/lib.es2015.iterable.d.ts"
sed -i.bak -e 's/null): ReadonlySet<T>;/null): Set<T>;/g' "dist/lib.es2015.collection.d.ts"
sed -i.bak -e 's/null): ReadonlySet<T>;/null): Set<T>;/g' "dist/lib.es2015.iterable.d.ts"
sed -i.bak -e 's/readonly prototype: ReadonlyMap<unknown, unknown>;/readonly prototype: Map<unknown, unknown>;/g' "dist/lib.es2015.collection.d.ts"
sed -i.bak -e 's/readonly prototype: ReadonlySet<unknown>;/readonly prototype: Set<unknown>;/g' "dist/lib.es2015.collection.d.ts"

# require compareFn of Array.sort (lib.es5.d.ts)
sed -i.bak -e 's/sort(compareFn?: (a: T, b: T) => number): this;/sort(compareFn: (a: T, b: T) => number): this;/g' "dist/lib.es5.d.ts"


# fix manually the `eslint --fix` results
for file in "./dist"/*; do
    sed -i.bak -e 's/readonly -readonly/-readonly/g' "${file}"
    sed -i.bak -e 's/readonly readonly readonly readonly readonly readonly readonly readonly readonly readonly/readonly/g' "${file}"
    sed -i.bak -e 's/keyof unknown/keyof never/g' "${file}"
    sed -i.bak -e 's/TReturn = unknown/TReturn = any/g' "${file}"
    sed -i.bak -e 's/\.\.\.args: unknown\[\]/...args: readonly never[]/g' "${file}"
    sed -i.bak -e 's/\.\.\.args: readonly unknown\[\]/...args: readonly never[]/g' "${file}"
    sed -i.bak -e 's/\.\.\.args: unknown/...args: readonly never[]/g' "${file}"
    # sed -i.bak -e 's/): readonly /): /g' "${file}" -> Object.freeze の結果を余計に mutable にしてしまうので没
done

rm -rf "dist"/*.bak

node ./scripts/gen-stdlib-dts.mjs

# ###### prettier ######

yarn fmt

