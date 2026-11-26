import { runNodeScript } from '@sumi-lang/oxlint-config';
import * as path from 'node:path';
import { hasKey, isRecord, Json, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
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
 * `--showConfig` — the same resolution the type check uses, so what the lock is
 * checked against is exactly what the compiler sees.
 */
export const showConfig = async (
  tsconfigPath: string,
): Promise<Result<EffectiveTsConfig, string>> => {
  const { status, failure, stdout, stderr } = await runNodeScript(
    [nativeTscPath, '--showConfig', '-p', tsconfigPath],
    'tsc --showConfig',
  );

  if (failure !== undefined || status !== 0) {
    return Result.err(
      `tsc --showConfig failed for ${tsconfigPath}${failure === undefined ? '' : ` (${failure})`}:\n${stdout}${stderr}`,
    );
  }

  const json = Json.parse(stdout);

  if (Result.isErr(json)) {
    return Result.err(
      `tsc --showConfig printed no JSON for ${tsconfigPath}: ${json.value}`,
    );
  }

  const parsed = json.value;

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
