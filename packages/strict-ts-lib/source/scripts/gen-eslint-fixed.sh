#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
COPIED_DIR="${THIS_SCRIPT_DIR}/../temp/copied"
ESLINT_FIXED_DIR="${THIS_SCRIPT_DIR}/../temp/eslint-fixed"


mkdir -p "${ESLINT_FIXED_DIR}"
cp -r "${COPIED_DIR}"/lib*.d.ts "${ESLINT_FIXED_DIR}"

yarn zz:eslint "${ESLINT_FIXED_DIR}" --config ./configs/eslint.config.gen.mjs --fix || true
