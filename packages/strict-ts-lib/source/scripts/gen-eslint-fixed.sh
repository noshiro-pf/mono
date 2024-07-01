#!/bin/bash

###### copy original definitions ######

rm -rf ./copied
mkdir -p ./copied
./get-lib-files.sh

# ###### eslint fix & prettier ######

mkdir -p ./eslint-fixed
cp -r ./copied/* ./eslint-fixed

yarn autofix > /dev/null 2>&1 || true

yarn prettier --write ./eslint-fixed > /dev/null 2>&1  || true
