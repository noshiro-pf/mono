/**
 * How a check workflow's matrix job runs its entry: `pnpm run z:ci-job --build
 * <script> --command <script>` (`tools/scripts/cmd/ci-job.mts`). The guards
 * that read the workflows (`check-ci-commands.mts`, `check-ci-job-shape.mts`)
 * name it through these.
 */
export const CI_JOB = 'z:ci-job';

export const CI_JOB_COMMAND = '--command';

export const CI_JOB_BUILD = '--build';
