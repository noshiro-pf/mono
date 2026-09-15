import dedent from 'dedent';
import {
  collectEventNameViolations,
  parseWorkflowTriggers,
} from './check-workflow-event-name.mjs';

/**
 * The shape the seven workflows share, with the two things this check reads
 * left as parameters.
 */
const workflowFile = (
  triggerEvent: string,
  comparedEventName: string,
): string => dedent`
  name: Skip CI Label

  # A comment above the trigger.

  on:
    ${triggerEvent}:
      types:
        - opened
        - labeled
        - unlabeled

  concurrency:
    group: \${{ github.workflow }}-\${{ github.event.pull_request.number || github.ref }}
    cancel-in-progress: \${{ github.event_name == '${comparedEventName}' }}

  permissions:
    statuses: write

  jobs:
    skip-ci-label:
      runs-on: ubuntu-latest
`;

describe('parseWorkflowTriggers', () => {
  test('reads the trigger events and the compared event names', () => {
    const triggers = parseWorkflowTriggers(
      workflowFile('pull_request_target', 'pull_request_target'),
    );

    assert.deepStrictEqual(triggers, {
      triggerEvents: ['pull_request_target'],
      comparedEventNames: ['pull_request_target'],
    });
  });

  test('stops the trigger list at the next top-level key', () => {
    const triggers = parseWorkflowTriggers(
      workflowFile('pull_request_target', 'pull_request_target'),
    );

    assert.isFalse(triggers.triggerEvents.includes('group'));

    assert.isFalse(triggers.triggerEvents.includes('permissions'));
  });

  test('reads every trigger of a workflow that has several', () => {
    const triggers = parseWorkflowTriggers(dedent`
      on:
        pull_request_target:
          types:
            - opened
        workflow_dispatch:

      permissions:
        statuses: write
    `);

    assert.deepStrictEqual(triggers.triggerEvents, [
      'pull_request_target',
      'workflow_dispatch',
    ]);
  });

  test('reads no event name from a comparison that is not about the event', () => {
    const triggers = parseWorkflowTriggers(dedent`
      on:
        pull_request_target:

      jobs:
        x:
          if: \${{ github.ref == 'refs/heads/main' }}
    `);

    assert.deepStrictEqual(triggers.comparedEventNames, []);
  });

  test('reads a `!=` comparison as well as an `==` one', () => {
    const triggers = parseWorkflowTriggers(dedent`
      on:
        pull_request:

      jobs:
        x:
          if: \${{ github.event_name != 'push' }}
    `);

    assert.deepStrictEqual(triggers.comparedEventNames, ['push']);
  });
});

describe('collectEventNameViolations', () => {
  test('accepts a comparison that names a trigger', () => {
    const violations = collectEventNameViolations(
      parseWorkflowTriggers(
        workflowFile('pull_request_target', 'pull_request_target'),
      ),
    );

    assert.deepStrictEqual(violations, []);
  });

  test('rejects a comparison against an event that never fires', () => {
    const violations = collectEventNameViolations(
      parseWorkflowTriggers(
        workflowFile('pull_request_target', 'pull_request'),
      ),
    );

    assert.deepStrictEqual(violations.length, 1);

    assert.isTrue(violations.join('\n').includes('constant'));

    assert.isTrue(violations.join('\n').includes('pull_request_target'));
  });

  test('rejects a `!=` comparison against an event that never fires', () => {
    const violations = collectEventNameViolations(
      parseWorkflowTriggers(dedent`
        on:
          pull_request_target:

        jobs:
          x:
            if: \${{ github.event_name != 'pull_request' }}
      `),
    );

    assert.deepStrictEqual(violations.length, 1);
  });

  test('asks nothing of a workflow that compares no event name', () => {
    const violations = collectEventNameViolations(
      parseWorkflowTriggers(dedent`
        on:
          schedule:
            - cron: '7 21 * * *'

        jobs:
          x:
            runs-on: ubuntu-latest
      `),
    );

    assert.deepStrictEqual(violations, []);
  });

  test('asks nothing of a reusable workflow, whose event is the caller’s', () => {
    const violations = collectEventNameViolations(
      parseWorkflowTriggers(dedent`
        on:
          workflow_call:
            inputs:
              diff-scope:
                type: string

        jobs:
          check:
            if: \${{ github.event_name == 'pull_request' }}
      `),
    );

    assert.deepStrictEqual(violations, []);
  });

  test('rejects a comparison it cannot judge because the `on:` block is unreadable', () => {
    const violations = collectEventNameViolations(
      parseWorkflowTriggers(dedent`
        on: pull_request

        jobs:
          x:
            if: \${{ github.event_name == 'pull_request' }}
      `),
    );

    assert.deepStrictEqual(violations.length, 1);

    assert.isTrue(violations.join('\n').includes('no `on:` block'));
  });
});
