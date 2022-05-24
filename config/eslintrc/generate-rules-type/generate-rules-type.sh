#!/bin/bash


SCRIPT_DIR=$(cd $(dirname $0); pwd)


typeNames=(
    "EslintArrayFuncRules"
    "EslintFunctionalRules"
    "EslintImportsRules"
    "EslintJestRules"
    "EslintPromiseRules"
    "EslintSecurityRules"
    "EslintUnicornRules"
    "EslintReactRules"
    "EslintReactHooksRules"
    "EslintRules"
    "TypeScriptEslintRules"
)

pluginNames=(
    "eslint-plugin-array-func"
    "eslint-plugin-functional"
    "eslint-plugin-import"
    "eslint-plugin-jest"
    "eslint-plugin-promise"
    "eslint-plugin-security"
    "eslint-plugin-unicorn"
    "eslint-plugin-react"
    "eslint-plugin-react-hooks"
    "eslint"
    "@typescript-eslint/eslint-plugin"
)

rulePrefixes=(
    "array-func/"
    "functional/"
    "import/"
    "jest/"
    "promise/"
    "security/"
    "unicorn/"
    "react/"
    "react-hooks/"
    "xxx"
    "@typescript-eslint/"
)

outputFiles=(
    "${SCRIPT_DIR}/../eslint-rules/rules-type/eslint-array-func-rules.ts"
    "${SCRIPT_DIR}/../eslint-rules/rules-type/eslint-functional-rules.ts"
    "${SCRIPT_DIR}/../eslint-rules/rules-type/eslint-import-rules.ts"
    "${SCRIPT_DIR}/../eslint-rules/rules-type/eslint-jest-rules.ts"
    "${SCRIPT_DIR}/../eslint-rules/rules-type/eslint-promise-rules.ts"
    "${SCRIPT_DIR}/../eslint-rules/rules-type/eslint-security-rules.ts"
    "${SCRIPT_DIR}/../eslint-rules/rules-type/eslint-unicorn-rules.ts"
    "${SCRIPT_DIR}/../eslint-rules/rules-type/eslint-react-rules.ts"
    "${SCRIPT_DIR}/../eslint-rules/rules-type/eslint-react-hooks-rules.ts"
    "${SCRIPT_DIR}/../eslint-rules/rules-type/eslint-rules.ts"
    "${SCRIPT_DIR}/../eslint-rules/rules-type/typescript-eslint-rules.ts"
)


function generate () {
    typeName=$1
    pluginName=$2
    rulePrefix=$3
    outputFileName=$4

    node ${SCRIPT_DIR}/index.js ${typeName} ${pluginName} ${rulePrefix} > ${outputFileName}
}

function lintFix() {
    # add readonly
    eslint --fix --no-eslintrc --config ${SCRIPT_DIR}/.eslintrc.generate-rules-type.js ${outputFiles[@]}
}


function format() {
    prettier --write ${outputFiles[@]}
}

for (( i=0; i < ${#typeNames[*]}; ++i)); do
    echo "generating ${outputFiles[$i]} ..."
    generate "${typeNames[$i]}" "${pluginNames[$i]}" "${rulePrefixes[$i]}" "${outputFiles[$i]}"
done

echo "lint --fix"
lintFix

echo "formatting code ..."
format
