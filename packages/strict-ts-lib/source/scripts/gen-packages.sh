#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
STRICT_TS_LIB_DIR="${THIS_SCRIPT_DIR}/../.."

PACKAGES_DIR="${STRICT_TS_LIB_DIR}/output/packages"
PACKAGES_BRANDED_DIR="${STRICT_TS_LIB_DIR}/output-branded/packages"
LIB_DIR="${STRICT_TS_LIB_DIR}/output/lib"
LIB_BRANDED_DIR="${STRICT_TS_LIB_DIR}/output-branded/lib"


###### convert ######

rm -rf "${PACKAGES_DIR}/**/index.d.ts"
rm -rf "${PACKAGES_DIR}/**/package.json"
rm -rf "${PACKAGES_BRANDED_DIR}/**/index.d.ts"
rm -rf "${PACKAGES_BRANDED_DIR}/**/package.json"


zx "${THIS_SCRIPT_DIR}/dist/main-gen-packages.mjs"


echo "formatting..."
yarn zz:prettier "${PACKAGES_DIR}" "${PACKAGES_BRANDED_DIR}" "${LIB_DIR}" "${LIB_BRANDED_DIR}"


# 1回の prettier 実行でフォーマットされない一部ファイルに2回 prettier をかける
for _ in $(seq 0 1); do
  yarn zz:prettier \
    "${PACKAGES_DIR}/es2017/object/index.d.ts" \
    "${PACKAGES_DIR}/dom/index.d.ts" \
    "${PACKAGES_DIR}/es2021/intl/index.d.ts" \
    "${PACKAGES_DIR}/es5/index.d.ts" \
    "${PACKAGES_BRANDED_DIR}/es2017/object/index.d.ts" \
    "${PACKAGES_BRANDED_DIR}/dom/index.d.ts" \
    "${PACKAGES_BRANDED_DIR}/es2021/intl/index.d.ts" \
    "${PACKAGES_BRANDED_DIR}/es5/index.d.ts"
done
