import { Result } from 'ts-data-forge';
import { proxiedFetchTransport, useEnvProxy } from './proxy.mjs';

describe(useEnvProxy, () => {
  test('passes the environment it was given', () => {
    const mut_seen: (string | undefined)[] = [];

    const result = useEnvProxy(
      { HTTPS_PROXY: 'http://given' },
      {
        setGlobalProxyFromEnv: (env) => {
          mut_seen.push(env['HTTPS_PROXY']);
        },
      },
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(mut_seen, ['http://given']);
  });

  test('a proxy that does not parse is the error, not a throw', () => {
    const result = useEnvProxy(
      { HTTPS_PROXY: 'not a url' },
      {
        setGlobalProxyFromEnv: () => {
          throw new Error('ERR_PROXY_INVALID_CONFIG');
        },
      },
    );

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'ERR_PROXY_INVALID_CONFIG');
  });

  test('an older Node is left as it was started', () => {
    assert.isTrue(
      Result.isOk(
        useEnvProxy(
          { HTTPS_PROXY: 'http://proxy' },
          { setGlobalProxyFromEnv: undefined },
        ),
      ),
    );
  });
});

describe(proxiedFetchTransport, () => {
  test('a transport once fetch is told, and none when telling it fails', () => {
    const mut_told: string[] = [];

    assert.isTrue(
      Result.isOk(
        proxiedFetchTransport(
          {},
          {
            setGlobalProxyFromEnv: () => {
              mut_told.push('told');
            },
          },
          fetch,
        ),
      ),
    );

    assert.deepStrictEqual(mut_told, ['told']);

    assert.isTrue(
      Result.isErr(
        proxiedFetchTransport(
          {},
          {
            setGlobalProxyFromEnv: () => {
              throw new Error('bad');
            },
          },
          fetch,
        ),
      ),
    );
  });
});
