import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  DEFAULT_BRANCH_CONDITION,
  findPullRequestJobsOnAnyRef,
} from './check-dispatch-default-branch.mjs';

const onAnyRef = (text: string): readonly string[] => {
  const found = findPullRequestJobsOnAnyRef(text);

  if (Result.isErr(found)) {
    throw new Error(found.value);
  }

  return found.value;
};

describe(findPullRequestJobsOnAnyRef, () => {
  test('names a job that opens a pull request on any dispatched ref', () => {
    assert.deepStrictEqual(
      onAnyRef(dedent`
        on:
          workflow_dispatch:
        jobs:
          update:
            steps:
              - run: |
                  if [ -n "$x" ]; then
                    gh pr create --base main --head "$branch"
                  fi
      `),
      ['update'],
    );
  });

  test('accepts the job gated to the default branch, however the `if:` is folded', () => {
    assert.deepStrictEqual(
      onAnyRef(dedent`
        on:
          workflow_dispatch:
        jobs:
          update:
            if: >-
              github.ref == format('refs/heads/{0}',
              case(github.event.repository.default_branch != '',
              github.event.repository.default_branch, 'main'))
            steps:
              - run: gh pr create --base main
      `),
      [],
    );
  });

  test('names a job whose `if:` lets another ref through with `||`', () => {
    assert.deepStrictEqual(
      onAnyRef(dedent`
        on:
          workflow_dispatch:
        jobs:
          update:
            if: github.event_name == 'schedule' || ${DEFAULT_BRANCH_CONDITION}
            steps:
              - run: gh pr create --base main
      `),
      ['update'],
    );
  });

  test('accepts a job that needs one gated, which is skipped with it', () => {
    assert.deepStrictEqual(
      onAnyRef(dedent`
        on:
          workflow_dispatch:
        jobs:
          update:
            if: ${DEFAULT_BRANCH_CONDITION}
            steps:
              - run: pnpm run update
          commit:
            needs: update
            if: needs.update.outputs.changed == 'true'
            steps:
              - run: gh pr create --base main
      `),
      [],
    );
  });

  test('names a job that needs one gated but runs whatever it did', () => {
    assert.deepStrictEqual(
      onAnyRef(dedent`
        on:
          workflow_dispatch:
        jobs:
          update:
            if: ${DEFAULT_BRANCH_CONDITION}
            steps:
              - run: pnpm run update
          commit:
            needs: [update]
            if: always() && needs.update.result != 'failure'
            steps:
              - run: gh pr create --base main
      `),
      ['commit'],
    );
  });

  test('asks nothing of a workflow that cannot be dispatched', () => {
    assert.deepStrictEqual(
      onAnyRef(dedent`
        on:
          schedule:
            - cron: '0 0 * * *'
        jobs:
          update:
            steps:
              - run: gh pr create --base main
      `),
      [],
    );
  });

  test('asks nothing of a job that only mentions the command', () => {
    assert.deepStrictEqual(
      onAnyRef(dedent`
        on:
          workflow_dispatch:
        jobs:
          report:
            steps:
              - run: echo 'run gh pr create to open one'
      `),
      [],
    );
  });
});
