import { pathExists } from 'ts-repo-utils';
import { extractSampleCode } from './embed-examples-utils.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

const synstateSamplesRoot = path.resolve(
  workspaceRootPath,
  '../synstate/samples',
);

const codeBlockStart = '```tsx';

const codeBlockEnd = '```';

// --- Helper: generate reference page → sample mapping ---

const refDir = path.resolve(workspaceRootPath, 'src/content/docs/reference');

const jaRefDir = path.resolve(
  workspaceRootPath,
  'src/content/docs/ja/reference',
);

const srcSamplesDir = path.resolve(synstateSamplesRoot, 'src');

/** Maps reference page slug → sample file name */
const referencePageSamples: DeepReadonly<[slug: string, sampleFile: string][]> =
  [
    ['attach-index', 'attach-index-example.mts'],
    ['audit', 'audit-example.mts'],
    ['combine', 'combine-example.mts'],
    ['counter', 'counter-example.mts'],
    ['create-boolean-state', 'create-boolean-state-example.tsx'],
    ['create-event-emitter', 'create-void-event-emitter-example.mts'],
    ['create-reducer', 'create-reducer-example.mts'],
    ['create-state', 'create-state-example.mts'],
    ['create-value-emitter', 'create-event-emitter-example.mts'],
    ['debounce', 'debounce-example.mts'],
    ['filter', 'filter-example.mts'],
    ['from-promise', 'from-promise-example.mts'],
    ['from-subscribable', 'from-subscribable-example.mts'],
    ['get-key', 'get-key-example.mts'],
    ['map', 'map-example.mts'],
    ['map-optional', 'map-optional-example.mts'],
    ['map-result-err', 'map-result-err-example.mts'],
    ['map-result-ok', 'map-result-ok-example.mts'],
    ['map-to', 'map-to-example.mts'],
    ['merge', 'merge-example.mts'],
    ['merge-map', 'merge-map-example.mts'],
    ['pairwise', 'pairwise-example.mts'],
    ['scan', 'scan-example.mts'],
    ['skip', 'skip-example.mts'],
    ['skip-if-no-change', 'skip-if-no-change-example.mts'],
    ['skip-until', 'skip-until-example.mts'],
    ['skip-while', 'skip-while-example.mts'],
    ['source', 'source-example.mts'],
    ['switch-map', 'switch-map-example.mts'],
    ['take', 'take-example.mts'],
    ['take-until', 'take-until-example.mts'],
    ['take-while', 'take-while-example.mts'],
    ['throttle', 'throttle-example.mts'],
    ['timer', 'timer-example.mts'],
    ['unwrap-optional', 'unwrap-optional-example.mts'],
    ['unwrap-result-err', 'unwrap-result-err-example.mts'],
    ['unwrap-result-ok', 'unwrap-result-ok-example.mts'],
    ['with-buffered', 'with-buffered-from-example.mts'],
    ['with-current-value-from', 'with-current-value-from-example.mts'],
    ['with-initial-value', 'with-initial-value-example.mts'],
    ['zip', 'zip-example.mts'],
  ] as const;

const referenceDocuments: DeepReadonly<
  {
    mdPath: string;
    samplesDir: string;
    sampleCodeFiles: string[];
  }[]
> = await Promise.all(
  referencePageSamples.map(async ([slug, sampleFile]) => {
    const mdxPath = path.resolve(refDir, `${slug}.mdx`);

    const mdxExists = await pathExists(mdxPath);

    return {
      mdPath: mdxExists ? mdxPath : path.resolve(refDir, `${slug}.md`),
      samplesDir: srcSamplesDir,
      sampleCodeFiles: [sampleFile],
    };
  }),
);

// --- Japanese reference documents ---

const jaReferenceDocuments: DeepReadonly<
  {
    mdPath: string;
    samplesDir: string;
    sampleCodeFiles: string[];
  }[]
> = await Promise.all(
  referencePageSamples.map(async ([slug, sampleFile]) => {
    const mdxPath = path.resolve(jaRefDir, `${slug}.mdx`);

    const mdxExists = await pathExists(mdxPath);

    return {
      mdPath: mdxExists ? mdxPath : path.resolve(jaRefDir, `${slug}.md`),
      samplesDir: srcSamplesDir,
      sampleCodeFiles: [sampleFile],
    };
  }),
);

// --- Document → Sample mapping ---

const jaDocsBase = 'src/content/docs/ja';

const documents: DeepReadonly<
  {
    mdPath: string;
    samplesDir: string;
    sampleCodeFiles: string[];
  }[]
> = [
  {
    mdPath: path.resolve(
      workspaceRootPath,
      'src/content/docs/getting-started/introduction.md',
    ),
    samplesDir: path.resolve(synstateSamplesRoot, 'docs-site/introduction'),
    sampleCodeFiles: [
      '01-simple-state.mts',
      '02-simple-state-with-map.mts',
      '03-synstate-react-hooks-example.tsx',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      `${jaDocsBase}/getting-started/introduction.md`,
    ),
    samplesDir: path.resolve(synstateSamplesRoot, 'docs-site/introduction/ja'),
    sampleCodeFiles: [
      '01-simple-state.mts',
      '02-simple-state-with-map.mts',
      '03-synstate-react-hooks-example.tsx',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      'src/content/docs/guides/react-integration.md',
    ),
    samplesDir: path.resolve(synstateSamplesRoot, 'readme'),
    sampleCodeFiles: [
      '02-synstate-react-hooks-example.tsx',
      '03-react-18-example.tsx',
      '12-react-hooks-third-element.tsx',
      '13-use-observable-value.tsx',
      '14-react-hooks-compat-example.tsx',
      '04-react-example.tsx',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      `${jaDocsBase}/guides/react-integration.md`,
    ),
    samplesDir: path.resolve(synstateSamplesRoot, 'readme'),
    sampleCodeFiles: [
      '02-synstate-react-hooks-example.tsx',
      '03-react-18-example.tsx',
      '12-react-hooks-third-element.tsx',
      '13-use-observable-value.tsx',
      '14-react-hooks-compat-example.tsx',
      '04-react-example.tsx',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      'src/content/docs/examples/react.md',
    ),
    samplesDir: path.resolve(synstateSamplesRoot, 'readme'),
    sampleCodeFiles: [
      '06-global-counter.tsx',
      '07-todo-reducer.tsx',
      '08-dark-mode.tsx',
      '09-cross-component.tsx',
    ],
  },
  {
    mdPath: path.resolve(workspaceRootPath, `${jaDocsBase}/examples/react.md`),
    samplesDir: path.resolve(synstateSamplesRoot, 'readme'),
    sampleCodeFiles: [
      '06-global-counter.tsx',
      '07-todo-reducer.tsx',
      '08-dark-mode.tsx',
      '09-cross-component.tsx',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      'src/content/docs/examples/advanced.md',
    ),
    samplesDir: path.resolve(synstateSamplesRoot, 'readme'),
    sampleCodeFiles: [
      '10-search-debounce.tsx',
      '11-event-emitter-throttle.tsx',
      '05-simple-state-with-additional-api.mts',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      `${jaDocsBase}/examples/advanced.md`,
    ),
    samplesDir: path.resolve(synstateSamplesRoot, 'readme'),
    sampleCodeFiles: [
      '10-search-debounce.tsx',
      '11-event-emitter-throttle.tsx',
      '05-simple-state-with-additional-api.mts',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      'src/content/docs/guides/declarative-state-management.mdx',
    ),
    samplesDir: path.resolve(synstateSamplesRoot, 'docs-site/why-reactive'),
    sampleCodeFiles: [
      '01-usememo-example.tsx',
      '02-synstate-global-example.mts',
      '03-react-debounce-fetch.tsx',
      '04-synstate-debounce-fetch.mts',
      '05-imperative-table.mts',
      '06-reactive-table.mts',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      `${jaDocsBase}/guides/declarative-state-management.mdx`,
    ),
    samplesDir: path.resolve(synstateSamplesRoot, 'docs-site/why-reactive/ja'),
    sampleCodeFiles: [
      '01-usememo-example.tsx',
      '02-synstate-global-example.mts',
      '03-react-debounce-fetch.tsx',
      '04-synstate-debounce-fetch.mts',
      '05-imperative-table.mts',
      '06-reactive-table.mts',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      'src/content/docs/internals/how-synstate-solved-the-glitch.mdx',
    ),
    samplesDir: path.resolve(
      synstateSamplesRoot,
      'docs-site/how-synstate-solved-the-glitch',
    ),
    sampleCodeFiles: [
      '01-simple-glitch-example.synstate.mts',
      '01-simple-glitch-example.rxjs.mts',
      // '01-simple-glitch-example.mobx.mts',
      // '01-simple-glitch-example.jotai.mts',
      // '01-simple-glitch-example.redux.mts',
      // '01-simple-glitch-example.zustand.mts',
      '02-filter-diamond-example.synstate.mts',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      `${jaDocsBase}/internals/how-synstate-solved-the-glitch.mdx`,
    ),
    samplesDir: path.resolve(
      synstateSamplesRoot,
      'docs-site/how-synstate-solved-the-glitch',
    ),
    sampleCodeFiles: [
      '01-simple-glitch-example.synstate.mts',
      '01-simple-glitch-example.rxjs.mts',
      '02-filter-diamond-example.synstate.mts',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      'src/content/docs/guides/library-comparison/benchmark.mdx',
    ),
    samplesDir: path.resolve(synstateSamplesRoot, 'docs-site/benchmark'),
    sampleCodeFiles: [
      '01-derived-chain.synstate.mts',
      '01-derived-chain.rxjs.mts',
      '01-derived-chain.mobx.mts',
      '01-derived-chain.jotai.mts',
      '01-derived-chain.redux.mts',
      '01-derived-chain.zustand.mts',
      '01-derived-chain.valtio.mts',
      '02-diamond-dependency.synstate.mts',
      '02-diamond-dependency.rxjs.mts',
      '02-diamond-dependency.mobx.mts',
      '02-diamond-dependency.jotai.mts',
      '02-diamond-dependency.redux.mts',
      '05-conditional-fan-out.synstate.mts',
      '05-conditional-fan-out.rxjs.mts',
      '05-conditional-fan-out.mobx.mts',
      '05-conditional-fan-out.jotai.mts',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      `${jaDocsBase}/guides/library-comparison/benchmark.mdx`,
    ),
    samplesDir: path.resolve(synstateSamplesRoot, 'docs-site/benchmark'),
    sampleCodeFiles: [
      '01-derived-chain.synstate.mts',
      '01-derived-chain.rxjs.mts',
      '01-derived-chain.mobx.mts',
      '01-derived-chain.jotai.mts',
      '01-derived-chain.redux.mts',
      '01-derived-chain.zustand.mts',
      '01-derived-chain.valtio.mts',
      '02-diamond-dependency.synstate.mts',
      '02-diamond-dependency.rxjs.mts',
      '02-diamond-dependency.mobx.mts',
      '02-diamond-dependency.jotai.mts',
      '02-diamond-dependency.redux.mts',
      '05-conditional-fan-out.synstate.mts',
      '05-conditional-fan-out.rxjs.mts',
      '05-conditional-fan-out.mobx.mts',
      '05-conditional-fan-out.jotai.mts',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      'src/content/docs/preact-signals/demo.mdx',
    ),
    samplesDir: path.resolve(
      workspaceRootPath,
      'src/components/preact-signals-demo',
    ),
    sampleCodeFiles: [
      'render-count-demo.tsx',
      'counter-demo.tsx',
      'signal-bridge-demo.tsx',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      'src/content/docs/ja/preact-signals/demo.mdx',
    ),
    samplesDir: path.resolve(
      workspaceRootPath,
      'src/components/preact-signals-demo',
    ),
    sampleCodeFiles: [
      'render-count-demo.tsx',
      'counter-demo.tsx',
      'signal-bridge-demo.tsx',
    ],
  },
  ...referenceDocuments,
  ...jaReferenceDocuments,
] as const;

const embedExamples = async (): Promise<void> => {
  for (const { mdPath, sampleCodeFiles, samplesDir } of documents) {
    const markdownContent = await fs.readFile(mdPath, 'utf8');

    const codeBlockCount = markdownContent.split(codeBlockStart).length - 1;

    // eslint-disable-next-line ts-data-forge/prefer-arr-is-array-of-length
    if (codeBlockCount !== sampleCodeFiles.length) {
      throw new Error(
        `❌ Code block count mismatch in ${mdPath}: found ${codeBlockCount} \`\`\`tsx blocks but expected ${sampleCodeFiles.length} sample files`,
      );
    }

    const mut_results: string[] = [];

    let mut_rest: string = markdownContent;

    for (const sampleCodeFile of sampleCodeFiles) {
      const samplePath = path.resolve(samplesDir, sampleCodeFile);

      const sampleContent = await fs.readFile(samplePath, 'utf8');

      const sampleContentSliced = extractSampleCode(sampleContent);

      const codeBlockStartIndex = mut_rest.indexOf(codeBlockStart);

      if (codeBlockStartIndex === -1) {
        throw new Error(
          `❌ codeBlockStart not found for ${sampleCodeFile} in ${mdPath}`,
        );
      }

      const codeBlockEndIndex = mut_rest.indexOf(
        codeBlockEnd,
        codeBlockStartIndex + codeBlockStart.length,
      );

      if (codeBlockEndIndex === -1) {
        throw new Error(
          `❌ codeBlockEnd not found for ${sampleCodeFile} in ${mdPath}`,
        );
      }

      const beforeBlock = mut_rest.slice(
        0,
        Math.max(0, codeBlockStartIndex + codeBlockStart.length),
      );

      const afterBlock = mut_rest.slice(Math.max(0, codeBlockEndIndex));

      mut_results.push(beforeBlock, sampleContentSliced);

      mut_rest = afterBlock;

      console.log(`✓ Updated code block for ${sampleCodeFile}`);
    }

    mut_results.push(mut_rest);

    await fs.writeFile(mdPath, mut_results.join('\n'), 'utf8');
  }
};

const result = await embedExamples().catch((error: unknown) => error);

if (result !== undefined) {
  console.error(result);

  process.exit(1);
}
