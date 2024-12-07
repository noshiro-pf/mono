#!/bin/bash

THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
STRICT_TS_LIB_DIR="${THIS_SCRIPT_DIR}/../.."

# 1回の prettier 実行でフォーマットされない一部ファイルに2回 prettier をかける
for _ in $(seq 0 1); do
  yarn zz:prettier \
    ${STRICT_TS_LIB_DIR}/**/lib.es2017.object.d.ts \
    ${STRICT_TS_LIB_DIR}/**/lib.dom.d.ts \
    ${STRICT_TS_LIB_DIR}/**/lib.es2021.intl.d.ts \
    ${STRICT_TS_LIB_DIR}/**/lib.es5.d.ts \
    ${STRICT_TS_LIB_DIR}/**/es2017/object/index.d.ts \
    ${STRICT_TS_LIB_DIR}/**/dom/index.d.ts \
    ${STRICT_TS_LIB_DIR}/**/es2021/intl/index.d.ts \
    ${STRICT_TS_LIB_DIR}/**/es5/index.d.ts
done
