#!/bin/bash


###### convert ######

rm -rf ../packages/**/index.d.ts
rm -rf ../packages/**/package.json
node ./scripts/convert-dts/main-create-packages.mjs


###### last step ######

yarn zz:cmd:prettier ../packages > /dev/null
