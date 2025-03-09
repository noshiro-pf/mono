import { pipe, toThisDir } from '@noshiro/mono-utils';
import 'zx/globals';
import { type SemVer } from './types.mjs';

export const libName = '@noshiro/strict-typescript-lib';

export const repo = 'https://github.com/noshiro-pf/mono.git';

export const license = 'MIT';

export const genLib = false as boolean;

export const packageManagerName = 'yarn';

// /packages/strict-ts-lib/dist/functions/constants.mts
const thisDir = toThisDir(import.meta.url);

// /packages/strict-ts-lib
const strictTsLibDir = path.resolve(thisDir, '../..');

export const paths = {
  root: strictTsLibDir,

  tsTypeUtilsPackageJsonPath: path.resolve(
    strictTsLibDir,
    '../ts-type-utils/package.json',
  ),

  strictTsLib: pipe(strictTsLibDir).chain((root) => ({
    $: root,

    packageJson: path.resolve(root, 'package.json'),

    output: (tsVersion: SemVer) =>
      pipe(`${strictTsLibDir}/output/${tsVersion}` as const).chain(
        (output) => ({
          $: output,

          temp: pipe(`${output}/temp` as const).chain((temp) => ({
            $: temp,

            copied: {
              $: `${temp}/copied` as const,
            },
            copiedForDiff: {
              $: `${temp}/copied-for-diff` as const,
            },
            eslintFixed: {
              $: `${temp}/eslint-fixed` as const,
            },
          })).value,

          normal: pipe(`${output}/normal` as const).chain((o) => ({
            diff: {
              $: `${o}/diff` as const,
            },
            lib: {
              $: `${o}/lib` as const,
            },
            libFiles: {
              $: `${o}/lib-files` as const,
            },
            packages: {
              $: `${o}/packages` as const,
            },
          })).value,

          branded: pipe(`${output}/branded` as const).chain((o) => ({
            diff: {
              $: `${o}/diff` as const,
            },
            lib: {
              $: `${o}/lib` as const,
            },
            libFiles: {
              $: `${o}/lib-files` as const,
            },
            packages: {
              $: `${o}/packages` as const,
            },
          })).value,
        }),
      ).value,
  })).value,
} as const;

export type ConverterConfig = Readonly<{
  commentOutDeprecated: boolean;
  returnType: 'mutable' | 'readonly';
  numberType: 'normal' | 'branded';
}>;

export const converterConfigs = [
  {
    numberType: 'branded',
    commentOutDeprecated: false,
    returnType: 'readonly',
  },
  {
    numberType: 'normal',
    commentOutDeprecated: false,
    returnType: 'mutable',
  },
] as const satisfies ConverterConfig[];
