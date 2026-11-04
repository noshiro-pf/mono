import { Result } from 'ts-data-forge';
import {
  findReachViolations,
  planReach,
  samplePaths,
} from './check-changed-reach.mjs';
import { AREAS, type PackageInfo } from './check-changed/plan.mjs';

const pkg = (dir: string, scripts: readonly string[]): PackageInfo =>
  ({
    name: dir.slice(dir.lastIndexOf('/') + 1),
    dir,
    scripts: new Set(scripts),
    isPrivate: false,
    workspaceDependencies: new Set<string>(),
    buildDependencies: new Set<string>(),
    exportsBuild: false,
  }) as const;

const packages = [
  pkg('libs/a', ['gen', 'fix:lint', 'check:types', 'check:test', 'check:ext']),
  pkg('apps/b', ['check:types']),
] as const;

// The shape `z:check-should-run:code-checks` has, cut down.
const proseGate = [
  'docs/',
  '**.md',
  '.cspell.config.yaml',
  '.prettierrc',
] as const;

const reach = planReach({
  packages,
  proseGate,
  rootScripts: ['check:root:a', 'check:root:types', 'check:prose'],
});

describe('samplePaths', () => {
  test('a source file, a document and a manifest in every package', () => {
    const paths = samplePaths(packages);

    for (const { dir } of packages) {
      assert.include(paths, `${dir}/src/sample.mts`);

      assert.include(paths, `${dir}/README.md`);

      assert.include(paths, `${dir}/package.json`);
    }
  });
});

describe('planReach', () => {
  test('every area is touched by some sample path', () => {
    assert.isTrue(Result.isOk(reach));

    assert.deepStrictEqual(
      Array.from(reach.value.areas).toSorted(),
      AREAS.toSorted(),
    );
  });

  test('the commands are those some plan runs', () => {
    assert.isTrue(Result.isOk(reach));

    const { commands } = reach.value;

    for (const command of [
      'libs/a:check:types',
      'libs/a:check:ext',
      'apps/b:check:types',
      '.:check:root:a',
      '.:check:root:types',
      '.:check:prose',
      '.:fix:codemod:affected',
      '.:gen:deps-graph',
      '.:fix:fmt:full',
    ]) {
      assert.include(commands, command);
    }
  });
});

describe('findReachViolations', () => {
  const ciOnly = [
    { scriptName: 'check:e2e', reason: 'slow' },
    { directory: '.', scriptName: 'verify:npm-packages', reason: 'packs' },
  ] as const;

  test('a CI command no plan reaches and no entry names is a violation', () => {
    const violations = findReachViolations({
      uncovered: [
        { command: 'apps/b:check:e2e', origin: 'code-check.yml: ws:check:e2e' },
        { command: '.:verify:npm-packages', origin: 'code-check.yml: x' },
        { command: 'libs/a:check:ext', origin: 'style-check.yml: y' },
        { command: 'apps/b:check:ext', origin: 'style-check.yml: y' },
      ],
      ciOnly,
      localReach: new Set<string>(),
      defined: new Set<string>(),
    });

    assert.lengthOf(violations, 1);

    assert.include(violations[0], '`check:ext` in libs/a, apps/b');

    assert.include(violations[0], 'style-check.yml: y');
  });

  test('an entry that matches nothing CI leaves to it is stale', () => {
    const violations = findReachViolations({
      uncovered: [{ command: 'apps/b:check:e2e', origin: 'code-check.yml: z' }],
      ciOnly,
      localReach: new Set<string>(),
      defined: new Set<string>(),
    });

    assert.lengthOf(violations, 1);

    assert.include(violations[0], '`verify:npm-packages`');

    assert.include(violations[0], 'remove');
  });

  // #3099: the generator of a CI-only script's committed output went
  // unplanned, and nothing said so.
  test('a CI-only script whose generator no plan runs is a violation', () => {
    const generated = [
      {
        directory: '.',
        scriptName: 'verify:npm-packages',
        reason: 'packs',
        writtenBy: ['gen:verify-npm-packages'],
      },
    ] as const;

    const uncovered = [
      { command: '.:verify:npm-packages', origin: 'code-check.yml: x' },
    ] as const;

    assert.deepStrictEqual(
      findReachViolations({
        uncovered,
        ciOnly: generated,
        localReach: new Set<string>(['.:gen:verify-npm-packages']),
        defined: new Set<string>(['.:gen:verify-npm-packages']),
      }),
      [],
    );

    const violations = findReachViolations({
      uncovered,
      ciOnly: generated,
      localReach: new Set<string>(),
      defined: new Set<string>(['.:gen:verify-npm-packages']),
    });

    assert.lengthOf(violations, 1);

    assert.include(violations[0], '`gen:verify-npm-packages`');

    // A renamed generator is no longer defined, which must not pass.
    assert.lengthOf(
      findReachViolations({
        uncovered,
        ciOnly: generated,
        localReach: new Set<string>(),
        defined: new Set<string>(),
      }),
      1,
    );
  });

  test('every generator listed that a package defines has to be planned there', () => {
    const doc = [
      {
        scriptName: 'doc',
        reason: 'reads dist/',
        writtenBy: ['gen:readme', 'gen:jsdoc'],
      },
    ] as const;

    const uncovered = [
      { command: 'libs/both:doc', origin: 'style-check.yml: ws:doc' },
      { command: 'libs/jsdoc-only:doc', origin: 'style-check.yml: ws:doc' },
    ] as const;

    const defined = new Set<string>([
      'libs/both:gen:readme',
      'libs/both:gen:jsdoc',
      'libs/jsdoc-only:gen:jsdoc',
    ]);

    assert.deepStrictEqual(
      findReachViolations({
        uncovered,
        ciOnly: doc,
        localReach: defined,
        defined,
      }),
      [],
    );

    const violations = findReachViolations({
      uncovered,
      ciOnly: doc,
      localReach: new Set<string>([
        'libs/both:gen:readme',
        'libs/jsdoc-only:gen:jsdoc',
      ]),
      defined,
    });

    assert.lengthOf(violations, 1);

    assert.include(violations[0], '`doc` in libs/both to CI');
  });

  // #3445: a package whose `doc` writes nothing committed defines no
  // generator, and a directory-scoped entry is how it says so.
  describe('a directory-scoped entry takes precedence over a global one', () => {
    const doc = {
      scriptName: 'doc',
      reason: 'reads dist/',
      writtenBy: ['gen:readme', 'gen:jsdoc'],
    } as const;

    const exemption = {
      directory: 'libs/plain',
      scriptName: 'doc',
      reason: 'typedoc output only, which is untracked',
    } as const;

    const uncovered = [
      { command: 'libs/plain:doc', origin: 'style-check.yml: ws:doc' },
      { command: 'libs/both:doc', origin: 'style-check.yml: ws:doc' },
    ] as const;

    const defined = new Set<string>(['libs/both:gen:readme']);

    test('so a package that writes nothing committed can be exempted', () => {
      assert.deepStrictEqual(
        findReachViolations({
          uncovered,
          ciOnly: [doc, exemption],
          localReach: defined,
          defined,
        }),
        [],
      );

      const violations = findReachViolations({
        uncovered,
        ciOnly: [doc],
        localReach: defined,
        defined,
      });

      assert.lengthOf(violations, 1);

      assert.include(violations[0], '`doc` in libs/plain to CI');
    });

    test('and a renamed generator still fails where no entry exempts it', () => {
      const violations = findReachViolations({
        uncovered,
        ciOnly: [doc, exemption],
        localReach: new Set<string>(),
        defined: new Set<string>(),
      });

      assert.lengthOf(violations, 1);

      assert.include(violations[0], '`doc` in libs/both to CI');
    });

    test('and an exemption of a package that defines a listed generator fails', () => {
      const violations = findReachViolations({
        uncovered,
        ciOnly: [doc, { ...exemption, directory: 'libs/both' }],
        localReach: defined,
        defined,
      });

      assert.include(
        violations.join('\n'),
        'names `doc` in libs/both as writing nothing committed, but the package defines `gen:readme`',
      );
    });
  });
});
