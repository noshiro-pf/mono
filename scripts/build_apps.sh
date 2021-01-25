#!/bin/bash


THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})
apps_path="${MONO_ROOT_DIR}/packages/apps"
echo ${apps_path}

while read target; do
    echo "building \"${target}\" ..." 
    cd "${apps_path}/${target}"
    yarn build
    echo "done."
    echo ""
done < "${THIS_SCRIPT_DIR}/apps.txt"
