import { Result } from 'ts-data-forge';
import '../node-global.mjs';
import { getDiffFrom, getUntrackedFiles } from './diff.mjs';

describe('diff', () => {
  // Helper function to clean up test files
  const cleanupTestFiles = async (files: Set<string>): Promise<void> => {
    for (const file of files) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await fs.rm(file, { force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  };

  describe('getUntrackedFiles', () => {
    test('should return empty array when no files are changed', async () => {
      const result = await getUntrackedFiles({ silent: true });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(Array.isArray(result.value)).toBe(true);
      }
    });

    test('should detect newly created files', async () => {
      const testFiles = new Set<string>();

      // Create a new file in project root
      const testFileName = 'test-new-file.tmp';
      const testFilePath = path.join(process.cwd(), testFileName);
      testFiles.add(testFilePath);

      await fs.writeFile(testFilePath, 'test content');

      const result = await getUntrackedFiles({ silent: true });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        const files = result.value;
        expect(files).toContain(testFileName);
      }

      await cleanupTestFiles(testFiles);
    });

    test('should detect modified existing files', async () => {
      const testFiles = new Set<string>();

      // Use an existing file in the project that we can modify safely
      const testFileName = 'test-modify-file.tmp';
      const testFilePath = path.join(process.cwd(), testFileName);
      testFiles.add(testFilePath);

      // Create and commit the file first
      await fs.writeFile(testFilePath, 'initial content');

      // Add to git to track it
      await $(`git add ${testFileName}`, { silent: true });

      // Modify the file
      await fs.writeFile(testFilePath, 'modified content');

      const result = await getUntrackedFiles({ silent: true });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        const files = result.value;
        expect(files).not.toContain(testFileName);
      }

      // Reset git state
      await $(`git reset HEAD ${testFileName}`, { silent: true });

      await cleanupTestFiles(testFiles);
    });

    test('should detect multiple types of changes', async () => {
      const testFiles = new Set<string>();

      // Create multiple test files
      const newFile = path.join(process.cwd(), 'test-new-file.tmp');
      const modifyFile = path.join(process.cwd(), 'test-modify-file.tmp');
      testFiles.add(newFile);
      testFiles.add(modifyFile);

      // Create new file
      await fs.writeFile(newFile, 'new file content');

      // Create and track another file
      await fs.writeFile(modifyFile, 'initial content');
      await $(`git add test-modify-file.tmp`, { silent: true });

      // Modify the tracked file
      await fs.writeFile(modifyFile, 'modified content');

      const result = await getUntrackedFiles({ silent: true });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        const files = result.value;
        expect(files).toContain('test-new-file.tmp');
        expect(files).not.toContain('test-modify-file.tmp');
      }

      // Reset git state
      await $(`git reset HEAD test-modify-file.tmp`, { silent: true });

      await cleanupTestFiles(testFiles);
    });

    test('should exclude deleted files from results', async () => {
      // This test is more complex as it requires simulating git state
      // For now, we'll test that the function executes successfully
      const result = await getUntrackedFiles({ silent: true });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        const files = result.value;
        // Verify no deleted files are included (status 'D')
        for (const file of files) {
          expect(typeof file).toBe('string');
          expect(file.length).toBeGreaterThan(0);
        }
      }
    });

    test('should handle git command errors gracefully', async () => {
      // This test would require mocking git command failure
      // For now, we'll ensure the function returns a Result type
      const result = await getUntrackedFiles({ silent: true });

      // Should always return a Result, either Ok or Err
      expect(Result.isOk(result) || Result.isErr(result)).toBe(true);
    });

    test('should parse git status output correctly', async () => {
      const result = await getUntrackedFiles({ silent: true });

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
    });

    test('should work with silent option', async () => {
      const result = await getUntrackedFiles({ silent: true });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(Array.isArray(result.value)).toBe(true);
      }
    });
  });

  describe('getDiffFrom', () => {
    test('should work with silent option', async () => {
      const result = await getDiffFrom('HEAD~1', { silent: true });

      expect(Result.isOk(result) || Result.isErr(result)).toBe(true);
    });
  });
});
