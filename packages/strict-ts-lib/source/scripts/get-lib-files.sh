#!/bin/bash

THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
COPIED_DIR="${THIS_SCRIPT_DIR}/../copied"

rm "${COPIED_DIR}"/*

for filename in $(gh api --method GET --jq '.[].name' /repos/microsoft/TypeScript/contents/lib -F ref=v5.4.3 \
    | grep "^lib.*\.d\.ts"); do
    wget "https://raw.githubusercontent.com/microsoft/TypeScript/v5.4.3/lib/${filename}"  -P "${COPIED_DIR}"
done
