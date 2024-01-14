#!/bin/bash

# usage: yarn create:util <new-util-name>

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname $(dirname ${THIS_SCRIPT_DIR}))

TEMPLATE_DIR_NAME="template"
UTILS_DIR="${MONO_ROOT_DIR}/packages/utils"
TEMPLATE_DIR="${UTILS_DIR}/${TEMPLATE_DIR_NAME}"

new_util_name=$1

if [ -z ${new_util_name} ]; then
    echo "util name is required."
    exit 1
fi

mkdir -p "${UTILS_DIR}/${new_util_name}"
cp -r "${TEMPLATE_DIR}/." "${UTILS_DIR}/${new_util_name}/"

new_util_name_kebab=$(echo "${new_util_name}" | sed "s/_/-/g")
echo ${new_util_name_kebab}
sed -i "s/template-utils/${new_util_name_kebab}/" "${UTILS_DIR}/${new_util_name}/package.json"

echo "created ${UTILS_DIR}/${new_util_name}"

echo "don't forget to add \"${new_util_name}\" to yarn workspaces!"
