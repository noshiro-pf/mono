/* eslint-disable vitest/expect-expect */
/* eslint-disable vitest/no-conditional-expect */
import { exec, type ExecException } from 'node:child_process';
import { expectType, Result } from 'ts-data-forge';
import '../node-global.mjs';
import { $ } from './exec-async.mjs';

describe('exec-async', () => {
  // Helper to suppress echo output during tests
  const withSilentEcho = async <T,>(fn: () => Promise<T>): Promise<T> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const originalEcho = (globalThis as any).echo;
    // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-unsafe-member-access
    (globalThis as any).echo = () => {
      // Silent implementation - no output
    };
    try {
      return await fn();
    } finally {
      // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      (globalThis as any).echo = originalEcho;
    }
  };
  describe('basic command execution', () => {
    test('should execute simple command successfully', async () => {
      const result = await $('echo "hello world"', { silent: true });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.stdout.trim()).toBe('hello world');
        expect(result.value.stderr).toBe('');
      }
    });

    test('should execute command with multiple lines of output', async () => {
      const result = await $('echo "line1\nline2\nline3"', { silent: true });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.stdout.trim()).toBe('line1\nline2\nline3');
        expect(result.value.stderr).toBe('');
      }
    });

    test('should handle empty output', async () => {
      const result = await $('true', { silent: true });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.stdout).toBe('');
        expect(result.value.stderr).toBe('');
      }
    });
  });

  describe('error handling', () => {
    test('should handle command not found error', async () => {
      const result = await $('nonexistent_command_xyz', { silent: true });

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.value).toBeDefined();
        expect(result.value.code).toBeDefined();
      }
    });

    test('should handle exit code error', async () => {
      const result = await $('exit 1', { silent: true });

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.value).toBeDefined();
        expect(result.value.code).toBe(1);
      }
    });

    test('should capture stderr on error', async () => {
      const result = await $('>&2 echo "error message" && exit 1', {
        silent: true,
      });

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.value).toBeDefined();
      }
    });
  });

  describe('silent option', () => {
    test('should not output when silent is true', async () => {
      // Silent mode should not produce any output
      await $('echo "test"', { silent: true });
      // If no error is thrown, the test passes
    });

    test('should output when silent is false', async () => {
      // Non-silent mode should produce output (suppressed for clean test output)
      await withSilentEcho(async () => {
        await $('echo "test"', { silent: false });
      });
      // If no error is thrown, the test passes
    });

    test('should default to not silent', async () => {
      // Default behavior should produce output (suppressed for clean test output)
      await withSilentEcho(async () => {
        await $('echo "test"');
      });
      // If no error is thrown, the test passes
    });
  });

  describe('encoding options', () => {
    test('should return string with default encoding', async () => {
      const result = await $('echo "test"', { silent: true });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(typeof result.value.stdout).toBe('string');
      }
    });

    test('should return Buffer with buffer encoding', async () => {
      const result = await $('echo "test"', {
        silent: true,
        encoding: 'buffer',
      });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(Buffer.isBuffer(result.value.stdout)).toBe(true);
        expect(Buffer.isBuffer(result.value.stderr)).toBe(true);
      }
    });

    test('should return Buffer with null encoding', async () => {
      const result = await $('echo "test"', { silent: true, encoding: null });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(Buffer.isBuffer(result.value.stdout)).toBe(true);
        expect(Buffer.isBuffer(result.value.stderr)).toBe(true);
      }
    });

    test('should handle utf8 encoding', async () => {
      const result = await $('echo "test 日本語"', {
        silent: true,
        encoding: 'utf8',
      });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(typeof result.value.stdout).toBe('string');
        expect(result.value.stdout.trim()).toBe('test 日本語');
      }
    });
  });

  describe('complex commands', () => {
    test('should handle pipes', async () => {
      const result = await $('echo "hello world" | grep "world"', {
        silent: true,
      });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.stdout.trim()).toBe('hello world');
      }
    });

    test('should handle command chaining with &&', async () => {
      const result = await $('echo "first" && echo "second"', { silent: true });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.stdout.trim()).toBe('first\nsecond');
      }
    });

    test('should handle command chaining with ;', async () => {
      const result = await $('echo "first"; echo "second"', { silent: true });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.stdout.trim()).toBe('first\nsecond');
      }
    });

    test('should stop on first error with &&', async () => {
      const result = await $('false && echo "should not print"', {
        silent: true,
      });

      expect(Result.isErr(result)).toBe(true);
    });
  });

  describe('type inference (compile-time checks)', () => {
    test('should infer string result type with no encoding option', async () => {
      const result = await $('echo "test"', { silent: true });

      // Type assertion: result should be string type
      assertType<
        Result<Readonly<{ stdout: string; stderr: string }>, ExecException>
      >(result);

      if (Result.isOk(result)) {
        // These assignments will fail at compile time if types don't match
        assertType<string>(result.value.stdout);
        assertType<string>(result.value.stderr);
      }
    });

    test('should infer string result type with default options', async () => {
      const _result = await withSilentEcho(async () => $('echo "test"'));

      expectType<
        typeof _result,
        Result<Readonly<{ stdout: string; stderr: string }>, ExecException>
      >('=');
    });

    test('should infer Buffer result type with buffer encoding', async () => {
      const result = await $('echo "test"', {
        encoding: 'buffer',
        silent: true,
      });

      expectType<
        typeof result,
        Result<Readonly<{ stdout: Buffer; stderr: Buffer }>, ExecException>
      >('=');

      if (Result.isOk(result)) {
        assertType<Buffer>(result.value.stdout);
        assertType<Buffer>(result.value.stderr);
      }
    });

    test('should infer Buffer result type with null encoding', async () => {
      const result = await $('echo "test"', { encoding: null, silent: true });

      expectType<
        typeof result,
        Result<Readonly<{ stdout: Buffer; stderr: Buffer }>, ExecException>
      >('=');

      if (Result.isOk(result)) {
        assertType<Buffer>(result.value.stdout);
        assertType<Buffer>(result.value.stderr);
      }
    });

    test('should infer string result type with specific BufferEncoding', async () => {
      const _resultUtf8 = await $('echo "test"', {
        encoding: 'utf8',
        silent: true,
      });
      const _resultAscii = await $('echo "test"', {
        encoding: 'ascii',
        silent: true,
      });
      const _resultBase64 = await $('echo "test"', {
        encoding: 'base64',
        silent: true,
      });

      expectType<
        typeof _resultUtf8,
        Result<Readonly<{ stdout: string; stderr: string }>, ExecException>
      >('=');

      expectType<
        typeof _resultAscii,
        Result<Readonly<{ stdout: string; stderr: string }>, ExecException>
      >('=');

      expectType<
        typeof _resultBase64,
        Result<Readonly<{ stdout: string; stderr: string }>, ExecException>
      >('=');
    });

    test('should maintain type safety with const encoding values', async () => {
      const bufferEncoding = 'buffer';
      const nullEncoding = null;
      const utf8Encoding = 'utf8';

      const _resultBuffer = await $('echo "test"', {
        encoding: bufferEncoding,
        silent: true,
      });
      const _resultNull = await $('echo "test"', {
        encoding: nullEncoding,
        silent: true,
      });
      const _resultUtf8 = await $('echo "test"', {
        encoding: utf8Encoding,
        silent: true,
      });

      expectType<
        typeof _resultBuffer,
        Result<Readonly<{ stdout: Buffer; stderr: Buffer }>, ExecException>
      >('=');

      expectType<
        typeof _resultNull,
        Result<Readonly<{ stdout: Buffer; stderr: Buffer }>, ExecException>
      >('=');

      expectType<
        typeof _resultUtf8,
        Result<Readonly<{ stdout: string; stderr: string }>, ExecException>
      >('=');
    });

    test('should handle union types when encoding is not const', async () => {
      // Test that when we don't know the encoding at compile time,
      // we need to check the type at runtime
      const randomEncoding = Math.random() > 0.5 ? 'utf8' : 'buffer';

      if (randomEncoding === 'buffer') {
        const _result = await $('echo "test"', {
          encoding: randomEncoding,
          silent: true,
        });

        expectType<
          typeof _result,
          Result<Readonly<{ stdout: Buffer; stderr: Buffer }>, ExecException>
        >('=');
      } else {
        const _result = await $('echo "test"', {
          encoding: randomEncoding,
          silent: true,
        });

        expectType<
          typeof _result,
          Result<Readonly<{ stdout: string; stderr: string }>, ExecException>
        >('=');
      }
    });
  });

  describe('type correspondence with native exec', () => {
    test('should match exec callback types for default encoding', () => {
      // Type check for native exec with default options
      exec('echo "test"', (error, stdout, stderr) => {
        expectType<ExecException | null, typeof error>('=');
        expectType<string, typeof stdout>('=');
        expectType<string, typeof stderr>('=');
      });

      // The $ function should produce the same types wrapped in Result (suppressed for clean output)
      const _resultPromise = withSilentEcho(async () => $('echo "test"'));
      expectType<
        typeof _resultPromise,
        Promise<
          Result<Readonly<{ stdout: string; stderr: string }>, ExecException>
        >
      >('=');
    });

    test('should match exec callback types for buffer encoding', () => {
      // Type check for native exec with buffer encoding
      exec('echo "test"', { encoding: 'buffer' }, (error, stdout, stderr) => {
        expectType<ExecException | null, typeof error>('=');
        expectType<Buffer, typeof stdout>('>=');
        expectType<Buffer, typeof stderr>('>=');
      });

      // The $ function should produce the same types wrapped in Result (suppressed for clean output)
      const _resultPromise = withSilentEcho(async () =>
        $('echo "test"', { encoding: 'buffer' }),
      );
      expectType<
        typeof _resultPromise,
        Promise<
          Result<Readonly<{ stdout: Buffer; stderr: Buffer }>, ExecException>
        >
      >('~=');
    });

    test('should match exec callback types for null encoding', () => {
      // Type check for native exec with null encoding
      exec('echo "test"', { encoding: null }, (error, stdout, stderr) => {
        expectType<ExecException | null, typeof error>('=');
        expectType<Buffer, typeof stdout>('>=');
        expectType<Buffer, typeof stderr>('>=');
      });

      // The $ function should produce the same types wrapped in Result (suppressed for clean output)
      const _resultPromise = withSilentEcho(async () =>
        $('echo "test"', { encoding: null }),
      );
      expectType<
        typeof _resultPromise,
        Promise<
          Result<Readonly<{ stdout: Buffer; stderr: Buffer }>, ExecException>
        >
      >('=');
    });

    test('should match exec callback types for specific BufferEncoding', () => {
      // Type check for native exec with utf8 encoding
      exec('echo "test"', { encoding: 'utf8' }, (error, stdout, stderr) => {
        expectType<ExecException | null, typeof error>('=');
        expectType<string, typeof stdout>('=');
        expectType<string, typeof stderr>('=');
      });

      // The $ function should produce the same types wrapped in Result (suppressed for clean output)
      const _resultPromise = withSilentEcho(async () =>
        $('echo "test"', { encoding: 'utf8' }),
      );
      expectType<
        typeof _resultPromise,
        Promise<
          Result<Readonly<{ stdout: string; stderr: string }>, ExecException>
        >
      >('=');
    });

    test('should match exec callback types with custom options', () => {
      // Type check for native exec with custom options
      exec(
        'echo "test"',
        { encoding: 'utf8', timeout: 5000 },
        (error, stdout, stderr) => {
          expectType<ExecException | null, typeof error>('=');
          expectType<string, typeof stdout>('=');
          expectType<string, typeof stderr>('=');
        },
      );

      // The $ function with silent option should produce the same stdout/stderr types
      const _resultPromise = $('echo "test"', {
        encoding: 'utf8',
        silent: true,
      });
      expectType<
        typeof _resultPromise,
        Promise<
          Result<Readonly<{ stdout: string; stderr: string }>, ExecException>
        >
      >('=');
    });

    test('should demonstrate type equivalence with runtime comparison', async () => {
      // Mock console functions to suppress output
      const consoleLogSpy = vi
        // eslint-disable-next-line vitest/no-restricted-vi-methods
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      const consoleErrorSpy = vi
        // eslint-disable-next-line vitest/no-restricted-vi-methods
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const stderrWriteSpy = vi
        // eslint-disable-next-line vitest/no-restricted-vi-methods
        .spyOn(process.stderr, 'write')
        .mockImplementation(() => true);

      try {
        await withSilentEcho(async () => {
          // Create a type that represents what exec callback receives
          type ExecCallbackParams<T extends string | Buffer> = {
            error: ExecException | null;
            stdout: T;
            stderr: T;
          };

          // Helper to capture exec callback types
          const captureExecTypes = <T extends string | Buffer>(
            _encoding?: BufferEncoding | 'buffer' | null,
          ): ExecCallbackParams<T> => {
            const emptyParams: ExecCallbackParams<T> = {
              error: null,

              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              stdout: undefined as unknown as T,

              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              stderr: undefined as unknown as T,
            };
            return emptyParams;
          };

          // Default encoding comparison
          const _execDefault = captureExecTypes<string>();
          const $Default = await $('echo "test"', { silent: true });
          if (Result.isOk($Default)) {
            expectType<
              typeof _execDefault.stdout,
              typeof $Default.value.stdout
            >('=');
            expectType<
              typeof _execDefault.stderr,
              typeof $Default.value.stderr
            >('=');
          }

          // Buffer encoding comparison
          const _execBuffer = captureExecTypes<Buffer>('buffer');
          const $Buffer = await $('echo "test"', {
            encoding: 'buffer',
            silent: true,
          });
          if (Result.isOk($Buffer)) {
            expectType<typeof _execBuffer.stdout, typeof $Buffer.value.stdout>(
              '=',
            );
            expectType<typeof _execBuffer.stderr, typeof $Buffer.value.stderr>(
              '=',
            );
          }

          // Error type comparison
          if (Result.isErr($Default)) {
            expectType<ExecException, typeof $Default.value>('=');
          }
        });
      } finally {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        stderrWriteSpy.mockRestore();
      }
    });
  });
});
