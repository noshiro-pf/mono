import { Result } from 'ts-data-forge';
import {
  diffFromExpected,
  parseTrustListOutput,
} from './report-npm-trusted-publishers.mjs';

const expectedFlat = {
  id: 'abc',
  type: 'github',
  file: 'release.yml',
  repository: 'noshiro-pf/mono',
  environment: 'release',
  permissions: ['createPackage'],
} as const;

describe(parseTrustListOutput, () => {
  test('no output means no configuration', () => {
    assert.deepStrictEqual(parseTrustListOutput(''), Result.ok([]));
  });

  test('accepts the double-encoded output npm 11 prints', () => {
    const stdout = JSON.stringify(JSON.stringify(expectedFlat, undefined, 2));

    assert.deepStrictEqual(
      parseTrustListOutput(stdout),
      Result.ok([{ ...expectedFlat, project: undefined }]),
    );
  });

  test('accepts an array in the registry shape', () => {
    const stdout = JSON.stringify([
      {
        id: 'abc',
        type: 'github',
        claims: {
          repository: 'noshiro-pf/mono',
          workflow_ref: { file: 'release.yml' },
        },
      },
    ]);

    assert.deepStrictEqual(
      parseTrustListOutput(stdout),
      Result.ok([
        {
          id: 'abc',
          type: 'github',
          repository: 'noshiro-pf/mono',
          project: undefined,
          file: 'release.yml',
          environment: undefined,
          permissions: undefined,
        },
      ]),
    );
  });

  test('reports an npm error', () => {
    const stdout = JSON.stringify({
      error: { code: 'E403', summary: 'Forbidden' },
    });

    assert.deepStrictEqual(
      parseTrustListOutput(stdout),
      Result.err('Forbidden'),
    );
  });
});

describe(diffFromExpected, () => {
  const base = { ...expectedFlat, project: undefined };

  test('a matching configuration has no differences', () => {
    assert.deepStrictEqual(diffFromExpected(base), []);
  });

  test('no permissions field is treated as publish allowed', () => {
    assert.deepStrictEqual(
      diffFromExpected({ ...base, permissions: undefined }),
      [],
    );
  });

  test('lists every difference', () => {
    assert.deepStrictEqual(
      diffFromExpected({
        ...base,
        environment: undefined,
        permissions: ['createStagedPackage'],
      }),
      ['environment is (none)', 'publish is not allowed'],
    );
  });
});
