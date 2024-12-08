#!/bin/bash

THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
STRICT_TS_LIB_DIR="${THIS_SCRIPT_DIR}/../.."

COPIED_DIR="${STRICT_TS_LIB_DIR}/source/temp/copied"
TS_VERSION=$(less "${THIS_SCRIPT_DIR}/typescript-version.txt")


echo "TypeScript version: ${TS_VERSION}"
echo ""

rm -rf "${COPIED_DIR}"
mkdir -p "${COPIED_DIR}"

for filename in $(gh api --method GET --jq '.[].name' /repos/microsoft/TypeScript/contents/lib -F ref=v${TS_VERSION} \
    | grep "^lib.*\.d\.ts"); do
    wget "https://raw.githubusercontent.com/microsoft/TypeScript/v${TS_VERSION}/lib/${filename}"  -P "${COPIED_DIR}"
done

echo "formatting..."

yarn zz:prettier "${COPIED_DIR}"

for _ in $(seq 0 1); do
  yarn zz:prettier \
    "${COPIED_DIR}/lib.es2017.object.d.ts" \
    "${COPIED_DIR}/lib.dom.d.ts" \
    "${COPIED_DIR}/lib.es2021.intl.d.ts" \
    "${COPIED_DIR}/lib.es5.d.ts";
done
