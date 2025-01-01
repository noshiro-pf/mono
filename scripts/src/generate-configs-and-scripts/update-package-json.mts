import * as fs from 'fs/promises';
import path from 'node:path';
import { type Workspace } from '../index.mjs';
import { isNotUndefined, isRecord } from '../ts-utils/index.mjs';
import {
  eslintConfigName,
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

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const mut_packageJson = JSON.parse(
    await fs.readFile(packageJsonPath, { encoding: 'utf8' }),
  ) as MutableJsonValue;

  if (!isRecord(mut_packageJson)) return;

  updatePackageJsonImpl(
    workspace,

    mut_packageJson as MutableRecord<string, MutableJsonValue | undefined>,
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
  mut_packageJson: MutableRecord<string, MutableJsonValue | undefined>,
  packageName: string,
  pathPrefixToRoot: string,
  cfg: WorkspaceConfig,
): void => {
  mut_packageJson['private'] = false;
  mut_packageJson['license'] = 'MIT';
  mut_packageJson['author'] = 'noshiro-pf <noshiro.pf@gmail.com>';
  mut_packageJson['sideEffects'] =
    cfg.useVite === true || packageName.startsWith('global-');
  mut_packageJson['type'] = 'module';

  delete mut_packageJson['module'];
  delete mut_packageJson['main'];
  delete mut_packageJson['types'];

  if (cfg.useVite === false && packageName !== 'strict-ts-lib') {
    mut_packageJson['exports'] = {
      '.': {
        import:
          packageName === 'ts-type-utils'
            ? {
                types: './ts-type-utils.d.mts',
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

    if (packageName === 'ts-type-utils') {
      mut_packageJson['types'] = './ts-type-utils.d.mts';
    }

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

    switch (packageName) {
      case 'ts-type-utils': {
        const filename = './ts-type-utils.d.mts';

        mut_packageJson['scripts'] = {
          build: 'yarn zz:build:seq',
          clean: 'run-p clean:**',
          'clean:wireit': 'rimraf .wireit/**',
          fmt: 'yarn zz:prettier .',
          lint: 'yarn zz:eslint:src-and-test',
          'lint:fix': 'yarn zz:eslint:src-and-test --fix',
          pub: 'yarn zz:publish',
          tsc: 'yarn type-check',
          tscw: 'yarn type-check --watch',
          'type-check': 'tsc --noEmit',
          'zz:build:seq': 'run-s zz:build:step1',

          'zz:build:step1': `ls src/*.d.mts | sed -E 's@(^.*$)@/// <reference path="./\\1" />@g' > ${filename}`,

          'zz:eslint': 'ESLINT_USE_FLAT_CONFIG=true TIMING=1 eslint',
          'zz:eslint:src-and-test': 'yarn zz:eslint "./{src,test}/**"',
          'zz:prettier': `prettier --cache --cache-strategy content --ignore-path ${pathPrefixToRoot}/.prettierignore --write`,
          'zz:publish': 'yarn publish --no-git-tag-version --access=public',
        };

        break;
      }

      case 'eslint-configs':
      case 'strict-ts-lib': {
        // skip
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
            mut_scripts['clean'] = 'run-p clean:build clean:wireit';
          } else {
            mut_scripts['clean'] = 'run-p clean:**';
          }
        }

        {
          mut_scripts['fmt'] = 'yarn zz:prettier .';
          mut_scripts['zz:prettier'] =
            `prettier --cache --cache-strategy content --ignore-path ${pathPrefixToRoot}/.prettierignore --write`;
        }

        if (generateFlag.typeCheck) {
          mut_scripts['tsc'] = 'yarn type-check';
          mut_scripts['tscw'] = 'tsc --noEmit --watch';

          if (cfg.useVite === true) {
            mut_scripts['type-check'] = 'run-p type-check:src type-check:cy';
            mut_scripts['type-check:cy'] =
              'tsc --noEmit -p ./cypress/tsconfig.json';
            mut_scripts['type-check:src'] = 'wireit';

            mut_wireit['type-check:src'] = {
              dependencies:
                packageName === 'event-schedule-app'
                  ? [
                      'z:setup:gen-global-dts',
                      '../event-schedule-app-shared:type-check',
                      'z:setup:service-account-key',
                    ]
                  : ['z:setup:gen-global-dts'],
              command: 'tsc --noEmit',
            };
          } else {
            mut_scripts['type-check'] = 'tsc --noEmit';
          }
        }

        if (generateFlag.gi !== false) {
          const minDepth = generateFlag.gi;
          const giIgnore = cfg.packageJson.scripts.giIgnore;

          const mts = cfg.useVite !== true;

          const command = [
            `bash ${pathPrefixToRoot}/scripts/bash/index_ts_generator.sh`,
            './src',
            `--min-depth ${minDepth}`,
            mts ? '--ext .mts' : undefined,
            giIgnore === undefined
              ? undefined
              : `--ignore ${giIgnore.join(',')}`,
          ]
            .filter(isNotUndefined)
            .join(' ');

          if (packageName === 'syncflow') {
            mut_scripts['gi'] = 'run-p gi:src gi:test';

            mut_scripts['gi:src'] = command;
            mut_scripts['gi:test'] =
              `bash ${pathPrefixToRoot}/scripts/bash/index_ts_generator.sh ./test/cases --min-depth 0 --ext .mts`;
          } else {
            mut_scripts['gi'] = command;
          }
        }

        if (generateFlag.build) {
          mut_scripts['build'] = 'wireit';
          mut_scripts['clean:build'] =
            cfg.useVite === true ? 'rimraf build' : 'rimraf esm';

          if (cfg.useVite === true) {
            mut_wireit['build'] = {
              dependencies: [
                ...(packageName === 'my-portfolio-app-preact'
                  ? ['get-zenn-articles']
                  : []),
                'clean:build',
                'type-check',
              ],
              command: 'yarn zz:vite build',
            };
          } else {
            if (packageName.startsWith('global-')) {
              mut_wireit['build'] = {
                dependencies: ['clean:build', 'zz:setup'],
                command: `rollup --config ./${workspaceConfigsDirName}/rollup.config.ts --configPlugin typescript`,
              };
            } else {
              mut_wireit['build'] = {
                dependencies: [
                  'clean:build',
                  ...(generateFlag.gi === false ? [] : ['gi']),
                  'type-check',
                  ...(packageName === 'syncflow-preact-hooks' ||
                  packageName === 'syncflow-react-hooks'
                    ? ['gen:re-export']
                    : []),
                ],
                command: `rollup --config ./${workspaceConfigsDirName}/rollup.config.ts --configPlugin typescript`,
              };
            }
          }
        }

        if (generateFlag.test) {
          const vitestConfigPath =
            cfg.useVite === true
              ? `./${workspaceConfigsDirName}/${viteConfigName}`
              : `./${workspaceConfigsDirName}/${vitestConfigName}`;

          mut_scripts['test'] = 'yarn zz:vitest run';
          mut_scripts['testw'] = 'yarn zz:vitest watch';

          mut_scripts['zz:vitest'] = `vitest --config ${vitestConfigPath}`;
        }

        if (generateFlag.lint) {
          if (cfg.useVite === true) {
            mut_scripts['lint'] = 'run-p lint:src lint:cy';
            mut_scripts['lint:src'] =
              packageName === 'syncflow'
                ? 'yarn zz:eslint:src-and-test'
                : 'yarn zz:eslint:src';
            mut_scripts['lint:cy'] = 'yarn zz:eslint:cy';

            mut_scripts['lint:fix'] = 'run-p lint:fix:src lint:fix:cy';
            mut_scripts['lint:fix:src'] =
              packageName === 'syncflow'
                ? 'yarn zz:eslint:src-and-test --fix'
                : 'yarn zz:eslint:src --fix';
            mut_scripts['lint:fix:cy'] = 'yarn zz:eslint:cy --fix';
          } else {
            mut_scripts['lint'] =
              packageName === 'syncflow'
                ? 'yarn zz:eslint:src-and-test'
                : 'yarn zz:eslint:src';
            mut_scripts['lint:fix'] =
              packageName === 'syncflow'
                ? 'yarn zz:eslint:src-and-test --fix'
                : 'yarn zz:eslint:src --fix';
          }

          mut_scripts['zz:eslint'] =
            'ESLINT_USE_FLAT_CONFIG=true TIMING=1 eslint';

          mut_scripts['zz:eslint:print-config'] = [
            'yarn zz:eslint --print-config',
            cfg.useVite === true ? 'src/main.tsx' : 'src/index.mts',
          ].join(' ');

          const srcDirStr =
            cfg.srcDirs.length >= 2
              ? `{${cfg.srcDirs.join(',')}}`
              : cfg.srcDirs[0];

          mut_scripts[
            packageName === 'syncflow'
              ? 'zz:eslint:src-and-test'
              : 'zz:eslint:src'
          ] = [
            `yarn zz:eslint --config ${eslintConfigName}`,
            `'./${srcDirStr}/**/*'`,
          ].join(' ');

          if (cfg.useVite === true) {
            mut_scripts['zz:eslint:cy'] = [
              `yarn zz:eslint --config ./cypress/${eslintConfigName}`,
              "'./cypress/**/*.ts'",
            ].join(' ');
          }
        }

        if (generateFlag.publish) {
          mut_scripts['pub'] = 'yarn zz:publish';
          mut_scripts['zz:publish'] =
            'yarn publish --no-git-tag-version --access=public';
        }

        if (
          packageName === 'syncflow-preact-hooks' ||
          packageName === 'syncflow-react-hooks'
        ) {
          mut_scripts['build:script'] =
            'tsc -p ./configs/tsconfig.scripts.json';

          mut_scripts['gen:re-export'] = 'wireit';
          mut_scripts['gen:re-export:fmt'] =
            'yarn zz:prettier src/syncflow.mts';
          mut_scripts['gen:re-export:script'] =
            'node ./scripts/generate-re-export-script.mjs';

          // "build": {
          //   "dependencies": [
          //     "clean:build",
          //     "gi",
          //     "type-check",
          //     "gen:re-export"
          //   ],
          //   "command": "rollup --config ./configs/rollup.config.ts --configPlugin typescript"
          // },

          mut_wireit['gen:re-export'] = {
            command:
              'run-s build:script gen:re-export:script gen:re-export:fmt',
          };
        }

        if (cfg.useVite === true) {
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

          mut_scripts['preview'] = 'yarn zz:vite:preview';
          mut_scripts['serve'] = 'firebase serve';
          mut_scripts['start'] = 'run-p start:**';
          mut_scripts['start:dev-server'] = 'yarn zz:vite --port 5180';

          mut_scripts['z:setup'] = 'run-p z:setup:gen-global-dts';
          mut_scripts['z:setup:gen-global-dts'] =
            'node ./scripts/gen-global-dts.mjs';

          mut_scripts['zz:vite'] = 'vite --config configs/vite.config.ts';
          mut_scripts['zz:vite:preview'] = 'yarn zz:vite preview';

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
            mut_scripts['fb:export'] =
              'node ./scripts/export-firestore > ./scripts/firestore_backup.json && prettier --cache --cache-strategy content --write ./scripts/firestore_backup.json';

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
              };
            }

            mut_scripts['z:setup:service-account-key'] =
              'touch ./scripts/service-account-key.json';
          }
        }

        if (packageName.startsWith('global-')) {
          mut_scripts['zz:fmt-src'] = 'yarn zz:prettier ./src';
          mut_scripts['zz:gen'] = `node ./${workspaceScriptsDirName}/gen.mjs`;
          mut_scripts['zz:setup'] =
            'run-s clean:src zz:gen zz:fmt-src type-check';
        }

        if (packageName === 'syncflow') {
          mut_scripts['start'] = 'node esm/test/preview-main.js';
          mut_scripts['test:stream'] = 'yarn zz:vitest:stream run';
          mut_scripts['zz:vitest:stream'] =
            'vitest --config ./configs/vitest.config.stream.ts';
        }

        if (packageName === 'my-portfolio-app-preact')
          mut_scripts['get-zenn-articles'] =
            'node ./scripts/get-zenn-articles.mjs';
      }
    }
  }

  {
    // devDependencies
    if (!isRecord(mut_packageJson['devDependencies'])) {
      mut_packageJson['devDependencies'] = {};
    }

    const mut_ref = mut_packageJson['devDependencies'];

    if (
      packageName === 'eslint-configs' ||
      packageName === 'goober' ||
      packageName === 'strict-ts-lib'
    ) {
      delete mut_ref['@noshiro/eslint-configs'];
    } else {
      mut_ref['@noshiro/eslint-configs'] = '*';
    }

    if (
      packageName !== 'goober' &&
      packageName !== 'eslint-configs' &&
      packageName !== 'ts-type-utils' &&
      packageName !== 'strict-ts-lib'
    ) {
      mut_ref['@noshiro/ts-type-utils'] = '*';
    }
  }

  {
    if (cfg.useVite === true) {
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

  if (Object.keys(mut_packageJson['wireit']).length === 0) {
    delete mut_packageJson['wireit'];
  }
};
