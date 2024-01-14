#!/bin/bash

# index_ts_generator.sh

SCRIPT_DIR=$(cd $(dirname "$0") || exit; pwd)

# configs
ADD_SUB_DIRECTORY_EXPORT_IN_INDEX_TS="true"
TS_FILENAME_REGEX="^[a-zA-Z0-9_\-]+.[mc]?tsx?$"

# args
target_directory=$1
clear=false
min_recursion_depth=0
max_recursion_depth=10
ignore=""
ext=".ts"

while [[ $# -gt 0 ]]
do
    key="$1"
    
    case $key in
        --clear)
            clear=true
            shift # past argument
        ;;
        --min-depth)
            min_recursion_depth="$2"
            shift # past argument
            shift # past argument
        ;;
        --max-depth)
            max_recursion_depth="$2"
            shift # past argument
            shift # past argument
        ;;
        --ignore)
            ignore="$2"
            shift # past argument
            shift # past argument
        ;;
        --ext)
            ext="$2"
            shift # past argument
            shift # past argument
        ;;
        *)    # unknown option
            shift # past argument
        ;;
    esac
done

echo clear: ${clear}
echo min_recursion_depth: "${min_recursion_depth}"
echo max_recursion_depth: "${max_recursion_depth}"
echo ignore: "${ignore}"
echo ext: "${ext}"

# move to target directory
cd "${target_directory}" || exit
echo -n "target_directory: "
pwd
echo

index_ts_files=()

# generate index.ts recursively
for directory in $(find . -mindepth "${min_recursion_depth}" -maxdepth "${max_recursion_depth}" -type d); do
    echo "${directory}"
    
    if [ -n "${ignore}" ]; then
        if [[ "${directory}" =~ ${ignore} ]]; then
            echo "skipped."
            continue
        fi
    fi
    
    index_ts="${directory}/index${ext}"
    
    if "${clear}"; then
        rm "${index_ts}"
    else
        
        result=""
        
        # files in a current directory
        for file in $(find "${directory}" -mindepth 1 -maxdepth 1 -type f); do
            filename=$(basename "${file}")
            extension="${filename##*.}"
            
            # filename without extension
            filename_without_ext="${filename%.*}"
            
            # only files that match a regular expression "[a-zA-Z0-9_]+.ts"
            if [ "${filename}" != "index${ext}" ]; then
                if [[ ${filename} =~ ${TS_FILENAME_REGEX} ]]; then
                    # add line "export * from 'filename'"
                    if [ "${extension}" = "mts" ]; then
                        result+="export * from './${filename_without_ext}.mjs';"
                        elif [ "${extension}" = "cts" ]; then
                        result+="export * from './${filename_without_ext}.cjs';"
                    else
                        if [ "${ext}" = ".mts" ] && [ "${extension}" = "tsx" ]; then
                            result+="export * from './${filename_without_ext}.js';"
                        else
                            result+="export * from './${filename_without_ext}';"
                        fi
                    fi
                fi
            fi
        done
        
        if [ ${ADD_SUB_DIRECTORY_EXPORT_IN_INDEX_TS} = "true" ]; then
            # directories in a current directory
            for sub_directory in $(find "${directory}" -mindepth 1 -maxdepth 1 -type d); do
                
                if [ -n "${ignore}" ]; then
                    if [[ "${sub_directory}" =~ ${ignore} ]]; then
                        echo "skipped."
                        continue
                    fi
                fi
                
                # add line "export * from 'directory_name'"
                sub_directory_basename=$(basename "${sub_directory}")
                
                if [ "${ext}" = ".mts" ]; then
                    result+="export * from './${sub_directory_basename}/index.mjs';"
                    elif [ "${ext}" = ".cts" ]; then
                    result+="export * from './${sub_directory_basename}/index.cjs';"
                else
                    result+="export * from './${sub_directory_basename}';"
                fi
            done
            
        fi
        
        
        if [ -z "${result}" ]; then
            result+="export {};"
        fi
        
        echo "${result}" > "${index_ts}"
        index_ts_files+=" ${index_ts}"
        
    fi
    
    echo "${directory}" "done"
    
done

echo
echo "--- prettier ---"

if [ -n "${index_ts_files}" ]; then
    node "${SCRIPT_DIR}"/../node_modules/.bin/prettier --config "${SCRIPT_DIR}"/../.prettierrc --ignore-unknown --no-error-on-unmatched-pattern --cache --cache-strategy content --write ${index_ts_files}
fi
