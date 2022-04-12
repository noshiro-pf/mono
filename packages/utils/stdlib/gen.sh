#!/bin/bash

###### copy original definitions ######

rm -rf ./dist
cp -r unchanged dist

###### eslint fix ######

for file in "./dist"/*; do
    # /// <reference lib="(.+)" />
    # /// <reference path="lib.$1.d.ts" />

    sed -i.bak -r 's@/// <reference lib="(.+)" />@/// <reference path="./lib.\1.d.ts" />@g' "${file}"
    sed -i.bak -e 's/declare var /declare const /g' "${file}"
    sed -i.bak -e 's/  var /  const /g' "${file}"
done

rm -rf "dist"/*.bak

yarn lint --fix

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

###### prettier ######

yarn fmt

