import dedent from 'dedent';
import { ok, recordedTransport, status } from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import { HEAD, routes, type Routes } from '../../../test/index.mjs';
import {
  declaredRequirements,
  prReport,
  readReport,
  type PrReportWorld,
} from './main.mjs';
import type { Options } from './options.mjs';
import { MAX_OPEN_PULLS } from './queue.mjs';

const NOW = Date.parse('2026-11-10T00:00:00Z');

const options: Options = {
  format: 'terminal',
  repo: 'o/n',
  mergedDays: 7,
  mergedLimit: 20,
  issuesLimit: 30,
} as const;

const worldOf = (recorded: Routes): PrReportWorld =>
  ({
    transport: recordedTransport(recorded).transport,
    env: { GH_TOKEN: 'token' },
    nowEpochMs: NOW,
    originUrl: () => Promise.resolve(undefined),
    manifestUrl: () => Promise.resolve(undefined),
    declaredRuleset: () => Promise.resolve(undefined),
    ghAuthToken: () => Promise.resolve(Result.err('no gh')),
    warn: () => undefined,
  }) as const;

describe(readReport, () => {
  test('reads, decides and builds the report', async () => {
    const report = Result.unwrapThrow(
      await readReport(options, worldOf(routes)),
    );

    assert.deepStrictEqual(report.required, ['ci']);

    assert.deepStrictEqual(
      report.entries.map((entry) => ({
        number: entry.number,
        verdict: entry.checks.verdict,
        failed: entry.checks.failed,
        reported: entry.reported,
        comparison: entry.comparison,
        linked: entry.linkedIssues.map(({ number }) => number),
        owner: entry.owner?.owner,
      })),
      [
        {
          number: 7,
          verdict: 'failing',
          failed: ['ci'],
          reported: { ci: 'failed' },
          comparison: { aheadBy: 1, behindBy: 2 },
          linked: [3],
          owner: 'worker',
        },
      ],
    );

    assert.deepStrictEqual(
      report.issues.map(({ number, start, claim }) => ({
        number,
        start,
        claim,
      })),
      [
        { number: 3, start: 'in-progress', claim: undefined },
        {
          number: 4,
          start: 'planned',
          claim: {
            state: 'planned',
            by: 'session-a',
            at: '2026-11-09T21:00:00Z',
          },
        },
      ],
    );
  });

  test('warns, and reads anonymously, without a token', async () => {
    const mut_warned: string[] = [];

    const report = Result.unwrapThrow(
      await readReport(options, {
        ...worldOf(routes),
        env: {},
        warn: (line) => {
          mut_warned.push(line);
        },
      }),
    );

    assert.isFalse(report.authenticated);

    assert.lengthOf(mut_warned, 1);

    assert.include(mut_warned[0], 'no credential');
  });

  test('leaves out a planned claim that has expired', async () => {
    const report = Result.unwrapThrow(
      await readReport(options, {
        ...worldOf(routes),
        nowEpochMs: Date.parse('2026-11-11T00:00:00Z'),
      }),
    );

    assert.isUndefined(report.issues.find(({ number }) => number === 4)?.claim);
  });

  test('fails, naming what, when a pull request’s checks are unread', async () => {
    const report = await readReport(
      options,
      worldOf({
        ...routes,
        [`/repos/o/n/commits/${HEAD}/check-runs?filter=all&per_page=100`]:
          status(502, 'bad gateway'),
      }),
    );

    assert.match(
      Result.isErr(report) ? report.value : 'read in full',
      /for #7/u,
    );
  });

  test('refuses more than it covers before reading each one', async () => {
    const { transport, sent } = recordedTransport({
      ...routes,
      '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100': ok(
        Array.from({ length: MAX_OPEN_PULLS + 1 }, (_, i) => ({
          number: i + 1,
        })),
      ),
    });

    const report = await readReport(options, { ...worldOf(routes), transport });

    assert.match(
      Result.isErr(report) ? report.value : 'read in full',
      /more than 100 pull requests are open/u,
    );

    assert.deepStrictEqual(
      sent.map(({ url }) => url),
      [
        'https://api.github.com/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100',
      ],
    );
  });

  test('fails on a repository it cannot name', async () => {
    const report = await readReport(
      { ...options, repo: undefined },
      worldOf(routes),
    );

    assert.isTrue(Result.isErr(report));
  });
});

describe(declaredRequirements, () => {
  const ruleset = JSON.stringify({
    rules: [
      {
        type: 'required_status_checks',
        parameters: { required_status_checks: [{ context: 'declared' }] },
      },
    ],
  });

  const world = (origin: string): PrReportWorld =>
    ({
      ...worldOf(routes),
      originUrl: () => Promise.resolve(origin),
      declaredRuleset: () => Promise.resolve(ruleset),
    }) as const;

  const repo = { owner: 'o', name: 'n' } as const;

  test('the checkout’s own repository reads its declaration', async () => {
    assert.deepStrictEqual(
      Result.map(
        await declaredRequirements(
          undefined,
          repo,
          world('git@github.com:o/n'),
        ),
        (read) => read?.requiredContexts,
      ),
      Result.ok(['declared']),
    );

    assert.deepStrictEqual(
      Result.map(
        await declaredRequirements('O/N', repo, world('git@github.com:o/n')),
        (read) => read?.requiredContexts,
      ),
      Result.ok(['declared']),
    );
  });

  test('another repository reads what GitHub enforces', async () => {
    assert.deepStrictEqual(
      await declaredRequirements('o/n', repo, world('git@github.com:x/y')),
      Result.ok(undefined),
    );
  });

  test('a declaration that does not parse is the error', async () => {
    const result = await declaredRequirements(undefined, repo, {
      ...world('git@github.com:o/n'),
      declaredRuleset: () => Promise.resolve('{'),
    });

    assert.isTrue(Result.isErr(result));
  });

  test('a declaration of the wrong shape says what is wrong', async () => {
    const result = await declaredRequirements(undefined, repo, {
      ...world('git@github.com:o/n'),
      declaredRuleset: () => Promise.resolve('{"rules":1}'),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'rules');

    assert.notInclude(result.value, '[object Object]');
  });

  test('the report takes the declared contexts', async () => {
    const report = Result.unwrapThrow(
      await readReport(options, {
        ...world('git@github.com:o/n'),
      }),
    );

    assert.deepStrictEqual(report.required, ['declared']);
  });
});

describe(prReport, () => {
  test('prints the tree, the stale-free failure and the claim', async () => {
    const printed = Result.unwrapThrow(
      await prReport(options, worldOf(routes)),
    );

    assert.strictEqual(
      printed,
      `${dedent`
        Open pull requests — o/n
        1 open · 1 queued · 0 draft · 1 failing · 1 behind · generated 2026-11-10T00:00:00Z

        ✗ #7 fix: a thing · +1 / -2 · [merge-queued] · closes #3 · failed: ci

        Open issues (2)

        - #3 issue 3 · in progress · updated 2026-11-02T00:00:00Z · by author · 1 comment · [priority:B]
        - #4 issue 4 · planned by session-a 3h ago · updated 2026-11-02T00:00:00Z · by author · 1 comment · [priority:B]
      `}\n`,
    );
  });

  test('JSON carries the reported map as an object', async () => {
    const printed = Result.unwrapThrow(
      await prReport({ ...options, format: 'json' }, worldOf(routes)),
    );

    const parsed: unknown = JSON.parse(printed);

    assert.deepNestedPropertyVal(parsed, 'entries[0].reported', {
      ci: 'failed',
    });
  });
});
