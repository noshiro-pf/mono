import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { type DeepReadonly } from 'ts-type-forge';
import { createRule } from './create-rule.mjs';

/**
 * `modules/no-internal-module-import` — a module is addressed by its public
 * surface only (Sumi spec/modules.md, D-42 for the relative form):
 *
 * - a relative specifier names a sibling (`./a.mjs`, `../a.mjs`) or a
 *   directory's index (`./a/index.mjs`); reaching further (`./a/b.mjs`)
 *   bypasses the directory's index;
 * - a package is imported by its name, or by a subpath its `exports` map
 *   exposes. A subpath of a package that has no `exports` is its internals.
 *   `#` imports (package.json `imports`) and `node:` builtins are not
 *   packages. A package that cannot be found is left to the type check.
 */
export const noInternalModuleImport = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow importing a module by an internal path (Sumi spec/modules.md).',
    },
    messages: {
      relativeReach:
        '`{{specifier}}` reaches into a directory. Import a sibling module or a directory index (`./dir/index.mjs`) instead.',
      packageInternal:
        '`{{specifier}}` is an internal path of `{{packageName}}`, which has no `exports` map. Import the package by its name.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const check = (source: DeepReadonly<TSESTree.Node> | null): void => {
      if (source === null) return;

      if (
        source.type !== AST_NODE_TYPES.Literal ||
        typeof source.value !== 'string'
      ) {
        return;
      }

      const specifier = source.value;

      if (specifier.startsWith('./') || specifier.startsWith('../')) {
        if (reachesIntoDirectory(specifier)) {
          context.report({
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            node: source as TSESTree.Node,
            messageId: 'relativeReach',
            data: { specifier },
          });
        }

        return;
      }

      const packageName = packageNameOf(specifier);

      if (packageName === undefined || packageName === specifier) return;

      if (
        packageHasExports(path.dirname(context.filename), packageName) === false
      ) {
        context.report({
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          node: source as TSESTree.Node,
          messageId: 'packageInternal',
          data: { specifier, packageName },
        });
      }
    };

    return {
      ImportDeclaration: (node) => {
        check(node.source);
      },
      ExportNamedDeclaration: (node) => {
        check(node.source);
      },
      ExportAllDeclaration: (node) => {
        check(node.source);
      },
      ImportExpression: (node) => {
        check(node.source);
      },
    };
  },
});

/**
 * `./a/b.mjs` reaches; `./a.mjs`, `../a.mjs` and `./a/index.mjs` do not.
 * Leading `.` / `..` segments are the walk to the base directory and are
 * not counted.
 */
const reachesIntoDirectory = (specifier: string): boolean => {
  const segments = specifier
    .split('/')
    .filter((segment) => segment !== '.' && segment !== '..');

  if (segments.length <= 1) return false;

  return !(segments.length === 2 && segments[1] === 'index.mjs');
};

/** `@scope/name/sub` → `@scope/name`; `name/sub` → `name`; `undefined` for a non-package specifier. */
const packageNameOf = (specifier: string): string | undefined => {
  if (
    specifier.startsWith('#') ||
    specifier.startsWith('/') ||
    specifier.startsWith('node:') ||
    specifier.startsWith('data:')
  ) {
    return undefined;
  }

  const segments = specifier.split('/');

  const name = specifier.startsWith('@')
    ? segments.slice(0, 2).join('/')
    : segments[0];

  return name === undefined || name === '' ? undefined : name;
};

/**
 * Whether `packageName`, resolved from `fromDir` upwards through
 * `node_modules`, declares an `exports` map; `undefined` when it cannot be
 * found (left to the type check).
 */
const packageHasExports = (
  fromDir: string,
  packageName: string,
): boolean | undefined => {
  for (let mut_dir = fromDir; ; mut_dir = path.dirname(mut_dir)) {
    const manifest = path.join(
      mut_dir,
      'node_modules',
      packageName,
      'package.json',
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (fs.existsSync(manifest)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const parsed: unknown = JSON.parse(fs.readFileSync(manifest, 'utf8'));

      return (
        typeof parsed === 'object' &&
        parsed !== null &&
        Object.hasOwn(parsed, 'exports')
      );
    }

    if (path.dirname(mut_dir) === mut_dir) return undefined;
  }
};
