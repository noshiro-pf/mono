#!/bin/bash

###### copy original definitions ######

rm -rf ./copied
mkdir -p ./copied
cp -r ../../../node_modules/typescript/lib/lib*.d.ts ./copied


# ###### eslint fix & prettier ######

mkdir -p ./eslint-fixed
cp -r ./copied/* ./eslint-fixed

yarn autofix > /dev/null 2>&1 || true

yarn prettier --write ./eslint-fixed > /dev/null 2>&1  || true
