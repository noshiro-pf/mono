#!/bin/bash

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})

function buildPkg () {
  cd "${MONO_ROOT_DIR}/$1"
  yarn build
}

function publishPkg () {
  yarn publish "${MONO_ROOT_DIR}/$1" --patch --no-git-tag-version --access=public
}

function buildAndPublishPkg () {
  buildPkg $1;
  publishPkg $1
}

buildAndPublishPkg packages/utils/ts-utils
buildAndPublishPkg packages/utils/syncflow
buildAndPublishPkg packages/utils/syncflow-preact-hooks
buildAndPublishPkg packages/utils/react-syncflow-hooks
buildAndPublishPkg packages/apps/event_schedule_app_shared
buildAndPublishPkg packages/utils/ts-utils
buildAndPublishPkg packages/tools/eslint-custom-rules
