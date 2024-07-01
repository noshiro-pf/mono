#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
BASIC_FINAL_DIR="${THIS_SCRIPT_DIR}/../../basic/final"
BRANDED_FINAL_DIR="${THIS_SCRIPT_DIR}/../../branded/final"

###### convert ######

mkdir -p "${BASIC_FINAL_DIR}"
mkdir -p "${BRANDED_FINAL_DIR}"
node "${THIS_SCRIPT_DIR}/dist/convert-dts/main.mjs" || exit
