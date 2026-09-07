import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import { hasKey, isRecord, Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { nativeTscPath } from './native-tsc.mjs';

/** What `tsc --showConfig` resolves a project to (the parts Sumi reads). */
export type EffectiveTsConfig = Readonly<{
  /** Effective compilerOptions, `extends` chains resolved. */
  compilerOptions: ReadonlyRecord<string, unknown>;
  /** Every file in the program, absolute. */
  files: readonly string[];
}>;

/**
 * Resolves a project's effective configuration through the native compiler's
 * `--showConfig` — the same resolution the type check uses, so what the
 * lock is checked against is exactly what the compiler sees.
 */
export const showConfig = (
  tsconfigPath: string,
): Result<EffectiveTsConfig, string> => {
  const result = spawnSync(
    process.execPath,
    [nativeTscPath, '--showConfig', '-p', tsconfigPath],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );

  if (result.status !== 0) {
    return Result.err(
      `tsc --showConfig failed for ${tsconfigPath}:\n${result.stdout}${result.stderr}`,
    );
  }

  const parsed: unknown = JSON.parse(result.stdout);

  if (!isRecord(parsed)) {
    return Result.err('tsc --showConfig printed no JSON object');
  }

  const compilerOptions = hasKey(parsed, 'compilerOptions')
    ? parsed.compilerOptions
    : undefined;

  const files = hasKey(parsed, 'files') ? parsed.files : undefined;

  const projectDir = path.dirname(path.resolve(tsconfigPath));

  return Result.ok({
    compilerOptions: isRecord(compilerOptions) ? compilerOptions : {},
    files: Array.isArray(files)
      ? files
          .filter((file): file is string => typeof file === 'string')
          .map((file) => path.resolve(projectDir, file))
      : [],
  });
};
