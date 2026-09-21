import { Result } from 'ts-data-forge';
import {
  checkDataBranchFiles,
  DATA_BRANCH_FILES,
  type Exists,
} from './check-data-branch-files.mjs';

/** A repository in which exactly these paths are there. */
const holding =
  (...present: readonly string[]): Exists =>
  (relativePath) =>
    Promise.resolve(present.includes(relativePath));

describe(checkDataBranchFiles, () => {
  test('passes when none of them is in the repository', async () => {
    const result = await checkDataBranchFiles(holding());

    assert.isTrue(Result.isOk(result));

    expect(result.value.checked).toBe(DATA_BRANCH_FILES.length);
  });

  // What a pull request from `data/pr-report` into `main` would leave behind.
  test('names the file it found, and how it got there', async () => {
    const result = await checkDataBranchFiles(holding('pr-report.json'));

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('pr-report.json'));

    assert.isTrue(result.value.includes('data/pr-report'));

    assert.isTrue(result.value.includes('merged into this one'));
  });

  test('reports all of them rather than the first', async () => {
    const result = await checkDataBranchFiles(
      holding('pr-report.json', 'pr-report.md', 'unblock-prs-log.json'),
    );

    assert.isTrue(Result.isErr(result));

    expect(result.value.includes('3 file(s)')).toBe(true);
  });

  // The Markdown is the half a person reads, and it is the one with a name
  // ordinary enough to be written here by hand without anyone thinking twice.
  test('catches the Markdown as well as the payload', async () => {
    const result = await checkDataBranchFiles(holding('pr-report.md'));

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('pr-report.md'));
  });

  test('watches every file the data branches carry', () => {
    expect(DATA_BRANCH_FILES).toStrictEqual([
      'pr-report.json',
      'pr-report.md',
      'unblock-prs-log.json',
    ]);
  });
});
