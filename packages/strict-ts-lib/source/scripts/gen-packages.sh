#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)

BASIC_PACKAGES_DIR="${THIS_SCRIPT_DIR}/../../basic/packages"
BRANDED_PACKAGES_DIR="${THIS_SCRIPT_DIR}/../../branded/packages"


###### convert ######

rm -rf "${BASIC_PACKAGES_DIR}/**/index.d.ts"
rm -rf "${BASIC_PACKAGES_DIR}/**/package.json"
rm -rf "${BRANDED_PACKAGES_DIR}/**/index.d.ts"
rm -rf "${BRANDED_PACKAGES_DIR}/**/package.json"

node "${THIS_SCRIPT_DIR}/dist/main-create-packages.mjs"
