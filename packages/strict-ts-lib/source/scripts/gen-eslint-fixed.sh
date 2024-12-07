#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
STRICT_TS_LIB_DIR="${THIS_SCRIPT_DIR}/../.."

COPIED_DIR="${STRICT_TS_LIB_DIR}/source/temp/copied"
ESLINT_FIXED_DIR="${STRICT_TS_LIB_DIR}/source/temp/eslint-fixed"


rm -rf "${ESLINT_FIXED_DIR}"
mkdir -p "${ESLINT_FIXED_DIR}"
cp -r "${COPIED_DIR}"/lib*.d.ts "${ESLINT_FIXED_DIR}"

yarn zz:eslint "${ESLINT_FIXED_DIR}" --config ./configs/eslint.config.gen.mjs --fix || true

echo "formatting..."

yarn zz:prettier "${ESLINT_FIXED_DIR}"

# 1回の prettier 実行でフォーマットされない一部ファイルに2回 prettier をかける
for _ in $(seq 0 1); do
  yarn zz:prettier \
    "${ESLINT_FIXED_DIR}/lib.es2017.object.d.ts" \
    "${ESLINT_FIXED_DIR}/lib.dom.d.ts" \
    "${ESLINT_FIXED_DIR}/lib.es2021.intl.d.ts" \
    "${ESLINT_FIXED_DIR}/lib.es5.d.ts"
done
