import {
  castMutable,
  isRecord,
  pipe,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-utils';
import 'zx/globals';
import {
  type ConverterConfig,
  converterConfigs,
  genLib,
  libName,
  license,
  paths,
  repo,
  typeUtilsName,
} from '../constants.mjs';
import { strictLibVersions, type TsVersion } from '../typescript-versions.mjs';
import { fetchLibFileNameList } from './fetch-lib-files.mjs';
import { getPackageDirList } from './get-package-dir-list.mjs';
import { clearDir, forAllTsVersions } from './utils/index.mjs';

/** Generate files to `output/{tsVersion}/{numberType}/packages` */
export const genPackages = async (
  tsVersion: TsVersion | 'all',
): Promise<'ok' | 'err'> => forAllTsVersions(tsVersion, genPackagesImpl);

const genPackagesImpl = async (tsVersion: TsVersion): Promise<'ok' | 'err'> => {
  // lib ファイル名に基づき package ディレクトリ階層を packages/ に生成し、
  // その直下のディレクトリ名を元に dependencies を生成するために先に実行する
  await Promise.all(
    converterConfigs.map((cf) => createPackages(cf, tsVersion)),
  );

  await Promise.all([
    ...(genLib ? converterConfigs.map((cfg) => createLib(tsVersion, cfg)) : []),
    updateRootPackageJson(converterConfigs[0], tsVersion),
  ]);

  return 'ok';
};

const createPackages = async (
  config: ConverterConfig,
  tsVersion: TsVersion,
): Promise<'err' | 'ok'> => {
  {
    const res = await clearDir(
      paths.strictTsLib.output(tsVersion)[config.numberType].packages,
    );
    if (res === 'err') return 'err';
  }

  const strictLibVersion = `${tsVersion}-strict-ts-lib-v${strictLibVersions[tsVersion]}`;

  const outDir =
    paths.strictTsLib.output(tsVersion)[config.numberType].packages;

  if (!strictLibVersion.startsWith(tsVersion)) {
    console.error(
      `strictLibVersion should starts with tsVersion "${tsVersion}"`,
    );
    return 'err';
  }

  const packageDirList = await getPackageDirList(tsVersion);

  console.log(
    'target directories:',
    packageDirList.map((a) => path.resolve(outDir, a.packageRelativePath)),
  );

  await Promise.all(
    packageDirList.map(async ({ filename, packageRelativePath }) => {
      const outputDir = path.resolve(outDir, packageRelativePath);

      try {
        await fs.access(outputDir);
      } catch {
        await fs.mkdir(outputDir, { recursive: true });
      }

      {
        const outputFile = path.resolve(outputDir, 'index.d.ts');

        const content = await fs.readFile(
          path.resolve(
            paths.strictTsLib.output(tsVersion)[config.numberType].libFiles,
            filename,
          ),
          { encoding: 'utf8' },
        );

        await fs.writeFile(
          outputFile,
          pipe(content).chain(
            replaceWithNoMatchCheck(
              /\/\/\/ <reference path="\.\/lib\.(.+)\.d\.ts" \/>/gu,
              '/// <reference lib="$1" />',
              {
                onNotFound: 'off',
              },
            ),
          ).value,
        );

        console.log(`${outputFile} generated.`);
      }

      {
        const tsTypeUtilsVersion = await getTsTypeUtilsVersion();

        const outputFile = path.resolve(outputDir, 'package.json');

        await fs.writeFile(
          outputFile,

          JSON.stringify({
            // eslint-disable-next-line no-restricted-syntax
            name: `${libName}${config.numberType === 'branded' ? '-branded' : ''}-${packageRelativePath.replaceAll('/', '-')}`,
            version: strictLibVersion,
            private: false,
            description: 'Strict TypeScript lib',
            repository: {
              type: 'git',
              url: repo,
            },
            license,
            author: 'noshiro-pf <noshiro.pf@gmail.com>',
            sideEffects: false,
            type: 'module',
            types: './index.d.ts',
            dependencies: {
              [typeUtilsName]: tsTypeUtilsVersion,
            },
            peerDependencies: {
              typescript: '>=4.5.2',
            },
          }),
        );

        console.log(`${outputFile} generated.`);
      }
    }),
  );

  return 'ok';
};

/** Generate files in `output/{tsVersion}/{numberType}/lib` */
const createLib = async (
  tsVersion: TsVersion,
  config: ConverterConfig,
): Promise<'ok' | 'err'> => {
  {
    const res = await clearDir(
      paths.strictTsLib.output(tsVersion)[config.numberType].lib,
    );
    if (res === 'err') return 'err';
  }

  {
    const res = await writeLibPackageJson(config.numberType, tsVersion);
    if (res === 'err') return 'err';
  }
  {
    const res =
      await $`cp ${path.resolve(paths.strictTsLib.$, 'README.md')} ${paths.strictTsLib.output(tsVersion)[config.numberType].lib}`;

    if (res.exitCode !== 0) {
      console.error(res.stderr);
      return 'err';
    }
  }
  return 'ok';
};

/** Update root package.json */
const updateRootPackageJson = async (
  config: ConverterConfig,
  tsVersion: TsVersion,
): Promise<'ok' | 'err'> => {
  const strictLibVersion = await getStrictLibVersion();

  if (strictLibVersion === undefined) {
    console.error('tsVersion is undefined');
    return 'err';
  }

  const rootPackageJson = path.resolve(paths.monoRoot, 'package.json');

  const packageJsonStr = await fs.readFile(rootPackageJson, {
    encoding: 'utf8',
  });

  const packageJson = JSON.parse(packageJsonStr);

  if (
    isRecord(packageJson) &&
    Object.hasOwn(packageJson, 'devDependencies') &&
    isRecord(packageJson.devDependencies)
  ) {
    for (const key of Object.keys(packageJson.devDependencies)) {
      if (key.startsWith('@typescript/lib-')) {
        // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-dynamic-delete
        delete castMutable(packageJson.devDependencies)[key];
      }
    }

    const tsStrictLibDependencies = await constructTypeScriptLibDependencies(
      strictLibVersion,
      tsVersion,
      config.numberType,
      'local',
    );

    for (const [key, value] of Object.entries(tsStrictLibDependencies)) {
      if (key.startsWith('@typescript/lib-')) {
        // eslint-disable-next-line functional/immutable-data
        castMutable(packageJson.devDependencies)[key] = value;
      }
    }

    await fs.writeFile(
      rootPackageJson,
      JSON.stringify(packageJson, undefined, 2),
    );
  }

  console.log("root package.json's devDependencies updated.");

  return 'ok';
};

const writeLibPackageJson = async (
  numberType: 'normal' | 'branded',
  tsVersion: TsVersion,
): Promise<'ok' | 'err'> => {
  const strictLibVersion = await getStrictLibVersion();

  if (strictLibVersion === undefined) {
    console.error('version is undefined');
    return 'err';
  }

  const tsTypeUtilsVersion = await getTsTypeUtilsVersion();

  if (tsTypeUtilsVersion === undefined) {
    console.error('tsTypeUtilsVersion is undefined');
    return 'err';
  }

  const outDir = paths.strictTsLib.output(tsVersion)[numberType].lib;

  try {
    await fs.access(outDir);
  } catch {
    await fs.mkdir(outDir, { recursive: true });
  }

  const outputFile = path.resolve(outDir, 'package.json');

  const name = `${libName}${numberType === 'branded' ? '-branded' : ''}`;

  const tsStrictLibDependencies = await constructTypeScriptLibDependencies(
    strictLibVersion,
    tsVersion,
    numberType,
    'global',
  );

  await fs.writeFile(
    outputFile,

    JSON.stringify({
      name,
      version: strictLibVersion,
      private: false,
      description: 'Strict TypeScript lib',
      repository: {
        type: 'git',
        url: repo,
      },
      license,
      author: 'noshiro-pf <noshiro.pf@gmail.com>',
      sideEffects: false,
      type: 'module',
      dependencies: {
        [typeUtilsName]: `^${tsTypeUtilsVersion}`,
        ...tsStrictLibDependencies,
      },
      peerDependencies: {
        typescript: '>=4.5.2',
      },
      publishConfig: {
        access: 'restricted',
        registry: 'https://npm.pkg.github.com/',
      },
    }),
  );

  console.log(`${outputFile} generated.`);

  return 'ok';
};

/** Construct `@typescript/lib-*` dependency object */
const constructTypeScriptLibDependencies = async (
  libVersion: string,
  tsVersion: TsVersion,
  numberType: 'normal' | 'branded',
  type: 'local' | 'global',
): Promise<Record<`@typescript/lib-${string}`, string>> => {
  const prefix = {
    local: `file:./packages/strict-ts-lib/output/${tsVersion}/${numberType}/packages/`,
    global: `npm:${libName}${numberType === 'branded' ? '-branded' : ''}-`,
  }[type];

  const suffix = {
    local: '',
    global: `@${libVersion}`,
  }[type];

  // root package.json には最新の TypeScript バージョンを使用する場合
  if (type === 'global') {
    console.log({ libVersion, typescriptVersion: tsVersion });

    if (!libVersion.startsWith(tsVersion)) {
      // ['lib.decorators.d.ts', ... ]
      const libFileNameList = fetchLibFileNameList(tsVersion);

      const libNameList = libFileNameList
        .filter((name) => name !== 'lib.d.ts')
        .map(replaceWithNoMatchCheck(/lib\.(.+)\.d\.ts/gu, '$1'))
        .filter((s) => !s.includes('.'));

      console.log({
        libFileNameList,
        libNameList,
      });

      return Object.fromEntries(
        libNameList.map((file) => [
          `@typescript/lib-${file}`,
          `${prefix}${file}${suffix}`,
        ]),
      );
    }
  }

  const packagesDir = paths.strictTsLib.output(tsVersion)[numberType].packages;

  const dirs = await fs.readdir(packagesDir);

  return Object.fromEntries(
    dirs.map((file) => [
      `@typescript/lib-${file}`,
      `${prefix}${file}${suffix}`,
    ]),
  );
};

const getStrictLibVersion = async (): Promise<string | undefined> => {
  // NOTE(noshiro-pf): import により静的に読み込むことも可能だが、
  // dist に package.json が複製され都合が悪いため動的に読み込む。

  const packageJsonStr = await fs.readFile(paths.strictTsLib.packageJson, {
    encoding: 'utf8',
  });

  const packageJson = JSON.parse(packageJsonStr);

  return isRecord(packageJson) && Object.hasOwn(packageJson, 'version')
    ? typeof packageJson.version === 'string'
      ? packageJson.version
      : undefined
    : undefined;
};

const getTsTypeUtilsVersion = async (): Promise<string | undefined> => {
  // NOTE: import により静的に読み込むことも可能だが、
  // dist に package.json が複製され都合が悪いため動的に読み込む。

  const packageJsonStr = await fs.readFile(paths.tsTypeUtilsPackageJsonPath, {
    encoding: 'utf8',
  });

  const packageJson = JSON.parse(packageJsonStr);

  return isRecord(packageJson) && Object.hasOwn(packageJson, 'version')
    ? typeof packageJson.version === 'string'
      ? packageJson.version
      : undefined
    : undefined;
};
