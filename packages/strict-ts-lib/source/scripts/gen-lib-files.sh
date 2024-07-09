#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
STRICT_TS_LIB_DIR="${THIS_SCRIPT_DIR}/../.."

LIB_FILES_DIR="${STRICT_TS_LIB_DIR}/output/lib-files"
LIB_FILES_BRANDED_DIR="${STRICT_TS_LIB_DIR}/output-branded/lib-files"

###### convert ######

mkdir -p "${LIB_FILES_DIR}"
mkdir -p "${LIB_FILES_BRANDED_DIR}"
node "${THIS_SCRIPT_DIR}/dist/main-gen-lib-files.mjs" || exit
