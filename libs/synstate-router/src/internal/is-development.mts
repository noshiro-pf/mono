/**
 * Whether development-only warnings are written.
 *
 * `process.env.NODE_ENV` is written out in full because that is the expression
 * bundlers (Vite, webpack, esbuild) replace, in the application's build and in
 * a pre-bundled dependency alike: `true` in a development build, `false` in a
 * production one. Where nothing replaces it and there is no `process` (an
 * unbundled module in a browser), reading it throws and the warnings are off.
 */
const isDevelopmentBuild = (): boolean => {
  try {
    // The assertion names the key the index signature already allows (the same
    // `string | undefined`), and keeps the dot form in the emitted
    // JavaScript, which is what bundlers match; the bracket form the index
    // signature asks for is not.
    return (
      (process.env as Readonly<{ NODE_ENV?: string }>).NODE_ENV !== 'production'
    );
  } catch {
    return false;
  }
};

export const isDevelopment: boolean = isDevelopmentBuild();
