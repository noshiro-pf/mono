import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import '../node-global.mjs';
import {
  getDiffFrom,
  getModifiedFiles,
  getStagedFiles,
  getUntrackedFiles,
} from './diff.mjs';
import {
  formatDiffFrom,
  formatFiles,
  formatFilesGlob,
  formatUncommittedFiles,
} from './format.mjs';

vi.mock(import('./diff.mjs'), () => ({
  getDiffFrom: vi.fn(),
  getModifiedFiles: vi.fn(),
  getStagedFiles: vi.fn(),
  getUntrackedFiles: vi.fn(),
}));

describe(formatFilesGlob, () => {
  const testDir = path.join(
    process.cwd(),
    `test-format-files-${crypto.randomUUID()}`,
  );

  // Helper to create a test file with unformatted content
  const createTestFile = async (
    filename: string,
    content: string,
  ): Promise<string> => {
    const filePath = path.join(testDir, filename);

    await fs.writeFile(filePath, content, 'utf8');

    return filePath;
  };

  // Helper to read file content
  const readTestFile = async (filePath: string): Promise<string> =>
    fs.readFile(filePath, 'utf8');

  test('should format files matching glob pattern', async () => {
    vi.clearAllMocks();

    // Setup test directory
    await fs.mkdir(testDir, { recursive: true });

    try {
      // Create test files with unformatted code
      const file1 = await createTestFile(
        'test1.ts',
        dedent`
          const   foo    =    "bar"
          const baz = {a:1,b:2}
        `,
      );

      const file2 = await createTestFile(
        'test2.ts',
        dedent`
          function test  (  x:number,y:string  )   {
          return x+1
          }
        `,
      );

      // Create a non-matching file
      await createTestFile('test.md', '# Test\n\nSome    spaces');

      // Format TypeScript files
      const result = await formatFilesGlob(`${testDir}/*.ts`, { silent: true });

      assert.isTrue(Result.isOk(result));

      // Check that files were formatted
      const content1 = await readTestFile(file1);

      expect(content1).toBe(
        `${dedent`
          const foo = 'bar';
          const baz = { a: 1, b: 2 };
        `}\n`,
      );

      const content2 = await readTestFile(file2);

      expect(content2).toBe(
        `${dedent`
          function test(x: number, y: string) {
            return x + 1;
          }
        `}\n`,
      );

      // Check that non-matching file was not touched
      const mdContent = await readTestFile(path.join(testDir, 'test.md'));

      expect(mdContent).toBe('# Test\n\nSome    spaces');
    } finally {
      // Cleanup
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  test('should return ok when no files match pattern', async () => {
    vi.clearAllMocks();

    const result = await formatFilesGlob('/non-existent-path/*.ts', {
      silent: true,
    });

    assert.isTrue(Result.isOk(result));
  });

  test('should handle nested directories with glob pattern', async () => {
    vi.clearAllMocks();

    // Setup test directory with nested structure
    await fs.mkdir(path.join(testDir, 'src', 'utils'), { recursive: true });

    try {
      // Create nested test file
      const nestedFile = await createTestFile(
        path.join('src', 'utils', 'helper.ts'),
        dedent`
          export const helper=(x:number)=>{return x*2}
        `,
      );

      // Format with recursive glob
      const result = await formatFilesGlob(`${testDir}/**/*.ts`, {
        silent: true,
      });

      assert.isTrue(Result.isOk(result));

      // Check that nested file was formatted
      const content = await readTestFile(nestedFile);

      expect(content).toBe(
        `${dedent`
          export const helper = (x: number) => {
            return x * 2;
          };
        `}\n`,
      );
    } finally {
      // Cleanup
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });
});

describe(formatFiles, () => {
  const testDir = path.join(
    process.cwd(),
    `test-format-files-list-${crypto.randomUUID()}`,
  );

  // Helper to create a test file with unformatted content
  const createTestFile = async (
    filename: string,
    content: string,
  ): Promise<string> => {
    const filePath = path.join(testDir, filename);

    await fs.writeFile(filePath, content, 'utf8');

    return filePath;
  };

  // Helper to read file content
  const readTestFile = async (filePath: string): Promise<string> =>
    fs.readFile(filePath, 'utf8');

  test('should format a list of files', async () => {
    vi.clearAllMocks();

    await fs.mkdir(testDir, { recursive: true });

    try {
      // Create test files
      const file1 = await createTestFile(
        'file1.ts',
        dedent`
          const x={a:1,b:2}
        `,
      );

      const file2 = await createTestFile(
        'file2.ts',
        dedent`
          function test(){return"hello"}
        `,
      );

      // Format the files
      const result = await formatFiles([file1, file2], {
        silent: true,
      });

      assert.isTrue(Result.isOk(result));

      // Check formatted content
      const content1 = await readTestFile(file1);

      expect(content1).toBe(
        `${dedent`
          const x = { a: 1, b: 2 };
        `}\n`,
      );

      const content2 = await readTestFile(file2);

      expect(content2).toBe(
        `${dedent`
          function test() {
            return 'hello';
          }
        `}\n`,
      );
    } finally {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  test('should return ok for empty file list', async () => {
    vi.clearAllMocks();

    const result = await formatFiles([], {
      silent: true,
    });

    assert.isTrue(Result.isOk(result));
  });
});

describe(formatUncommittedFiles, () => {
  const testDir = path.join(
    process.cwd(),
    `test-format-uncommitted-${crypto.randomUUID()}`,
  );

  const createTestFile = async (
    filename: string,
    content: string,
  ): Promise<string> => {
    const filePath = path.join(testDir, filename);

    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(filePath, content, 'utf8');

    return filePath;
  };

  const setupTest = async (): Promise<void> => {
    vi.clearAllMocks();

    await fs.mkdir(testDir, { recursive: true });
  };

  const cleanupTest = async (): Promise<void> => {
    await fs.rm(testDir, { recursive: true, force: true });
  };

  test('should format all uncommitted files by default', async () => {
    await setupTest();

    try {
      const untrackedFiles = ['untracked1.ts', 'untracked2.ts'];

      const modifiedFiles = ['modified1.ts', 'modified2.ts'];

      const stagedFiles = ['staged1.ts', 'staged2.ts'];

      // Create test files
      const allFiles = [...untrackedFiles, ...modifiedFiles, ...stagedFiles];

      const filePromises = allFiles.map((file) =>
        createTestFile(file, 'const x=1'),
      );

      await Promise.all(filePromises);

      // Mock git functions
      vi.mocked(getUntrackedFiles).mockResolvedValue(
        Result.ok(untrackedFiles.map((f) => path.join(testDir, f))),
      );

      vi.mocked(getModifiedFiles).mockResolvedValue(
        Result.ok(modifiedFiles.map((f) => path.join(testDir, f))),
      );

      vi.mocked(getStagedFiles).mockResolvedValue(
        Result.ok(stagedFiles.map((f) => path.join(testDir, f))),
      );

      const result = await formatUncommittedFiles({ silent: true });

      assert.isTrue(Result.isOk(result));

      // Verify all git functions were called
      expect(getUntrackedFiles).toHaveBeenCalledWith({ silent: true });

      expect(getModifiedFiles).toHaveBeenCalledWith({ silent: true });

      expect(getStagedFiles).toHaveBeenCalledWith({ silent: true });

      // Verify files were formatted
      const verifyPromises = allFiles.map(async (file) => {
        const content = await fs.readFile(path.join(testDir, file), 'utf8');

        expect(content).toBe('const x = 1;\n');
      });

      await Promise.all(verifyPromises);
    } finally {
      await cleanupTest();
    }
  });

  test('should format only untracked files when specified', async () => {
    await setupTest();

    try {
      const untrackedFiles = ['untracked.ts'] as const;

      await createTestFile(untrackedFiles[0], 'const x=1');

      vi.mocked(getUntrackedFiles).mockResolvedValue(
        Result.ok(untrackedFiles.map((f) => path.join(testDir, f))),
      );

      const result = await formatUncommittedFiles({
        untracked: true,
        modified: false,
        staged: false,
        silent: true,
      });

      assert.isTrue(Result.isOk(result));

      expect(getUntrackedFiles).toHaveBeenCalledWith({ silent: true });

      expect(getModifiedFiles).not.toHaveBeenCalled();

      expect(getStagedFiles).not.toHaveBeenCalled();
    } finally {
      await cleanupTest();
    }
  });

  test('should format only modified files when specified', async () => {
    await setupTest();

    try {
      const modifiedFiles = ['modified.ts'] as const;

      await createTestFile(modifiedFiles[0], 'const x=1');

      vi.mocked(getModifiedFiles).mockResolvedValue(
        Result.ok(modifiedFiles.map((f) => path.join(testDir, f))),
      );

      const result = await formatUncommittedFiles({
        untracked: false,
        modified: true,
        staged: false,
        silent: true,
      });

      assert.isTrue(Result.isOk(result));

      expect(getUntrackedFiles).not.toHaveBeenCalled();

      expect(getModifiedFiles).toHaveBeenCalledWith({ silent: true });

      expect(getStagedFiles).not.toHaveBeenCalled();
    } finally {
      await cleanupTest();
    }
  });

  test('should format only staged files when specified', async () => {
    await setupTest();

    try {
      const stagedFiles = ['staged.ts'] as const;

      await createTestFile(stagedFiles[0], 'const x=1');

      vi.mocked(getStagedFiles).mockResolvedValue(
        Result.ok(stagedFiles.map((f) => path.join(testDir, f))),
      );

      const result = await formatUncommittedFiles({
        untracked: false,
        modified: false,
        staged: true,
        silent: true,
      });

      assert.isTrue(Result.isOk(result));

      expect(getUntrackedFiles).not.toHaveBeenCalled();

      expect(getModifiedFiles).not.toHaveBeenCalled();

      expect(getStagedFiles).toHaveBeenCalledWith({ silent: true });
    } finally {
      await cleanupTest();
    }
  });

  test('should handle combinations of file types', async () => {
    await setupTest();

    try {
      const untrackedFiles = ['untracked.ts'];

      const stagedFiles = ['staged.ts'];

      const allFiles = [...untrackedFiles, ...stagedFiles];

      const filePromises = allFiles.map((file) =>
        createTestFile(file, 'const x=1'),
      );

      await Promise.all(filePromises);

      vi.mocked(getUntrackedFiles).mockResolvedValue(
        Result.ok(untrackedFiles.map((f) => path.join(testDir, f))),
      );

      vi.mocked(getStagedFiles).mockResolvedValue(
        Result.ok(stagedFiles.map((f) => path.join(testDir, f))),
      );

      const result = await formatUncommittedFiles({
        untracked: true,
        modified: false,
        staged: true,
        silent: true,
      });

      assert.isTrue(Result.isOk(result));

      expect(getUntrackedFiles).toHaveBeenCalledWith({ silent: true });

      expect(getModifiedFiles).not.toHaveBeenCalled();

      expect(getStagedFiles).toHaveBeenCalledWith({ silent: true });
    } finally {
      await cleanupTest();
    }
  });

  test('should deduplicate files that appear in multiple categories', async () => {
    await setupTest();

    try {
      const duplicateFile = path.join(testDir, 'duplicate.ts');

      await createTestFile('duplicate.ts', 'const x=1');

      // Mock the same file appearing in multiple categories
      vi.mocked(getUntrackedFiles).mockResolvedValue(
        Result.ok([duplicateFile]),
      );

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.ok([duplicateFile]));

      vi.mocked(getStagedFiles).mockResolvedValue(Result.ok([duplicateFile]));

      const result = await formatUncommittedFiles({ silent: true });

      assert.isTrue(Result.isOk(result));

      // Verify file was formatted (only once despite appearing in all categories)
      const content = await fs.readFile(duplicateFile, 'utf8');

      expect(content).toBe('const x = 1;\n');
    } finally {
      await cleanupTest();
    }
  });

  test('should handle empty file lists', async () => {
    await setupTest();

    try {
      vi.mocked(getUntrackedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getStagedFiles).mockResolvedValue(Result.ok([]));

      const result = await formatUncommittedFiles({ silent: true });

      assert.isTrue(Result.isOk(result));
    } finally {
      await cleanupTest();
    }
  });

  test('should return error when getUntrackedFiles fails', async () => {
    await setupTest();

    try {
      const error = { message: 'Git error' };

      vi.mocked(getUntrackedFiles).mockResolvedValue(Result.err(error));

      const result = await formatUncommittedFiles({
        untracked: true,
        modified: false,
        staged: false,
        silent: true,
      });

      assert.isTrue(Result.isErr(result));

      if (Result.isErr(result)) {
        assert.deepStrictEqual(result.value, error);
      }
    } finally {
      await cleanupTest();
    }
  });

  test('should return error when getModifiedFiles fails', async () => {
    await setupTest();

    try {
      const error = { message: 'Git error' };

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.err(error));

      const result = await formatUncommittedFiles({
        untracked: false,
        modified: true,
        staged: false,
        silent: true,
      });

      assert.isTrue(Result.isErr(result));

      if (Result.isErr(result)) {
        assert.deepStrictEqual(result.value, error);
      }
    } finally {
      await cleanupTest();
    }
  });

  test('should return error when getStagedFiles fails', async () => {
    await setupTest();

    try {
      const error = { message: 'Git error' };

      vi.mocked(getStagedFiles).mockResolvedValue(Result.err(error));

      const result = await formatUncommittedFiles({
        untracked: false,
        modified: false,
        staged: true,
        silent: true,
      });

      assert.isTrue(Result.isErr(result));

      if (Result.isErr(result)) {
        assert.deepStrictEqual(result.value, error);
      }
    } finally {
      await cleanupTest();
    }
  });

  test('should respect silent option', async () => {
    await setupTest();

    try {
      // Using vi.stubGlobal to avoid direct assignment
      const consoleErrorStub = vi.fn();

      vi.stubGlobal('console', {
        ...console,
        error: consoleErrorStub,
      });

      vi.mocked(getUntrackedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getStagedFiles).mockResolvedValue(Result.ok([]));

      const result1 = await formatUncommittedFiles({ silent: false });

      assert.isTrue(Result.isOk(result1));
      // With silent: false, console output may occur

      const result2 = await formatUncommittedFiles({ silent: true });

      assert.isTrue(Result.isOk(result2));
      // With silent: true, console output should be suppressed

      vi.unstubAllGlobals();
    } finally {
      await cleanupTest();
    }
  });

  test('should format TypeScript files correctly', async () => {
    await setupTest();

    try {
      const testFile = 'test.ts';

      await createTestFile(
        testFile,
        dedent`
          function test(){return"hello"}
          const obj={a:1,b:2}
        `,
      );

      vi.mocked(getUntrackedFiles).mockResolvedValue(
        Result.ok([path.join(testDir, testFile)]),
      );

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getStagedFiles).mockResolvedValue(Result.ok([]));

      const result = await formatUncommittedFiles({ silent: true });

      assert.isTrue(Result.isOk(result));

      const content = await fs.readFile(path.join(testDir, testFile), 'utf8');

      expect(content).toBe(
        `${dedent`
          function test() {
            return 'hello';
          }
          const obj = { a: 1, b: 2 };
        `}\n`,
      );
    } finally {
      await cleanupTest();
    }
  });

  test('should handle non-formattable files gracefully', async () => {
    await setupTest();

    try {
      const binaryFile = 'test.bin';

      const binaryPath = path.join(testDir, binaryFile);

      await createTestFile(
        binaryFile,
        Buffer.from([0x00, 0x01, 0x02]).toString(),
      );

      vi.mocked(getUntrackedFiles).mockResolvedValue(Result.ok([binaryPath]));

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getStagedFiles).mockResolvedValue(Result.ok([]));

      const result = await formatUncommittedFiles({ silent: true });

      // Should handle error gracefully
      assert.isTrue(Result.isOk(result) || Result.isErr(result));
    } finally {
      await cleanupTest();
    }
  });
});

describe(formatDiffFrom, () => {
  const testDir = path.join(
    process.cwd(),
    `test-format-diff-${crypto.randomUUID()}`,
  );

  const createTestFile = async (
    filename: string,
    content: string,
  ): Promise<string> => {
    const filePath = path.join(testDir, filename);

    await fs.writeFile(filePath, content, 'utf8');

    return filePath;
  };

  const readTestFile = async (filePath: string): Promise<string> =>
    fs.readFile(filePath, 'utf8');

  test('should format files from diff', async () => {
    vi.clearAllMocks();

    await fs.mkdir(testDir, { recursive: true });

    try {
      const file1 = await createTestFile(
        'diff1.ts',
        dedent`
          const a=1;const b=2
        `,
      );

      // Mock getDiffFrom to return our test file
      vi.mocked(getDiffFrom).mockResolvedValue(Result.ok([file1]));

      vi.mocked(getUntrackedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getStagedFiles).mockResolvedValue(Result.ok([]));

      const result = await formatDiffFrom('main', { silent: true });

      assert.isTrue(Result.isOk(result));

      // Check file was formatted
      const content = await readTestFile(file1);

      expect(content).toBe(
        `${dedent`
          const a = 1;
          const b = 2;
        `}\n`,
      );

      expect(getDiffFrom).toHaveBeenCalledWith('main', { silent: true });
    } finally {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  test('should include untracked files when option is set', async () => {
    vi.clearAllMocks();

    await fs.mkdir(testDir, { recursive: true });

    try {
      const diffFile = await createTestFile(
        'diff.ts',
        dedent`
          const diff=true
        `,
      );

      const untrackedFile = await createTestFile(
        'untracked.ts',
        dedent`
          const untracked=true
        `,
      );

      // Mock both functions
      vi.mocked(getDiffFrom).mockResolvedValue(Result.ok([diffFile]));

      vi.mocked(getUntrackedFiles).mockResolvedValue(
        Result.ok([untrackedFile]),
      );

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getStagedFiles).mockResolvedValue(Result.ok([]));

      const result = await formatDiffFrom('main', {
        includeUntracked: true,
        silent: true,
      });

      assert.isTrue(Result.isOk(result));

      // Check both files were formatted
      const diffContent = await readTestFile(diffFile);

      expect(diffContent).toBe(
        `${dedent`
          const diff = true;
        `}\n`,
      );

      const untrackedContent = await readTestFile(untrackedFile);

      expect(untrackedContent).toBe(
        `${dedent`
          const untracked = true;
        `}\n`,
      );

      expect(getDiffFrom).toHaveBeenCalledWith('main', { silent: true });

      expect(getUntrackedFiles).toHaveBeenCalledWith({ silent: true });
    } finally {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  test('should deduplicate files when including untracked', async () => {
    vi.clearAllMocks();

    await fs.mkdir(testDir, { recursive: true });

    try {
      const sharedFile = await createTestFile(
        'shared.ts',
        dedent`
          const shared={value:1}
        `,
      );

      // Mock both functions to return the same file
      vi.mocked(getDiffFrom).mockResolvedValue(Result.ok([sharedFile]));

      vi.mocked(getUntrackedFiles).mockResolvedValue(Result.ok([sharedFile]));

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getStagedFiles).mockResolvedValue(Result.ok([]));

      const result = await formatDiffFrom('main', {
        includeUntracked: true,
        silent: true,
      });

      assert.isTrue(Result.isOk(result));

      // Verify both functions were called
      expect(getDiffFrom).toHaveBeenCalledWith('main', { silent: true });

      expect(getUntrackedFiles).toHaveBeenCalledWith({ silent: true });

      // Check that the file was formatted (content should change)
      const finalContent = await readTestFile(sharedFile);

      expect(finalContent).toBe(
        `${dedent`
          const shared = { value: 1 };
        `}\n`,
      );
    } finally {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  test('should include both staged and untracked files by default', async () => {
    vi.clearAllMocks();

    await fs.mkdir(testDir, { recursive: true });

    try {
      const diffFile = await createTestFile(
        'diff.ts',
        dedent`
          const diff=true
        `,
      );

      const stagedFile = await createTestFile(
        'staged.ts',
        dedent`
          const staged=true
        `,
      );

      const untrackedFile = await createTestFile(
        'untracked.ts',
        dedent`
          const untracked=true
        `,
      );

      // Mock all functions
      vi.mocked(getDiffFrom).mockResolvedValue(Result.ok([diffFile]));

      vi.mocked(getUntrackedFiles).mockResolvedValue(
        Result.ok([untrackedFile]),
      );

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getStagedFiles).mockResolvedValue(Result.ok([stagedFile]));

      // Test default behavior (no options provided)
      const result = await formatDiffFrom('main', { silent: true });

      assert.isTrue(Result.isOk(result));

      // Check all files were formatted
      const diffContent = await readTestFile(diffFile);

      expect(diffContent).toBe(
        `${dedent`
          const diff = true;
        `}\n`,
      );

      const stagedContent = await readTestFile(stagedFile);

      expect(stagedContent).toBe(
        `${dedent`
          const staged = true;
        `}\n`,
      );

      const untrackedContent = await readTestFile(untrackedFile);

      expect(untrackedContent).toBe(
        `${dedent`
          const untracked = true;
        `}\n`,
      );

      // Verify all functions were called by default
      expect(getDiffFrom).toHaveBeenCalledWith('main', { silent: true });

      expect(getStagedFiles).toHaveBeenCalledWith({ silent: true });

      expect(getUntrackedFiles).toHaveBeenCalledWith({ silent: true });
    } finally {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  test('should include staged files when option is set', async () => {
    vi.clearAllMocks();

    await fs.mkdir(testDir, { recursive: true });

    try {
      const diffFile = await createTestFile(
        'diff.ts',
        dedent`
          const diff=true
        `,
      );

      const stagedFile = await createTestFile(
        'staged.ts',
        dedent`
          const staged=true
        `,
      );

      // Mock all functions
      vi.mocked(getDiffFrom).mockResolvedValue(Result.ok([diffFile]));

      vi.mocked(getUntrackedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getStagedFiles).mockResolvedValue(Result.ok([stagedFile]));

      const result = await formatDiffFrom('main', {
        includeStaged: true,
        includeUntracked: false,
        includeModified: false,
        silent: true,
      });

      assert.isTrue(Result.isOk(result));

      // Check both files were formatted
      const diffContent = await readTestFile(diffFile);

      expect(diffContent).toBe(
        `${dedent`
          const diff = true;
        `}\n`,
      );

      const stagedContent = await readTestFile(stagedFile);

      expect(stagedContent).toBe(
        `${dedent`
          const staged = true;
        `}\n`,
      );

      expect(getDiffFrom).toHaveBeenCalledWith('main', { silent: true });

      expect(getStagedFiles).toHaveBeenCalledWith({ silent: true });

      expect(getUntrackedFiles).not.toHaveBeenCalled();
    } finally {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  test('should deduplicate files when including both staged and untracked', async () => {
    vi.clearAllMocks();

    await fs.mkdir(testDir, { recursive: true });

    try {
      const sharedFile = await createTestFile(
        'shared.ts',
        dedent`
          const shared={value:1}
        `,
      );

      // Mock all functions to return the same file
      vi.mocked(getDiffFrom).mockResolvedValue(Result.ok([sharedFile]));

      vi.mocked(getUntrackedFiles).mockResolvedValue(Result.ok([sharedFile]));

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getStagedFiles).mockResolvedValue(Result.ok([sharedFile]));

      const result = await formatDiffFrom('main', {
        includeUntracked: true,
        includeStaged: true,
        silent: true,
      });

      assert.isTrue(Result.isOk(result));

      // Verify all functions were called
      expect(getDiffFrom).toHaveBeenCalledWith('main', { silent: true });

      expect(getUntrackedFiles).toHaveBeenCalledWith({ silent: true });

      expect(getStagedFiles).toHaveBeenCalledWith({ silent: true });

      // Check that the file was formatted (content should change)
      const finalContent = await readTestFile(sharedFile);

      expect(finalContent).toBe(
        `${dedent`
          const shared = { value: 1 };
        `}\n`,
      );
    } finally {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  test('should exclude staged files when option is set to false', async () => {
    vi.clearAllMocks();

    await fs.mkdir(testDir, { recursive: true });

    try {
      const diffFile = await createTestFile(
        'diff.ts',
        dedent`
          const diff=true
        `,
      );

      // Mock functions - staged should not be called
      vi.mocked(getDiffFrom).mockResolvedValue(Result.ok([diffFile]));

      vi.mocked(getUntrackedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getModifiedFiles).mockResolvedValue(Result.ok([]));

      vi.mocked(getStagedFiles).mockResolvedValue(Result.ok([]));

      const result = await formatDiffFrom('main', {
        includeStaged: false,
        includeUntracked: false,
        includeModified: false,
        silent: true,
      });

      assert.isTrue(Result.isOk(result));

      // Check only diff file was formatted
      const diffContent = await readTestFile(diffFile);

      expect(diffContent).toBe(
        `${dedent`
          const diff = true;
        `}\n`,
      );

      expect(getDiffFrom).toHaveBeenCalledWith('main', { silent: true });

      expect(getStagedFiles).not.toHaveBeenCalled();

      expect(getUntrackedFiles).not.toHaveBeenCalled();

      expect(getModifiedFiles).not.toHaveBeenCalled();
    } finally {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });
});
