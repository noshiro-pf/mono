#!/bin/bash

targets=(
  # no local dependency
  "ts-utils"

  # ts-utils dependent
  "syncflow"
  "react-syncflow-hooks"
  "preact-syncflow-hooks"
  "rxjs-utils"
  "react-router-utils"
  "react-utils"
  "preact-utils"
  "react-resize-observer-hooks"
  
  # dependencies: [react-utils, rxjs-utils, ts-utils]
  "react-rxjs-utils"
  "preact-rxjs-utils"

  # dependencies: [react-utils, react-resize-observer-hooks, ts-utils]
  "react-utils-styled"

  # dependencies: [react-utils, react-utils-styled, react-resize-observer-hooks, ts-utils]
  "react-material-ui-utils"
  "react-blueprintjs-utils"
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

echo "building \"lambda_calculus_interpreter_core\" ..." 
apps_path="${MONO_ROOT_DIR}/packages/apps"
cd "${apps_path}/lambda_calculus_interpreter_core"
yarn build
echo "done."
