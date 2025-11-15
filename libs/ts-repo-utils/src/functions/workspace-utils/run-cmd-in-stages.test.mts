/* eslint-disable vitest/no-restricted-vi-methods */
import { type MockInstance } from 'vitest';
import '../../node-global.mjs';
import { executeStages } from './execute-parallel.mjs';
import { getWorkspacePackages } from './get-workspace-packages.mjs';
import { runCmdInStagesAcrossWorkspaces } from './run-cmd-in-stages.mjs';
import { type Package } from './types.mjs';

// Mock the dependencies
vi.mock(import('./execute-parallel.mjs'), () => ({
  executeStages: vi.fn(),
}));

vi.mock(import('./get-workspace-packages.mjs'), () => ({
  getWorkspacePackages: vi.fn(),
}));

describe(runCmdInStagesAcrossWorkspaces, () => {
  type MockedSpies = Readonly<{
    consoleLogSpy: MockInstance<typeof console.log>;
    consoleErrorSpy: MockInstance<typeof console.error>;
    processExitSpy: MockInstance<typeof process.exit>;
  }>;

  const setupSpies = (): MockedSpies => {
    vi.clearAllMocks();

    const consoleLogSpy = vi
      .spyOn(console, 'log')
      .mockImplementation((): void => {});

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation((): void => {});

    const processExitSpy = vi
      .spyOn(process, 'exit')
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      .mockImplementation((): never => undefined as never);

    return { consoleLogSpy, consoleErrorSpy, processExitSpy };
  };

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  const cleanupSpies = (spies: MockedSpies): void => {
    spies.consoleLogSpy.mockRestore();

    spies.consoleErrorSpy.mockRestore();

    spies.processExitSpy.mockRestore();
  };

  test('should fail fast and exit immediately when executeStages throws an error', async () => {
    const spies = setupSpies();

    try {
      // Mock workspace packages
      const mockPackages: Package[] = [
        {
          name: 'package-a',
          path: '/test/package-a',
          packageJson: { name: 'package-a', scripts: { test: 'exit 1' } },
          dependencies: {},
        },
        {
          name: 'package-b',
          path: '/test/package-b',
          packageJson: { name: 'package-b', scripts: { test: 'echo success' } },
          dependencies: {},
        },
        {
          name: 'package-c',
          path: '/test/package-c',
          packageJson: { name: 'package-c', scripts: { test: 'echo success' } },
          dependencies: {},
        },
      ];

      vi.mocked(getWorkspacePackages).mockResolvedValue(mockPackages);

      // Mock executeStages to throw an error (simulating a failed command)
      const mockError = new Error('package-a exited with code 1');

      vi.mocked(executeStages).mockRejectedValue(mockError);

      // Record start time
      const startTime = Date.now();

      // Execute the function
      await runCmdInStagesAcrossWorkspaces({
        rootPackageJsonDir: '/test',
        cmd: 'test',
        concurrency: 2,
      });

      // Record end time
      const endTime = Date.now();

      const executionTime = endTime - startTime;

      // Verify that execution was fast (fail-fast behavior)
      // Should complete within 100ms since it should fail immediately
      expect(executionTime).toBeLessThan(100);

      // Verify executeStages was called
      expect(executeStages).toHaveBeenCalledWith(mockPackages, 'test', 2);

      // Verify console.error was called with fail-fast message
      expect(spies.consoleErrorSpy).toHaveBeenCalledWith(
        '\n❌ test failed (fail-fast mode stopped execution):',
      );

      expect(spies.consoleErrorSpy).toHaveBeenCalledWith(
        'package-a exited with code 1',
      );

      // Verify process.exit was called with code 1
      expect(spies.processExitSpy).toHaveBeenCalledWith(1);

      // Verify success message was NOT called
      expect(spies.consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('✅ test completed successfully'),
      );
    } finally {
      cleanupSpies(spies);
    }
  });

  test('should complete successfully when no errors occur', async () => {
    const spies = setupSpies();

    try {
      // Mock workspace packages
      const mockPackages: Package[] = [
        {
          name: 'package-a',
          path: '/test/package-a',
          packageJson: { name: 'package-a', scripts: { test: 'echo test' } },
          dependencies: {},
        },
        {
          name: 'package-b',
          path: '/test/package-b',
          packageJson: { name: 'package-b', scripts: { test: 'echo test' } },
          dependencies: {},
        },
      ];

      vi.mocked(getWorkspacePackages).mockResolvedValue(mockPackages);

      vi.mocked(executeStages).mockResolvedValue(undefined);

      // Execute the function
      await runCmdInStagesAcrossWorkspaces({
        rootPackageJsonDir: '/test',
        cmd: 'test',
        concurrency: 2,
      });

      // Verify executeStages was called
      expect(executeStages).toHaveBeenCalledWith(mockPackages, 'test', 2);

      // Verify success messages were called
      expect(spies.consoleLogSpy).toHaveBeenCalledWith(
        '\nStarting test across 2 packages (fail-fast mode)...',
      );

      expect(spies.consoleLogSpy).toHaveBeenCalledWith(
        '\n✅ test completed successfully (all stages)',
      );

      // Verify process.exit was NOT called
      expect(spies.processExitSpy).not.toHaveBeenCalled();

      // Verify error messages were NOT called
      expect(spies.consoleErrorSpy).not.toHaveBeenCalled();
    } finally {
      cleanupSpies(spies);
    }
  });

  test('should apply package filtering correctly', async () => {
    const spies = setupSpies();

    try {
      // Mock workspace packages
      const mockPackages: Package[] = [
        {
          name: 'package-a',
          path: '/test/package-a',
          packageJson: { name: 'package-a', scripts: { test: 'echo test' } },
          dependencies: {},
        },
        {
          name: 'package-b',
          path: '/test/package-b',
          packageJson: { name: 'package-b', scripts: { test: 'echo test' } },
          dependencies: {},
        },
        {
          name: 'other-package',
          path: '/test/other-package',
          packageJson: {
            name: 'other-package',
            scripts: { test: 'echo test' },
          },
          dependencies: {},
        },
      ];

      vi.mocked(getWorkspacePackages).mockResolvedValue(mockPackages);

      vi.mocked(executeStages).mockResolvedValue(undefined);

      // Filter to only packages starting with 'package-'
      const filterFn = (name: string): boolean => name.startsWith('package-');

      // Execute the function with filter
      await runCmdInStagesAcrossWorkspaces({
        rootPackageJsonDir: '/test',
        cmd: 'test',
        concurrency: 2,
        filterWorkspacePattern: filterFn,
      });

      // Verify executeStages was called with filtered packages
      const expectedFilteredPackages = mockPackages.filter((pkg) =>
        pkg.name.startsWith('package-'),
      );

      expect(executeStages).toHaveBeenCalledWith(
        expectedFilteredPackages,
        'test',
        2,
      );

      // Verify log shows correct package count
      expect(spies.consoleLogSpy).toHaveBeenCalledWith(
        '\nStarting test across 2 packages (fail-fast mode)...',
      );
    } finally {
      cleanupSpies(spies);
    }
  });

  test('should handle workspace package loading errors', async () => {
    const spies = setupSpies();

    try {
      // Mock getWorkspacePackages to throw an error
      const mockError = new Error('Failed to load workspace packages');

      vi.mocked(getWorkspacePackages).mockRejectedValue(mockError);

      // Execute the function
      await runCmdInStagesAcrossWorkspaces({
        rootPackageJsonDir: '/test',
        cmd: 'test',
        concurrency: 2,
      });

      // Verify executeStages was NOT called
      expect(executeStages).not.toHaveBeenCalled();

      // Verify error handling
      expect(spies.consoleErrorSpy).toHaveBeenCalledWith(
        '\n❌ test failed (fail-fast mode stopped execution):',
      );

      expect(spies.consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load workspace packages',
      );

      expect(spies.processExitSpy).toHaveBeenCalledWith(1);
    } finally {
      cleanupSpies(spies);
    }
  });
});
