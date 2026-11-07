import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { projectRootPath } from '../project-root-path.mjs';
import {
  findLibReplacementViolations,
  PROBE_TEMPLATE,
  probePathOf,
  programReads,
  templateProblem,
  type TsconfigFile,
} from './check-tsconfig-lib-replacement.mjs';

const PROBE =
  "// @ts-expect-error\nexport const probeIsFinite: boolean = Number.isFinite('1');";

const file = (
  content: string,
  probe: string | undefined = PROBE,
  probeRead = true,
): TsconfigFile =>
  ({
    relativePath: 'libs/a/tsconfig.json',
    content,
    probe,
    probeRead: () => Result.ok(probeRead),
  }) as const;

describe(findLibReplacementViolations, () => {
  test('accepts `true`', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        file(dedent`
          {
            "compilerOptions": { "libReplacement": true },
            "include": ["./src", "./test"]
          }
        `),
      ]),
      [],
    );
  });

  test('`true` needs a probe that is a copy of the template', () => {
    const config = dedent`
      {
        "compilerOptions": { "libReplacement": true },
        "include": ["./src", "./test"]
      }
    `;

    const noProbe = {
      relativePath: 'libs/a/tsconfig.json',
      problem: 'no-probe',
    } as const;

    assert.deepStrictEqual(
      // Not `file()`: a default parameter takes `undefined` for its default.
      findLibReplacementViolations(PROBE, [
        {
          relativePath: 'libs/a/tsconfig.json',
          content: config,
          probe: undefined,
          probeRead: () => Result.ok(false),
        },
      ]),
      [noProbe],
    );

    // Anything but the copy: whether a directive applies is tsc's question.
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        file(config, "// @ts-expect-error\nexport const a: number = 'a';"),
      ]),
      [noProbe],
    );

    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        file(config, `${PROBE}\n// edited`),
      ]),
      [noProbe],
    );
  });

  test('`true` needs its probe among the files the program reads', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        file(
          dedent`
            {
              "compilerOptions": { "libReplacement": true },
              "include": ["./src", "./scripts"]
            }
          `,
          PROBE,
          false,
        ),
      ]),
      [{ relativePath: 'libs/a/tsconfig.json', problem: 'probe-not-included' }],
    );
  });

  test('`false` needs no probe', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        {
          relativePath: 'libs/a/tsconfig.json',
          content: dedent`
            {
              "compilerOptions": {
                // The strict library depends on this package.
                "libReplacement": false
              }
            }
          `,
          probe: undefined,
          probeRead: () => Result.ok(false),
        },
      ]),
      [],
    );
  });

  test('a program tsc cannot read is said so, not taken for a probe left out', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        {
          relativePath: 'libs/a/tsconfig.json',
          content: '{ "compilerOptions": { "libReplacement": true } }',
          probe: PROBE,
          probeRead: () => Result.err('File ./gone.json not found.'),
        },
      ]),
      [
        {
          relativePath: 'libs/a/tsconfig.json',
          problem: 'program-unreadable',
          detail: 'File ./gone.json not found.',
        },
      ],
    );
  });

  test('the root keeps its probe under tools/', () => {
    assert.strictEqual(
      probePathOf('tsconfig.json'),
      'tools/scripts/strict-lib-active.mts',
    );

    assert.strictEqual(
      probePathOf('libs/a/tsconfig.json'),
      'libs/a/test/strict-lib-active.mts',
    );
  });

  test('accepts `false` with a comment above it', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        file(dedent`
          {
            "compilerOptions": {
              // The strict library depends on this package.
              "libReplacement": false
            }
          }
        `),
      ]),
      [],
    );
  });

  test('accepts `false` with a comment on the same line', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        file(dedent`
          {
            "compilerOptions": {
              "libReplacement": false // Runs under TypeScript 5.7.
            }
          }
        `),
      ]),
      [],
    );
  });

  test('reports a file without `compilerOptions`', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        file(dedent`
          {
            "extends": "../../tools/configs/tsconfig/tsconfig.type-check.json",
            "include": ["./src"]
          }
        `),
      ]),
      [{ relativePath: 'libs/a/tsconfig.json', problem: 'undeclared' }],
    );
  });

  test('reports `compilerOptions` without `libReplacement`', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        file(dedent`
          {
            "compilerOptions": { "jsx": "react-jsx" }
          }
        `),
      ]),
      [{ relativePath: 'libs/a/tsconfig.json', problem: 'undeclared' }],
    );
  });

  test('does not take a commented-out declaration for one', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        file(dedent`
          {
            "compilerOptions": {
              // "libReplacement": true,
              "jsx": "react-jsx"
            }
          }
        `),
      ]),
      [{ relativePath: 'libs/a/tsconfig.json', problem: 'undeclared' }],
    );
  });

  test('reports `false` with no reason', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        file(dedent`
          {
            "compilerOptions": {
              "jsx": "react-jsx",
              "libReplacement": false
            }
          }
        `),
      ]),
      [
        {
          relativePath: 'libs/a/tsconfig.json',
          problem: 'false-without-reason',
        },
      ],
    );
  });

  test('does not take a comment above an unrelated line for a reason', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        file(dedent`
          {
            "compilerOptions": {
              // React, not Preact.
              "jsx": "react-jsx",
              "libReplacement": false
            }
          }
        `),
      ]),
      [
        {
          relativePath: 'libs/a/tsconfig.json',
          problem: 'false-without-reason',
        },
      ],
    );
  });

  test('reports a value that is not a boolean', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations(PROBE, [
        file(dedent`
          {
            "compilerOptions": { "libReplacement": "true" }
          }
        `),
      ]),
      [{ relativePath: 'libs/a/tsconfig.json', problem: 'not-boolean' }],
    );
  });
});

describe(programReads, () => {
  test('answers as tsc resolves the program', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lib-replacement-'));

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary directory the test makes
      await fs.mkdir(path.join(dir, 'test', 'browser'), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary directory the test makes
      await fs.mkdir(path.join(dir, 'src'), { recursive: true });

      const probe = path.join(dir, 'test', 'strict-lib-active.mts');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary directory the test makes
      await fs.writeFile(probe, 'export const a = 1;\n');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary directory the test makes
      await fs.writeFile(
        path.join(dir, 'src', 'a.mts'),
        'export const b = 1;\n',
      );

      const reads = (config: string): boolean => {
        const read = programReads(
          path.join(dir, 'tsconfig.json'),
          config,
          probe,
        );

        assert.isTrue(Result.isOk(read));

        return Result.unwrapOkOr(read, false);
      };

      assert.isTrue(reads('{ "include": ["./src", "./test"] }'));

      // No `include` is everything.
      assert.isTrue(reads('{}'));

      // `extends`, as every tsconfig here has it.
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary directory the test makes
      await fs.writeFile(
        path.join(dir, 'base.json'),
        '{ "include": ["./src"] }',
      );

      assert.isFalse(reads('{ "extends": "./base.json" }'));

      // An option this tsc does not know is not a program it cannot read.
      assert.isTrue(
        Result.isOk(
          programReads(
            path.join(dir, 'tsconfig.json'),
            '{ "compilerOptions": { "notAnOptionYet": true } }',
            probe,
          ),
        ),
      );

      // A compiler option of a type this tsc does not take is not a program it
      // cannot read: the native compiler may take it.
      assert.isTrue(
        Result.isOk(
          programReads(
            path.join(dir, 'tsconfig.json'),
            '{ "compilerOptions": { "strict": "yes" } }',
            probe,
          ),
        ),
      );

      // An `exclude` of the wrong type, which tsc drops, is not an answer.
      assert.isTrue(
        Result.isErr(
          programReads(
            path.join(dir, 'tsconfig.json'),
            '{ "include": ["./test"], "exclude": "test" }',
            probe,
          ),
        ),
      );

      // An `extends` that does not resolve is not an answer.
      assert.isTrue(
        Result.isErr(
          programReads(
            path.join(dir, 'tsconfig.json'),
            '{ "extends": "./gone.json" }',
            probe,
          ),
        ),
      );

      assert.isFalse(reads('{ "include": ["./src", "./test/browser"] }'));

      assert.isFalse(reads('{ "include": ["./src", "./tools"] }'));

      assert.isFalse(reads('{ "include": ["."], "exclude": ["test"] }'));
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});

describe(templateProblem, () => {
  test('takes the template as it is', async () => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the repository's own template
    const template = await fs.readFile(
      path.join(projectRootPath, PROBE_TEMPLATE),
      'utf8',
    );

    assert.isUndefined(templateProblem(template));
  });

  test('reads the line tsc reads, past blank lines', () => {
    assert.isUndefined(
      templateProblem(
        "// @ts-expect-error A reason,\n// on two lines.\n\nexport const probeIsFinite: boolean = Number.isFinite('1');",
      ),
    );
  });

  test('refuses another line, even one keeping the expression', () => {
    assert.isString(
      templateProblem(
        "// @ts-expect-error\nexport const probeIsFinite: string = Number.isFinite('1');",
      ),
    );
  });

  test('refuses a directive on an error every library gives', () => {
    assert.isString(
      templateProblem(
        "// Number.isFinite('1')\n// @ts-expect-error\nexport const a: number = 'a';",
      ),
    );

    assert.isString(templateProblem("export const a = Number.isFinite('1');"));
  });
});
