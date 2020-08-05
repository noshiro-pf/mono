#!/bin/bash

# index_ts_generator.sh

# configs
ADD_SUB_DIRECTORY_EXPORT_IN_INDEX_TS="true"
TS_FILENAME_REGEX="^[a-zA-Z0-9_\-]+.tsx?$"
OMIT_ROOT_INDEX_TS=false
MAX_RECURSION_DEPTH=10

# args
target_directory=$1
clear=$2

# move to target directory
cd ${target_directory}

# regenerate index.ts recursively
for directory in $(find . -maxdepth ${MAX_RECURSION_DEPTH} -type d); do
  if [ "${OMIT_ROOT_INDEX_TS}" = "true" -a "${directory}" = "." ]; then
    continue;
  fi

  index_ts="${directory}/index.ts"

  if [ "${clear}" = "clear" ]; then
    rm ${index_ts}
  else

    # reset index.ts
    echo -n "" > ${index_ts}

    # files in a current directory
    for file in $(find ${directory} -mindepth 1 -maxdepth 1 -type f); do
      filename=$(basename $file)

      # filename without extension
      filename_without_ext="${filename%.*}"

      # only files that match a regular expression "[a-zA-Z0-9_]+.ts"
      if [ ${filename} != "index.ts" ]; then
        if [[ ${filename} =~ ${TS_FILENAME_REGEX} ]]; then
          # add line "export * from 'filename'"
          echo "export * from './${filename_without_ext}';" >> ${index_ts}
        fi
      fi
    done

    if [ ${ADD_SUB_DIRECTORY_EXPORT_IN_INDEX_TS} = "true" ]; then
      # directories in a current directory
      for sub_directory in $(find ${directory} -mindepth 1 -maxdepth 1 -type d); do
        # add line "export * from 'directory_name'"
        sub_directory_basename=$(basename ${sub_directory})
        echo "export * from './${sub_directory_basename}';" >> ${index_ts}
      done
    fi

  fi

  echo ${directory} "done"

done
