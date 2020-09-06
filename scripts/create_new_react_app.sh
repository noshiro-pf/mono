#!/bin/bash

# usage: yarn newapp <new-app-name>

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})

TEMPLATE_DIR_NAME="template"
APPS_DIR="${MONO_ROOT_DIR}/packages/apps"
TEMPLATE_DIR="${APPS_DIR}/${TEMPLATE_DIR_NAME}"

echo "APPS_DIR" ${APPS_DIR}
echo "TEMPLATE_DIR" ${TEMPLATE_DIR}

new_app_name=$1

echo ${new_app_name}


if [ -z ${new_app_name} ]; then
  echo "app name is required."
  exit 1
fi

cp -r ${TEMPLATE_DIR} "${APPS_DIR}/${new_app_name}"
