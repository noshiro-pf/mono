#!/bin/bash


THIS_SCRIPT_DIR=$(cd "$(dirname $0)" || exit; pwd)
COPIED_DIR="${THIS_SCRIPT_DIR}/../temp/copied-for-diff"

DIFF_BASIC_DIR="${THIS_SCRIPT_DIR}/../../basic/diff"
DIFF_BRANDED_DIR="${THIS_SCRIPT_DIR}/../../branded/diff"
FINAL_BASIC_DIR="${THIS_SCRIPT_DIR}/../../basic/final"
FINAL_BRANDED_DIR="${THIS_SCRIPT_DIR}/../../branded/final"


main() {
    diff_dir=$1
    final_dir=$2
    
    rm -rf "${diff_dir}"
    mkdir -p "${diff_dir}"
    
    while IFS= read -r -d '' file
    do
        filename=$(basename -- "${file}")
        name="${filename%.d.ts}"
        echo "${filename}"
        
        DIFF_CONTENTS=$(git diff --no-index "${COPIED_DIR}/${name}.d.ts" "${final_dir}/${name}.d.ts")
        DIFF_CONTENTS=$(echo "$DIFF_CONTENTS" | tail -n +5)
        
        out_file="${diff_dir}/${name}.md"
        echo '```diff' > "${out_file}"
        echo "$DIFF_CONTENTS" >> "${out_file}"
        echo '```' >> "${out_file}"
    done <   <(find "${COPIED_DIR}" -mindepth 1 -maxdepth 1 -type f -print0)
}

main "${DIFF_BASIC_DIR}" "${FINAL_BASIC_DIR}"
main "${DIFF_BRANDED_DIR}" "${FINAL_BRANDED_DIR}"
