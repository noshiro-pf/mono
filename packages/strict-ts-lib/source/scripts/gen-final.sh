#!/bin/bash


###### convert ######

mkdir -p ./final
rm -f ./final/lib.*
node ./scripts/convert-dts/main.mjs


###### last step ######

yarn zz:cmd:prettier ./final > /dev/null
