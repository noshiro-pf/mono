import packageJson from '../../package.json' with { type: 'json' };

/**
 * The version string the CLIs in this directory report for `--version`.
 *
 * It is read from the package's own `package.json` rather than written down.
 * A literal has to be carried from `package.json` by a separate step, and
 * what a CLI prints is the one value that must not lag behind the code it is
 * printed by: it is what tells a consumer which build of these commands their
 * CI is actually running.
 *
 * The import attribute is required under `module: NodeNext`, and it is also
 * what keeps this cheap: TypeScript leaves the specifier alone instead of
 * pulling `package.json` in as an emit input, so `dist/` keeps its layout
 * and no copy of the manifest is produced that could itself go stale.
 * `package.json` sits two directories up both from the sources (`src/cmd/`)
 * and from what `bin` points at (`dist/cmd/`), so one specifier serves the
 * repository and the published package alike.
 */
export const cliVersion: string = packageJson.version;
