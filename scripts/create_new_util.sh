#!/bin/bash

# usage: yarn newapp <new-app-name>

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})

TEMPLATE_DIR_NAME="template"
APPS_DIR="${MONO_ROOT_DIR}/packages/utils"
TEMPLATE_DIR="${APPS_DIR}/${TEMPLATE_DIR_NAME}"

new_util_name=$1

if [ -z ${new_util_name} ]; then
  echo "util name is required."
  exit 1
fi

cp -r ${TEMPLATE_DIR} "${APPS_DIR}/${new_util_name}"
echo "created ${APPS_DIR}/${new_util_name}"

echo "don't forget to add \"${new_util_name}\" to \"build_utils.sh\" targets!"
