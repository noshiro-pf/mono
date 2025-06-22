import dedent from 'dedent';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { formatFiles } from './format.mjs';

describe('formatFiles', () => {
  const testDir = join(process.cwd(), 'test-format-files');

  // Helper to create a test file with unformatted content
  const createTestFile = async (
    filename: string,
    content: string,
  ): Promise<string> => {
    const filePath = join(testDir, filename);
    await writeFile(filePath, content, 'utf8');
    return filePath;
  };

  // Helper to read file content
  const readTestFile = async (filePath: string): Promise<string> => {
    const { readFile } = await import('node:fs/promises');
    return readFile(filePath, 'utf8');
  };

  test('should format files matching glob pattern', async () => {
    // Setup test directory
    await mkdir(testDir, { recursive: true });

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
      const result = await formatFiles(`${testDir}/*.ts`);
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
      const mdContent = await readTestFile(join(testDir, 'test.md'));
      expect(mdContent).toBe('# Test\n\nSome    spaces');
    } finally {
      // Cleanup
      await rm(testDir, { recursive: true, force: true });
    }
  });

  test('should return ok when no files match pattern', async () => {
    const result = await formatFiles('/non-existent-path/*.ts');
    expect(result).toBe('ok');
  });

  test('should handle nested directories with glob pattern', async () => {
    // Setup test directory with nested structure
    await mkdir(join(testDir, 'src', 'utils'), { recursive: true });

    try {
      // Create nested test file
      const nestedFile = await createTestFile(
        join('src', 'utils', 'helper.ts'),
        dedent`
          export const helper=(x:number)=>{return x*2}
        `,
      );

      // Format with recursive glob
      const result = await formatFiles(`${testDir}/**/*.ts`);
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
      await rm(testDir, { recursive: true, force: true });
    }
  });
});
