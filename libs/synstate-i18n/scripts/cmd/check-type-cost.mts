import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
// eslint-disable-next-line import-x/no-relative-packages -- the repository's one way to run a process
import { runFile } from '../../../../tools/scripts/lib/child-process.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

/**
 * Type-checks an application with a catalog of 500 messages, one translation
 * and a call of `t` for each message, and fails when the checker needs more
 * instantiations than {@link instantiationLimit}: a change to the catalog types
 * that makes them much more expensive would otherwise show only as a slow
 * editor in a large application. The time is printed, not checked, since it
 * depends on the machine.
 *
 * The count includes the libraries the fixture imports: about 74,000 when the
 * check was last measured. Raise the limit only with the reason in the pull
 * request.
 */
const instantiationLimit = 100_000;

const sectionCount = 20;

/** Twenty-five messages per section, so that the catalog has 500. */
const messageCount = 25;

const baseMessage = (i: number): string =>
  i % 5 === 4
    ? (`m${i}: (p: Readonly<{ n: number }>) => \`\${p.n} items\`,` as const)
    : (`m${i}: '${['Plain text', 'Hello, {name}!', '{a} and {b}', 'At {time} on {date}'][i % 4] ?? ''}',` as const);

const translatedMessage = (i: number): string =>
  i % 5 === 4
    ? (`m${i}: (p) => \`\${p.n} 件\`,` as const)
    : (`m${i}: '${['テキスト', 'こんにちは、{name}さん', '{b} と {a}', '{date} の {time}'][i % 4] ?? ''}',` as const);

const section = (
  i: number,
  message: (index: number) => string,
): string => dedent`
  s${i}: {
    ${Arr.seq(messageCount).map(message).join('\n')}
  },
`;

const usage = (s: number, i: number): string =>
  i % 5 === 4
    ? (`i18n.t.s${s}.m${i}({ n });` as const)
    : ([
        `i18n.t.s${s}.m${i}();`,
        `i18n.t.s${s}.m${i}({ name });`,
        `i18n.t.s${s}.m${i}({ a: 1, b: name });`,
        `i18n.t.s${s}.m${i}({ time: '9:00', date: name });`,
      ][i % 4] ?? '');

const fixture = (srcIndex: string): string => dedent`
  import { state } from 'synstate';
  import { createI18n, type TranslationOf } from ${JSON.stringify(srcIndex)};

  const en = {
    ${Arr.seq(sectionCount)
      .map((i) => section(i, baseMessage))
      .join('\n')}
  } as const;

  const ja = {
    ${Arr.seq(sectionCount)
      .map((i) => section(i, translatedMessage))
      .join('\n')}
  } as const satisfies TranslationOf<typeof en>;

  export const i18n = createI18n({
    baseLocale: 'en',
    baseMessages: en,
    translations: { ja, fr: () => Promise.resolve(ja) },
  });

  const name = state('Alice');

  const n = state(3);

  ${Arr.seq(sectionCount)
    .flatMap((s) => Arr.seq(messageCount).map((i) => usage(s, i)))
    .join('\n')}
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
      'check-type-cost: the 500-message fixture does not type-check',
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
    `500 messages: ${instantiations} instantiations (limit ${instantiationLimit}), check time ${checkTime}`,
  );

  if (instantiations > instantiationLimit) {
    throw new Error(
      `check-type-cost: ${instantiations} instantiations is over the limit of ${instantiationLimit}`,
    );
  }
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}
