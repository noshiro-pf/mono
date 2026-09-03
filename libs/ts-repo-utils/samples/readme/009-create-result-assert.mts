import { hasKey, isNumber, isRecord, Result } from 'ts-data-forge';
import { createResultAssert } from 'ts-repo-utils';

type AppConfig = Readonly<{ port: number }>;

const parseConfig = (
  raw: string,
): Promise<Result<AppConfig, Readonly<{ message: string }>>> => {
  const parsed: unknown = ((): unknown => {
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  })();

  if (!isRecord(parsed) || !hasKey(parsed, 'port') || !isNumber(parsed.port)) {
    return Promise.resolve(Result.err({ message: 'Invalid config shape' }));
  }

  return Promise.resolve(Result.ok({ port: parsed.port }));
};

const assertValidConfig = createResultAssert({
  run: parseConfig,
  onSuccess: (config) => {
    console.log(`✓ Config loaded on port ${config.port}`);
  },
});

await assertValidConfig('{"port":3000}');
