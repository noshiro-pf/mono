/* eslint-disable @typescript-eslint/no-dynamic-delete */

import * as fs from 'fs/promises';
import path from 'node:path';
import { type Workspace } from '../index.mjs';
import { isNotUndefined, isRecord } from '../ts-utils/index.mjs';
import {
  eslintConfigName,
  jsOrTsExt,
  tsconfigBuildJsonName,
  tsconfigTestJsonName,
  viteConfigName,
  vitestConfigName,
  workspaceConfigsDirName,
  workspaceScriptsDirName,
} from './constants.mjs';
import { type WorkspaceConfig } from './workspace-config-type.mjs';
import { workspaceConfig } from './workspace-config.mjs';

export const updatePackageJson = async (
  workspace: Workspace,
  packageName: string,
): Promise<void> => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  const depth = workspace.location.split('/').length;

  const pathPrefixToRoot = Array.from({ length: depth }, () => '..').join('/');

  const packageJsonPath = path.resolve(workspace.location, './package.json');

  const mut_packageJson = JSON.parse(
    await fs.readFile(packageJsonPath, { encoding: 'utf8' }),
  );

  if (!isRecord(mut_packageJson)) return;

  updatePackageJsonImpl(
    workspace,
    mut_packageJson,
    packageName,
    pathPrefixToRoot,
    cfg,
  );

  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(mut_packageJson, null, 2),
    {
      encoding: 'utf8',
    },
  );

  console.log(`[${packageName}] package.json updated.`);
};

const updatePackageJsonImpl = (
  workspace: Workspace,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_packageJson: MutableRecord<string, MutableJSONValue | undefined>,
  packageName: string,
  pathPrefixToRoot: string,
  cfg: WorkspaceConfig,
): void => {
  mut_packageJson['private'] = false;
  mut_packageJson['license'] = 'MIT';
  mut_packageJson['author'] = 'noshiro';
  mut_packageJson['sideEffects'] =
    cfg.isViteApp || packageName.startsWith('global-');
  mut_packageJson['type'] = 'module';

  delete mut_packageJson['module'];
  delete mut_packageJson['main'];
  delete mut_packageJson['types'];

  if (!cfg.isViteApp && packageName !== 'strict-ts-lib') {
    mut_packageJson['exports'] = {
      '.': {
        import:
          packageName === 'ts-type-utils-no-stdlib'
            ? {
                types: './ts-type-utils-no-stdlib.d.mts',
              }
            : packageName.startsWith('global-')
              ? {
                  types: './esm/globals-decl.d.mts',
                }
              : {
                  types: './esm/index.d.mts',
                  default: './esm/index.mjs',
                },
      },
    };

    if (packageName === 'event-schedule-app-shared') {
      for (let mut_n = 1; mut_n <= 7; mut_n += 1) {
        const vn = `v${mut_n}`;
        mut_packageJson['exports'][`./${vn}`] = {
          import: {
            types: `./esm/${vn}/index.d.mts`,
            default: `./esm/${vn}/index.mjs`,
          },
        };
      }
    }

    if (packageName.startsWith('global-')) {
      mut_packageJson['exports']['./eslint-no-restricted-imports-def'] = {
        import: './esm/eslint-no-restricted-imports-def.mjs',
      };
      mut_packageJson['exports']['./auto-imports'] = {
        import: './esm/auto-import-def.mjs',
      };
      mut_packageJson['exports']['./inject-modules-def'] = {
        import: './esm/inject-modules-def.mjs',
      };
    }
  }

  {
    // scripts
    if (!isRecord(mut_packageJson['scripts'])) {
      mut_packageJson['scripts'] = {};
    }

    // wireit
    if (!isRecord(mut_packageJson['wireit'])) {
      mut_packageJson['wireit'] = {};
    }

    const generateFlag = {
      typeCheck: true,
      build: cfg.gen.build,
      test: cfg.gen.test,
      lint: cfg.packageJson.scripts.lint !== false,
      gi: cfg.packageJson.scripts.gi,
      publish: cfg.packageJson.scripts.publish,
    };

    const wireitDeps = {
      src: `./${
        cfg.srcDirs.length >= 2 ? `(${cfg.srcDirs.join('|')})` : cfg.srcDirs[0]
      }/**/*.{${jsOrTsExt}}`,
      typeCheckTarget: `./**/*.{${jsOrTsExt}}`,
      tsConfigs: `${pathPrefixToRoot}/config/tsconfig/**`,
      rootPackageJson: `${pathPrefixToRoot}/package.json`,
      rootPrettierrc: `${pathPrefixToRoot}/.prettierrc`,
    };

    switch (packageName) {
      case 'ts-type-utils-no-stdlib': {
        // reset
        mut_packageJson['wireit'] = {};

        // aliases
        const mut_wireit = mut_packageJson['wireit'];

        {
          const filename = './ts-type-utils-no-stdlib.d.mts';

          mut_packageJson['scripts'] = {
            build: 'yarn zz:cmd:build:seq',
            clean: 'run-p clean:**',
            'clean:eslintcache': 'rimraf .eslintcache',
            'clean:wireit': 'rimraf .wireit/**',
            fmt: 'yarn zz:cmd:prettier .',
            lint: 'wireit',
            'lint:fix': 'wireit',
            pub: 'yarn zz:cmd:publish',
            tsc: 'yarn type-check',
            tscw: 'tsc --noEmit --watch',
            'type-check': 'wireit',

            'zz:cmd:build:seq': 'run-s zz:cmd:build:step1',

            'zz:cmd:build:step1': `ls src/*.d.mts | grep std.d.mts --invert | sed -E 's@(^.*$)@/// <reference path="./\\1" />@g' > ${filename}`,
            'zz:cmd:build:step2': `date | sed 's/^/\\/\\/ /g' >> ${filename}`,

            'zz:cmd:eslint': 'ESLINT_USE_FLAT_CONFIG=true eslint',
            'zz:cmd:eslint:src-and-test':
              'yarn zz:cmd:eslint "./{src,test}/**" --cache --cache-location ./.eslintcache',
            'zz:cmd:prettier': `prettier --cache --cache-strategy content --ignore-path ${pathPrefixToRoot}/.prettierignore --write`,
            'zz:cmd:publish':
              'yarn publish --no-git-tag-version --access=public',
          };
        }

        mut_wireit['type-check'] = {
          command: 'tsc --noEmit',
          files: [
            wireitDeps.typeCheckTarget,
            'tsconfig.json',
            wireitDeps.rootPackageJson,
            wireitDeps.tsConfigs,
          ],
          output: [],
        };

        {
          const files = [
            wireitDeps.src,
            eslintConfigName,
            'package.json',
            'tsconfig.json',
            wireitDeps.rootPackageJson,
            wireitDeps.tsConfigs,
          ];

          mut_wireit['lint'] = {
            dependencies: [
              `${pathPrefixToRoot}/packages/utils/eslint-utils:build`,
            ],
            command: 'yarn zz:cmd:eslint:src-and-test',
            files,
            output: [],
          };

          mut_wireit['lint:fix'] = {
            command: 'yarn zz:cmd:eslint:src-and-test --fix',
            files,
            clean: false,
            output: ['src/**/*.mts'],
          };
        }

        break;
      }

      case 'strict-ts-lib': {
        // reset
        mut_packageJson['scripts'] = {
          autofix: 'wireit',
          fmt: 'yarn zz:cmd:prettier .',
          gen: 'run-s gen:d gen:packages',
          'gen:d': 'run-s gen:d:eslint-fixed gen:d:final',
          'gen:d:eslint-fixed': `./${workspaceScriptsDirName}/gen-eslint-fixed.sh`,
          'gen:d:final': `./${workspaceScriptsDirName}/gen-final.sh`,
          'gen:packages': `./${workspaceScriptsDirName}/gen-packages.sh`,
          lint: 'wireit',
          tsc: 'yarn type-check',
          tscw: 'tsc --noEmit --watch',
          'type-check': 'wireit',
          'zz:cmd:eslint': 'ESLINT_USE_FLAT_CONFIG=true eslint',
          'zz:cmd:eslint:scripts': `yarn zz:cmd:eslint --config ${eslintConfigName} ${workspaceScriptsDirName} --cache --cache-location ./${workspaceScriptsDirName}/.eslintcache`,
          'zz:cmd:prettier': `prettier --cache --cache-strategy content --ignore-path ${pathPrefixToRoot}/.prettierignore --write`,
        };
        mut_packageJson['wireit'] = {};

        // aliases
        const mut_wireit = mut_packageJson['wireit'];

        {
          const tsConfigPath = `./${workspaceConfigsDirName}/tsconfig.type-check.json`;
          mut_wireit['type-check'] = {
            command: `tsc -p ${tsConfigPath}`,
            files: ['./test/**/*.mts', tsConfigPath, wireitDeps.tsConfigs],
            output: [],
          };
        }

        mut_wireit['lint'] = {
          dependencies: [
            `${pathPrefixToRoot}/packages/utils/eslint-utils:build`,
          ],
          command: 'yarn zz:cmd:eslint:scripts',
          files: [
            `./${workspaceScriptsDirName}/**/*.{mjs,mts,js,ts,jsx,tsx,d.ts}`,
            `./${eslintConfigName}`,
            './package.json',
            './tsconfig.json',
            wireitDeps.rootPackageJson,
            wireitDeps.tsConfigs,
          ],
          output: [],
        };

        {
          const configPath = `./${workspaceConfigsDirName}/eslint.config.gen.mjs`;

          mut_wireit['autofix'] = {
            command: `yarn zz:cmd:eslint eslint-fixed/ --config ${configPath} --fix --cache --cache-location ./.eslintcache`,
            files: [
              './eslint-fixed/**/*.d.ts',
              configPath,
              './package.json',
              './tsconfig.json',
              wireitDeps.rootPackageJson,
              wireitDeps.tsConfigs,
            ],
            output: [],
          };
        }

        break;
      }

      default: {
        // reset

        mut_packageJson['wireit'] = {};
        mut_packageJson['scripts'] = {};

        // aliases
        const mut_scripts = mut_packageJson['scripts'];
        const mut_wireit = mut_packageJson['wireit'];

        {
          mut_scripts['clean:wireit'] = 'rimraf .wireit/**';

          if (packageName.startsWith('global-')) {
            mut_scripts['clean:src'] = 'rimraf src/*.mts';
            mut_scripts['clean'] =
              'run-p clean:build clean:eslintcache clean:wireit';
          } else {
            mut_scripts['clean'] = 'run-p clean:**';
          }
        }

        {
          mut_scripts['fmt'] = 'yarn zz:cmd:prettier .';
          mut_scripts['zz:cmd:prettier'] =
            `prettier --cache --cache-strategy content --ignore-path ${pathPrefixToRoot}/.prettierignore --write`;
        }

        if (generateFlag.typeCheck) {
          mut_scripts['tsc'] = 'yarn type-check';
          mut_scripts['tscw'] = 'tsc --noEmit --watch';

          if (cfg.isViteApp) {
            mut_scripts['type-check'] = 'run-p type-check:src type-check:cy';
            mut_scripts['type-check:cy'] = 'wireit';
            mut_scripts['type-check:src'] = 'wireit';

            mut_wireit['type-check:src'] = {
              dependencies:
                packageName === 'event-schedule-app'
                  ? ['z:setup', 'z:setup:service-account-key']
                  : ['z:setup'],
              command: 'tsc --noEmit',
              files: [
                wireitDeps.typeCheckTarget,
                './tsconfig.json',
                wireitDeps.rootPackageJson,
                wireitDeps.tsConfigs,
              ],
              output: [],
            };

            mut_wireit['type-check:cy'] = {
              command: 'tsc --noEmit -p ./cypress/tsconfig.json',
              files: [
                `./cypress/**/*.{${jsOrTsExt}}`,
                './cypress/tsconfig.json',
                wireitDeps.rootPackageJson,
                wireitDeps.tsConfigs,
              ],
              output: [],
            };
          } else {
            mut_scripts['type-check'] = 'wireit';

            mut_wireit['type-check'] = {
              command: 'tsc --noEmit',
              files: [
                wireitDeps.typeCheckTarget,
                './tsconfig.json',
                wireitDeps.rootPackageJson,
                wireitDeps.tsConfigs,
              ],
              output: [],
            };
          }
        }

        if (generateFlag.gi !== false) {
          mut_scripts['gi'] = 'wireit';

          const minDepth = generateFlag.gi;
          const giIgnore = cfg.packageJson.scripts.giIgnore;

          const mts = !cfg.isViteApp;

          const content = {
            command: [
              `bash ${pathPrefixToRoot}/scripts/bash/index_ts_generator.sh`,
              './src',
              `--min-depth ${minDepth}`,
              mts ? '--ext .mts' : undefined,
              giIgnore === undefined
                ? undefined
                : `--ignore ${giIgnore.join(',')}`,
            ]
              .filter(isNotUndefined)
              .join(' '),

            files: [
              `${pathPrefixToRoot}/scripts/bash/index_ts_generator.sh`,
              wireitDeps.src,
            ],

            clean: false,
            output: [
              `src/${Array.from({ length: minDepth }, () => '*/').join('')}**/${
                mts ? 'index.mts' : 'index.ts'
              }`,
            ],
            packageLocks: [],
          };

          if (packageName === 'syncflow') {
            mut_scripts['gi'] = 'run-p gi:src gi:test';
            mut_scripts['gi:src'] = 'wireit';
            mut_scripts['gi:test'] = 'wireit';

            mut_wireit['gi:src'] = content;
            mut_wireit['gi:test'] = {
              command: `bash ${pathPrefixToRoot}/scripts/bash/index_ts_generator.sh ./test/cases --min-depth 0 --ext .mts`,
              files: [
                `${pathPrefixToRoot}/scripts/bash/index_ts_generator.sh`,
                'test/cases/**',
              ],
              clean: false,
              output: ['test/cases/**/index.mts'],
              packageLocks: [],
            };
          } else {
            mut_wireit['gi'] = content;
          }
        }

        if (generateFlag.build) {
          mut_scripts[packageName === 'eslint-utils' ? 'build:src' : 'build'] =
            'wireit';
          mut_scripts['clean:build'] = cfg.isViteApp
            ? 'rimraf build'
            : 'rimraf esm';

          if (cfg.isViteApp) {
            const viteConfigPath = `./${workspaceConfigsDirName}/${viteConfigName}`;

            mut_wireit['build'] = {
              dependencies: ['type-check'],
              command: 'yarn zz:cmd:vite build',
              files: [
                './public/**',
                wireitDeps.src,
                viteConfigPath,
                wireitDeps.rootPackageJson,
                wireitDeps.tsConfigs,
              ],
              output: ['build/**'],
            };
          } else {
            const tsConfigPath = `./${workspaceConfigsDirName}/${tsconfigBuildJsonName}`;

            mut_wireit[packageName === 'eslint-utils' ? 'build:src' : 'build'] =
              {
                ...(packageName.startsWith('global-')
                  ? {
                      dependencies: ['zz:cmd:setup'],
                    }
                  : packageName === 'eslint-utils'
                    ? {
                        dependencies: ['gi', 'gen-rules-type'],
                      }
                    : {}),
                command: `tsc --project ${tsConfigPath}`,
                files: [
                  wireitDeps.src,
                  tsConfigPath,
                  wireitDeps.rootPackageJson,
                  wireitDeps.tsConfigs,
                ],
                clean:
                  packageName === 'eslint-utils' ? 'if-file-deleted' : true,
                output: ['esm/**', '.tsbuildinfo'],
              };
          }
        }

        if (generateFlag.test) {
          const vitestConfigPath = cfg.isViteApp
            ? `./${workspaceConfigsDirName}/${viteConfigName}`
            : `./${workspaceConfigsDirName}/${vitestConfigName}`;

          mut_scripts['test'] = 'wireit';
          mut_scripts['testw'] = 'yarn zz:cmd:vitest watch';

          mut_scripts['zz:cmd:vitest'] = `vitest --config ${vitestConfigPath}`;

          mut_wireit['test'] = {
            command: 'yarn zz:cmd:vitest run',
            files: [
              wireitDeps.src,
              vitestConfigPath,
              `./${workspaceConfigsDirName}/${tsconfigTestJsonName}`,
              wireitDeps.rootPackageJson,
              wireitDeps.tsConfigs,
            ],
            output: [],
          };
        }

        if (generateFlag.lint) {
          mut_scripts['clean:eslintcache'] = 'rimraf .eslintcache';

          if (cfg.isViteApp) {
            mut_scripts['lint'] = 'run-p lint:src lint:cy';
            mut_scripts['lint:src'] = 'wireit';
            mut_scripts['lint:cy'] = 'wireit';

            mut_scripts['lint:fix'] = 'run-p lint:fix:src lint:fix:cy';
            mut_scripts['lint:fix:src'] = 'wireit';
            mut_scripts['lint:fix:cy'] = 'wireit';
          } else {
            if (packageName === 'eslint-utils') {
              mut_scripts['lint:src'] = 'wireit';
              mut_scripts['lint:fix:src'] = 'wireit';
            } else {
              mut_scripts['lint'] = 'wireit';
              mut_scripts['lint:fix'] = 'wireit';
            }
          }

          mut_scripts['zz:cmd:eslint'] = 'ESLINT_USE_FLAT_CONFIG=true eslint';

          mut_scripts['zz:cmd:eslint:print-config'] = [
            'yarn zz:cmd:eslint --print-config',
            cfg.isViteApp ? 'src/main.tsx' : 'src/index.mts',
          ].join(' ');

          const srcDirStr =
            cfg.srcDirs.length >= 2
              ? `{${cfg.srcDirs.join(',')}}`
              : cfg.srcDirs[0];

          mut_scripts[
            packageName === 'syncflow'
              ? 'zz:cmd:eslint:src-and-test'
              : 'zz:cmd:eslint:src'
          ] = [
            `yarn zz:cmd:eslint --config ${eslintConfigName}`,
            `'./${srcDirStr}/**/*'`,
            '--cache --cache-location ./src/.eslintcache',
          ].join(' ');

          {
            const dependencies = {
              dependencies: [
                packageName === 'eslint-utils'
                  ? 'build'
                  : `${pathPrefixToRoot}/packages/utils/eslint-utils:build`,
              ],
            };

            const files = [
              wireitDeps.src,
              `./${eslintConfigName}`,
              './package.json',
              './tsconfig.json',
              wireitDeps.rootPackageJson,
              wireitDeps.tsConfigs,
            ];

            mut_wireit[
              cfg.isViteApp || packageName === 'eslint-utils'
                ? 'lint:src'
                : 'lint'
            ] = {
              ...dependencies,
              command:
                packageName === 'syncflow'
                  ? 'yarn zz:cmd:eslint:src-and-test'
                  : 'yarn zz:cmd:eslint:src',
              files,
              output: [],
            };

            mut_wireit[
              cfg.isViteApp || packageName === 'eslint-utils'
                ? 'lint:fix:src'
                : 'lint:fix'
            ] = {
              ...dependencies,
              command:
                packageName === 'syncflow'
                  ? 'yarn zz:cmd:eslint:src-and-test --fix'
                  : 'yarn zz:cmd:eslint:src --fix',
              files,
              clean: false,
              output: [wireitDeps.src],
            };
          }

          if (cfg.isViteApp) {
            mut_scripts['zz:cmd:eslint:cy'] = [
              `yarn zz:cmd:eslint --config ./cypress/${eslintConfigName}`,
              "'./cypress/**/*.ts'",
              '--cache --cache-location ./cypress/.eslintcache',
            ].join(' ');

            const files = [
              './cypress/**/*.ts',
              `./cypress/${eslintConfigName}`,
              './cypress/tsconfig.json',
              './package.json',
              wireitDeps.rootPackageJson,
              wireitDeps.tsConfigs,
            ];

            mut_wireit['lint:cy'] = {
              dependencies: [
                `${pathPrefixToRoot}/packages/utils/eslint-utils:build`,
              ],
              command: 'yarn zz:cmd:eslint:cy',
              files,
              output: [],
            };

            mut_wireit['lint:fix:cy'] = {
              dependencies: [
                `${pathPrefixToRoot}/packages/utils/eslint-utils:build`,
              ],
              command: 'yarn zz:cmd:eslint:cy --fix',
              files,
              clean: false,
              output: ['./cypress/**/*.ts'],
            };
          }
        }

        if (generateFlag.publish) {
          mut_scripts['pub'] = 'yarn zz:cmd:publish';
          mut_scripts['zz:cmd:publish'] =
            'yarn publish --no-git-tag-version --access=public';
        }

        if (cfg.isViteApp) {
          mut_scripts['build:no-minify'] = 'yarn build --minify false';
          mut_scripts['clean:firebase'] = 'rimraf .firebase';

          // workspace.name
          mut_scripts['cy:open'] =
            `yarn workspace ${workspace.name}-cypress cy:open`;
          mut_scripts['cy:record'] =
            `yarn workspace ${workspace.name}-cypress cy:record`;
          mut_scripts['cy:run:chrome'] =
            `yarn workspace ${workspace.name}-cypress cy:run:chrome`;
          mut_scripts['cy:run:firefox'] =
            `yarn workspace ${workspace.name}-cypress cy:run:firefox`;

          mut_scripts['fb'] = 'firebase';
          mut_scripts['fb:deploy'] = 'wireit';
          mut_scripts['fb:deploy:hosting'] = 'wireit';

          mut_wireit['fb:deploy'] = {
            dependencies: ['build'],
            command: 'firebase deploy',
          };

          mut_wireit['fb:deploy:hosting'] = {
            dependencies: ['build'],
            command: 'firebase deploy --only hosting',
          };

          mut_scripts['fb:init'] = 'firebase init';
          mut_scripts['fb:login'] = 'firebase login';
          mut_scripts['fb:login:ci'] = 'firebase login:ci';

          mut_scripts['preview'] = 'yarn zz:cmd:vite:preview';
          mut_scripts['serve'] = 'firebase serve';
          mut_scripts['start'] = 'run-p start:**';
          mut_scripts['start:dev-server'] = 'wireit';

          mut_scripts['z:setup'] = 'run-p z:setup:gen-global-dts';
          mut_scripts['z:setup:gen-global-dts'] =
            'node ./scripts/gen-global-dts.mjs';

          mut_wireit['start:dev-server'] = {
            service: true,
            command: 'yarn zz:cmd:vite --port 5180',
          };

          mut_scripts['zz:cmd:vite'] = 'vite --config configs/vite.config.ts';
          mut_scripts['zz:cmd:vite:preview'] = 'yarn zz:cmd:vite preview';

          if (
            packageName === 'lambda-calculus-interpreter-preact' ||
            packageName === 'lambda-calculus-interpreter-react' ||
            packageName === 'event-schedule-app'
          ) {
            mut_scripts['z:setup'] =
              'run-p z:setup:build-deps z:setup:gen-global-dts';

            mut_scripts['z:setup:build-deps'] = 'wireit';

            mut_wireit['z:setup:build-deps'] = {
              dependencies:
                packageName === 'event-schedule-app'
                  ? ['../event-schedule-app-shared:build']
                  : ['../lambda-calculus-interpreter-core:build'],
              command: "echo 'build deps'",
            };
          }

          if (
            packageName === 'event-schedule-app' ||
            packageName === 'slack-app'
          ) {
            mut_scripts['fb:deploy:functions'] = 'wireit';

            mut_wireit['fb:deploy:functions'] = {
              dependencies: ['./functions:build'],
              command: 'firebase deploy --only functions',
            };

            mut_scripts['start:build-functions'] = 'cd functions && yarn watch';
            mut_scripts['start:emulators'] = 'wireit';

            mut_wireit['start:emulators'] = {
              dependencies: ['./functions:build'],
              service: true,
              command:
                'firebase emulators:start --only functions,firestore,pubsub --import firebase-emulator-exports --export-on-exit',
            };
          }

          if (packageName === 'event-schedule-app') {
            mut_scripts['fb:export'] = 'wireit';

            mut_wireit['fb:export'] = {
              command:
                'node ./scripts/export-firestore > ./scripts/firestore_backup.json && prettier --cache --cache-strategy content --write ./scripts/firestore_backup.json',
            };

            mut_scripts['build:functions'] =
              'yarn workspace @noshiro/event-schedule-app-functions build';

            mut_scripts['fb:write'] = 'node ./scripts/write_firestore';

            mut_scripts['start:emulators:e2e'] =
              'firebase emulators:start --only functions,firestore --import firebase-emulator-exports --export-on-exit';

            mut_scripts['start'] =
              'run-p start:build-functions start:dev-server start:emulators';

            mut_scripts['z:setup:scripts'] = 'wireit';
            {
              const tsConfigPath = `./${workspaceConfigsDirName}/tsconfig.scripts.json`;

              mut_wireit['z:setup:scripts'] = {
                dependencies: [
                  'z:setup:service-account-key',
                  '../event-schedule-app-shared:build',
                ],
                command: `tsc --project ${tsConfigPath}`,
                files: [
                  tsConfigPath,
                  `./${workspaceScriptsDirName}/**/*.ts`,
                  wireitDeps.tsConfigs,
                ],
                clean: false,
                output: [
                  `./${workspaceScriptsDirName}/**/*.js`,
                  `!./${workspaceScriptsDirName}/gen-global-dts.mjs`,
                ],
              };
            }

            mut_scripts['z:setup:service-account-key'] =
              'touch ./scripts/service-account-key.json';
          }
        }

        if (packageName.startsWith('global-')) {
          mut_scripts['zz:cmd:fmt-src'] = 'yarn zz:cmd:prettier ./src';
          mut_scripts['zz:cmd:gen'] =
            `node ./${workspaceScriptsDirName}/gen.mjs`;
          mut_scripts['zz:cmd:setup'] =
            'run-s clean:src zz:cmd:gen zz:cmd:fmt-src';
        }

        if (packageName === 'syncflow') {
          mut_scripts['start'] = 'node esm/test/preview-main.js';
          mut_scripts['test:stream'] = 'yarn zz:cmd:vitest:stream run';
          mut_scripts['zz:cmd:vitest:stream'] =
            'vitest --config ./configs/vitest.config.stream.ts';
        }

        if (packageName === 'eslint-utils') {
          mut_scripts['build'] = 'run-s build:scripts build:src';
          mut_scripts['build:scripts'] = 'wireit';

          mut_scripts['watch'] = 'yarn build:src --watch';

          {
            const tsConfigPath = `./${workspaceConfigsDirName}/tsconfig.scripts.json`;

            mut_wireit['build:scripts'] = {
              command: `tsc --project ${tsConfigPath}`,
              files: [
                `./${workspaceScriptsDirName}/**/*.{mts,ts,d.ts}`,
                tsConfigPath,
                wireitDeps.rootPackageJson,
                wireitDeps.tsConfigs,
              ],
              clean: true,
              output: [
                `${workspaceScriptsDirName}/**/*.mjs`,
                `!${workspaceScriptsDirName}/eslint.config.gen.mjs`,
              ],
            };
          }

          mut_scripts['lint'] = 'run-p lint:scripts lint:src';
          mut_scripts['lint:fix'] = 'run-p lint:fix:scripts lint:fix:src';

          mut_scripts['lint:scripts'] = 'wireit';
          mut_scripts['lint:fix:scripts'] = 'wireit';
          mut_scripts['zz:cmd:eslint:scripts'] =
            `yarn zz:cmd:eslint --config ${eslintConfigName} "./${workspaceScriptsDirName}/**/*" --cache --cache-location ./${workspaceScriptsDirName}/.eslintcache`;

          {
            const files = [
              `${workspaceScriptsDirName}/**/*.mts`,
              eslintConfigName,
              'package.json',
              'tsconfig.json',
              wireitDeps.rootPackageJson,
              wireitDeps.tsConfigs,
            ];

            mut_wireit['lint:scripts'] = {
              dependencies: ['build'],
              command: 'yarn zz:cmd:eslint:scripts',
              files,
              output: [],
            };

            mut_wireit['lint:fix:scripts'] = {
              dependencies: ['build'],
              command: 'yarn zz:cmd:eslint:scripts --fix',
              files,
              clean: false,
              output: [`${workspaceScriptsDirName}/**/*.mts`],
            };
          }

          mut_scripts['gen-rules-type'] = 'wireit';
          mut_wireit['gen-rules-type'] = {
            dependencies: ['build:scripts'],
            command: `node ./${workspaceScriptsDirName}/main.mjs`,
            files: [
              `${pathPrefixToRoot}/scripts/**`,
              `./${workspaceScriptsDirName}/*.mjs`,
              `./${workspaceScriptsDirName}/tsconfig.gen.json`,
              `./${workspaceScriptsDirName}/eslint.config.gen.mjs`,
              wireitDeps.rootPackageJson,
              wireitDeps.rootPrettierrc,
              wireitDeps.tsConfigs,
            ],
            clean: false, // index.mts を削除しないため
            output: ['./src/types/rules/**/*.mts'],
          };

          {
            // re-order properties

            const keys = [
              'build:src',
              'lint:scripts',
              'lint:fix:scripts',
              'lint:src',
              'lint:fix:src',
            ];

            for (const key of keys) {
              const property = mut_wireit[key];
              delete mut_wireit[key];
              mut_wireit[key] = property;
            }
          }
        }
      }
    }
  }

  {
    // devDependencies
    if (!isRecord(mut_packageJson['devDependencies'])) {
      mut_packageJson['devDependencies'] = {};
    }

    const mut_ref = mut_packageJson['devDependencies'];

    if (packageName === 'eslint-utils' || packageName === 'goober') {
      delete mut_ref['@noshiro/eslint-utils'];
    } else {
      mut_ref['@noshiro/eslint-utils'] = '*';
    }

    if (
      packageName !== 'goober' &&
      packageName !== 'eslint-utils' &&
      packageName !== 'ts-type-utils-no-stdlib' &&
      packageName !== 'strict-ts-lib'
    ) {
      mut_ref['@noshiro/ts-type-utils-no-stdlib'] = '*';
    }
  }

  {
    if (cfg.isViteApp) {
      mut_packageJson['browserslist'] = {
        production: ['>0.2%', 'not dead', 'not op_mini all'],
        development: [
          'last 1 chrome version',
          'last 1 firefox version',
          'last 1 safari version',
        ],
      };
    }
  }
};
