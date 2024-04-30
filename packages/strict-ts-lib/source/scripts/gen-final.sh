#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
FINAL_DIR="${THIS_SCRIPT_DIR}/../final"
# MONO_DIR="${THIS_SCRIPT_DIR}/../../.."

###### convert ######

mkdir -p "${FINAL_DIR}"
node "${THIS_SCRIPT_DIR}/dist/convert-dts/main.mjs" || exit

# cd "${MONO_DIR}" || exit
