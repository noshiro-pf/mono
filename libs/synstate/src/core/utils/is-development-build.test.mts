// cspell:ignore unstub
import { isDevelopmentBuild } from './is-development-build.mjs';

describe(isDevelopmentBuild, () => {
  test('is true when NODE_ENV is development', () => {
    restoreAfterTest();

    vi.stubEnv('NODE_ENV', 'development');

    assert.isTrue(isDevelopmentBuild());
  });

  test('is true when NODE_ENV is not set', () => {
    restoreAfterTest();

    vi.stubEnv('NODE_ENV', undefined);

    assert.isTrue(isDevelopmentBuild());
  });

  test('is false when NODE_ENV is production', () => {
    restoreAfterTest();

    vi.stubEnv('NODE_ENV', 'production');

    assert.isFalse(isDevelopmentBuild());
  });

  test('is false where there is no process and nothing replaced the expression', () => {
    restoreAfterTest();

    vi.stubGlobal('process', undefined);

    assert.isFalse(isDevelopmentBuild());
  });
});

const restoreAfterTest = (): void => {
  onTestFinished(() => {
    vi.unstubAllEnvs();

    vi.unstubAllGlobals();
  });
};
