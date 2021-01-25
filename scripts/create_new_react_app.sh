#!/bin/bash

# usage: yarn newapp <new-app-name>

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})

TEMPLATE_DIR_NAME="template_react_app"
APPS_DIR="${MONO_ROOT_DIR}/packages/apps"
TEMPLATE_DIR="${APPS_DIR}/${TEMPLATE_DIR_NAME}"

new_app_name=$1

if [ -z ${new_app_name} ]; then
  echo "app name is required."
  exit 1
fi

cp -r ${TEMPLATE_DIR} "${APPS_DIR}/${new_app_name}"

sed -i "s/react-app-template/${new_app_name}/" "${APPS_DIR}/${new_app_name}/package.json"
echo ${new_app_name} >> "${THIS_SCRIPT_DIR}/apps.txt"

echo "created ${APPS_DIR}/${new_app_name}"
