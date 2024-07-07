#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
STRICT_TS_LIB_DIR="${THIS_SCRIPT_DIR}/../.."

PACKAGES_DIR="${STRICT_TS_LIB_DIR}/output/packages"
PACKAGES_BRANDED_DIR="${STRICT_TS_LIB_DIR}/output-branded/packages"


###### convert ######

rm -rf "${PACKAGES_DIR}/**/index.d.ts"
rm -rf "${PACKAGES_DIR}/**/package.json"
rm -rf "${PACKAGES_BRANDED_DIR}/**/index.d.ts"
rm -rf "${PACKAGES_BRANDED_DIR}/**/package.json"

node "${THIS_SCRIPT_DIR}/dist/main-gen-packages.mjs"
