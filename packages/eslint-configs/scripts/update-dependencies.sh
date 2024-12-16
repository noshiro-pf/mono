#!/bin/bash

THIS_SCRIPT_DIR=$(cd $(dirname "$0") || exit; pwd)
MONO_ROOT_DIR="${THIS_SCRIPT_DIR}/../../.."

ESLINT_DIR="$(dirname ${THIS_SCRIPT_DIR})"
STRICT_TS_LIB_SOURCE_DIR="${MONO_ROOT_DIR}/packages/strict-ts-lib/source"


#
# @tier4/strict-ts-lib
#

cd "${STRICT_TS_LIB_SOURCE_DIR}" || exit

yarn add -D \
  @types/eslint@latest \
  @typescript-eslint/eslint-plugin@latest \
  @typescript-eslint/parser@latest
  # TODO: enable this line after eslint v9 is supported in all plugins
  # eslint-plugin-functional@latest \
  # eslint@latest

node "${ESLINT_DIR}/scripts/update-dependencies.mjs" "${STRICT_TS_LIB_SOURCE_DIR}/package.json" "devDependencies"

#
# @tier4/eslint
#

cd "${ESLINT_DIR}" || exit

yarn add \
  @typescript-eslint/eslint-plugin@latest \
  @typescript-eslint/parser@latest \
  @typescript-eslint/utils@latest \
  eslint-import-resolver-typescript@latest \
  eslint-plugin-array-func@latest \
  eslint-plugin-eslint-plugin@latest \
  eslint-plugin-import@latest \
  eslint-plugin-jest@latest \
  eslint-plugin-jsx-a11y@latest \
  eslint-plugin-prefer-arrow-functions@latest \
  eslint-plugin-promise@latest \
  eslint-plugin-react-hooks@latest \
  eslint-plugin-react-refresh@latest \
  eslint-plugin-react@latest \
  eslint-plugin-security@latest \
  eslint-plugin-strict-dependencies@latest \
  eslint-plugin-testing-library@latest \
  eslint-plugin-total-functions@latest \
  eslint-plugin-tree-shakable@latest \
  eslint-plugin-unicorn@latest \
  eslint-plugin-vitest@latest \
  @types/eslint@latest \
  globals@latest \
  typescript-eslint@latest
  # TODO: enable this line after eslint v9 is supported in all plugins
  # eslint-plugin-functional@latest \
  # eslint-plugin-cypress@latest \
  # eslint@latest

node "${ESLINT_DIR}/scripts/update-dependencies.mjs" "${ESLINT_DIR}/package.json" "dependencies"

yarn add -D json-schema-to-typescript@latest

cd "${MONO_ROOT_DIR}" || exit

yarn

cd "${ESLINT_DIR}" || exit

yarn gen-rules-type

cd "${MONO_ROOT_DIR}" || exit

yarn fmt:diff

yarn
