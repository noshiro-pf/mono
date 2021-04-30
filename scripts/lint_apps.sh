#!/bin/bash


THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})
apps_path="${MONO_ROOT_DIR}/packages/apps"
echo ${apps_path}

echo "target list: "
while read target; do
    if [[ ${target} == \#* ]] ;
    then
        echo "  - (skipped) ${target} "
    else
        echo "  - ${target}"
    fi
done < "${THIS_SCRIPT_DIR}/apps.txt"
echo

while read target; do
    if [[ ${target} == \#* ]] ;
    then
        echo "skipped ${target} "
    else
        echo "linting \"${target}\" ..." 
        cd "${apps_path}/${target}"
        yarn lint
        echo "done."
        echo ""
    fi
done < "${THIS_SCRIPT_DIR}/apps.txt"
