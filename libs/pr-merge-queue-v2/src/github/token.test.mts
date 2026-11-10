import { Result } from 'ts-data-forge';
import { resolveToken, tokenFromEnv } from './token.mjs';

describe(tokenFromEnv, () => {
  test('GH_TOKEN before GITHUB_TOKEN, as gh reads them; blank is none', () => {
    assert.strictEqual(tokenFromEnv({ GH_TOKEN: 'a', GITHUB_TOKEN: 'b' }), 'a');

    assert.strictEqual(tokenFromEnv({ GH_TOKEN: ' ', GITHUB_TOKEN: 'b' }), 'b');

    assert.isUndefined(tokenFromEnv({}));
  });

  test('trims the token, as gh’s is', () => {
    assert.strictEqual(tokenFromEnv({ GH_TOKEN: ' a\n' }), 'a');
  });
});

describe(resolveToken, () => {
  test('asks gh only when the environment holds none', async () => {
    const mut_asked: string[] = [];

    const gh = (): Promise<Result<string, string>> => {
      mut_asked.push('gh');

      return Promise.resolve(Result.ok('from-gh\n'));
    };

    assert.deepStrictEqual(
      await resolveToken({ GH_TOKEN: 'env' }, gh),
      Result.ok('env'),
    );

    assert.deepStrictEqual(mut_asked, []);

    assert.deepStrictEqual(await resolveToken({}, gh), Result.ok('from-gh'));
  });

  test('refuses without one', async () => {
    const result = await resolveToken({}, () =>
      Promise.resolve(Result.err('gh: not found')),
    );

    assert.isTrue(Result.isErr(result));
  });
});
