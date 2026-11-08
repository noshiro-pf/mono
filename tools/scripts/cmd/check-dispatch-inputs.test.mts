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

  test('says when it is no workflow_dispatch trigger at all', () => {
    for (const text of [
      dedent`
        on:
          pull_request:
      `,
      dedent`
        on: [pull_request, workflow_dispatch]
      `,
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
  test('fails when no workflow calls the gate', () => {
    const found = findDispatchInputViolations([
      {
        relativePath: '.github/workflows/a.yml',
        text: 'on:\n  push:\njobs: {}\n',
      },
    ]);

    assert.isTrue(Result.isErr(found));
  });

  test('names the file a parse fails on', () => {
    const found = findDispatchInputViolations([
      { relativePath: '.github/workflows/broken.yml', text: 'on: [\n' },
    ]);

    assert.isTrue(Result.isErr(found) && found.value.includes('broken.yml'));
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
