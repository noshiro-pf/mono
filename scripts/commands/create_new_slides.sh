#!/bin/bash

# usage: yarn create:slides <new-slides-name>

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname $(dirname ${THIS_SCRIPT_DIR}))

TEMPLATE_DIR_NAME="template"
SLIDES_DIR="${MONO_ROOT_DIR}/packages/slides"
TEMPLATE_DIR="${SLIDES_DIR}/${TEMPLATE_DIR_NAME}"

new_slides_name=$1

if [ -z ${new_slides_name} ]; then
    echo "app name is required."
    exit 1
fi

cp -r ${TEMPLATE_DIR} "${SLIDES_DIR}/${new_slides_name}"
echo "created ${SLIDES_DIR}/${new_slides_name}"
