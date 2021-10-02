#!/bin/bash

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})

# convert newline separated string to an array by enclosing it in "()"
utils_path_list=($(node "${THIS_SCRIPT_DIR}/get-utils-paths.js"))

for utils_path in "${utils_path_list[@]}" ; do
    echo "linting \"${utils_path}\" ..."
    cd "${MONO_ROOT_DIR}/${utils_path}"
    yarn lint
    echo "done."
    echo ""
done

apps_path="${MONO_ROOT_DIR}/packages/apps"

echo "linting \"lambda_calculus_interpreter_core\" ..."
cd "${apps_path}/lambda_calculus_interpreter_core"
yarn lint
echo "done."

echo "linting \"event_schedule_app_shared\" ..."
cd "${apps_path}/event_schedule_app_shared"
yarn lint
echo "done."
