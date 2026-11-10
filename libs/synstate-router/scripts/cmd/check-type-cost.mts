import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
// eslint-disable-next-line import-x/no-relative-packages -- the repository's one way to run a process
import { runFile } from '../../../../tools/scripts/lib/child-process.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

/**
 * Type-checks an application of 200 routes and fails when the checker needs
 * more instantiations than {@link instantiationLimit}: a change to the route
 * types that makes them much more expensive would otherwise show only as a slow
 * editor in a large application. The time is printed, not checked, since it
 * depends on the machine.
 *
 * The count includes the libraries the fixture imports: about 164,000 when the
 * check was written. Raise the limit only with the reason in the pull request.
 */
const instantiationLimit = 250_000;

const sectionCount = 20;

/** Ten nodes per section, so that the fixture has 200 routes. */
const section = (i: number): string => dedent`
  s${i}: {
    search: { page: search.int({ default: 1 }), q: search.string() },
    children: {
      list: {},
      new: {},
      item: {
        params: { id: param.int },
        children: {
          edit: {},
          history: {},
          comments: { search: { sort: search.literal(['new', 'old']) } },
          files: {},
          tab: {
            params: { tab: param.literal('a', 'b') },
            children: { detail: {} },
          },
        },
      },
    },
  },
`;

const usage = (i: number): string => dedent`
  router.push(
    routes.s${i}.item.tab.detail.href(
      { id: asSafeInt(${i}), tab: 'a' },
      { search: { page: asSafeInt(2) } },
    ),
  );

  router.at(routes.s${i}.item);

  router.isActive(routes.s${i});

  router.setSearch(routes.s${i}.item.comments, (prev) => ({ ...prev, sort: 'old' }));
`;

const fixture = (srcIndex: string): string => dedent`
  import { asSafeInt } from 'ts-data-forge';
  import {
    createMemoryBrowser,
    createRouter,
    defineRoutes,
    param,
    search,
    type RouteMatch,
  } from ${JSON.stringify(srcIndex)};

  const routes = defineRoutes({
    home: { segment: '' },
    ${Arr.seq(sectionCount).map(section).join('\n')}
  });

  const router = createRouter(routes, {
    browser: createMemoryBrowser('https://example.com/'),
  });

  export const describeMatch = (m: RouteMatch<typeof routes>): string => {
    switch (m.route) {
      case undefined:
        return m.pathname;

      case 's0.item.tab.detail':
        return m.params.tab;

      default:
        return m.route;
    }
  };
  ${Arr.seq(sectionCount).map(usage).join('\n')}
`;

// Inside the package, so that type libraries and the strict standard library
// resolve as they do for its own code; under `node_modules`, so that git
// ignores it.
const cacheDir = path.resolve(workspaceRootPath, './node_modules/.cache');

// eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed directory in this package
await fs.mkdir(cacheDir, { recursive: true });

const dir = await fs.mkdtemp(path.join(cacheDir, 'type-cost-'));

try {
  const fixturePath = path.join(dir, 'fixture.mts');

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path in the directory made above
  await fs.writeFile(
    fixturePath,
    fixture(path.resolve(workspaceRootPath, './src/index.mjs')),
  );

  const tsconfigPath = path.join(dir, 'tsconfig.json');

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path in the directory made above
  await fs.writeFile(
    tsconfigPath,
    JSON.stringify({
      extends: path.resolve(workspaceRootPath, './tsconfig.json'),
      include: [fixturePath],
    }),
  );

  const tsc = path.resolve(
    workspaceRootPath,
    '../../node_modules/typescript-native/bin/tsc',
  );

  const result = await runFile(process.execPath, [
    tsc,
    '--noEmit',
    '--extendedDiagnostics',
    '-p',
    tsconfigPath,
  ]);

  if (result.error !== undefined || result.signal !== null) {
    throw new Error(
      `check-type-cost: tsc did not run (${result.error?.message ?? result.signal})`,
    );
  }

  const { stdout } = result;

  if (result.status !== 0) {
    console.error(stdout, result.stderr);

    throw new Error(
      'check-type-cost: the 200-route fixture does not type-check',
    );
  }

  const instantiations = Number(
    /^Instantiations:\s+(\d+)$/mu.exec(stdout)?.[1] ?? Number.NaN,
  );

  const checkTime = /^Check time:\s+(\S+)$/mu.exec(stdout)?.[1] ?? '?';

  if (Number.isNaN(instantiations)) {
    throw new TypeError(
      `check-type-cost: no instantiation count in the output:\n${stdout}`,
    );
  }

  console.info(
    `200 routes: ${instantiations} instantiations (limit ${instantiationLimit}), check time ${checkTime}`,
  );

  if (instantiations > instantiationLimit) {
    throw new Error(
      `check-type-cost: ${instantiations} instantiations is over the limit of ${instantiationLimit}`,
    );
  }
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}
