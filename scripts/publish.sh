#!/bin/bash

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})

function publishPkg () {
  yarn publish "${MONO_ROOT_DIR}/$1" --patch --no-git-tag-version --access=public
}

publishPkg packages/utils/ts-utils
publishPkg packages/utils/syncflow
publishPkg packages/utils/preact-syncflow-hooks
publishPkg packages/utils/react-syncflow-hooks
publishPkg packages/apps/event_schedule_app_shared
