#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
PACKAGES_DIR="${THIS_SCRIPT_DIR}/../../packages"
# MONO_DIR="${THIS_SCRIPT_DIR}/../../.."


###### convert ######

rm -rf "${PACKAGES_DIR}/**/index.d.ts"
rm -rf "${PACKAGES_DIR}/**/package.json"
node "${THIS_SCRIPT_DIR}/dist/main-create-packages.mjs"

# cd "${MONO_DIR}" || exit
