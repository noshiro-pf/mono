import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import { parse } from 'yaml';
import {
  checkDispatchInputs,
  dispatchInputViolations,
  findDispatchInputViolations,
} from './check-dispatch-inputs.mjs';

describe(dispatchInputViolations, () => {
  test('accepts the boolean diff-parent input alone', () => {
    assert.deepStrictEqual(
      dispatchInputViolations(
        parse(dedent`
          on:
            workflow_dispatch:
              # Comments and the description are the workflow's own.
              inputs:
                diff-parent:
                  default: false
                  type: boolean
                  description: Anything.
        `),
      ),
      [],
    );
  });

  test('names an input a queue dispatch does not supply', () => {
    assert.deepStrictEqual(
      dispatchInputViolations(
        parse(dedent`
          on:
            workflow_dispatch:
              inputs:
                diff-parent:
                  type: boolean
                  default: false
                filter:
                  type: string
        `),
      ),
      [
        "`workflow_dispatch` declares `filter`, which a queue's dispatch does not supply.",
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

  // A string input hands the gate whatever was typed.
  test('names a missing diff-parent, or one of another type or default', () => {
    for (const text of [
      dedent`
        on:
          workflow_dispatch:
      `,
      dedent`
        on:
          workflow_dispatch:
            inputs:
              diff-parent:
                type: string
                default: ''
      `,
      dedent`
        on:
          workflow_dispatch:
            inputs:
              diff-parent:
                type: boolean
                default: true
      `,
    ]) {
      assert.deepStrictEqual(dispatchInputViolations(parse(text)), [
        '`workflow_dispatch` has no `diff-parent` input of `type: boolean` and `default: false`.',
      ]);
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

describe(checkDispatchInputs, () => {
  test("holds for the repository's own workflows", async () => {
    const result = await checkDispatchInputs();

    // `assert.isTrue` takes no message in this repository's typings; the
    // comparison shows the messages when it fails.
    assert.deepStrictEqual(Result.isErr(result) ? result.value : '', '');
  });
});
