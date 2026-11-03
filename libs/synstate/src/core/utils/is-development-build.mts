/**
 * Whether this is a development build: `NODE_ENV` is not `production`.
 *
 * `process.env.NODE_ENV` is written out in full because that is the expression
 * bundlers (Vite, webpack, esbuild) replace, in the application's build and in
 * a pre-bundled dependency alike: with the string `"development"` in a
 * development build and `"production"` in a production one. Where nothing
 * replaces it and there is no `process` (an unbundled module in a browser),
 * reading it throws and the answer is `false`.
 *
 * synstate-router reads it the same way
 * (`libs/synstate-router/src/internal/is-development.mts`).
 */
export const isDevelopmentBuild = (): boolean => {
  // @sumi-expect-error exceptions/no-try
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
};

/**
 * The one part of Node.js's `process` read here, declared in this module so
 * that the dot form type-checks without the Node.js types (which this package's
 * Sumi check does not load) and without the bracket form their index signature
 * asks for, which bundlers do not replace. `declare` emits nothing:
 * the emitted code reads the global `process`.
 */
declare const process: Readonly<{
  env: Readonly<{ NODE_ENV?: string | undefined }>;
}>;
