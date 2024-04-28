#!/bin/bash


###### convert ######

mkdir -p ./final
rm -f ./final/lib.*
node ./scripts/convert-dts/main.mjs


###### last step ######

node ./scripts/gen-stdlib-dts.mjs

yarn zz:cmd:prettier ./final > /dev/null
yarn zz:cmd:prettier ./stdlib.d.ts > /dev/null
