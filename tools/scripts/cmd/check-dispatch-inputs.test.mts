import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import { parse } from 'yaml';
import {
  checkDispatchInputs,
  dispatchInputViolations,
  findDispatchInputViolations,
  speculateWorkflowViolations,
} from './check-dispatch-inputs.mjs';

describe(dispatchInputViolations, () => {
  test('accepts a workflow_dispatch with no inputs', () => {
    for (const text of [
      dedent`
        on:
          workflow_dispatch:
      `,
      dedent`
        on:
          workflow_dispatch: {}
      `,
    ]) {
      assert.deepStrictEqual(dispatchInputViolations(parse(text)), []);
    }
  });

  // An optional one too: a manual run with it set would be judged otherwise
  // than the queue's, and its verdict reused for the same tree.
  test('names every input a queue dispatch does not supply', () => {
    assert.deepStrictEqual(
      dispatchInputViolations(
        parse(dedent`
          on:
            workflow_dispatch:
              inputs:
                full:
                  type: boolean
                  default: false
                filter:
                  type: string
        `),
      ),
      [
        "`workflow_dispatch` declares `full`, `filter`, which a queue's dispatch does not supply.",
      ],
    );
  });

  test('accepts the list and the one-event forms, which declare no inputs (#3603)', () => {
    for (const text of [
      'on: [pull_request, workflow_dispatch]',
      'on: workflow_dispatch',
    ]) {
      assert.deepStrictEqual(dispatchInputViolations(parse(text)), []);
    }
  });

  test('says when it is no workflow_dispatch trigger at all', () => {
    for (const text of [
      dedent`
        on:
          pull_request:
      `,
      'on: [pull_request]',
    ]) {
      assert.include(
        dispatchInputViolations(parse(text)).join(''),
        'does not trigger on `workflow_dispatch`',
      );
    }
  });
});

describe(findDispatchInputViolations, () => {
  // The gate is called by its path; a rename that left nothing calling it must
  // not pass with nothing checked.
  test('says when no workflow calls the gate', () => {
    const found = findDispatchInputViolations([
      {
        relativePath: '.github/workflows/a.yml',
        text: 'on:\n  push:\njobs: {}\n',
      },
    ]);

    assert.deepStrictEqual(found.callerNames, []);

    assert.strictEqual(found.messages.length, 1);

    assert.include(found.messages[0], 'No workflow calls');
  });

  test('counts the callers, and prefixes each message with its file (#3603)', () => {
    const found = findDispatchInputViolations([
      {
        relativePath: '.github/workflows/good.yml',
        text: caller('on: [pull_request, workflow_dispatch]'),
      },
      {
        relativePath: '.github/workflows/bad.yml',
        text: caller('on: [pull_request]'),
      },
    ]);

    assert.deepStrictEqual(found.callerNames, ['good.yml', 'bad.yml']);

    assert.strictEqual(found.messages.length, 1);

    assert.match(
      found.messages[0] ?? '',
      /^\.github\/workflows\/bad\.yml: it does not trigger on `workflow_dispatch`/u,
    );
  });

  test('skips a workflow that does not call the gate, even one that does not parse (#3603)', () => {
    const found = findDispatchInputViolations([
      {
        relativePath: '.github/workflows/gated.yml',
        text: caller('on: workflow_dispatch'),
      },
      {
        relativePath: '.github/workflows/other.yml',
        text: 'on: [pull_request]\njobs: {}\n',
      },
      { relativePath: '.github/workflows/broken.yml', text: 'on: [\n' },
    ]);

    assert.deepStrictEqual(found, { callerNames: ['gated.yml'], messages: [] });
  });

  test('names a caller it cannot parse, in one line (#3603)', () => {
    const found = findDispatchInputViolations([
      {
        relativePath: '.github/workflows/broken.yml',
        text: `${caller('on: workflow_dispatch')}\n  bad: [\n`,
      },
    ]);

    assert.strictEqual(found.messages.length, 1);

    assert.match(
      found.messages[0] ?? '',
      /^\.github\/workflows\/broken\.yml: /u,
    );

    assert.notInclude(found.messages[0], '\n');

    // Still a caller to speculate.workflows, which would otherwise be told it
    // names a workflow that does not call the gate.
    assert.deepStrictEqual(found.callerNames, ['broken.yml']);
  });
});

describe(speculateWorkflowViolations, () => {
  test('holds speculate.workflows to the callers of the gate, both ways', () => {
    assert.deepStrictEqual(
      speculateWorkflowViolations(['a.yml', 'b.yml'], ['b.yml', 'a.yml']),
      [],
    );

    assert.strictEqual(
      speculateWorkflowViolations(['a.yml', 'b.yml'], ['a.yml', 'c.yml'])
        .length,
      2,
    );
  });

  test('asks nothing of a repository that does not check ahead', () => {
    assert.deepStrictEqual(
      speculateWorkflowViolations(['a.yml'], undefined),
      [],
    );
  });
});

describe(checkDispatchInputs, () => {
  test("holds for the repository's own workflows", async () => {
    const result = await checkDispatchInputs();

    // `assert.isTrue` takes no message in this repository's typings; the
    // comparison shows the messages when it fails.
    assert.deepStrictEqual(Result.isErr(result) ? result.value : '', '');
  });
});

/** A workflow triggered by `on` whose one job calls the gate. */
const caller = (on: string): string => dedent`
  ${on}
  jobs:
    gate:
      uses: ./.github/workflows/check-gates.yml
`;
