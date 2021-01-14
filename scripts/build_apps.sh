#!/bin/bash

targets=(
  "annotation_tool"
  "catan_dice_app"
  "color_demo_app"
  "event_schedule_app"
  "housing_loan_calculator"
  "lambda_calculus_interpreter"
  "my_profile_app"
  "slack-app"
)

THIS_SCRIPT_DIR=$(cd $(dirname $0); pwd)
MONO_ROOT_DIR=$(dirname ${THIS_SCRIPT_DIR})
apps_path="${MONO_ROOT_DIR}/packages/apps"
echo ${apps_path}

for target in "${targets[@]}" ; do
    echo "building \"${target}\" ..." 
    cd "${apps_path}/${target}"
    yarn build
    echo "done."
    echo ""
done
