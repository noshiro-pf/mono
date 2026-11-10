// cspell:ignore esac

import dedent from 'dedent';
import { readShellCommands } from './shell-commands.mjs';

const commands = (script: string): readonly (readonly string[])[] =>
  readShellCommands(script).commands;

describe('readShellCommands', () => {
  test('splits at every separator', () => {
    assert.deepStrictEqual(commands('a 1; b 2 && c || d | e & f\ng'), [
      ['a', '1'],
      ['b', '2'],
      ['c'],
      ['d'],
      ['e'],
      ['f'],
      ['g'],
    ]);
  });

  test('takes the quotes off a word and keeps a quoted run together', () => {
    assert.deepStrictEqual(
      commands('run-s check:md "gen:x -- --all" \'a b\'c'),
      [['run-s', 'check:md', 'gen:x -- --all', 'a bc']],
    );
  });

  test('a quoted separator or `#` separates nothing', () => {
    assert.deepStrictEqual(
      commands('echo "a; b && c # d" \'e | f\' && pnpm run x'),
      [
        ['echo', 'a; b && c # d', 'e | f'],
        ['pnpm', 'run', 'x'],
      ],
    );
  });

  test('a `#` that starts a word starts a comment, one inside a word does not', () => {
    assert.deepStrictEqual(
      commands(dedent`
        # pnpm run commented
        echo a#b # then pnpm run trailing
        pnpm run x
      `),
      [
        ['echo', 'a#b'],
        ['pnpm', 'run', 'x'],
      ],
    );
  });

  test('an apostrophe in a double-quoted string opens nothing', () => {
    assert.deepStrictEqual(commands('echo "can\'t" && pnpm run x'), [
      ['echo', "can't"],
      ['pnpm', 'run', 'x'],
    ]);
  });

  test('a backslash at the end of a line continues the command', () => {
    assert.deepStrictEqual(
      commands('pnpm run \\\n  z:ci-job \\\n  --command x'),
      [['pnpm', 'run', 'z:ci-job', '--command', 'x']],
    );
  });

  test('a quoted string may span lines', () => {
    assert.deepStrictEqual(commands('echo "one\ntwo" && pnpm run x'), [
      ['echo', 'one\ntwo'],
      ['pnpm', 'run', 'x'],
    ]);
  });

  test('the commands of a substitution are commands too, quoted or not', () => {
    assert.deepStrictEqual(
      commands(dedent`
        out="$(cd a && pnpm run x)"
        spaced=$( pnpm run y )
        old=\`pnpm run z\`
        echo "$(echo "$(pnpm run nested)")"
      `),
      [
        ['cd', 'a'],
        ['pnpm', 'run', 'x'],
        ['pnpm', 'run', 'y'],
        ['pnpm', 'run', 'z'],
        ['pnpm', 'run', 'nested'],
        ['echo', '$(…)'],
        ['echo', '$(…)'],
      ],
    );
  });

  test('a process substitution is a command, and its `<` no redirection', () => {
    assert.deepStrictEqual(commands('mapfile -t xs < <(pnpm run list)'), [
      ['pnpm', 'run', 'list'],
      ['mapfile', '-t', 'xs'],
    ]);
  });

  test('an arithmetic expansion runs nothing', () => {
    assert.deepStrictEqual(commands('n=$((n + 1)); echo "$((2 * 3))"'), [
      ['echo', '$((2 * 3))'],
    ]);
  });

  test('a GitHub expression is one word, spaces and all', () => {
    assert.deepStrictEqual(
      commands(
        // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
        'pnpm run z:ci-job --build ${{ matrix.build }} --command "${{ matrix.command }}"',
      ),
      [
        [
          'pnpm',
          'run',
          'z:ci-job',
          '--build',
          // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
          '${{ matrix.build }}',
          '--command',
          // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
          '${{ matrix.command }}',
        ],
      ],
    );
  });

  test('a parameter expansion stays as written', () => {
    // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
    assert.deepStrictEqual(commands('pnpm run "${COMMAND}" $NAME ${A:-b c}'), [
      // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
      ['pnpm', 'run', '${COMMAND}', '$NAME', '${A:-b c}'],
    ]);
  });

  test('assignments and redirections are not words of the command', () => {
    assert.deepStrictEqual(
      commands(
        'CI=true FOO="a b" pnpm run x > out.txt 2>&1 < in.txt &>> all.log',
      ),
      [['pnpm', 'run', 'x']],
    );
  });

  test('an assignment alone is no command', () => {
    assert.deepStrictEqual(commands('A=1\nB="$(pnpm run x)"'), [
      ['pnpm', 'run', 'x'],
    ]);
  });

  test('the reserved words around a command are not part of it', () => {
    assert.deepStrictEqual(
      commands(dedent`
        if ! pnpm run x; then
          echo failed
        elif pnpm run y; then :
        else
          { pnpm run z; }
        fi
        while read -r line; do pnpm run "$line"; done < list.txt
        for app in a b; do (cd "$app" && pnpm run w); done
      `),
      [
        ['pnpm', 'run', 'x'],
        ['echo', 'failed'],
        ['pnpm', 'run', 'y'],
        [':'],
        ['pnpm', 'run', 'z'],
        ['read', '-r', 'line'],
        ['pnpm', 'run', '$line'],
        ['cd', '$app'],
        ['pnpm', 'run', 'w'],
      ],
    );
  });

  test('a `case` statement’s patterns are not commands, and its `)` closes nothing', () => {
    assert.deepStrictEqual(
      commands(dedent`
        case "$x" in
          # a comment between clauses
          a | 'b c') pnpm run first ;;
          (d) pnpm run second
            echo more ;&
          *) ;;
        esac
        echo "$(case $y in e) pnpm run inside;; esac)"
        pnpm run after
      `),
      [
        ['pnpm', 'run', 'first'],
        ['pnpm', 'run', 'second'],
        ['echo', 'more'],
        ['pnpm', 'run', 'inside'],
        ['echo', '$(…)'],
        ['pnpm', 'run', 'after'],
      ],
    );
  });

  test('a wrapper and its options are not the command it runs', () => {
    for (const script of [
      'env NODE_OPTIONS=--max-old-space-size=8192 pnpm run x',
      'timeout --signal=KILL 600 pnpm run x',
      'timeout -s KILL 600 pnpm run x',
      'xvfb-run -w 3 pnpm run x',
      'nice -n 10 env CI=1 pnpm run x',
      'exec -a name pnpm run x',
      'time -p pnpm run x',
    ] as const) {
      assert.deepStrictEqual(commands(script), [['pnpm', 'run', 'x']]);
    }
  });

  test('a `case` after a reserved word, or with `in` on the next line, is read', () => {
    assert.deepStrictEqual(
      commands(dedent`
        echo "$(if true; then case $y in e) pnpm run inside;; esac; fi)"
        case $x
        in a) pnpm run next-line;; esac
        case $z in @(a|b) | c\\)) pnpm run grouped;; esac
      `),
      [
        ['true'],
        ['pnpm', 'run', 'inside'],
        ['echo', '$(…)'],
        ['pnpm', 'run', 'next-line'],
        ['pnpm', 'run', 'grouped'],
      ],
    );
  });

  test('`command -v` runs nothing, and a blank line may come before `in`', () => {
    assert.deepStrictEqual(
      commands(
        'command -v pnpm run x\ncase $x\n\n# c\nin a) pnpm run y;; esac',
      ),
      [['pnpm', 'run', 'y']],
    );
  });

  test('a GitHub expression holding `$(` is no substitution', () => {
    assert.deepStrictEqual(
      // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
      readShellCommands("echo ${{ format('$(x) `y`', 1) }}").problems,
      [],
    );
  });

  test('arithmetic in a heredoc runs nothing', () => {
    assert.deepStrictEqual(
      readShellCommands('cat <<EOF\nTotal: $((a + b))\nEOF\npnpm run x'),
      {
        commands: [['cat'], ['pnpm', 'run', 'x']],
        assignments: [],
        problems: [],
      },
    );
  });

  test('keeps an assignment after a reserved word or through export', () => {
    assert.deepStrictEqual(
      readShellCommands(
        'if [ -f a ]; then f=a.mts; else f=b.mts; fi; export G=c readonly; local h=d',
      ).assignments,
      [
        ['f', 'a.mts'],
        ['f', 'b.mts'],
        ['G', 'c'],
        ['h', 'd'],
      ],
    );
  });

  test('keeps what an assignment alone sets, and not one inside $(…)', () => {
    const reading = readShellCommands(
      'f="$DIR/a b.mts"; FOO=1 node "$f"; x=$(y=2; echo "$y"); g=1 h=2',
    );

    assert.deepStrictEqual(reading.assignments, [
      ['f', '$DIR/a b.mts'],
      ['x', '$(…)'],
      ['g', '1'],
      ['h', '2'],
    ]);

    assert.deepStrictEqual(reading.commands, [
      ['node', '$f'],
      ['echo', '$y'],
    ]);
  });

  test("a heredoc's body is text, not commands", () => {
    assert.deepStrictEqual(
      commands(dedent`
        cat <<'EOF' > notes.md
        then pnpm run not:this
        EOF
        cat <<-END
        	pnpm run nor:this
        	END
        pnpm run after
      `),
      [['cat'], ['cat'], ['pnpm', 'run', 'after']],
    );
  });

  test('a here-string is a word for the command, not a command', () => {
    assert.deepStrictEqual(commands('grep -q x <<< "pnpm run no"'), [
      ['grep', '-q', 'x'],
    ]);
  });

  test('reads by code point, so a character outside the BMP moves nothing', () => {
    assert.deepStrictEqual(commands('echo "🎉" 🎉 # pnpm run commented'), [
      ['echo', '🎉', '🎉'],
    ]);
  });

  test.each([
    ['an unterminated single quote', "echo 'abc"],
    ['an unterminated double quote', 'echo "abc'],
    ['an unterminated substitution', 'echo $(pnpm run x'],
    ['an unterminated backtick', 'echo `pnpm run x'],
    ['an unterminated heredoc', 'cat <<EOF\nabc'],
    // eslint-disable-next-line no-template-curly-in-string -- a shell parameter expansion, not a template.
    ['a substitution inside a parameter expansion', 'echo ${X:-$(pnpm run x)}'],
    ['a `case` clause whose patterns never end', 'case $x in\n a b c'],
    [
      'a heredoc whose body would run a substitution',
      'cat <<EOF\n$(pnpm run x)\nEOF',
    ],
  ] as const)('reports %s rather than reading past it', (_, script) => {
    assert.isNotEmpty(readShellCommands(script).problems);
  });

  test('a script it reads whole has no problems', () => {
    assert.deepStrictEqual(
      readShellCommands('echo "a" && pnpm run x # done').problems,
      [],
    );
  });
});
