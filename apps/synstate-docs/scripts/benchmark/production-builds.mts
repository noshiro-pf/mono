/**
 * Puts the benchmark process in production mode, so that SynState and every
 * library it is compared with run the build their users ship.
 *
 * With `NODE_ENV` unset, MobX loads its development build, and reselect,
 * Redux, Jotai and SynState itself run their development-only checks inside the
 * timed loops — overhead no production bundle carries, and that differs from
 * one library to the next. The published tables compare what users ship.
 *
 * Every `run-*.mts` calls this before it loads a measured library. MobX and
 * SynState read `NODE_ENV` once, when their module is first evaluated, so it
 * has to come first: the libraries are loaded by dynamic import for that
 * reason, and a runner must not import one statically, since a static import is
 * evaluated before any statement of the module that imports it. Setting it here
 * rather than in the workflow keeps a local `pnpm run benchmark` measuring the
 * same thing as CI.
 *
 * Valtio's ES module build reads `import.meta.env.MODE`, which a bundler
 * defines and Node does not, so it keeps its development checks here. They run
 * only when a nested proxy is attached or a subscription made, not per update.
 */
export const selectProductionBuilds = (): void => {
  // eslint-disable-next-line functional/immutable-data
  process.env['NODE_ENV'] = 'production';
};
