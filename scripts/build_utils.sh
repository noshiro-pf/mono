#!/bin/bash

targets=(
  # no local dependency
  "ts-utils"
  "rnjs"
  "rnjs2"

  # ts-utils dependent
  "react-router-utils"
  "react-utils"
  "resize-observer-hooks"
  "rxjs-utils"
  
  # dependencies: [react-utils, rxjs-utils, ts-utils]
  "react-rxjs-utils"

  # dependencies: [react-utils, resize-observer-hooks, ts-utils]
  "react-utils-styled"

  # dependencies: [react-utils, react-utils-styled, resize-observer-hooks, ts-utils]
  "react-material-ui-utils"
)

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})
utils_path="${MONO_ROOT_DIR}/packages/utils"
echo ${utils_path}

for target in "${targets[@]}" ; do
    echo "building \"${target}\" ..." 
    cd "${utils_path}/${target}"
    yarn build
    echo "done."
    echo ""
done
