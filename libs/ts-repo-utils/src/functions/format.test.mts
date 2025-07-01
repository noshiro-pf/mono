import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import '../node-global.mjs';
import { getDiffFrom, getUntrackedFiles } from './diff.mjs';
import { formatDiffFrom, formatFiles, formatFilesList } from './format.mjs';

vi.mock('./diff.mjs', () => ({
  getDiffFrom: vi.fn(),
  getUntrackedFiles: vi.fn(),
}));

describe('formatFiles', () => {
  const testDir = path.join(process.cwd(), 'test-format-files');

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
      const result = await formatFiles(`${testDir}/*.ts`, { silent: true });
      expect(result).toBe('ok');

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
    const result = await formatFiles('/non-existent-path/*.ts', {
      silent: true,
    });
    expect(result).toBe('ok');
  });

  test('should handle nested directories with glob pattern', async () => {
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
      const result = await formatFiles(`${testDir}/**/*.ts`, {
        silent: true,
      });
      expect(result).toBe('ok');

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

describe('formatFilesList', () => {
  const testDir = path.join(process.cwd(), 'test-format-files-list');

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
      const result = await formatFilesList([file1, file2], {
        silent: true,
      });
      expect(result).toBe('ok');

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
    const result = await formatFilesList([], {
      silent: true,
    });
    expect(result).toBe('ok');
  });
});

describe('formatDiffFrom', () => {
  const testDir = path.join(process.cwd(), 'test-format-diff');

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should format files from diff', async () => {
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

      const result = await formatDiffFrom('main', { silent: true });
      expect(result).toBe('ok');

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

      const result = await formatDiffFrom('main', {
        includeUntracked: true,
        silent: true,
      });
      expect(result).toBe('ok');

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

      const result = await formatDiffFrom('main', {
        includeUntracked: true,
        silent: true,
      });
      expect(result).toBe('ok');

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
});
