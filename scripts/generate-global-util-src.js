'use strict';
// @ts-check

/**
 * @param {string} packageName
 * @param {readonly string[]} importsList
 * @returns {string}
 */
const generateGlobalsForJest = (packageName, importsList) =>
  [
    // header
    '/* eslint-disable',
    '  @typescript-eslint/no-explicit-any,',
    '  @typescript-eslint/no-unsafe-member-access,',
    '  functional/immutable-data',
    '*/',
    '',

    // imports
    'import {',
    ...importsList.map((s) => `${s},`),
    `} from '${packageName}';`,
    '',

    // set values to global
    ...importsList.map((s) => `(global as any).${s} = ${s};`),
  ].join('\n');

/**
 * @param {string} packageName
 * @param {readonly string[]} importsList
 * @param {Readonly<{
 *   name: string,
 *   params: readonly string[]
 * }>[]} typeImportsList
 * @returns {string}
 */
const generateGlobalsDecl = (packageName, importsList, typeImportsList) =>
  [
    // imports
    'import {',
    ...typeImportsList.map(({ name: s }) => `type ${s} as TYPE_${s},`),
    ...importsList.map((s) => `type ${s} as VAR_${s},`),
    `} from '${packageName}';`,

    '',

    // declaration
    'declare global {',
    ...typeImportsList.map(({ name: s, params: p }) => {
      const paramsDestStr = p.length === 0 ? '' : `<${p.join(', ')}>`;
      const paramsSrcStr =
        p.length === 0
          ? ''
          : `<${p.map((a) => a.replace(/ extends .*$/gu, '')).join(', ')}>`;

      return `type ${s}${paramsDestStr} = TYPE_${s}${paramsSrcStr};`;
    }),
    '',
    '/* custom types */',
    '',
    ...importsList.map((s) => `const ${s}: typeof VAR_${s};`),
    '',
    '/* custom variables */',
    '',
    '}',
  ].join('\n');

/**
 * @param {string} packageName
 * @param {readonly string[]} importsList
 * @param {string} varName
 * @returns {string}
 */
const generateProvidePluginDef = (packageName, importsList, varName) =>
  [
    "import { Obj, tp } from '@noshiro/ts-utils';",
    '',
    `export const providePlugin${varName}Def = Obj.fromEntries(`,
    '[',
    ...importsList.map((s) => `'${s}',`),
    `].map((key) => tp(key, tp('${packageName}', key)))`,
    ');',
  ].join('\n');

/**
 * @param {string} packageName
 * @param {readonly string[]} importsList
 * @param {Readonly<{
 *   name: string,
 *   params: readonly string[]
 * }>[]} typeImportsList
 * @param {string} varName
 * @returns {string}
 */
const generateEslintNoRestrictedImportsDef = (
  packageName,
  importsList,
  typeImportsList,
  varName
) => {
  /**
   * @type {{
   *  name: string
   *  importNames: string[]
   *  message: string
   * }}
   */
  const def = {
    name: packageName,
    importNames: [...importsList, ...typeImportsList.map(({ name }) => name)],
    message: 'use global variable instead.',
  };

  return [
    `export const eslintNoRestrictedImports${varName}Def = {`,
    `name: '${def.name}',`,
    `importNames: [${def.importNames.map((s) => `'${s}'`).join(', ')}],`,
    `message: '${def.message}'`,
    '}',
  ].join('\n');
};

module.exports = {
  generateGlobalsForJest,
  generateGlobalsDecl,
  generateProvidePluginDef,
  generateEslintNoRestrictedImportsDef,
};
