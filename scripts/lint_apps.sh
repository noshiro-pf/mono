#!/bin/bash

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})

# convert newline separated string to an array by enclosing it in "()"
apps_path_list=($(node "${THIS_SCRIPT_DIR}/get-apps-paths.js"))

for apps_path in "${apps_path_list[@]}" ; do
    echo "linting \"${apps_path}\" ..."
    cd "${MONO_ROOT_DIR}/${apps_path}"
    yarn lint
    echo "done."
    echo ""
done
