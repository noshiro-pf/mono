import dedent from 'dedent';
import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { ChangesetFile } from '../lib/changesets.mjs';
import {
  checkDependentReleases,
  findReExportedPackages,
  listDependencies,
  type ExposureOverride,
  type WorkspacePackage,
} from './check-dependent-releases.mjs';

describe('findReExportedPackages', () => {
  test('reads every form of export … from, multi-line ones included', () => {
    const packages = findReExportedPackages(
      'a.mts',
      dedent`
        export { a } from 'core';
        export type {
          B,
          C,
        } from 'types';
        export * from '@scope/pkg/sub';
        export * as ns from 'ns-pkg';
        export { a as b } from 'core';
      `,
    );

    assert.deepStrictEqual(packages, ['core', 'types', '@scope/pkg', 'ns-pkg']);
  });

  test('ignores imports, relative re-exports, comments and strings', () => {
    const packages = findReExportedPackages(
      'a.mts',
      dedent`
        import { a } from 'imported';
        export * from './local.mjs';
        // export { a } from 'commented';
        const s = "export { a } from 'quoted'";
        const local = a.length;
        export { local };
      `,
    );

    assert.deepStrictEqual(packages, []);
  });

  test('reads an import exported by a separate statement', () => {
    const packages = findReExportedPackages(
      'a.mts',
      dedent`
        import { a, b as c } from 'named';
        import type { T } from 'typed';
        import d from 'default';
        import * as ns from 'namespace';
        import e from 'exported-default';
        export { a };
        export { c as b };
        export type { T };
        export { d, ns };
        export default e;
      `,
    );

    assert.deepStrictEqual(packages, [
      'named',
      'typed',
      'default',
      'namespace',
      'exported-default',
    ]);
  });

  test('reads an exported alias of an import', () => {
    const packages = findReExportedPackages(
      'a.mts',
      dedent`
        import type { Int as ImportedInt } from 'types';
        import type * as t from 'qualified';
        import type { Box } from 'generic';
        import { pipe } from 'values';
        import * as R from 'members';
        import { wrapped } from 'wrapped';

        export type Int = ImportedInt;
        export type Shape = t.Shape;
        export type MyBox<A, B> = Box<A, B>;
        export const myPipe = pipe;
        export const ok = R.Result.ok;
        export const w = ((wrapped as typeof wrapped)!) satisfies unknown;
      `,
    );

    assert.deepStrictEqual(packages, [
      'types',
      'qualified',
      'generic',
      'values',
      'members',
      'wrapped',
    ]);
  });

  test('does not take a type or a value built from an import for an alias of it', () => {
    const packages = findReExportedPackages(
      'a.mts',
      dedent`
        import type { Box, Brand, DeepReadonly } from 'types';
        import { f } from 'values';

        export type Config = DeepReadonly<{ a: string }>;
        export type Email = Brand<string, 'Email'>;
        export type StringBox = Box<string>;
        export type Swapped<A, B> = Box<B, A>;
        export const called = f();
        export const g = () => f;
      `,
    );

    assert.deepStrictEqual(packages, []);
  });
});

describe('listDependencies', () => {
  test('reads each runtime field and leaves out devDependencies', () => {
    assert.deepStrictEqual(
      listDependencies({
        dependencies: { a: '^1.0.0' },
        optionalDependencies: { b: '^1.0.0' },
        peerDependencies: { c: '^1.0.0' },
        devDependencies: { d: '^1.0.0' },
      }),
      [
        { name: 'a', field: 'dependencies', range: '^1.0.0' },
        { name: 'b', field: 'optionalDependencies', range: '^1.0.0' },
        { name: 'c', field: 'peerDependencies', range: '^1.0.0' },
      ],
    );
  });

  test('lists a name once for each field it is in', () => {
    assert.deepStrictEqual(
      listDependencies({
        peerDependencies: { core: 'workspace:^' },
        dependencies: { core: 'workspace:^' },
      }),
      [
        { name: 'core', field: 'dependencies', range: 'workspace:^' },
        { name: 'core', field: 'peerDependencies', range: 'workspace:^' },
      ],
    );
  });
});

describe('checkDependentReleases', () => {
  test('passes when no breaking release is pending', () => {
    const result = check({
      changesets: [changeset({ core: 'minor', wrapper: 'patch' })],
    });

    assert.deepStrictEqual(
      result,
      Result.ok({ edges: 3, reExports: 1, peers: 0, warnings: [] }),
    );
  });

  test('fails a breaking release of a re-exported package alone', () => {
    const result = check({
      changesets: [changeset({ core: 'major', typed: 'major', user: 'major' })],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'wrapper re-exports core (libs/wrapper/src/index.mts), whose breaking release is pending:\n\n  - .changeset/change.md gives core "major"',
    );

    assert.include(result.value, 'Add a changeset giving wrapper "major"');
  });

  test('passes when every dependent has a breaking release too', () => {
    const result = check({
      changesets: [
        changeset({ core: 'major' }, 'core'),
        changeset({ wrapper: 'major', typed: 'major', user: 'major' }, 'rest'),
      ],
    });

    assert.deepStrictEqual(
      result,
      Result.ok({ edges: 3, reExports: 1, peers: 0, warnings: [] }),
    );
  });

  test('does not take a patch of the dependent for a breaking release', () => {
    const result = check({
      changesets: [changeset({ core: 'major', wrapper: 'patch' })],
    });

    assert.isTrue(Result.isErr(result));
  });

  test('treats a minor of a 0.x dependency as breaking, and asks a 0.x dependent for a minor', () => {
    const result = check({
      changesets: [changeset({ young: 'minor' })],
      packages: [pkg('young', '0.5.1'), pkg('wrapper', '0.2.0', ['young'])],
      reExports: new Map<string, ReadonlyMap<string, readonly string[]>>([
        [
          'wrapper',
          new Map<string, readonly string[]>([
            ['young', ['libs/wrapper/src/index.mts']],
          ]),
        ],
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'Add a changeset giving wrapper "minor"');
  });

  test('lists every other dependent for review, in one paragraph per dependency, without failing', () => {
    const result = check({
      changesets: [changeset({ core: 'major', wrapper: 'major' })],
    });

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value.warnings, [
      [
        'core has a breaking release pending:',
        '',
        '  - .changeset/change.md gives core "major"',
        '',
        'and these dependents of it are given no breaking bump, so changesets',
        'would release each with what a changeset gives it, or as a dependency',
        'patch:',
        '',
        '  - typed@1.0.0',
        '  - user@4.0.0',
        '',
        'Where the change reaches what one of them exposes — a type in its',
        'signatures, the behavior of a function or a CLI built on it — give that',
        'one a breaking changeset of its own; where it does not, the patch is right.',
      ].join('\n'),
    ]);
  });

  test('leaves out of the review a dependent with a breaking release of its own', () => {
    const result = check({
      changesets: [
        changeset({ core: 'major', wrapper: 'major', user: 'major' }),
      ],
    });

    assert.isTrue(Result.isOk(result));

    assert.include(result.value.warnings[0], '  - typed@1.0.0');

    assert.notInclude(result.value.warnings[0], 'user@');
  });

  test('lists the dependents to review beside a failure', () => {
    const result = check({ changesets: [changeset({ core: 'major' })] });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'And to review, without holding the release:\n\ncore has a breaking release pending:',
    );
  });

  test('names the first re-exporting file and counts the rest', () => {
    const result = check({
      changesets: [changeset({ core: 'major' })],
      reExports: new Map<string, ReadonlyMap<string, readonly string[]>>([
        [
          'wrapper',
          new Map<string, readonly string[]>([
            ['core', ['a.mts', 'b.mts', 'c.mts']],
          ]),
        ],
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'wrapper re-exports core (a.mts and 2 other files),',
    );
  });

  test('ignores a dependent that is not released', () => {
    const result = check({
      changesets: [changeset({ core: 'major' })],
      packages: [
        pkg('core', '3.0.0'),
        { ...pkg('wrapper', '2.0.0', ['core']), released: false },
      ],
    });

    assert.deepStrictEqual(
      result,
      Result.ok({ edges: 0, reExports: 0, peers: 0, warnings: [] }),
    );
  });

  test('reads a breaking release a release group carries to the dependency', () => {
    const result = check({
      changesets: [changeset({ sibling: 'major' })],
      groups: [{ kind: 'linked', members: ['core', 'sibling'] }],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '  - .changeset/change.md gives sibling "major", which the linked group carries to core',
    );
  });

  test('reads a fixed group written as a glob', () => {
    const result = check({
      changesets: [changeset({ 'core-b': 'major' })],
      packages: [
        pkg('core-a', '1.0.0'),
        pkg('core-b', '1.0.0'),
        pkg('other-core', '1.0.0'),
        pkg('wrapper', '2.0.0', ['core-a', 'other-core']),
      ],
      groups: [{ kind: 'fixed', members: ['core-*'] }],
      reExports: new Map<string, ReadonlyMap<string, readonly string[]>>([
        [
          'wrapper',
          new Map<string, readonly string[]>([
            ['core-a', ['libs/wrapper/src/index.mts']],
            ['other-core', ['libs/wrapper/src/index.mts']],
          ]),
        ],
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'which the fixed group carries to core-a');

    assert.notInclude(result.value, 'wrapper re-exports other-core');
  });

  test('takes an overriding re-export that detection misses', () => {
    const result = check({
      changesets: [changeset({ core: 'major', wrapper: 'major' })],
      overrides: [
        { dependency: 'core', dependents: ['typed'], exposure: 're-export' },
      ],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'typed re-exports core, whose breaking');
  });

  test('takes an override to review over a detected re-export', () => {
    const result = check({
      changesets: [changeset({ core: 'major' })],
      overrides: [
        { dependency: 'core', dependents: ['wrapper'], exposure: 'review' },
      ],
    });

    assert.isTrue(Result.isOk(result));

    assert.include(result.value.warnings[0], '  - wrapper@2.1.0');
  });

  test('fails an override of an edge that does not exist', () => {
    const result = check({
      changesets: [],
      overrides: [
        { dependency: 'core', dependents: ['stranger'], exposure: 're-export' },
      ],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'core → stranger ("re-export"): stranger is not a published package with core among its dependencies',
    );
  });

  test('fails an override that says what detection finds', () => {
    const result = check({
      changesets: [],
      overrides: [
        { dependency: 'core', dependents: ['wrapper'], exposure: 're-export' },
        { dependency: 'core', dependents: ['typed'], exposure: 'review' },
      ],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'core → wrapper ("re-export"): the re-export is found in src/ without it.',
    );

    assert.include(
      result.value,
      'core → typed ("review"): no re-export is found in src/',
    );
  });

  test('fails a breaking release of a peer dependency, with no re-export', () => {
    const result = check({
      changesets: [changeset({ core: 'major', wrapper: 'major' })],
      packages: Arr.toPushed(
        defaultPackages,
        pkg('plugin', '1.2.0', [], ['core']),
      ),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'plugin has core in its peerDependencies as "workspace:^", whose breaking release is pending:\n\n  - .changeset/change.md gives core "major"',
    );

    assert.include(result.value, 'moves that range to the new\ncore,');

    assert.include(result.value, 'Add a changeset giving plugin "major"');

    assert.notInclude(result.value, 'override the edge');

    assert.notInclude(result.value, '  - plugin@');
  });

  test('reports a dependency in both peerDependencies and dependencies once, as a peer', () => {
    const result = check({
      changesets: [changeset({ core: 'major', wrapper: 'major' })],
      packages: Arr.toPushed(
        defaultPackages,
        pkg('plugin', '1.2.0', ['core'], ['core']),
      ),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '❌ 1 problem(s)');

    assert.include(result.value, 'plugin has core in its peerDependencies');

    assert.notInclude(result.value, '  - plugin@');
  });

  test('holds a peer edge written as workspace:* or workspace:~', () => {
    const result = check({
      changesets: [changeset({ core: 'major' })],
      packages: [
        pkg('core', '3.1.0'),
        {
          ...pkg('exact', '1.0.0'),
          dependencies: listDependencies({
            peerDependencies: { core: 'workspace:*' },
          }),
        },
        {
          ...pkg('tilde', '1.0.0'),
          dependencies: listDependencies({
            peerDependencies: { core: 'workspace:~' },
          }),
        },
      ],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'exact has core in its peerDependencies as "workspace:*"',
    );

    assert.include(
      result.value,
      'tilde has core in its peerDependencies as "workspace:~"',
    );
  });

  test('holds a 0.x peer dependent on a minor of a 0.x dependency, and asks it for a minor', () => {
    const result = check({
      changesets: [changeset({ young: 'minor' })],
      packages: [pkg('young', '0.5.1'), pkg('plugin', '0.2.0', [], ['young'])],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'plugin has young in its peerDependencies');

    assert.include(result.value, 'Add a changeset giving plugin "minor"');
  });

  test('passes a peer dependent that a fixed group gives the breaking release', () => {
    const result = check({
      changesets: [changeset({ core: 'major' })],
      packages: [pkg('core', '3.1.0'), pkg('plugin', '3.1.0', [], ['core'])],
      groups: [{ kind: 'fixed', members: ['core', 'plugin'] }],
    });

    assert.deepStrictEqual(
      result,
      Result.ok({ edges: 1, reExports: 0, peers: 1, warnings: [] }),
    );
  });

  test('passes a peer dependent with a breaking release of its own', () => {
    const result = check({
      changesets: [
        changeset({
          core: 'major',
          wrapper: 'major',
          typed: 'major',
          user: 'major',
          plugin: 'major',
        }),
      ],
      packages: Arr.toPushed(
        defaultPackages,
        pkg('plugin', '1.2.0', [], ['core']),
      ),
    });

    assert.deepStrictEqual(
      result,
      Result.ok({ edges: 4, reExports: 1, peers: 1, warnings: [] }),
    );
  });

  test('holds a peer edge that src/ also re-exports as a peer', () => {
    const result = check({
      changesets: [changeset({ core: 'major' })],
      packages: [pkg('core', '3.1.0'), pkg('wrapper', '2.1.0', [], ['core'])],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'wrapper has core in its peerDependencies');

    assert.notInclude(result.value, 'wrapper re-exports other-core');
  });

  test('reads a peer range the break stays in as any other edge, while nothing else releases the dependent', () => {
    const result = check({
      changesets: [changeset({ core: 'major', wrapper: 'major' })],
      packages: Arr.toPushed(defaultPackages, {
        ...pkg('plugin', '1.2.0'),
        dependencies: listDependencies({
          peerDependencies: { core: '>=3.1.0' },
          devDependencies: { core: 'workspace:*' },
        }),
      }),
    });

    assert.isTrue(Result.isOk(result));

    assert.include(result.value.warnings[0], '  - plugin@1.2.0');
  });

  test('holds a peer range the break stays in when a changeset releases the dependent', () => {
    const result = check({
      changesets: [
        changeset({ core: 'major', wrapper: 'major', plugin: 'minor' }),
      ],
      packages: Arr.toPushed(defaultPackages, {
        ...pkg('plugin', '1.2.0'),
        dependencies: listDependencies({
          peerDependencies: { core: '>=3.1.0' },
        }),
      }),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'plugin has core in its peerDependencies as ">=3.1.0", whose breaking release is pending:',
    );
  });

  test('does not take a `none` for a changeset releasing the dependent', () => {
    const result = check({
      changesets: [
        changeset({ core: 'major', wrapper: 'major', plugin: 'none' }),
      ],
      packages: Arr.toPushed(defaultPackages, {
        ...pkg('plugin', '1.2.0'),
        dependencies: listDependencies({
          peerDependencies: { core: '>=3.1.0' },
        }),
      }),
    });

    assert.isTrue(Result.isOk(result));

    assert.include(result.value.warnings[0], '  - plugin@1.2.0');
  });

  test('holds a peer range the break stays in when another field pins the dependent to the workspace version', () => {
    const result = check({
      changesets: [changeset({ core: 'major', wrapper: 'major' })],
      packages: Arr.toPushed(defaultPackages, {
        ...pkg('plugin', '1.2.0'),
        dependencies: listDependencies({
          dependencies: { core: 'workspace:^' },
          peerDependencies: { core: '>=3.1.0' },
        }),
      }),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'plugin has core in its peerDependencies as ">=3.1.0"',
    );
  });

  test('holds a peer range the break stays in when a fixed group releases the dependent', () => {
    const result = check({
      changesets: [changeset({ core: 'major', other: 'patch' })],
      packages: [
        pkg('core', '3.1.0'),
        pkg('other', '1.0.0'),
        {
          ...pkg('plugin', '1.0.0'),
          dependencies: listDependencies({
            peerDependencies: { core: '>=3.1.0' },
          }),
        },
      ],
      groups: [{ kind: 'fixed', members: ['other', 'plugin'] }],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'plugin has core in its peerDependencies');
  });

  test('passes a re-exporting dependent that a linked group gives the breaking release', () => {
    const result = check({
      changesets: [changeset({ core: 'major', typed: 'major', user: 'major' })],
      groups: [{ kind: 'linked', members: ['core', 'wrapper'] }],
    });

    assert.deepStrictEqual(
      result,
      Result.ok({ edges: 3, reExports: 1, peers: 0, warnings: [] }),
    );
  });

  test('fails an override of a peer edge', () => {
    const result = check({
      changesets: [changeset({ core: 'major' })],
      packages: [pkg('core', '3.1.0'), pkg('plugin', '1.2.0', [], ['core'])],
      overrides: [
        { dependency: 'core', dependents: ['plugin'], exposure: 'review' },
      ],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'core → plugin ("review"): plugin names core in its peerDependencies and is released with any breaking release of it, which holds its release whatever src/ does. Remove the entry.',
    );
  });

  test.each(['^3.1.0', 'workspace:^3.1.0', '>=3 <4'])(
    'holds a peer edge written as %s, which a breaking release leaves',
    (range) => {
      const result = check({
        changesets: [changeset({ core: 'major' })],
        packages: [
          pkg('core', '3.1.0'),
          {
            ...pkg('plugin', '1.2.0'),
            dependencies: listDependencies({
              peerDependencies: { core: range },
            }),
          },
        ],
      });

      assert.isTrue(Result.isErr(result));

      assert.include(
        result.value,
        `plugin has core in its peerDependencies as "${range}", whose breaking release is pending:`,
      );
    },
  );

  test('holds a peer edge whose dependent another dependency releases', () => {
    const result = check({
      changesets: [changeset({ core: 'major', types: 'major' })],
      packages: [
        pkg('core', '3.1.0'),
        pkg('types', '2.0.0'),
        {
          ...pkg('blueprint', '1.0.0'),
          dependencies: listDependencies({
            dependencies: { types: 'workspace:^' },
            peerDependencies: { core: '>=3.1.0' },
          }),
        },
      ],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'blueprint has core in its peerDependencies as ">=3.1.0", whose breaking release is pending:',
    );
  });

  test('lists apart a reviewed dependent that changesets does not release', () => {
    const result = check({
      changesets: [changeset({ core: 'major' })],
      packages: [
        pkg('core', '3.1.0'),
        pkg('typed', '1.0.0', ['core']),
        {
          ...pkg('loose', '1.0.0'),
          dependencies: listDependencies({ dependencies: { core: '>=3' } }),
        },
      ],
    });

    assert.isTrue(Result.isOk(result));

    const [warning] = result.value.warnings;

    assert.include(warning, 'or as a dependency\npatch:\n\n  - typed@1.0.0\n');

    assert.include(
      warning,
      'And these, which changesets does not release:\n\n  - loose@1.0.0\n',
    );

    assert.include(warning, 'narrow that\nrange and release it.');
  });

  test('fails an override of a peer edge written as an explicit range a breaking release leaves', () => {
    const result = check({
      changesets: [],
      packages: [
        pkg('core', '3.1.0'),
        {
          ...pkg('plugin', '1.2.0'),
          dependencies: listDependencies({
            peerDependencies: { core: '^3.1.0' },
          }),
        },
      ],
      overrides: [
        { dependency: 'core', dependents: ['plugin'], exposure: 'review' },
      ],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'core → plugin ("review"): plugin names core in its peerDependencies and is released with any breaking release of it',
    );
  });

  test('accepts an override of a peer edge whose range admits a breaking release', () => {
    const result = check({
      changesets: [],
      packages: [
        pkg('core', '3.1.0'),
        {
          ...pkg('plugin', '1.2.0'),
          dependencies: listDependencies({
            peerDependencies: { core: '>=3.1.0' },
          }),
        },
      ],
      reExports: new Map<string, ReadonlyMap<string, readonly string[]>>([
        [
          'plugin',
          new Map<string, readonly string[]>([
            ['core', ['libs/plugin/src/index.mts']],
          ]),
        ],
      ]),
      overrides: [
        { dependency: 'core', dependents: ['plugin'], exposure: 'review' },
      ],
    });

    assert.isTrue(Result.isOk(result));
  });

  test('fails a config changesets refuses', () => {
    const result = check({
      changesets: [],
      groups: [
        { kind: 'fixed', members: ['core', 'sibling'] },
        { kind: 'linked', members: ['core', 'wrapper'] },
      ],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '.changeset/config.json is not a config changesets accepts:',
    );
  });

  test('fails an edge overridden twice', () => {
    const result = check({
      changesets: [],
      overrides: [
        { dependency: 'core', dependents: ['typed'], exposure: 're-export' },
        { dependency: 'core', dependents: ['typed'], exposure: 're-export' },
      ],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'core → typed: overridden more than once.');
  });
});

const pkg = (
  name: string,
  version: string,
  dependencies: readonly string[] = [],
  peerDependencies: readonly string[] = [],
): WorkspacePackage =>
  ({
    name,
    version,
    released: true,
    dependencies: [
      ...dependencies.map(
        (d) =>
          ({ name: d, field: 'dependencies', range: 'workspace:^' }) as const,
      ),
      ...peerDependencies.map(
        (d) =>
          ({
            name: d,
            field: 'peerDependencies',
            range: 'workspace:^',
          }) as const,
      ),
    ],
  }) as const;

/** `wrapper` re-exports `core`; `typed` and `user` use it otherwise. */
const defaultPackages = [
  pkg('core', '3.1.0'),
  pkg('sibling', '1.0.0'),
  pkg('wrapper', '2.1.0', ['core', 'react']),
  pkg('typed', '1.0.0', ['core']),
  pkg('user', '4.0.0', ['core']),
] as const;

const check = ({
  changesets,
  groups = [],
  packages = defaultPackages,
  reExports = new Map<string, ReadonlyMap<string, readonly string[]>>([
    [
      'wrapper',
      new Map<string, readonly string[]>([
        ['core', ['libs/wrapper/src/index.mts']],
      ]),
    ],
  ]),
  overrides = [],
}: Readonly<{
  changesets: readonly ChangesetFile[];
  /** As written in `.changeset/config.json`; a member may be a glob. */
  groups?: readonly Readonly<{
    kind: 'fixed' | 'linked';
    members: readonly string[];
  }>[];
  packages?: readonly WorkspacePackage[];
  reExports?: ReadonlyMap<string, ReadonlyMap<string, readonly string[]>>;
  overrides?: readonly ExposureOverride[];
}>): ReturnType<typeof checkDependentReleases> =>
  checkDependentReleases({
    changesets,
    config: {
      fixed: groups
        .filter(({ kind }) => kind === 'fixed')
        .map(({ members }) => members),
      linked: groups
        .filter(({ kind }) => kind === 'linked')
        .map(({ members }) => members),
    },
    packages,
    reExports,
    overrides,
  });

const changeset = (
  bumps: ReadonlyRecord<string, string>,
  name = 'change',
): ChangesetFile =>
  ({
    file: `.changeset/${name}.md`,
    content: [
      '---',
      ...Object.entries(bumps).map(([p, bump]) => `'${p}': ${bump}`),
      '---',
      '',
      'Something.',
      '',
    ].join('\n'),
  }) as const;
