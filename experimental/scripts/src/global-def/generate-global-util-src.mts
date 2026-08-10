import 'zx/globals';

type TypeImports = Readonly<{ name: string; params: readonly string[] }>;
type Imports = Readonly<{ default: string }> | string;

export const generateAllGlobalDefs = async ({
  rootDir,
  packageName,
  importsList,
  typeImportsList,
}: Readonly<{
  rootDir: string;
  packageName: string;
  importsList: readonly Imports[];
  typeImportsList: readonly TypeImports[];
}>): Promise<void> => {
  await Promise.all([
    fs.writeFile(
      `${rootDir}/src/globals-decl.mts`,
      generateGlobalsDecl(packageName, importsList, typeImportsList),
    ),
    fs.writeFile(
      `${rootDir}/src/inject-modules-def.mts`,
      generateInjectModulesDef(packageName, importsList),
    ),
    fs.writeFile(
      `${rootDir}/src/auto-import-def.mts`,
      generateAutoImportDef(packageName, importsList),
    ),
    fs.writeFile(
      `${rootDir}/src/eslint-no-restricted-imports-def.mts`,
      generateEslintNoRestrictedImportsDef(
        packageName,
        importsList,
        typeImportsList,
      ),
    ),
  ]);
};

const generateGlobalsDecl = (
  packageName: string,
  importsList: readonly Imports[],
  typeImportsList: readonly TypeImports[],
): string =>
  [
    // imports
    'import {',
    ...typeImportsList.map(({ name: s }) => `type ${s} as TYPE_${s},`),
    ...importsList.map(
      (s) =>
        `type ${typeof s === 'string' ? s : 'default'} as VAR_${
          typeof s === 'string' ? s : s.default
        },`,
    ),
    `} from '${packageName}';`,

    '',

    // declaration
    'declare global {',
    ...typeImportsList.map(({ name: s, params: p }) => {
      const paramsDestStr = p.length === 0 ? '' : `<${p.join(', ')}>`;
      const paramsSrcStr =
        p.length === 0
          ? ''
          : `<${p.map((a) => a.replaceAll(/ extends .*$/gu, '')).join(', ')}>`;

      return `type ${s}${paramsDestStr} = TYPE_${s}${paramsSrcStr};`;
    }),
    '',
    '/* custom types */',
    '',
    ...importsList.map(
      (s) =>
        `const ${typeof s === 'string' ? s : s.default}: typeof VAR_${
          typeof s === 'string' ? s : s.default
        };`,
    ),
    '',
    '/* custom variables */',
    '',
    '}',
  ].join('\n');

const generateAutoImportDef = (
  packageName: string,
  importsList: readonly Imports[],
): string =>
  [
    'export const autoImportDef = {',
    `"${packageName}": [`,
    ...importsList.flatMap((s) =>
      typeof s === 'string' ? `'${s}',` : [`'default',`, `'${s.default}'`],
    ),
    ']',
    '} as const;',
  ].join('\n');

const generateInjectModulesDef = (
  packageName: string,
  importsList: readonly Imports[],
): string =>
  [
    "import { tp } from '@noshiro/ts-utils';",
    '',
    `export const injectModulesDef = Object.fromEntries(`,
    ...(importsList.every((s) => typeof s === 'string')
      ? [
          '[',
          ...importsList.map(
            (s) => `'${typeof s === 'string' ? s : 'default'}',`,
          ),
          `].map((key) => tp(key, tp('${packageName}', key)))`,
        ]
      : [
          '[',
          ...importsList.map((s) =>
            typeof s === 'string' ? `'${s}'` : `{ default: '${s.default}' }`,
          ),
          `].map((e) => tp(typeof e === 'string' ? e : e.default, tp('${packageName}', typeof e === 'string' ? e : 'default')))`,
        ]),
    ');',
  ].join('\n');

const generateEslintNoRestrictedImportsDef = (
  packageName: string,
  importsList: readonly Imports[],
  typeImportsList: readonly TypeImports[],
): string => {
  const def: Readonly<{
    name: string;
    importNames: readonly string[];
    message: string;
  }> = {
    name: packageName,
    importNames: [
      ...importsList.map((s) => (typeof s === 'string' ? s : 'default')),
      ...typeImportsList.map(({ name }) => name),
    ],
    message: 'use global variable instead.',
  };

  return [
    `export const eslintNoRestrictedImportsDef = {`,
    `name: '${def.name}',`,
    `importNames: [${def.importNames.map((s) => `'${s}'`).join(', ')}],`,
    `message: '${def.message}'`,
    '}',
  ].join('\n');
};
