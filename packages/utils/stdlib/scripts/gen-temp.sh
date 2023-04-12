#!/bin/bash

###### copy original definitions ######

rm -rf ./unchanged
mkdir -p ./unchanged
cp -r ../../../node_modules/typescript/lib/lib*.d.ts ./unchanged


# ###### eslint fix & prettier ######

mkdir -p ./temp
cp -r ./unchanged/* ./temp

yarn autofix  || true

yarn zz:cmd:prettier ./temp > /dev/null 2>&1  || true
