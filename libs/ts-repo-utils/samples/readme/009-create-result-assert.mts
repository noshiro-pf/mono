import { hasKey, isNumber, isRecord, isString, Result } from 'ts-data-forge';
import { createResultAssert } from 'ts-repo-utils';

type AppConfig = Readonly<{ port: number; host: string }>;

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

  if (
    !isRecord(parsed) ||
    !hasKey(parsed, 'port') ||
    !hasKey(parsed, 'host') ||
    !isNumber(parsed.port) ||
    !isString(parsed.host)
  ) {
    return Promise.resolve(Result.err({ message: 'Invalid config shape' }));
  }

  return Promise.resolve(Result.ok({ port: parsed.port, host: parsed.host }));
};

const assertValidConfig = createResultAssert({
  run: parseConfig,
  onSuccess: (config) => {
    console.log(`✓ Config loaded: ${config.host}:${config.port}`);
  },
});

await assertValidConfig('{"port":3000,"host":"localhost"}');
