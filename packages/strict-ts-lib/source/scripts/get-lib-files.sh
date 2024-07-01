#!/bin/bash

THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
COPIED_DIR="${THIS_SCRIPT_DIR}/../temp/copied"


TS_VERSION=$(less "${THIS_SCRIPT_DIR}/typescript-version.txt")


echo "TypeScript version: ${TS_VERSION}"
echo ""

rm -rf "${COPIED_DIR}"
mkdir -p "${COPIED_DIR}"

for filename in $(gh api --method GET --jq '.[].name' /repos/microsoft/TypeScript/contents/lib -F ref=v${TS_VERSION} \
    | grep "^lib.*\.d\.ts"); do
    wget "https://raw.githubusercontent.com/microsoft/TypeScript/v${TS_VERSION}/lib/${filename}"  -P "${COPIED_DIR}"
done

yarn zz:prettier "${COPIED_DIR}"
yarn zz:prettier "${COPIED_DIR}"
