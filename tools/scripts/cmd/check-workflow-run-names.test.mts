import dedent from 'dedent';
import { parseWorkflowRunNames } from './check-workflow-run-names.mjs';

describe(parseWorkflowRunNames, () => {
  test('reads the names a workflow_run trigger watches', () => {
    const parsed = parseWorkflowRunNames(dedent`
      name: PR Report

      on:
        push:
          branches:
            - main

        workflow_run:
          workflows:
            - Code Check
            - Style Check
          types:
            - completed

        schedule:
          - cron: '0 22 * * *'
    `);

    expect(parsed.name).toBe('PR Report');

    expect(parsed.watched).toStrictEqual(['Code Check', 'Style Check']);
  });

  // The scan has to stop at `types:`, and again at the trigger after it, or
  // the guard would go looking for a workflow named "completed".
  test('stops at the end of the workflow_run block', () => {
    const parsed = parseWorkflowRunNames(dedent`
      name: A

      on:
        workflow_run:
          workflows:
            - Code Check
          types:
            - completed

        pull_request:
          types:
            - opened
    `);

    expect(parsed.watched).toStrictEqual(['Code Check']);
  });

  test('says nothing about a workflow that watches none', () => {
    const parsed = parseWorkflowRunNames(dedent`
      name: Code Check

      on:
        pull_request:
          types:
            - opened
    `);

    expect(parsed.name).toBe('Code Check');

    expect(parsed.watched).toStrictEqual([]);
  });

  // A `name:` inside a step is indented; the workflow's own is not. Reading
  // the first one either way would make every workflow "named" after its
  // first step.
  test('takes the workflow name, not a step name', () => {
    const parsed = parseWorkflowRunNames(dedent`
      name: Lint Pull Request

      jobs:
        lint:
          steps:
            - name: Checkout
    `);

    expect(parsed.name).toBe('Lint Pull Request');
  });

  test('reads a quoted name as written', () => {
    expect(
      parseWorkflowRunNames("name: 'Node.js Version Compatibility'\n").name,
    ).toBe('Node.js Version Compatibility');
  });
});
