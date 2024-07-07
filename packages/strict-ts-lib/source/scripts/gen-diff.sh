#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
STRICT_TS_LIB_DIR="${THIS_SCRIPT_DIR}/../.."

COPIED_FOR_DIFF_DIR="${STRICT_TS_LIB_DIR}/source/temp/copied-for-diff"

DIFF_DIR="${STRICT_TS_LIB_DIR}/output/diff"
DIFF_BRANDED_DIR="${STRICT_TS_LIB_DIR}/output-branded/diff"
LIB_FILES_DIR="${STRICT_TS_LIB_DIR}/output/lib-files"
LIB_FILES_BRANDED_DIR="${STRICT_TS_LIB_DIR}/output-branded/lib-files"


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
