/** @typedef {import('./workspace-config-type.mjs').WorkspaceConfig} WorkspaceConfig */

import { produce } from 'immer';
import { isNotUndefined } from '../ts-utils/guard.mjs';
import {
  workspaceConfigsDirName,
  workspaceScriptsDirName,
} from './constants.mjs';

/** @type {WorkspaceConfig} */
const workspaceConfigGlobalUtil = {
  gen: {
    typeCheck: true,
    build: true,
    lint: true,
    test: false,
  },
  tsType: 'mts',
  isViteApp: false,
  srcDirs: ['src'],
  typeCheckIncludes: ['src', workspaceConfigsDirName, workspaceScriptsDirName],
  packageJson: {
    scripts: {
      gi: false,
      publish: false,
    },
  },
};

/** @type {WorkspaceConfig} */
const defaultsForUtil = {
  gen: {
    typeCheck: true,
    build: true,
    lint: true,
    test: true,
  },
  tsType: 'mts',
  isViteApp: false,
  srcDirs: ['src'],
  typeCheckIncludes: ['src', workspaceConfigsDirName],
  packageJson: {
    scripts: {
      gi: 0,
      publish: true,
    },
  },
};

/** @type {WorkspaceConfig} */
const defaultsForApp = {
  gen: {
    typeCheck: true,
    build: true,
    lint: true,
    test: true,
  },
  // eslint-disable-next-line unicorn/no-unused-properties
  isViteApp: true,
  // eslint-disable-next-line unicorn/no-unused-properties
  tsType: 'mts',
  // eslint-disable-next-line unicorn/no-unused-properties
  srcDirs: ['src'],
  typeCheckIncludes: ['src', workspaceConfigsDirName],
  // eslint-disable-next-line unicorn/no-unused-properties
  packageJson: {
    scripts: {
      gi: 0,
      publish: false,
    },
  },
};

/**
 * @param {Readonly<{
 *   tsType?: WorkspaceConfig["tsType"];
 *   gi?: WorkspaceConfig["packageJson"]["scripts"]["gi"];
 *   passWithNoTests?: WorkspaceConfig["packageJson"]["scripts"]["passWithNoTests"];
 *   hasScripts?: boolean;
 * }>} [options]
 * @returns {WorkspaceConfig}
 */
const fillDefaultsForUtil = (options) => ({
  gen: defaultsForUtil.gen,
  tsType: options?.tsType ?? 'mts',
  isViteApp: false,
  srcDirs: ['src'],
  typeCheckIncludes: [
    ...defaultsForUtil.typeCheckIncludes,
    options?.hasScripts === true ? workspaceScriptsDirName : undefined,
  ].filter(isNotUndefined),
  packageJson: {
    scripts: {
      gi: options?.gi ?? 0,
      publish: true,
      passWithNoTests: options?.passWithNoTests,
    },
  },
});

/**
 * @param {Readonly<{
 *   tsType?: WorkspaceConfig["tsType"];
 *   gi?: WorkspaceConfig["packageJson"]["scripts"]["gi"];
 *   giIgnore?: WorkspaceConfig["packageJson"]["scripts"]["giIgnore"];
 *   passWithNoTests?: WorkspaceConfig["packageJson"]["scripts"]["passWithNoTests"];
 *   hasScripts?: boolean;
 * }>} [options]
 * @returns {WorkspaceConfig}
 */
const fillDefaultsForApp = (options) => ({
  gen: defaultsForApp.gen,
  tsType: options?.tsType ?? 'mts',
  isViteApp: true,
  srcDirs: ['src'],
  typeCheckIncludes: [
    ...defaultsForApp.typeCheckIncludes,
    options?.hasScripts === false ? undefined : workspaceScriptsDirName,
  ].filter(isNotUndefined),
  packageJson: {
    scripts: {
      gi: options?.gi ?? 1,
      giIgnore: options?.giIgnore ?? ['assets'],
      publish: false,
      passWithNoTests: options?.passWithNoTests ?? true,
    },
  },
});

/** @type {Record<string, WorkspaceConfig>} */
export const workspaceConfig = {
  'global-emotion-react': workspaceConfigGlobalUtil,
  'global-emotion-styled': workspaceConfigGlobalUtil,
  'global-goober': workspaceConfigGlobalUtil,
  'global-preact-utils': workspaceConfigGlobalUtil,
  'global-preact': workspaceConfigGlobalUtil,
  'global-react-utils': workspaceConfigGlobalUtil,
  'global-react': workspaceConfigGlobalUtil,
  'global-syncflow-preact-hooks': workspaceConfigGlobalUtil,
  'global-syncflow-react-hooks': workspaceConfigGlobalUtil,
  'global-syncflow': workspaceConfigGlobalUtil,
  'global-tiny-router-observable': workspaceConfigGlobalUtil,
  'global-tiny-router-preact-hooks': workspaceConfigGlobalUtil,
  'global-tiny-router-react-hooks': workspaceConfigGlobalUtil,
  'global-ts-utils': workspaceConfigGlobalUtil,

  template: fillDefaultsForUtil({
    passWithNoTests: true,
  }),
  'ts-utils': fillDefaultsForUtil(),
  'tiny-router-observable': fillDefaultsForUtil({
    passWithNoTests: true,
  }),
  'io-ts': fillDefaultsForUtil(),
  'lambda-calculus-interpreter-core': fillDefaultsForUtil(),

  'ts-utils-additional': fillDefaultsForUtil({
    hasScripts: true,
  }),

  'event-schedule-app-shared': fillDefaultsForUtil({
    gi: 2,
  }),
  'deep-object-diff': fillDefaultsForUtil({
    gi: false,
    passWithNoTests: true,
  }),
  'fast-deep-equal': fillDefaultsForUtil({
    gi: false,
    passWithNoTests: true,
  }),
  'preact-utils': fillDefaultsForUtil({
    tsType: 'preact',
    passWithNoTests: true,
  }),
  'react-blueprintjs-utils': fillDefaultsForUtil({
    tsType: 'react',
    passWithNoTests: true,
  }),
  'react-mui-utils': fillDefaultsForUtil({
    gi: 1,
    tsType: 'react-emotion',
    passWithNoTests: true,
  }),
  'react-utils-styled': fillDefaultsForUtil({
    tsType: 'react',
    passWithNoTests: true,
  }),
  'react-utils': fillDefaultsForUtil({
    tsType: 'react',
    passWithNoTests: true,
  }),

  'resize-observer-preact-hooks': fillDefaultsForUtil({
    tsType: 'preact',
    gi: false,
    passWithNoTests: true,
  }),
  'resize-observer-react-hooks': fillDefaultsForUtil({
    tsType: 'react',
    gi: false,
    passWithNoTests: true,
  }),

  'syncflow-preact-hooks': fillDefaultsForUtil({
    tsType: 'preact',
    gi: false,
    passWithNoTests: true,
  }),
  'syncflow-react-hooks': fillDefaultsForUtil({
    tsType: 'react',
    gi: false,
    passWithNoTests: true,
  }),

  'tiny-router-preact-hooks': fillDefaultsForUtil({
    tsType: 'preact',
    passWithNoTests: true,
  }),
  'tiny-router-react-hooks': fillDefaultsForUtil({
    tsType: 'react',
    passWithNoTests: true,
  }),

  goober: produce(defaultsForUtil, (draft) => {
    draft.gen = {
      typeCheck: false,
      build: false,
      lint: false,
      test: false,
    };

    draft.tsType = undefined;

    draft.packageJson = {
      scripts: {
        gi: false,
        publish: false,
        lint: false,
      },
    };
  }),

  syncflow: produce(defaultsForUtil, (draft) => {
    draft.srcDirs = ['src', 'test'];
    draft.typeCheckIncludes.push('test');
  }),

  'eslint-utils': produce(defaultsForUtil, (draft) => {
    draft.packageJson.scripts.publish = false;

    draft.gen = {
      typeCheck: true,
      build: true,
      lint: false,
      test: false,
    };

    draft.typeCheckIncludes.push(workspaceScriptsDirName);
  }),

  'ts-type-utils-no-stdlib': produce(defaultsForUtil, (draft) => {
    draft.gen = {
      typeCheck: true,
      build: false,
      lint: false,
      test: false,
    };

    draft.typeCheckIncludes = ['src', workspaceConfigsDirName, 'test'];
  }),

  'strict-ts-lib': produce(defaultsForUtil, (draft) => {
    draft.gen = {
      typeCheck: true,
      build: false,
      test: false,
      lint: false,
    };

    draft.typeCheckIncludes = [
      'dist',
      'test',
      'stdlib.d.ts',
      workspaceScriptsDirName,
      workspaceConfigsDirName,
    ];
  }),

  // apps

  'algo-app': fillDefaultsForApp({
    tsType: 'preact',
  }),
  'annotation-tool': fillDefaultsForApp({
    tsType: 'react-emotion',
  }),
  'blueprintjs-playground': fillDefaultsForApp({
    tsType: 'react-emotion',
  }),
  'blueprintjs-playground-styled': fillDefaultsForApp({
    tsType: 'react-emotion',
  }),
  'cant-stop-probability-app': fillDefaultsForApp({
    tsType: 'react-emotion',
  }),
  'catan-dice-app': fillDefaultsForApp({
    tsType: 'react-emotion',
  }),
  'color-demo-app': fillDefaultsForApp({
    tsType: 'react-emotion',
  }),
  'event-schedule-app': produce(
    fillDefaultsForApp({
      tsType: 'react-emotion',
    }),
    (draft) => {
      draft.typeCheckIncludes.push('functions/src');
    },
  ),
  'housing-loan-calculator-app': fillDefaultsForApp({
    tsType: 'react-emotion',
  }),
  'lambda-calculus-interpreter-preact': fillDefaultsForApp({
    tsType: 'preact',
  }),
  'lambda-calculus-interpreter-react': fillDefaultsForApp({
    tsType: 'react-emotion',
  }),
  'mahjong-calculator-app': fillDefaultsForApp({
    tsType: 'preact',
  }),
  'my-portfolio-app-preact': fillDefaultsForApp({
    tsType: 'preact',
  }),
  'poll-discord-app': fillDefaultsForApp({
    tsType: 'mts',
  }),
  'slack-app': produce(
    fillDefaultsForApp({
      tsType: 'preact',
    }),
    (draft) => {
      draft.typeCheckIncludes.push('functions/src');
    },
  ),

  'template-preact-app-vite': fillDefaultsForApp({
    tsType: 'preact',
  }),
  'template-react-app-vite': fillDefaultsForApp({
    tsType: 'react-emotion',
  }),
};