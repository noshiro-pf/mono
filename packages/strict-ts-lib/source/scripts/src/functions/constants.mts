import { pipe, toThisDir } from '@noshiro/mono-utils';
import 'zx/globals';
import { type ConverterConfig } from '../convert-dts/common.mjs';

export const libName = '@noshiro/strict-typescript-lib';

export const repo = 'https://github.com/noshiro-pf/mono.git';

export const license = 'MIT';

export const genLib = false as boolean;

export const packageManagerName = 'yarn';

// /packages/strict-ts-lib/source/scripts/dist/commands/functions/constants.mts
const thisDir = toThisDir(import.meta.url);

// /packages/strict-ts-lib
const strictTsLibDir = path.resolve(thisDir, '../../../..');

export const paths = {
  root: path.resolve(strictTsLibDir, '../..'),

  tsTypeUtilsPackageJsonPath: path.resolve(
    strictTsLibDir,
    '../ts-type-utils/package.json',
  ),

  strictTsLib: pipe(strictTsLibDir).chain((root) => ({
    $: root,

    output: pipe(`${strictTsLibDir}/output` as const).chain((output) => ({
      $: output,

      diff: {
        $: `${output}/diff` as const,
      },
      lib: {
        $: `${output}/lib` as const,
      },
      libFiles: {
        $: `${output}/lib-files` as const,
      },
      packages: {
        $: `${output}/packages` as const,
      },
    })).value,

    outputBranded: pipe(`${strictTsLibDir}/output-branded` as const).chain(
      (output) => ({
        $: output,

        diff: {
          $: `${output}/diff` as const,
        },
        lib: {
          $: `${output}/lib` as const,
        },
        libFiles: {
          $: `${output}/lib-files` as const,
        },
        packages: {
          $: `${output}/packages` as const,
        },
      }),
    ).value,

    source: pipe(`${strictTsLibDir}/source` as const).chain((source) => ({
      $: source,

      packageJson: path.resolve(source, 'package.json'),

      temp: pipe(`${source}/temp` as const).chain((temp) => ({
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

      scripts: {
        $: `${source}/scripts` as const,
      },
    })).value,
  })).value,
} as const;

export const configs = [
  {
    useBrandedNumber: true,
    commentOutDeprecated: false,
    returnType: 'readonly',
  },
  {
    useBrandedNumber: false,
    commentOutDeprecated: false,
    returnType: 'mutable',
  },
] as const satisfies ConverterConfig[];
