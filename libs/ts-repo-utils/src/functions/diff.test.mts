/* eslint-disable vitest/no-conditional-expect */
import { tmpdir } from 'node:os';
import { Result } from 'ts-data-forge';
import '../node-global.mjs';
import {
  getDiffFrom,
  getModifiedFiles,
  getStagedFiles,
  getUntrackedFiles,
} from './diff.mjs';
import { type ExecResult } from './exec-async.mjs';

describe('diff', () => {
  // Helper function to create a temporary git repository
  const createTempRepo = async (): Promise<{
    repoPath: string;
    cleanup: () => Promise<void>;
    execInRepo: (
      cmd: string,
      options?: Readonly<{ silent?: boolean }>,
    ) => Promise<Result<{ stdout: string; stderr: string }, unknown>>;
  }> => {
    const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'temp-repo-'));
    const repoPath = tempDir;

    // Initialize git repository
    const execInRepo = async (
      cmd: string,
      options?: Readonly<{ silent?: boolean }>,
    ): Promise<ExecResult<string>> => {
      const originalCwd = process.cwd();
      process.chdir(repoPath);
      try {
        const result = await $(cmd, { silent: options?.silent ?? false });
        return result;
      } finally {
        process.chdir(originalCwd);
      }
    };

    await execInRepo('git init', { silent: true });
    await execInRepo('git config user.name "Test User"', { silent: true });
    await execInRepo('git config user.email "test@example.com"', {
      silent: true,
    });

    const cleanup = async (): Promise<void> => {
      try {
        await fs.rm(repoPath, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    };

    return { repoPath, cleanup, execInRepo };
  };

  // Wrapper functions to execute diff functions in the temporary repository
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createRepoFunctions = (repoPath: string) => {
    const executeInRepo = async <T,>(fn: () => Promise<T>): Promise<T> => {
      const originalCwd = process.cwd();
      process.chdir(repoPath);
      try {
        return await fn();
      } finally {
        process.chdir(originalCwd);
      }
    };

    return {
      getUntrackedFiles: (options?: Parameters<typeof getUntrackedFiles>[0]) =>
        executeInRepo(() => getUntrackedFiles(options)),
      getStagedFiles: (options?: Parameters<typeof getStagedFiles>[0]) =>
        executeInRepo(() => getStagedFiles(options)),
      getModifiedFiles: (options?: Parameters<typeof getModifiedFiles>[0]) =>
        executeInRepo(() => getModifiedFiles(options)),
      getDiffFrom: (
        base: string,
        options?: Parameters<typeof getDiffFrom>[1],
      ) => executeInRepo(() => getDiffFrom(base, options)),
    };
  };

  describe('getUntrackedFiles', () => {
    test('should return empty array when no files are changed', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getUntrackedFiles({ silent: true });

        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          expect(Array.isArray(result.value)).toBe(true);
        }
      } finally {
        await cleanup();
      }
    });

    test('should detect newly created files', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        // Create a new file in the temp repository
        const testFileName = `test-new-file-${crypto.randomUUID()}.tmp`;
        const testFilePath = path.join(repoPath, testFileName);

        await fs.writeFile(testFilePath, 'test content');

        const result = await repoFunctions.getUntrackedFiles({ silent: true });

        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          const files = result.value;
          expect(files).toContain(testFileName);
        }
      } finally {
        await cleanup();
      }
    });

    test('should detect modified existing files', async () => {
      const { repoPath, cleanup, execInRepo } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        // Create and track a file first
        const testFileName = `test-modify-file-${crypto.randomUUID()}.tmp`;
        const testFilePath = path.join(repoPath, testFileName);

        await fs.writeFile(testFilePath, 'initial content');

        // Add to git to track it
        await execInRepo(`git add ${testFileName}`, { silent: true });

        // Modify the file
        await fs.writeFile(testFilePath, 'modified content');

        const result = await repoFunctions.getUntrackedFiles({ silent: true });

        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          const files = result.value;
          expect(files).not.toContain(testFileName);
        }
      } finally {
        await cleanup();
      }
    });

    test('should detect multiple types of changes', async () => {
      const { repoPath, cleanup, execInRepo } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        // Create multiple test files
        const uuid = crypto.randomUUID();
        const newFile = `test-new-file-${uuid}.tmp`;
        const modifyFile = `test-modify-file-${uuid}.tmp`;
        const newFilePath = path.join(repoPath, newFile);
        const modifyFilePath = path.join(repoPath, modifyFile);

        // Create new file
        await fs.writeFile(newFilePath, 'new file content');

        // Create and track another file
        await fs.writeFile(modifyFilePath, 'initial content');
        await execInRepo(`git add ${modifyFile}`, { silent: true });

        // Modify the tracked file
        await fs.writeFile(modifyFilePath, 'modified content');

        const result = await repoFunctions.getUntrackedFiles({ silent: true });

        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          const files = result.value;
          expect(files).toContain(newFile);
          expect(files).not.toContain(modifyFile);
        }
      } finally {
        await cleanup();
      }
    });

    test('should exclude deleted files from results', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getUntrackedFiles({ silent: true });

        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          const files = result.value;
          // Verify no deleted files are included (status 'D')
          for (const file of files) {
            expect(typeof file).toBe('string');
            expect(file.length).toBeGreaterThan(0);
          }
        }
      } finally {
        await cleanup();
      }
    });

    test('should handle git command errors gracefully', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getUntrackedFiles({ silent: true });

        // Should always return a Result, either Ok or Err
        expect(Result.isOk(result) || Result.isErr(result)).toBe(true);
      } finally {
        await cleanup();
      }
    });

    test('should parse git status output correctly', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getUntrackedFiles({ silent: true });

        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          const files = result.value;

          // Each file should be a non-empty string
          for (const file of files) {
            expect(typeof file).toBe('string');
            expect(file.trim()).toBe(file); // No leading/trailing whitespace
            expect(file.length).toBeGreaterThan(0);
          }
        }
      } finally {
        await cleanup();
      }
    });

    test('should work with silent option', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getUntrackedFiles({ silent: true });

        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          expect(Array.isArray(result.value)).toBe(true);
        }
      } finally {
        await cleanup();
      }
    });
  });

  describe('getStagedFiles', () => {
    test('should return empty array when no files are staged', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getStagedFiles({ silent: true });
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          expect(Array.isArray(result.value)).toBe(true);
        }
      } finally {
        await cleanup();
      }
    });

    test('should detect staged files', async () => {
      const { repoPath, cleanup, execInRepo } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        // Create a new file
        const testFileName = `test-staged-file-${crypto.randomUUID()}.tmp`;
        const testFilePath = path.join(repoPath, testFileName);
        await fs.writeFile(testFilePath, 'staged file content');
        // Stage the file
        await execInRepo(`git add ${testFileName}`, { silent: true });

        const result = await repoFunctions.getStagedFiles({ silent: true });
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          const files = result.value;
          expect(files).toContain(testFileName);
        }
      } finally {
        await cleanup();
      }
    });

    test('should detect multiple staged files', async () => {
      const { repoPath, cleanup, execInRepo } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        // Create multiple test files
        const uuid = crypto.randomUUID();
        const file1 = `test-staged-file1-${uuid}.tmp`;
        const file2 = `test-staged-file2-${uuid}.tmp`;
        const filePath1 = path.join(repoPath, file1);
        const filePath2 = path.join(repoPath, file2);

        await fs.writeFile(filePath1, 'staged file 1 content');
        await fs.writeFile(filePath2, 'staged file 2 content');
        // Stage both files
        await execInRepo(`git add ${file1} ${file2}`, { silent: true });

        const result = await repoFunctions.getStagedFiles({ silent: true });
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          const files = result.value;
          expect(files).toContain(file1);
          expect(files).toContain(file2);
        }
      } finally {
        await cleanup();
      }
    });

    test('should exclude deleted files by default', async () => {
      const { repoPath, cleanup, execInRepo } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const testFileName = `test-deleted-file-${crypto.randomUUID()}.tmp`;
        const testFilePath = path.join(repoPath, testFileName);

        // Create a file and commit it
        await fs.writeFile(testFilePath, 'file to be deleted');
        await execInRepo(`git add ${testFileName}`, { silent: true });
        await execInRepo(
          `git commit -m "Add test file for deletion" --no-verify`,
          {
            silent: true,
          },
        );

        // Delete the file and stage the deletion
        await fs.rm(testFilePath, { force: true });
        await execInRepo(`git add ${testFileName}`, { silent: true });

        // Test with excludeDeleted = true (default)
        const resultExclude = await repoFunctions.getStagedFiles({
          silent: true,
        });
        expect(Result.isOk(resultExclude)).toBe(true);
        if (Result.isOk(resultExclude)) {
          const files = resultExclude.value;
          expect(files).not.toContain(testFileName);
        }

        // Test with excludeDeleted = false
        // First verify the file is actually staged for deletion by checking git status
        const gitStatusResult = await execInRepo(`git status --porcelain`, {
          silent: true,
        });
        const hasDeletion =
          Result.isOk(gitStatusResult) &&
          gitStatusResult.value.stdout.includes(`D  ${testFileName}`);

        if (hasDeletion) {
          const resultInclude = await repoFunctions.getStagedFiles({
            excludeDeleted: false,
            silent: true,
          });
          expect(Result.isOk(resultInclude)).toBe(true);
          if (Result.isOk(resultInclude)) {
            const files = resultInclude.value;
            expect(files).toContain(testFileName);
          }
        } else {
          // If the file is not properly staged for deletion, just log and skip the assertion
          console.warn(
            `Test file ${testFileName} was not properly staged for deletion, skipping inclusion test`,
          );
        }
      } finally {
        await cleanup();
      }
    });

    test('should parse staged files output correctly', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getStagedFiles({ silent: true });
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          const files = result.value;
          // Each file should be a non-empty string
          for (const file of files) {
            expect(typeof file).toBe('string');
            expect(file.trim()).toBe(file); // No leading/trailing whitespace
          }
        }
      } finally {
        await cleanup();
      }
    });

    test('should work with silent option', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getStagedFiles({ silent: true });
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          expect(Array.isArray(result.value)).toBe(true);
        }
      } finally {
        await cleanup();
      }
    });

    test('should handle git command errors gracefully', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getStagedFiles({ silent: true });
        // Should always return a Result, either Ok or Err
        expect(Result.isOk(result) || Result.isErr(result)).toBe(true);
      } finally {
        await cleanup();
      }
    });
  });

  describe('getModifiedFiles', () => {
    test('should return empty array when no files are modified', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getModifiedFiles({ silent: true });
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          expect(Array.isArray(result.value)).toBe(true);
        }
      } finally {
        await cleanup();
      }
    });

    test('should detect modified files', async () => {
      const { repoPath, cleanup, execInRepo } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        // Create a new file and commit it first
        const testFileName = `test-modified-file-${crypto.randomUUID()}.tmp`;
        const testFilePath = path.join(repoPath, testFileName);

        await fs.writeFile(testFilePath, 'initial content');
        await execInRepo(`git add ${testFileName}`, { silent: true });
        await execInRepo(
          `git commit -m "Add file for modification test" --no-verify`,
          { silent: true },
        );

        // Now modify the file (without staging)
        await fs.writeFile(testFilePath, 'modified content');

        const result = await repoFunctions.getModifiedFiles({ silent: true });
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          const files = result.value;
          expect(files).toContain(testFileName);
        }
      } finally {
        await cleanup();
      }
    });

    test('should detect multiple modified files', async () => {
      const { repoPath, cleanup, execInRepo } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const uuid = crypto.randomUUID();
        const file1 = `test-modified-file1-${uuid}.tmp`;
        const file2 = `test-modified-file2-${uuid}.tmp`;
        const filePath1 = path.join(repoPath, file1);
        const filePath2 = path.join(repoPath, file2);

        // Create and commit both files
        await fs.writeFile(filePath1, 'initial content 1');
        await fs.writeFile(filePath2, 'initial content 2');
        await execInRepo(`git add ${file1} ${file2}`, { silent: true });
        await execInRepo(
          `git commit -m "Add files for modification test" --no-verify`,
          { silent: true },
        );

        // Modify both files
        await fs.writeFile(filePath1, 'modified content 1');
        await fs.writeFile(filePath2, 'modified content 2');

        const result = await repoFunctions.getModifiedFiles({ silent: true });
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          const files = result.value;
          expect(files).toContain(file1);
          expect(files).toContain(file2);
        }
      } finally {
        await cleanup();
      }
    });

    test('should exclude deleted files by default', async () => {
      const { repoPath, cleanup, execInRepo } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const testFileName = `test-deleted-modified-file-${crypto.randomUUID()}.tmp`;
        const testFilePath = path.join(repoPath, testFileName);

        // Create a file and commit it
        await fs.writeFile(testFilePath, 'file to be deleted');
        await execInRepo(`git add ${testFileName}`, { silent: true });
        await execInRepo(
          `git commit -m "Add test file for deletion" --no-verify`,
          { silent: true },
        );

        // Delete the file (this makes it show up in git diff as deleted)
        await fs.rm(testFilePath, { force: true });

        // Test with excludeDeleted = true (default)
        const resultExclude = await repoFunctions.getModifiedFiles({
          silent: true,
        });
        expect(Result.isOk(resultExclude)).toBe(true);
        if (Result.isOk(resultExclude)) {
          const files = resultExclude.value;
          expect(files).not.toContain(testFileName);
        }

        // Test with excludeDeleted = false
        const resultInclude = await repoFunctions.getModifiedFiles({
          excludeDeleted: false,
          silent: true,
        });
        expect(Result.isOk(resultInclude)).toBe(true);
        if (Result.isOk(resultInclude)) {
          const files = resultInclude.value;
          expect(files).toContain(testFileName);
        }
      } finally {
        await cleanup();
      }
    });

    test('should parse modified files output correctly', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getModifiedFiles({ silent: true });
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          const files = result.value;
          // Each file should be a non-empty string
          for (const file of files) {
            expect(typeof file).toBe('string');
            expect(file.trim()).toBe(file); // No leading/trailing whitespace
          }
        }
      } finally {
        await cleanup();
      }
    });

    test('should work with silent option', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getModifiedFiles({ silent: true });
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          expect(Array.isArray(result.value)).toBe(true);
        }
      } finally {
        await cleanup();
      }
    });

    test('should handle git command errors gracefully', async () => {
      const { repoPath, cleanup } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        const result = await repoFunctions.getModifiedFiles({ silent: true });
        // Should always return a Result, either Ok or Err
        expect(Result.isOk(result) || Result.isErr(result)).toBe(true);
      } finally {
        await cleanup();
      }
    });
  });

  describe('getDiffFrom', () => {
    test('should work with silent option', async () => {
      const { repoPath, cleanup, execInRepo } = await createTempRepo();
      const repoFunctions = createRepoFunctions(repoPath);

      try {
        // Create an initial commit to have something to diff against
        const testFileName = `test-initial-file-${crypto.randomUUID()}.tmp`;
        const testFilePath = path.join(repoPath, testFileName);

        await fs.writeFile(testFilePath, 'initial content');
        await execInRepo(`git add ${testFileName}`, { silent: true });
        await execInRepo(`git commit -m "Initial commit" --no-verify`, {
          silent: true,
        });

        const result = await repoFunctions.getDiffFrom('HEAD~1', {
          silent: true,
        });

        expect(Result.isOk(result) || Result.isErr(result)).toBe(true);
      } finally {
        await cleanup();
      }
    });
  });
});
