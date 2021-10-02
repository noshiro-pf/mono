#!/bin/bash

targets=(
  # no local dependency
  "ts-utils"
  "fast-deep-equal"

  # ts-utils dependent
  "syncflow"
  "syncflow-preact-hooks"
  "syncflow-react-hooks"
  "preact-utils"
  "react-utils"
  "react-router-utils"
  "tiny-router-observable"
  "tiny-router-react-hooks"
  "tiny-router-preact-hooks"
  "resize-observer-preact-hooks"
  "resize-observer-react-hooks"

  # dependencies: [react-utils, resize-observer-react-hooks, ts-utils]
  "react-utils-styled"

  # dependencies: [react-utils, react-utils-styled, resize-observer-react-hooks, ts-utils]
  "react-material-ui-utils"
  "react-blueprintjs-utils"
)

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})
utils_path="${MONO_ROOT_DIR}/packages/utils"
echo ${utils_path}

for target in "${targets[@]}" ; do
    echo "linting \"${target}\" ..."
    cd "${utils_path}/${target}"
    yarn lint
    echo "done."
    echo ""
done

# echo "linting \"lambda_calculus_interpreter_core\" ..."
# apps_path="${MONO_ROOT_DIR}/packages/apps"
# cd "${apps_path}/lambda_calculus_interpreter_core"
# yarn lint
# echo "done."
