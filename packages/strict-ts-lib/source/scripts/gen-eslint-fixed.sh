#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
COPIED_DIR="${THIS_SCRIPT_DIR}/../copied"
ESLINT_FIXED_DIR="${THIS_SCRIPT_DIR}/../eslint-fixed"
MONO_ROOT_DIR="${THIS_SCRIPT_DIR}/../../../.."


###### copy original definitions ######

rm -rf "${COPIED_DIR}"
mkdir -p "${COPIED_DIR}"
cp -r ${MONO_ROOT_DIR}/node_modules/typescript/lib/lib*.d.ts "${COPIED_DIR}"


###### eslint fix ######

mkdir -p "${ESLINT_FIXED_DIR}"
cp -r ${COPIED_DIR}/* "${ESLINT_FIXED_DIR}"

yarn zz:eslint "${ESLINT_FIXED_DIR}" --config ./configs/eslint.config.gen.mjs --fix || true
