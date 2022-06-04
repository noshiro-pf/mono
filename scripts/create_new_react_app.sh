#!/bin/bash

# usage: yarn newapp <new-app-name>

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})

TEMPLATE_DIR_NAME="template-react-app"
APPS_DIR="${MONO_ROOT_DIR}/packages/apps"
TEMPLATE_DIR="${APPS_DIR}/${TEMPLATE_DIR_NAME}"

new_app_name=$1

if [ -z ${new_app_name} ]; then
    echo "app name is required."
    exit 1
fi

mkdir -p "${APPS_DIR}/${new_app_name}"
cp -r "${TEMPLATE_DIR}/." "${APPS_DIR}/${new_app_name}/"

new_app_name_kebab=$(echo "${new_app_name}" | sed "s/_/-/g")
echo ${new_app_name_kebab}
sed -i "s/react-app-template/${new_app_name_kebab}/" "${APPS_DIR}/${new_app_name}/package.json"

echo "created ${APPS_DIR}/${new_app_name}"

echo "don't forget to add \"${new_app_name}\" to yarn workspaces!"
