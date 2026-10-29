import dedent from 'dedent';
import { extractRunScripts } from './run-scripts.mjs';

/** Spliced in, so that an expected script can hold `${{` as written. */
const dollar = '$';

describe('extractRunScripts', () => {
  test('reads a block scalar without its indentation, at the line its script starts', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - name: Install dependencies
            shell: bash
            run: |
              set -euo pipefail

              if [ "\${{ inputs.install }}" = 'true' ]; then
                pnpm install
              fi
          - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
    `);

    assert.deepStrictEqual(problems, []);

    assert.deepStrictEqual(scripts, [
      {
        line: 7,
        column: 8,
        shell: 'bash',
        script: [
          'set -euo pipefail',
          '',
          `if [ "${dollar}{{ inputs.install }}" = 'true' ]; then`,
          '  pnpm install',
          'fi',
          '',
        ].join('\n'),
      },
    ]);
  });

  test('reads one-line scripts, quoted or not, with the shell before or after', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - run: echo plain # a comment, not the script
            shell: sh
          - shell: bash
            run: 'echo ''single'''
          - name: Double
            run: "echo 'double'"
            shell: bash
    `);

    assert.deepStrictEqual(problems, []);

    assert.deepStrictEqual(scripts, [
      { line: 4, column: 11, shell: 'sh', script: 'echo plain\n' },
      { line: 7, column: 12, shell: 'bash', script: "echo 'single'\n" },
      { line: 9, column: 12, shell: 'bash', script: "echo 'double'\n" },
    ]);
  });

  test('reports a step it cannot read rather than skipping it', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - name: No shell
            run: echo hi
          - name: Folded
            shell: bash
            run: >
              echo folded
    `);

    assert.deepStrictEqual(scripts, []);

    assert.deepStrictEqual(problems, [
      '4: a `run:` step with no `shell:`, which a composite action requires',
      '8: a folded (`>`) `run:` scalar, which this does not read; use `|`',
    ]);
  });

  test('reports a double-quoted script with an escape rather than misread it', () => {
    const { scripts, problems } = extractRunScripts(
      [
        'runs:',
        '  using: composite',
        '  steps:',
        '    - shell: bash',
        String.raw`      run: "echo \"quoted\""`,
      ].join('\n'),
    );

    assert.deepStrictEqual(scripts, []);

    assert.deepStrictEqual(problems, [
      '5: a double-quoted `run:` with an escape, which this does not read; use `|`',
    ]);
  });

  test('leaves a script in another shell to the step that runs it', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - shell: pwsh
            run: Write-Output hi
    `);

    assert.deepStrictEqual(scripts, [
      { line: 5, column: 11, shell: 'pwsh', script: 'Write-Output hi\n' },
    ]);

    assert.deepStrictEqual(problems, []);
  });

  test('reads the shell a `shell:` names however it is written', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - shell: bash # login shell not needed
            run: echo a
          - shell: 'bash'
            run: echo b
          - shell: bash -e {0}
            run: echo c
          - shell: /usr/bin/sh
            run: echo d
    `);

    assert.deepStrictEqual(problems, []);

    assert.deepStrictEqual(
      scripts.map(({ shell }) => shell),
      ['bash', 'bash', 'bash -e {0}', '/usr/bin/sh'],
    );
  });

  test('reads the shapes YAML allows for the sequence and the block header', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      inputs:
        steps:
          description: an input named like the key, read past
      runs:
        using: composite
        steps: # in order
        -   shell: bash
            run: | # a comment on the header
              echo a
        - shell: bash
          run: |2-
              echo b
    `);

    assert.deepStrictEqual(problems, []);

    assert.deepStrictEqual(scripts, [
      { line: 9, column: 8, shell: 'bash', script: 'echo a\n' },
      { line: 12, column: 6, shell: 'bash', script: '  echo b\n' },
    ]);
  });

  test('ends a single-quoted script at its closing quote, not at an apostrophe after it', () => {
    const { scripts } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - shell: bash
            run: 'echo hi' # it's a comment
    `);

    assert.deepStrictEqual(
      scripts.map(({ script }) => script),
      ['echo hi\n'],
    );
  });

  test('reports a one-line script continued on the next line', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - shell: bash
            run: echo a
              and more
    `);

    assert.deepStrictEqual(scripts, []);

    assert.deepStrictEqual(problems, [
      '5: a one-line `run:` continued on the next line, which this does not read; use `|`',
    ]);
  });

  test('reports a `run:` key it found outside the steps it read', () => {
    const { problems } = extractRunScripts(dedent`
      runs:
        using: composite
        run: echo misplaced
        steps:
          - shell: bash
            run: echo read
    `);

    assert.deepStrictEqual(problems, [
      '1: 1 `run:` key(s) outside the `runs.steps` this reads; write them as `- shell: …` / `run: |` steps under `runs:`',
    ]);
  });

  test('reports a step written as a flow mapping, or with a quoted key', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - { shell: bash, run: echo flow }
          - shell: bash
            "run": echo quoted
    `);

    assert.deepStrictEqual(scripts, []);

    assert.deepStrictEqual(problems, [
      '1: 2 `run:` key(s) outside the `runs.steps` this reads; write them as `- shell: …` / `run: |` steps under `runs:`',
    ]);
  });

  test('does not count a script line or a deeper key named `run` as a step', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - shell: bash
            env:
              run: not a step
            run: |
              cat <<'EOF'
              run: also not a step
              EOF
    `);

    assert.deepStrictEqual(problems, []);

    assert.strictEqual(scripts.length, 1);
  });

  test('puts a one-line script at the column after the key, whatever it says', () => {
    const { scripts } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - shell: bash
            run:   run
    `);

    assert.deepStrictEqual(
      scripts.map(({ column }) => column),
      [13],
    );
  });

  test('leaves a comment after a block scalar, or under a one-line one, to YAML', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - shell: bash
            run: |
              echo a
           # don't do X
          - shell: bash
            run: echo b
              # note
    `);

    assert.deepStrictEqual(problems, []);

    assert.deepStrictEqual(
      scripts.map(({ script }) => script),
      ['echo a\n', 'echo b\n'],
    );
  });

  test('reports an anchor or an alias on `run:`', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - shell: bash
            run: &setup |
              echo a
          - shell: bash
            run: *setup
    `);

    assert.deepStrictEqual(scripts, []);

    assert.deepStrictEqual(problems, [
      '5: an anchor or alias on `run:`, which this does not read; write the script out',
      '8: an anchor or alias on `run:`, which this does not read; write the script out',
    ]);
  });

  test('counts nothing before `runs:`, in a comment, or deeper than a step', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      # needs a shell, run: block
      inputs:
        run:
          description: Whether to run
      runs:
        using: composite
        steps:
          - shell: bash
            env: { run: x }
            run: echo hi
    `);

    assert.deepStrictEqual(problems, []);

    assert.strictEqual(scripts.length, 1);
  });

  test('reports a step whose `run` is an explicit `?` key', () => {
    const { problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - ? run
            : echo $x
            shell: bash
    `);

    assert.deepStrictEqual(problems, [
      '1: 1 `run:` key(s) outside the `runs.steps` this reads; write them as `- shell: …` / `run: |` steps under `runs:`',
    ]);
  });

  test.each([
    [
      'flow steps on the key',
      dedent`
        runs:
          using: composite
          steps: [ { shell: bash, run: echo $x } ]
      `,
      3,
    ],
    [
      'flow steps on the next line',
      dedent`
        runs:
          using: composite
          steps:
            [ { shell: bash, run: echo $x } ]
      `,
      4,
    ],
    [
      'a flow runs',
      'runs: { using: composite, steps: [ { shell: bash, run: echo $x } ] }',
      1,
    ],
  ] as const)('reports %s', (_, text, line) => {
    const { scripts, problems } = extractRunScripts(text);

    assert.deepStrictEqual(scripts, []);

    assert.include(
      problems,
      `${line}: \`runs:\` or \`steps:\` in flow style, which this does not read; write them in block style`,
    );
  });

  test('does not count a `run` key in a section after `runs:`', () => {
    const { problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - shell: bash
            run: echo hi
      inputs:
        run:
          description: Whether to run
    `);

    assert.deepStrictEqual(problems, []);
  });

  test('does not take a deeper `steps:` or a `[` in another key for flow style', () => {
    const { scripts, problems } = extractRunScripts(dedent`
      runs:
        using: composite
        steps:
          - uses: actions/github-script@60a0d83039c74a4aee543508d2ffcb1c3799cdea # v7.0.1
            with:
              steps: 3
              script: |
                [a, b] = [1, 2]
          - shell: bash
            run: echo hi
    `);

    assert.deepStrictEqual(problems, []);

    assert.strictEqual(scripts.length, 1);
  });

  test('reads CRLF line endings', () => {
    const { scripts, problems } = extractRunScripts(
      [
        'runs:',
        '  using: composite',
        '  steps:',
        '    - shell: bash',
        '      run: echo hi',
        '',
      ].join('\r\n'),
    );

    assert.deepStrictEqual(problems, []);

    assert.deepStrictEqual(
      scripts.map(({ script }) => script),
      ['echo hi\n'],
    );
  });

  test('reads the input names and the step ids the scripts may reference', () => {
    const { inputs, stepIds } = extractRunScripts(dedent`
      name: probe
      inputs:
        matrix:
          description: a JSON matrix
        'quoted-name':
          required: false
      runs:
        using: composite
        steps:
          - id: build
            uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
          - id: 'report'
            shell: bash
            run: echo "\${{ steps.build.outputs.x }}"
    `);

    assert.deepStrictEqual(inputs, ['matrix', 'quoted-name']);

    assert.deepStrictEqual(stepIds, ['build', 'report']);
  });
});
