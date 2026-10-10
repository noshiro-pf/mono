import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { type ReadonlyRecord } from 'ts-type-forge';
import { noTypeOnlyCodec } from './no-type-only-codec.mjs';

/**
 * The rule reads the importers of a file from the TypeScript program, so every
 * case gets a project of its own on disk: a `tsconfig.json`, the linted
 * `codec.mts`, and whatever other files the case is about. They are left in the
 * temporary directory, as the other tests here that write files leave theirs.
 */
const projectsRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), 'no-type-only-codec-'),
);

const TSCONFIG = JSON.stringify({
  compilerOptions: {
    module: 'nodenext',
    moduleResolution: 'nodenext',
    target: 'es2022',
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    types: [],
  },
  include: ['**/*.mts'],
});

const USER_CODEC = dedent`
  import * as t from 'ts-fortress';

  export const User = t.record({ name: t.string() });

  export type User = t.TypeOf<typeof User>;
`;

const mut_projectNames = new Set<string>();

/**
 * Writes a project for one case and returns what `RuleTester` needs to lint
 * its codec file — `codec.mts` unless `codecPath` says otherwise: the file
 * name and its content.
 */
const project = (
  name: string,
  files: ReadonlyRecord<string, string>,
  codec: string = USER_CODEC,
  codecPath: string = 'codec.mts',
): Readonly<{ filename: string; code: string }> => {
  if (mut_projectNames.has(name)) {
    throw new Error(`duplicate project name: ${name}`);
  }

  mut_projectNames.add(name);

  const dir = path.join(projectsRoot, name);

  for (const [file, content] of Object.entries({
    'tsconfig.json': TSCONFIG,
    [codecPath]: codec,
    ...files,
  })) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(path.join(dir, file), content);
  }

  return { filename: path.join(dir, codecPath), code: codec };
};

const entryPoint = (name: string, file: string): string =>
  path.join(projectsRoot, name, file);

const packageJson = (fields: ReadonlyRecord<string, unknown>): string =>
  JSON.stringify({ name: 'pkg', type: 'module', ...fields });

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      projectService: true,
      tsconfigRootDir: projectsRoot,
    },
  },
});

describe('no-type-only-codec', () => {
  tester.run('no-type-only-codec', noTypeOnlyCodec, {
    valid: [
      {
        name: 'a value import elsewhere',
        ...project('value-import', {
          'main.mts': dedent`
            import { User } from './codec.mjs';

            export const isUser = (u: unknown): boolean => User.is(u);
          `,
        }),
      },
      {
        name: 'a non-type import elsewhere, whatever it is used for',
        ...project('value-import-used-as-type', {
          'main.mts': dedent`
            import { User } from './codec.mjs';

            export const name = (u: User): string => u.name;
          `,
        }),
      },
      {
        name: 'a value use in its own file',
        ...project(
          'local-value-use',
          {},
          dedent`
            import * as t from 'ts-fortress';

            export const User = t.record({ name: t.string() });

            export type User = t.TypeOf<typeof User>;

            export const isUser = (u: unknown): boolean => User.is(u);
          `,
        ),
      },
      {
        name: 'composed into another codec in its own file',
        ...project(
          'composed-locally',
          {
            'main.mts': dedent`
              import { Users } from './codec.mjs';

              export const isUsers = (u: unknown): boolean => Users.is(u);
            `,
          },
          dedent`
            import * as t from 'ts-fortress';

            export const User = t.record({ name: t.string() });

            export type User = t.TypeOf<typeof User>;

            export const Users = t.array(User);

            export type Users = t.TypeOf<typeof Users>;
          `,
        ),
      },
      {
        name: 'a namespace import that reads the member',
        ...project('namespace-member', {
          'main.mts': dedent`
            import * as codecs from './codec.mjs';

            export const isUser = (u: unknown): boolean => codecs.User.is(u);
          `,
        }),
      },
      {
        name: 'a namespace import that reads the member by a string key',
        ...project('namespace-element', {
          'main.mts': dedent`
            import * as codecs from './codec.mjs';

            export const isUser = (u: unknown): boolean => codecs['User'].is(u);
          `,
        }),
      },
      {
        name: 'a namespace import handed over whole',
        ...project('namespace-whole', {
          'main.mts': dedent`
            import * as codecs from './codec.mjs';

            export const all = Object.values(codecs);
          `,
        }),
      },
      {
        name: 'a dynamic import',
        ...project('dynamic-import', {
          'main.mts': dedent`
            export const load = async (): Promise<unknown> => import('./codec.mjs');
          `,
        }),
      },
      {
        name: 'a value import through a barrel',
        ...project('barrel-named', {
          'index.mts': dedent`
            export { User } from './codec.mjs';
          `,
          'main.mts': dedent`
            import { User } from './index.mjs';

            export const isUser = (u: unknown): boolean => User.is(u);
          `,
        }),
      },
      {
        name: 'a value import through an `export *` barrel, renamed on the way',
        ...project('barrel-star-renamed', {
          'index.mts': dedent`
            export * from './codec.mjs';
          `,
          'api.mts': dedent`
            export { User as Person } from './index.mjs';
          `,
          'main.mts': dedent`
            import { Person } from './api.mjs';

            export const isPerson = (u: unknown): boolean => Person.is(u);
          `,
        }),
      },
      {
        name: 'a value import under the name `export { X as Y }` gives it',
        ...project(
          'local-export-alias',
          {
            'main.mts': dedent`
              import { Person } from './codec.mjs';

              export const isPerson = (u: unknown): boolean => Person.is(u);
            `,
          },
          dedent`
            import * as t from 'ts-fortress';

            const User = t.record({ name: t.string() });

            type User = t.TypeOf<typeof User>;

            export { User as Person, type User };
          `,
        ),
      },
      {
        name: 'a default import of `export default X`',
        ...project(
          'default-export',
          {
            'main.mts': dedent`
              import User from './codec.mjs';

              export const isUser = (u: unknown): boolean => User.is(u);
            `,
          },
          dedent`
            import * as t from 'ts-fortress';

            const User = t.record({ name: t.string() });

            export type User = t.TypeOf<typeof User>;

            export default User;
          `,
        ),
      },
      (() => {
        const files = project('entry-point-barrel', {
          'index.mts': dedent`
            export * from './codec.mjs';
          `,
        });

        return {
          name: 'reachable from an entry point through `export *`',
          ...files,
          options: [
            { entryPoints: [entryPoint('entry-point-barrel', 'index.mts')] },
          ] as const,
        };
      })(),
      (() => {
        const files = project('entry-point-self', {});

        return {
          name: 'exported by a file that is itself an entry point',
          ...files,
          options: [{ entryPoints: [files.filename] }] as const,
        };
      })(),
      {
        name: 'a codec named apart from its type, imported as a value',
        ...project(
          'type-def-naming-value',
          {
            'main.mts': dedent`
              import { userTypeDef } from './codec.mjs';

              export const isUser = (u: unknown): boolean => userTypeDef.is(u);
            `,
          },
          dedent`
            import * as t from 'ts-fortress';

            export const userTypeDef = t.record({ name: t.string() });

            export type User = t.TypeOf<typeof userTypeDef>;
          `,
        ),
      },
      {
        name: 'public through `exports` naming a source file',
        ...project('package-exports-source', {
          'package.json': packageJson({ exports: './index.mts' }),
          'index.mts': dedent`
            export * from './codec.mjs';
          `,
        }),
      },
      {
        name: 'public through `exports` naming the build output of a source file',
        ...project(
          'package-exports-dist',
          {
            'package.json': packageJson({
              exports: {
                '.': {
                  import: {
                    types: './dist/types.d.mts',
                    default: './dist/entry-point.mjs',
                  },
                },
              },
            }),
            'src/entry-point.mts': dedent`
              export * from './codec.mjs';
            `,
          },
          USER_CODEC,
          'src/codec.mts',
        ),
      },
      {
        name: 'public through the legacy `module` / `types` fields',
        ...project(
          'package-module-field',
          {
            'package.json': packageJson({
              module: './dist/index.mjs',
              types: './dist/index.d.mts',
            }),
            'src/index.mts': dedent`
              export { User } from './codec.mjs';
            `,
          },
          USER_CODEC,
          'src/codec.mts',
        ),
      },
      {
        name: 'public through a subpath pattern',
        ...project(
          'package-exports-pattern',
          {
            'package.json': packageJson({
              exports: { './*': './dist/schemas/*.mjs' },
            }),
          },
          USER_CODEC,
          'src/schemas/codec.mts',
        ),
      },
      {
        name: 'a package whose `exports` cannot all be traced back to source',
        ...project('package-exports-unresolved', {
          'package.json': packageJson({
            exports: {
              '.': './index.mts',
              './generated': './dist/generated.mjs',
            },
          }),
          'index.mts': dedent`
            export const unrelated = 1;
          `,
        }),
      },
      {
        name: 'a type alias that is not `TypeOf<typeof X>`',
        ...project(
          'not-a-pair',
          {},
          dedent`
            import * as t from 'ts-fortress';

            export const User = t.record({ name: t.string() });

            export type User = Readonly<{ name: string }>;
          `,
        ),
      },
      {
        name: 'a `TypeOf` that is not ts-fortress’s',
        ...project(
          'foreign-type-of',
          {},
          dedent`
            import * as z from 'some-other-library';

            export const User = z.object({ name: z.string() });

            export type User = z.TypeOf<typeof User>;
          `,
        ),
      },
    ],
    invalid: [
      {
        name: '`exports` that do not reach the codec',
        ...project('package-exports-elsewhere', {
          'package.json': packageJson({ exports: './index.mts' }),
          'index.mts': dedent`
            export const unrelated = 1;
          `,
        }),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
      {
        name: '`exports` that re-export only the type',
        ...project('package-exports-type-only', {
          'package.json': packageJson({ exports: './index.mts' }),
          'index.mts': dedent`
            export type { User } from './codec.mjs';
          `,
        }),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
      {
        name: 'explicit `entryPoints` that leave out what `package.json` exports',
        ...project('package-overridden-reported', {
          'package.json': packageJson({ exports: './index.mts' }),
          'index.mts': dedent`
            export * from './codec.mjs';
          `,
          'other.mts': dedent`
            export const unrelated = 1;
          `,
        }),
        options: [
          {
            entryPoints: [
              entryPoint('package-overridden-reported', 'other.mts'),
            ],
          },
        ] as const,
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
      {
        name: 'no importer at all',
        ...project('no-importer', {}),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
      {
        name: 'only `import type` elsewhere',
        ...project('import-type', {
          'main.mts': dedent`
            import type { User } from './codec.mjs';

            export const name = (u: User): string => u.name;
          `,
        }),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
      {
        name: 'only an inline `type` specifier elsewhere',
        ...project('import-inline-type', {
          'main.mts': dedent`
            import { type User } from './codec.mjs';

            export const name = (u: User): string => u.name;
          `,
        }),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
      {
        name: 'a codec named apart from the type derived from it',
        ...project(
          'type-def-naming',
          {
            'main.mts': dedent`
              import type { User, userTypeDef } from './codec.mjs';

              export const name = (u: User): string => u.name;

              export type UserCodec = typeof userTypeDef;
            `,
          },
          dedent`
            import * as t from 'ts-fortress';

            export const userTypeDef = t.record({ name: t.string() });

            export type User = t.TypeOf<typeof userTypeDef>;
          `,
        ),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'userTypeDef', typeName: 'User' },
          },
        ],
      },
      {
        name: 'a namespace import that reads it only in types',
        ...project('namespace-types-only', {
          'main.mts': dedent`
            import * as codecs from './codec.mjs';

            export const name = (u: codecs.User): string => u.name;

            export type Codec = typeof codecs.User;
          `,
        }),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
      {
        name: 'a namespace import that reads another member',
        ...project(
          'namespace-other-member',
          {
            'main.mts': dedent`
              import * as codecs from './codec.mjs';

              export const isTag = (u: unknown): boolean => codecs.Tag.is(u);

              export const name = (u: codecs.User): string => u.name;
            `,
          },
          dedent`
            import * as t from 'ts-fortress';

            export const User = t.record({ name: t.string() });

            export type User = t.TypeOf<typeof User>;

            export const Tag = t.string();

            export type Tag = t.TypeOf<typeof Tag>;
          `,
        ),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
      {
        name: 'a barrel that is not an entry point, imported for types only',
        ...project('barrel-type-only', {
          'index.mts': dedent`
            export * from './codec.mjs';
          `,
          'main.mts': dedent`
            import type { User } from './index.mjs';

            export const name = (u: User): string => u.name;
          `,
        }),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
      (() => {
        const files = project('entry-point-type-reexport', {
          'index.mts': dedent`
            export type { User } from './codec.mjs';
          `,
        });

        return {
          name: 'an entry point that re-exports only the type',
          ...files,
          options: [
            {
              entryPoints: [
                entryPoint('entry-point-type-reexport', 'index.mts'),
              ],
            },
          ] as const,
          errors: [
            {
              messageId: 'typeOnlyCodec',
              data: { name: 'User', typeName: 'User' },
            },
          ],
        };
      })(),
      {
        name: 'a re-export cycle',
        ...project('reexport-cycle', {
          'a.mts': dedent`
            export * from './codec.mjs';
            export * from './b.mjs';
          `,
          'b.mts': dedent`
            export * from './a.mjs';
          `,
        }),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
      {
        name: 'the codec composed only into one that is itself type-only',
        ...project(
          'composed-type-only',
          {},
          dedent`
            import * as t from 'ts-fortress';

            export const User = t.record({ name: t.string() });

            export type User = t.TypeOf<typeof User>;

            export const Users = t.array(User);

            export type Users = t.TypeOf<typeof Users>;
          `,
        ),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'Users', typeName: 'Users' },
          },
        ],
      },
      {
        name: '`typeof X` elsewhere in its own file',
        ...project(
          'local-typeof',
          {},
          dedent`
            import * as t from 'ts-fortress';

            export const User = t.record({ name: t.string() });

            export type User = t.TypeOf<typeof User>;

            export type UserCodec = typeof User;
          `,
        ),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
      {
        name: 'a named `TypeOf` import',
        ...project(
          'named-type-of',
          {},
          dedent`
            import * as t from 'ts-fortress';
            import { type TypeOf as Of } from 'ts-fortress';

            export const User = t.record({ name: t.string() });

            export type User = Of<typeof User>;
          `,
        ),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
      {
        name: 'a codec that is not exported',
        ...project(
          'not-exported',
          {},
          dedent`
            import * as t from 'ts-fortress';

            const User = t.record({ name: t.string() });

            export type User = t.TypeOf<typeof User>;
          `,
        ),
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
    ],
  });
});

describe('no-type-only-codec without type information', () => {
  const untyped = new RuleTester({
    languageOptions: {
      parser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    },
  });

  untyped.run('no-type-only-codec', noTypeOnlyCodec, {
    valid: [
      {
        name: 'a codec used in its own file needs no program',
        code: dedent`
          import * as t from 'ts-fortress';

          export const User = t.record({ name: t.string() });

          export type User = t.TypeOf<typeof User>;

          export const isUser = (u: unknown): boolean => User.is(u);
        `,
      },
      {
        name: 'an exported codec is left alone without a program to find its importers in',
        code: USER_CODEC,
      },
      {
        name: 'a file without a ts-fortress import is not looked at',
        code: dedent`
          export const User = { name: 'a' };
        `,
      },
    ],
    invalid: [
      {
        name: 'a codec that is not exported needs no program',
        code: dedent`
          import * as t from 'ts-fortress';

          const User = t.record({ name: t.string() });

          export type User = t.TypeOf<typeof User>;
        `,
        errors: [
          {
            messageId: 'typeOnlyCodec',
            data: { name: 'User', typeName: 'User' },
          },
        ],
      },
    ],
  });
});
