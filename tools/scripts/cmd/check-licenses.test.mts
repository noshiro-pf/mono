import { Result } from 'ts-data-forge';
import { type LicensePolicy } from '../../configs/license-policy.mjs';
import {
  collectViolations,
  formatReport,
  isAllowedExpression,
  matchesPackagePattern,
  parseLicensesOutput,
  type InstalledLicense,
} from './check-licenses.mjs';

const policy = {
  allowed: [
    { license: 'MIT', note: 'Keep the notice.' },
    { license: 'BSD-3-Clause', note: 'Keep the notice.' },
  ],
  exceptions: [
    {
      license: 'MPL-2.0',
      packages: ['axe-core', 'lightningcss', 'lightningcss-*'],
      reason: 'Unmodified.',
    },
  ],
} as const satisfies LicensePolicy;

const installedOf = (
  name: string,
  license: string,
  versions: readonly string[] = ['1.0.0'],
): InstalledLicense => ({ name, license, versions }) as const;

const subjectsOf = (
  installed: readonly InstalledLicense[],
): readonly string[] =>
  collectViolations(installed, policy).map(({ subject }) => subject);

describe(parseLicensesOutput, () => {
  test('flattens the groups into one entry per package and license', () => {
    const output = JSON.stringify({
      MIT: [{ name: 'a', versions: ['1.0.0', '2.0.0'], license: 'MIT' }],
      'Python-2.0': [
        { name: 'argparse', versions: ['2.0.1'], license: 'Python-2.0' },
      ],
      'PSF-2.0': [
        { name: 'argparse', versions: ['3.0.2'], license: 'PSF-2.0' },
      ],
    });

    assert.deepStrictEqual(
      parseLicensesOutput(output),
      Result.ok([
        { name: 'a', license: 'MIT', versions: ['1.0.0', '2.0.0'] },
        { name: 'argparse', license: 'Python-2.0', versions: ['2.0.1'] },
        { name: 'argparse', license: 'PSF-2.0', versions: ['3.0.2'] },
      ]),
    );
  });

  test('refuses output that lists nothing', () => {
    assert.isTrue(Result.isErr(parseLicensesOutput('{}')));
  });

  test('refuses output that is not the shape pnpm writes', () => {
    assert.isTrue(Result.isErr(parseLicensesOutput('No licenses found')));

    assert.isTrue(Result.isErr(parseLicensesOutput('{"MIT":[{"name":1}]}')));
  });
});

describe(isAllowedExpression, () => {
  const allowed = new Set(['MIT', 'BSD-3-Clause']);

  test('a plain identifier is looked up', () => {
    assert.isTrue(isAllowedExpression('MIT', allowed));

    assert.isFalse(isAllowedExpression('MPL-2.0', allowed));
  });

  test('OR is a choice, so one allowed alternative is enough', () => {
    assert.isTrue(isAllowedExpression('(AFL-2.1 OR BSD-3-Clause)', allowed));

    assert.isFalse(isAllowedExpression('(AFL-2.1 OR MPL-2.0)', allowed));
  });

  test('AND binds both, so every part has to be allowed', () => {
    assert.isTrue(isAllowedExpression('MIT AND BSD-3-Clause', allowed));

    assert.isFalse(isAllowedExpression('(MIT AND MPL-2.0)', allowed));
  });

  test('anything it cannot read is not allowed', () => {
    assert.isFalse(isAllowedExpression('(MIT OR (MPL-2.0 AND MIT))', allowed));

    assert.isFalse(isAllowedExpression('MIT WITH some-exception', allowed));

    assert.isFalse(isAllowedExpression('', allowed));
  });
});

describe(matchesPackagePattern, () => {
  test('a name matches itself and nothing longer', () => {
    assert.isTrue(matchesPackagePattern('lightningcss', 'lightningcss'));

    assert.isFalse(
      matchesPackagePattern('lightningcss', 'lightningcss-linux-x64-gnu'),
    );
  });

  test('a trailing `*` matches the platform binaries', () => {
    assert.isTrue(
      matchesPackagePattern('lightningcss-*', 'lightningcss-linux-x64-gnu'),
    );

    assert.isFalse(matchesPackagePattern('lightningcss-*', 'lightningcss'));
  });
});

describe(collectViolations, () => {
  test('allowed licenses and matching exceptions pass', () => {
    assert.deepStrictEqual(
      subjectsOf([
        installedOf('a', 'MIT'),
        installedOf('axe-core', 'MPL-2.0'),
        installedOf('lightningcss', 'MPL-2.0'),
        installedOf('lightningcss-linux-x64-gnu', 'MPL-2.0'),
      ]),
      [],
    );
  });

  test('a license outside the list fails, naming package and license', () => {
    const violations = collectViolations(
      [
        installedOf('axe-core', 'MPL-2.0'),
        installedOf('lightningcss', 'MPL-2.0'),
        installedOf('lightningcss-darwin-arm64', 'MPL-2.0'),
        installedOf('b', 'BUSL-1.1', ['3.1.0']),
      ],
      policy,
    );

    assert.deepStrictEqual(
      violations.map(({ subject }) => subject),
      ['b@3.1.0 (BUSL-1.1)'],
    );
  });

  test('an excepted package that changes license fails as a change', () => {
    const violations = collectViolations(
      [
        installedOf('axe-core', 'SSPL-1.0'),
        installedOf('lightningcss', 'MPL-2.0'),
        installedOf('lightningcss-linux-x64-gnu', 'MPL-2.0'),
      ],
      policy,
    );

    assert.deepStrictEqual(
      violations.map(({ subject }) => subject),
      ['axe-core@1.0.0 (SSPL-1.0)', "exception 'axe-core' (MPL-2.0)"],
    );

    assert.isTrue(violations[0]?.message.includes('MPL-2.0') === true);
  });

  test('`Unknown` fails even though nothing declares it forbidden', () => {
    assert.deepStrictEqual(
      subjectsOf([
        installedOf('c', 'Unknown'),
        installedOf('axe-core', 'MPL-2.0'),
        installedOf('lightningcss', 'MPL-2.0'),
        installedOf('lightningcss-linux-x64-gnu', 'MPL-2.0'),
      ]),
      ['c@1.0.0 (Unknown)'],
    );
  });

  test('an exception matching nothing installed is stale', () => {
    assert.deepStrictEqual(
      subjectsOf([
        installedOf('axe-core', 'MPL-2.0'),
        installedOf('lightningcss-linux-x64-gnu', 'MPL-2.0'),
      ]),
      ["exception 'lightningcss' (MPL-2.0)"],
    );
  });
});

describe(formatReport, () => {
  test('counts per license, with the note or the exception beside it', () => {
    const report = formatReport(
      [
        installedOf('a', 'MIT'),
        installedOf('b', 'MIT'),
        installedOf('axe-core', 'MPL-2.0'),
      ],
      policy,
    );

    assert.isTrue(report.includes('| MIT | 2 | allowed | Keep the notice. |'));

    assert.isTrue(
      report.includes('| MPL-2.0 | 1 | exception | `axe-core`: Unmodified. |'),
    );
  });
});
