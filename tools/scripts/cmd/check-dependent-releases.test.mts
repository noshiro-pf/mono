import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  checkDependentReleases,
  findReExportedPackages,
  matchesGroupMember,
  type ExposureOverride,
  type ReleaseGroup,
  type WorkspacePackage,
} from './check-dependent-releases.mjs';
import type { ChangesetFile } from './check-next-major.mjs';

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

describe('matchesGroupMember', () => {
  test('matches a name and a glob', () => {
    assert.isTrue(matchesGroupMember('core', 'core'));

    assert.isTrue(
      matchesGroupMember(
        'strict-ts-lib-v*-source',
        'strict-ts-lib-v5.0-source',
      ),
    );

    assert.isFalse(matchesGroupMember('core', 'core-x'));

    assert.isFalse(
      matchesGroupMember('strict-ts-lib-v*-source', 'strict-ts-lib-v5.0'),
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
      Result.ok({ edges: 3, reExports: 1, warnings: [] }),
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
      Result.ok({ edges: 3, reExports: 1, warnings: [] }),
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
      reExports: new Map([
        ['wrapper', new Map([['young', ['libs/wrapper/src/index.mts']]])],
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
        'would release each as a dependency patch:',
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
      reExports: new Map([
        ['wrapper', new Map([['core', ['a.mts', 'b.mts', 'c.mts']]])],
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
      Result.ok({ edges: 0, reExports: 0, warnings: [] }),
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
        pkg('wrapper', '2.0.0', ['core-a']),
      ],
      groups: [{ kind: 'fixed', members: ['core-*'] }],
      reExports: new Map([
        ['wrapper', new Map([['core-a', ['libs/wrapper/src/index.mts']]])],
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'which the fixed group carries to core-a');
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
): WorkspacePackage =>
  ({ name, version, released: true, dependencies }) as const;

/** `wrapper` re-exports `core`; `typed` and `user` use it otherwise. */
const check = ({
  changesets,
  groups = [],
  packages = [
    pkg('core', '3.1.0'),
    pkg('sibling', '1.0.0'),
    pkg('wrapper', '2.1.0', ['core', 'react']),
    pkg('typed', '1.0.0', ['core']),
    pkg('user', '4.0.0', ['core']),
  ],
  reExports = new Map([
    ['wrapper', new Map([['core', ['libs/wrapper/src/index.mts']]])],
  ]),
  overrides = [],
}: Readonly<{
  changesets: readonly ChangesetFile[];
  groups?: readonly ReleaseGroup[];
  packages?: readonly WorkspacePackage[];
  reExports?: ReadonlyMap<string, ReadonlyMap<string, readonly string[]>>;
  overrides?: readonly ExposureOverride[];
}>): ReturnType<typeof checkDependentReleases> =>
  checkDependentReleases({
    changesets,
    groups,
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
