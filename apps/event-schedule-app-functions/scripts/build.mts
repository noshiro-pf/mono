import * as esbuild from 'esbuild';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { hasKey, isRecord, isString, Json, Result } from 'ts-data-forge';

// Bundled, unlike `poll-discord-app`: Cloud Functions installs the deployed
// directory with `npm install` from its `package.json` alone, and npm cannot
// resolve `workspace:*`. So the workspace packages are bundled in, and the
// directory deployed is `build/`, whose `package.json` names only what is left
// external — the packages Cloud Functions has to install itself.
//
// `firebase.json` (in `apps/event-schedule-app`) points `functions.source` at
// `build/`, which the emulator loads too, so this runs before either.

const packageRoot = path.resolve(import.meta.dirname, '..');

const outDir = path.resolve(packageRoot, 'build');

/**
 * Left out of the bundle and installed by Cloud Functions. `firebase-functions`
 * and `firebase-admin` have to be: the deploy reads the former from
 * `node_modules` to discover the functions, and both keep state per process
 * that a second bundled copy would not share.
 */
const external = [
  'firebase-admin',
  'firebase-functions',
  'nodemailer',
] as const;

/**
 * The Node.js major the functions are deployed to. Cloud Functions (1st gen)
 * supports 22 until 2027-10-31; 24 needs 2nd gen.
 */
const nodeRuntime = '22';

const watch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: [path.resolve(packageRoot, 'src/index.mts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: `node${nodeRuntime}`,
  external: Array.from(external),
  outfile: path.resolve(outDir, 'index.mjs'),
  minify: false,
  logLevel: 'info',
} as const satisfies esbuild.BuildOptions;

const main = async (): Promise<void> => {
  // Not emptied in watch mode: the emulator watches `build/` itself, and stops
  // reloading once the directory it watches is deleted from under it.
  if (!watch) {
    await fs.rm(outDir, { recursive: true, force: true });
  }

  await fs.mkdir(outDir, { recursive: true });

  await writeDeployManifest();

  await writeLocalSecrets();

  await linkNodeModules();

  if (watch) {
    const ctx = await esbuild.context(buildOptions);

    await ctx.watch();

    return;
  }

  await esbuild.build(buildOptions);

  console.log('✅ build completed');
};

/**
 * Pins each external to the version installed here, so that what is deployed
 * is what was type-checked and run in the emulator, and is not re-resolved by
 * `npm install` on the day of the deploy.
 */
const writeDeployManifest = async (): Promise<void> => {
  const dependencies = Object.fromEntries(
    await Promise.all(
      external.map(
        async (name) => [name, await installedVersion(name)] as const,
      ),
    ),
  );

  const manifest = {
    name: 'event-schedule-app-functions-deploy',
    private: true,
    type: 'module',
    main: 'index.mjs',
    engines: { node: nodeRuntime },
    dependencies,
  } as const;

  const manifestStr = Result.unwrapThrow(
    Json.stringify(manifest, undefined, 2),
  );

  await fs.writeFile(
    path.resolve(outDir, 'package.json'),
    `${manifestStr ?? ''}\n`,
  );
};

/**
 * The emulator reads secrets from `.secret.local` in the functions source,
 * which is `build/`, and otherwise tries the production ones with the
 * developer's credentials. So one is always written here: the developer's own
 * `.secret.local` beside `package.json` if there is one, and otherwise a dummy
 * that lets the functions run and fail only when they try to send mail. Deploy
 * leaves it out (`ignore` in `firebase.json`); the real value is the
 * `RUNTIME_CONFIG` secret in Secret Manager.
 */
const writeLocalSecrets = async (): Promise<void> => {
  const ownSecrets = path.resolve(packageRoot, '.secret.local');

  const dest = path.resolve(outDir, '.secret.local');

  const hasOwnSecrets = await fs
    .access(ownSecrets)
    .then(() => true)
    .catch(() => false);

  if (hasOwnSecrets) {
    await fs.copyFile(ownSecrets, dest);

    return;
  }

  const dummy = Result.unwrapThrow(
    Json.stringify({
      gmail: {
        email: 'dummy@example.com',
        password: 'dummy',
        'app-password': 'dummy',
        'email-address-for-error-log': 'dummy@example.com',
      },
    }),
  );

  await fs.writeFile(dest, `RUNTIME_CONFIG=${dummy ?? ''}\n`);
};

/**
 * Both the emulator and the deploy start the functions through
 * `node_modules/.bin/firebase-functions`, which firebase-tools looks for in the
 * functions source and the Firebase project directory but not in the directories
 * above them, where Node.js would look. Under pnpm it exists only in this
 * package's `node_modules`, so `build/` gets a link to it. Deploy does not
 * upload it (`ignore` in `firebase.json`).
 */
const linkNodeModules = async (): Promise<void> => {
  const link = path.resolve(outDir, 'node_modules');

  await fs.rm(link, { force: true });

  await fs.symlink('../node_modules', link);
};

const installedVersion = async (name: string): Promise<string> => {
  // `name` is one of `external`, and `require.resolve` cannot stand in:
  // `firebase-admin` and `firebase-functions` do not export `./package.json`.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = await fs.readFile(
    path.resolve(packageRoot, 'node_modules', name, 'package.json'),
    'utf8',
  );

  const parsed = Result.unwrapThrow(Json.parse(content));

  if (
    isRecord(parsed) &&
    hasKey(parsed, 'version') &&
    isString(parsed.version)
  ) {
    return parsed.version;
  }

  throw new Error(`${name}: no version in its package.json`);
};

await main();
