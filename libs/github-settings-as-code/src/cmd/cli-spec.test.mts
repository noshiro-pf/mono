import * as fs from 'node:fs';
import * as path from 'node:path';
import { HELP, TARGETS, parseCliArgs } from './cli-spec.mjs';

/** The targets the `Targets:` section of the help names, in order. */
const targetsInHelp = (help: string): readonly string[] => {
  const lines = help.split('\n');

  const start = lines.indexOf('Targets:');

  assert.isAbove(start, -1);

  const end = lines.findIndex((line, index) => index > start && line === '');

  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .flatMap(
      (line) => /^ {2}(?<name>[\w-]+)/u.exec(line)?.groups?.['name'] ?? [],
    );
};

/** The targets the README's target table names, in order. */
const targetsInReadme = (readme: string): readonly string[] => {
  const lines = readme.split(/\r?\n/u);

  const start = lines.findIndex((line) => /^\| Target\s+\|/u.test(line));

  assert.isAbove(start, -1);

  const rows = lines.slice(start + 2);

  const end = rows.findIndex((row) => !row.startsWith('|'));

  return rows
    .slice(0, end === -1 ? undefined : end)
    .flatMap(
      (row) => /^\| `(?<name>[\w-]+)`/u.exec(row)?.groups?.['name'] ?? [],
    );
};

describe('TARGETS', () => {
  test('is what the help text lists under Targets', () => {
    assert.deepStrictEqual(targetsInHelp(HELP), TARGETS);
  });

  test("is what the README's target table lists", () => {
    const readme = fs.readFileSync(
      path.resolve(import.meta.dirname, '../../README.md'),
      'utf8',
    );

    assert.deepStrictEqual(targetsInReadme(readme), TARGETS);
  });
});

describe(parseCliArgs, () => {
  const errorOf = (args: readonly string[]): string => {
    const parsed = parseCliArgs(args);

    assert.isTrue(parsed.type === 'error');

    return parsed.message;
  };

  test('refuses an option the CLI does not have, naming only the option', () => {
    assert.strictEqual(
      errorOf(['apply', '--dry-run']),
      'Unknown option: "--dry-run"',
    );

    assert.strictEqual(errorOf(['apply', '-x']), 'Unknown option: "-x"');

    assert.strictEqual(errorOf(['apply', '-hx']), 'Unknown option: "-x"');

    assert.strictEqual(
      errorOf(['apply', '--foo=bar']),
      'Unknown option: "--foo"',
    );
  });

  test('refuses an unknown option whose value would be an ignored positional', () => {
    expect(
      errorOf(['apply', 'rulesets', '--repository', 'ts-repo-utils']),
    ).toContain('--repository');
  });

  test('refuses --repo given without a value', () => {
    expect(errorOf(['apply', '--owner', 'o', '--repo'])).toContain('--repo');
  });

  test('refuses --owner given without a value', () => {
    expect(errorOf(['apply', '--owner'])).toContain('--owner');
  });

  test('refuses --owner or --repo given an empty value', () => {
    expect(errorOf(['apply', '--owner', 'o', '--repo', ''])).toContain(
      '--repo',
    );

    expect(errorOf(['apply', '--owner='])).toContain('--owner');
  });

  test('refuses a third positional argument', () => {
    expect(errorOf(['apply', 'rulesets', 'extra'])).toContain('extra');
  });

  test('lists each extra argument separately', () => {
    assert.strictEqual(
      errorOf(['apply', 'rulesets', 'a', 'b c']),
      'Unexpected argument(s): "a", "b c"',
    );
  });

  test('names an unknown command or target before any extra argument', () => {
    expect(errorOf(['deploy', 'rulesets', 'extra'])).toContain('deploy');

    expect(errorOf(['apply', 'secrets', 'extra'])).toContain('secrets');
  });

  test('refuses an unknown command', () => {
    expect(errorOf(['deploy'])).toContain('deploy');
  });

  test('refuses an unknown target', () => {
    expect(errorOf(['apply', 'secrets'])).toContain('secrets');
  });

  test('accepts --owner and --repo with their values', () => {
    assert.deepStrictEqual(
      parseCliArgs(['apply', '--owner', 'o', '--repo', 'r']),
      { type: 'run', command: 'apply', target: 'all' },
    );
  });

  test('accepts a command and a target', () => {
    assert.deepStrictEqual(parseCliArgs(['backup', 'rulesets']), {
      type: 'run',
      command: 'backup',
      target: 'rulesets',
    });
  });

  test('takes the target all when none is given', () => {
    assert.deepStrictEqual(parseCliArgs(['apply']), {
      type: 'run',
      command: 'apply',
      target: 'all',
    });
  });

  test('refuses an empty --repo even when the help is asked for', () => {
    expect(errorOf(['apply', '--repo', '', '-h'])).toContain('--repo');
  });

  test('asks for the help with -h, alone or after a command', () => {
    assert.deepStrictEqual(parseCliArgs(['-h']), {
      type: 'help',
      requested: true,
    });

    assert.deepStrictEqual(parseCliArgs(['apply', '-h']), {
      type: 'help',
      requested: true,
    });

    assert.deepStrictEqual(parseCliArgs(['apply', '--help']), {
      type: 'help',
      requested: true,
    });
  });

  test('shows the help, not asked for, when no command is given', () => {
    assert.deepStrictEqual(parseCliArgs([]), {
      type: 'help',
      requested: false,
    });
  });
});
