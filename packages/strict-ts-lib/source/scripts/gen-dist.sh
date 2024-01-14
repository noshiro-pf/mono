#!/bin/bash


###### convert ######

mkdir -p ./dist
rm -f ./dist/lib.*
node ./scripts/convert-dts/main.mjs


###### last step ######

node ./scripts/gen-stdlib-dts.mjs

yarn zz:cmd:prettier ./dist > /dev/null
yarn zz:cmd:prettier ./stdlib.d.ts > /dev/null
