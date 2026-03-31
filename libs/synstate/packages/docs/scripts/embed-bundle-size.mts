import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import 'ts-repo-utils';
import { workspaceRootPath } from './workspace-root-path.mjs';

const synstateDistPath = path.resolve(
  workspaceRootPath,
  '../synstate/dist/index.mjs',
);

const reactHooksDistPath = path.resolve(
  workspaceRootPath,
  '../synstate-react-hooks/dist/index.mjs',
);

const targetMarkdownFiles: readonly string[] = [
  path.resolve(
    workspaceRootPath,
    'src/content/docs/getting-started/introduction.md',
  ),
  path.resolve(
    workspaceRootPath,
    'src/content/docs/ja/getting-started/introduction.md',
  ),
  path.resolve(workspaceRootPath, 'src/content/docs/index.mdx'),
  path.resolve(workspaceRootPath, 'src/content/docs/ja/index.mdx'),
  path.resolve(workspaceRootPath, '../synstate/README.md'),
] as const;

const measureBundleSize = async (
  entryPoint: string,
  externals: readonly string[],
): Promise<Readonly<{ minifiedBytes: number; gzippedBytes: number }>> => {
  const res = await build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: true,
    write: false,
    format: 'esm',
    external: Array.from(externals),
  });

  const minified = res.outputFiles[0]?.contents;

  if (minified === undefined) {
    throw new Error(`esbuild produced no output for ${entryPoint}`);
  }

  const gzipped = gzipSync(minified);

  return {
    minifiedBytes: minified.byteLength,
    gzippedBytes: gzipped.byteLength,
  };
};

const formatKB = (bytes: number): string =>
  (bytes / 1024).toFixed(1).replace(/\.0$/u, '');

const replacePlaceholder = (
  content: string,
  name: string,
  replacement: string,
): string => {
  // HTML comment style for .md files: <!-- bundle-size:name -->...<!-- /bundle-size:name -->
  // eslint-disable-next-line security/detect-non-literal-regexp
  const htmlPattern = new RegExp(
    `<!-- bundle-size:${name} -->.*?<!-- /bundle-size:${name} -->`,
    'gsu',
  );

  // JSX comment style for .mdx files: {/* bundle-size:name */}...{/* /bundle-size:name */}
  // eslint-disable-next-line security/detect-non-literal-regexp
  const jsxPattern = new RegExp(
    String.raw`\{/\* bundle-size:${name} \*/\}.*?\{/\* /bundle-size:${name} \*/\}`,
    'gsu',
  );

  return content
    .replace(
      htmlPattern,
      `<!-- bundle-size:${name} -->${replacement}<!-- /bundle-size:${name} -->`,
    )
    .replace(
      jsxPattern,
      `{/* bundle-size:${name} */}${replacement}{/* /bundle-size:${name} */}`,
    );
};

const embedBundleSize = async (): Promise<void> => {
  // Measure synstate
  console.log('Measuring bundle size for synstate...');

  const synstate = await measureBundleSize(synstateDistPath, ['ts-data-forge']);

  console.log(
    `  synstate: ${formatKB(synstate.minifiedBytes)} kB minified, ${formatKB(synstate.gzippedBytes)} kB gzipped`,
  );

  // Measure synstate-react-hooks
  console.log('Measuring bundle size for synstate-react-hooks...');

  const reactHooks = await measureBundleSize(reactHooksDistPath, [
    'ts-data-forge',
    'synstate',
    'react',
  ]);

  console.log(
    `  synstate-react-hooks: ${formatKB(reactHooks.minifiedBytes)} kB minified, ${formatKB(reactHooks.gzippedBytes)} kB gzipped`,
  );

  // Replace placeholders in markdown files
  for (const mdPath of targetMarkdownFiles) {
    let mut_content = await fs.readFile(mdPath, 'utf8');

    mut_content = replacePlaceholder(
      mut_content,
      'synstate',
      `~${formatKB(synstate.gzippedBytes)} kB min+gzip`,
    );

    mut_content = replacePlaceholder(
      mut_content,
      'synstate-react-hooks',
      `~${formatKB(reactHooks.gzippedBytes)} kB min+gzip`,
    );

    await fs.writeFile(mdPath, mut_content, 'utf8');

    console.log(`✓ Updated bundle size in ${path.basename(mdPath)}`);
  }
};

const result = await embedBundleSize().catch((error: unknown) => error);

if (result !== undefined) {
  console.error(result);

  process.exit(1);
}
