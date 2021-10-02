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
    echo "building \"${target}\" ..."
    cd "${utils_path}/${target}"
    yarn build
    echo "done."
    echo ""
done

apps_path="${MONO_ROOT_DIR}/packages/apps"

echo "building \"lambda_calculus_interpreter_core\" ..."
cd "${apps_path}/lambda_calculus_interpreter_core"
yarn build
echo "done."

echo "building \"event_schedule_app_shared\" ..."
cd "${apps_path}/event_schedule_app_shared"
yarn build
echo "done."
