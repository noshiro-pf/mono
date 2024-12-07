#!/bin/bash


FULL=$1

THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
STRICT_TS_LIB_DIR="${THIS_SCRIPT_DIR}/../.."

COPIED_DIR="${STRICT_TS_LIB_DIR}/source/temp/copied"
COPIED_FOR_DIFF_DIR="${STRICT_TS_LIB_DIR}/source/temp/copied-for-diff"

DIFF_DIR="${STRICT_TS_LIB_DIR}/output/diff"
DIFF_BRANDED_DIR="${STRICT_TS_LIB_DIR}/output-branded/diff"
LIB_FILES_DIR="${STRICT_TS_LIB_DIR}/output/lib-files"
LIB_FILES_BRANDED_DIR="${STRICT_TS_LIB_DIR}/output-branded/lib-files"

if [ "${FULL}" = "full" ]; then
  rm -rf "${COPIED_FOR_DIFF_DIR}"
  mkdir -p "${COPIED_FOR_DIFF_DIR}"
  cp "${COPIED_DIR}"/* "${COPIED_FOR_DIFF_DIR}/"

  echo "formatting..."

  yarn zz:prettier "${COPIED_FOR_DIFF_DIR}"

  # 1回の prettier 実行でフォーマットされない一部ファイルに2回 prettier をかける
  for _ in $(seq 0 1); do
    yarn zz:prettier \
      "${COPIED_FOR_DIFF_DIR}/lib.es2017.object.d.ts" \
      "${COPIED_FOR_DIFF_DIR}/lib.dom.d.ts" \
      "${COPIED_FOR_DIFF_DIR}/lib.es2021.intl.d.ts" \
      "${COPIED_FOR_DIFF_DIR}/lib.es5.d.ts"
  done
fi

main() {
    diff_dir=$1
    lib_files_dir=$2

    rm -rf "${diff_dir}"
    mkdir -p "${diff_dir}"

    while IFS= read -r -d '' file
    do
        filename=$(basename -- "${file}")
        name="${filename%.d.ts}"
        echo "${filename}"

        DIFF_CONTENTS=$(git diff --no-index "${COPIED_FOR_DIFF_DIR}/${name}.d.ts" "${lib_files_dir}/${name}.d.ts")
        DIFF_CONTENTS=$(echo "$DIFF_CONTENTS" | tail -n +5)

        echo "$DIFF_CONTENTS" >> "${diff_dir}/${name}.diff"
    done <   <(find "${COPIED_FOR_DIFF_DIR}" -mindepth 1 -maxdepth 1 -type f -print0)
}

main "${DIFF_DIR}" "${LIB_FILES_DIR}"
main "${DIFF_BRANDED_DIR}" "${LIB_FILES_BRANDED_DIR}"

