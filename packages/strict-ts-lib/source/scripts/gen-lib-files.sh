#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
STRICT_TS_LIB_DIR="${THIS_SCRIPT_DIR}/../.."

LIB_FILES_DIR="${STRICT_TS_LIB_DIR}/output/lib-files"
LIB_FILES_BRANDED_DIR="${STRICT_TS_LIB_DIR}/output-branded/lib-files"

###### convert ######

rm -rf "${LIB_FILES_DIR}"
rm -rf "${LIB_FILES_BRANDED_DIR}"
mkdir -p "${LIB_FILES_DIR}"
mkdir -p "${LIB_FILES_BRANDED_DIR}"
zx "${THIS_SCRIPT_DIR}/dist/main-gen-lib-files.mjs" || exit

echo "formatting..."

yarn zz:prettier "${LIB_FILES_DIR}" "${LIB_FILES_BRANDED_DIR}"

# 1回の prettier 実行でフォーマットされない一部ファイルに2回 prettier をかける
for _ in $(seq 0 1); do
  yarn zz:prettier \
    "${LIB_FILES_DIR}/lib.es2017.object.d.ts" \
    "${LIB_FILES_DIR}/lib.dom.d.ts" \
    "${LIB_FILES_DIR}/lib.es2021.intl.d.ts" \
    "${LIB_FILES_DIR}/lib.es5.d.ts" \
    "${LIB_FILES_BRANDED_DIR}/lib.es2017.object.d.ts" \
    "${LIB_FILES_BRANDED_DIR}/lib.dom.d.ts" \
    "${LIB_FILES_BRANDED_DIR}/lib.es2021.intl.d.ts" \
    "${LIB_FILES_BRANDED_DIR}/lib.es5.d.ts"
done
