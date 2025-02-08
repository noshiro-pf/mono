import { produce } from 'immer';
import { isNotUndefined } from '../ts-utils/index.mjs';
import {
  playwrightConfigName,
  workspaceConfigsDirName,
  workspaceE2eDirName,
  workspaceScriptsDirName,
} from './constants.mjs';
import { type WorkspaceConfig } from './workspace-config-type.mjs';

const workspaceConfigGlobalUtil: WorkspaceConfig = {
  utilOrApp: 'utils',
  gen: {
    typeCheck: true,
    build: true,
    lint: true,
    test: false,
  },
  tsType: 'mts',
  useVite: false,
  srcDirs: ['src'],
  typeCheckIncludes: ['src', workspaceConfigsDirName, workspaceScriptsDirName],
  packageJson: {
    scripts: {
      gi: false,
      publish: false,
    },
  },
};

const defaultsForUtil: WorkspaceConfig = {
  utilOrApp: 'utils',
  gen: {
    typeCheck: true,
    build: true,
    lint: true,
    test: true,
  },
  tsType: 'mts',
  useVite: 'vitest-only',
  srcDirs: ['src'],
  typeCheckIncludes: ['src', workspaceConfigsDirName],
  packageJson: {
    scripts: {
      gi: 0,
      publish: true,
    },
  },
};

const defaultsForApp = {
  utilOrApp: 'app',
  gen: {
    typeCheck: true,
    build: true,
    lint: true,
    test: true,
    e2e: 'playwright',
  },
  typeCheckIncludes: ['src', workspaceConfigsDirName],
} as const satisfies Pick<
  WorkspaceConfig,
  'utilOrApp' | 'gen' | 'typeCheckIncludes'
>;

const fillDefaultsForUtil = (
  options?: Readonly<{
    tsType?: WorkspaceConfig['tsType'];
    gi?: WorkspaceConfig['packageJson']['scripts']['gi'];
    passWithNoTests?: WorkspaceConfig['packageJson']['scripts']['passWithNoTests'];
    hasScripts?: boolean;
  }>,
): WorkspaceConfig => ({
  utilOrApp: defaultsForUtil.utilOrApp,
  gen: defaultsForUtil.gen,
  tsType: options?.tsType ?? defaultsForUtil.tsType,
  useVite: defaultsForUtil.useVite,
  srcDirs: defaultsForUtil.srcDirs,
  typeCheckIncludes: [
    ...defaultsForUtil.typeCheckIncludes,
    options?.hasScripts === true ? workspaceScriptsDirName : undefined,
  ].filter(isNotUndefined),
  packageJson: {
    scripts: {
      gi: options?.gi ?? defaultsForUtil.packageJson.scripts.gi,
      publish: defaultsForUtil.packageJson.scripts.publish,
      passWithNoTests: options?.passWithNoTests,
    },
  },
});

const fillDefaultsForApp = ({
  tsType,
  gi,
  giIgnore,
  hasScripts,
  passWithNoTests,
  playwright = true,
}: Readonly<{
  tsType: WorkspaceConfig['tsType'];
  gi?: WorkspaceConfig['packageJson']['scripts']['gi'];
  giIgnore?: WorkspaceConfig['packageJson']['scripts']['giIgnore'];
  passWithNoTests?: WorkspaceConfig['packageJson']['scripts']['passWithNoTests'];
  hasScripts?: boolean;
  playwright?: boolean;
}>): WorkspaceConfig => ({
  utilOrApp: defaultsForApp.utilOrApp,
  gen: produce(defaultsForApp.gen, (draft) => {
    if (playwright) {
      draft.e2e = 'playwright';
    }
  }),
  tsType,
  useVite: true,
  srcDirs: ['src'],
  typeCheckIncludes: [
    ...defaultsForApp.typeCheckIncludes,
    hasScripts === false ? undefined : workspaceScriptsDirName,
    ...(playwright ? [workspaceE2eDirName, playwrightConfigName] : []),
  ].filter(isNotUndefined),
  packageJson: {
    scripts: {
      gi: gi ?? 1,
      giIgnore: giIgnore ?? ['assets'],
      publish: false,
      passWithNoTests: passWithNoTests ?? true,
      e2e: playwright ? 'playwright' : undefined,
    },
  },
});

export const workspaceConfig: Record<string, WorkspaceConfig> = {
  'global-better-preact-use-state': workspaceConfigGlobalUtil,
  'global-better-react-use-state': workspaceConfigGlobalUtil,
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
  'better-preact-use-state': fillDefaultsForUtil({
    passWithNoTests: true,
    tsType: 'preact',
  }),
  'better-react-use-state': fillDefaultsForUtil({
    passWithNoTests: true,
    tsType: 'react',
  }),
  'ts-utils': fillDefaultsForUtil(),
  'numeric-input-utils': fillDefaultsForUtil({
    passWithNoTests: true,
    tsType: 'react',
  }),
  'tiny-router-observable': fillDefaultsForUtil({
    passWithNoTests: true,
    tsType: 'dom',
  }),
  'io-ts': fillDefaultsForUtil(),
  'io-ts-types': fillDefaultsForUtil(),
  'lambda-calculus-interpreter-core': fillDefaultsForUtil(),

  'ts-utils-additional': fillDefaultsForUtil({
    hasScripts: true,
    tsType: 'dom',
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
    gi: 0,
    passWithNoTests: true,
    hasScripts: true,
  }),
  'syncflow-react-hooks': fillDefaultsForUtil({
    tsType: 'react',
    gi: 0,
    passWithNoTests: true,
    hasScripts: true,
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

  'eslint-configs': produce(defaultsForUtil, (draft) => {
    draft.packageJson.scripts.publish = false;

    draft.gen = {
      typeCheck: true,
      build: true,
      lint: false,
      test: false,
    };

    draft.typeCheckIncludes.push(workspaceScriptsDirName);

    draft.gen.test = false;
  }),

  'ts-type-utils': produce(defaultsForUtil, (draft) => {
    draft.useVite = false;

    draft.gen = {
      typeCheck: true,
      build: false,
      lint: false,
      test: false,
    };

    draft.tsconfig = {
      compilerOptions: {
        types: [],
        lib: null,
        noLib: true,
        skipLibCheck: false,
        noEmit: true,
      },
    };

    draft.typeCheckIncludes = ['src', 'test'];
  }),

  'strict-ts-lib': produce(defaultsForUtil, (draft) => {
    draft.useVite = false;

    if (draft.tsconfig === undefined) {
      draft.tsconfig = { compilerOptions: { types: ['node'] } };
    } else {
      draft.tsconfig.compilerOptions = { types: ['node'] };
    }

    draft.gen = {
      typeCheck: true,
      build: false,
      test: false,
      lint: false,
    };

    draft.typeCheckIncludes = [
      `${workspaceScriptsDirName}/src`,
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
      draft.packageJson.scripts.hasFirebaseFunction = true;
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
      draft.packageJson.scripts.hasFirebaseFunction = true;
    },
  ),

  'template-preact-app-vite': fillDefaultsForApp({
    tsType: 'preact',
  }),
  'template-react-app-vite': fillDefaultsForApp({
    tsType: 'react-emotion',
  }),
};
