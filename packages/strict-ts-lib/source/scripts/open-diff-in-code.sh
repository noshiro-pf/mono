#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
STRICT_TS_LIB_DIR="${THIS_SCRIPT_DIR}/../.."

COPIED_FOR_DIFF_DIR="${STRICT_TS_LIB_DIR}/source/temp/copied-for-diff"

DIFF_DIR="${STRICT_TS_LIB_DIR}/output/diff"
DIFF_BRANDED_DIR="${STRICT_TS_LIB_DIR}/output-branded/diff"
LIB_FILES_DIR="${STRICT_TS_LIB_DIR}/output/lib-files"
LIB_FILES_BRANDED_DIR="${STRICT_TS_LIB_DIR}/output-branded/lib-files"


main() {
    lib_files_dir=$2

    while IFS= read -r -d '' file
    do
        filename=$(basename -- "${file}")
        name="${filename%.d.ts}"


        if [[ ! ${name} =~ ^(lib|lib.es6|lib\.esnext(\.full)?|lib.es20[0-9][0-9](\.full)?)$ ]]; then
            code --diff "${COPIED_FOR_DIFF_DIR}/${name}.d.ts" "${lib_files_dir}/${name}.d.ts"
        fi

    done <   <(find "${COPIED_FOR_DIFF_DIR}" -mindepth 1 -maxdepth 1 -type f -print0) | sort
}

if [ $1 = "normal" ]; then
    main "${DIFF_DIR}" "${LIB_FILES_DIR}"
    elif [ $1 = "branded" ]; then
    main "${DIFF_BRANDED_DIR}" "${LIB_FILES_BRANDED_DIR}"
fi

