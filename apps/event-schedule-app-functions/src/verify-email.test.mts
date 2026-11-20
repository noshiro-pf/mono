import { https } from 'firebase-functions/v1';
import {
  emailCheckLimit,
  emailCheckWindowMillis,
  nextEmailChecks,
  verifyEmailImpl,
  type VerifyEmailDeps,
} from './verify-email.mjs';

describe(verifyEmailImpl, () => {
  const payload = { eventId: 'e1', email: 'author@example.com' } as const;

  test('compares the email of an event made signed out, once a check is claimed', async () => {
    const deps = fakeDeps({ authorId: null });

    assert.strictEqual(await verifyEmailImpl(payload, undefined, deps), 'ok');

    assert.strictEqual(
      await verifyEmailImpl(
        { ...payload, email: 'other@example.com' },
        undefined,
        deps,
      ),
      'ng',
    );

    assert.deepStrictEqual(deps.calls, [
      'claim e1',
      'email e1',
      'claim e1',
      'email e1',
    ]);
  });

  test('refuses once the checks of an event made signed out are used up, without reading the email', async () => {
    const deps = fakeDeps({ authorId: null, claims: false });

    const error = await rejectionOf(verifyEmailImpl(payload, undefined, deps));

    assert.instanceOf(error, https.HttpsError);

    assert.strictEqual(error.code, 'resource-exhausted');

    assert.deepStrictEqual(deps.calls, ['claim e1']);
  });

  test('compares the email of a signed-in author’s event for that author', async () => {
    const deps = fakeDeps({ authorId: 'bob' });

    assert.strictEqual(await verifyEmailImpl(payload, 'bob', deps), 'ok');

    assert.deepStrictEqual(deps.calls, ['email e1']);
  });

  test.each([
    { name: 'a signed-out caller', callerUid: undefined },
    { name: 'another signed-in user', callerUid: 'alice' },
  ] as const)(
    'refuses $name on a signed-in author’s event, without reading the email',
    async ({ callerUid }) => {
      const deps = fakeDeps({ authorId: 'bob' });

      const error = await rejectionOf(
        verifyEmailImpl(payload, callerUid, deps),
      );

      assert.instanceOf(error, https.HttpsError);

      assert.strictEqual(error.code, 'permission-denied');

      assert.deepStrictEqual(deps.calls, []);
    },
  );

  test('refuses everyone on the event of a deleted account', async () => {
    const deps = fakeDeps({ authorId: '' });

    const error = await rejectionOf(verifyEmailImpl(payload, undefined, deps));

    assert.instanceOf(error, https.HttpsError);

    assert.strictEqual(error.code, 'permission-denied');

    assert.deepStrictEqual(deps.calls, []);
  });

  test('answers ng for an event with no email, the empty email included', async () => {
    const deps = fakeDeps({ authorId: null, email: '' });

    assert.strictEqual(
      await verifyEmailImpl({ ...payload, email: '' }, undefined, deps),
      'ng',
    );
  });

  test('answers ng for an event that does not exist', async () => {
    const deps = fakeDeps({ authorId: undefined });

    assert.strictEqual(await verifyEmailImpl(payload, undefined, deps), 'ng');

    assert.deepStrictEqual(deps.calls, []);
  });
});

describe(nextEmailChecks, () => {
  const now = 1_000_000_000;

  test('starts a window at the first check', () => {
    assert.deepStrictEqual(nextEmailChecks(undefined, now), {
      allowed: true,
      next: { windowStartMillis: now, count: 1 },
    });
  });

  test('counts checks within the window up to the limit, then refuses', () => {
    assert.deepStrictEqual(
      nextEmailChecks(
        { windowStartMillis: now, count: emailCheckLimit - 1 },
        now + 1,
      ),
      {
        allowed: true,
        next: { windowStartMillis: now, count: emailCheckLimit },
      },
    );

    assert.deepStrictEqual(
      nextEmailChecks(
        { windowStartMillis: now, count: emailCheckLimit },
        now + 1,
      ),
      {
        allowed: false,
        next: { windowStartMillis: now, count: emailCheckLimit },
      },
    );
  });

  test('starts a new window once the last one is over', () => {
    assert.deepStrictEqual(
      nextEmailChecks(
        { windowStartMillis: now, count: emailCheckLimit },
        now + emailCheckWindowMillis,
      ),
      {
        allowed: true,
        next: { windowStartMillis: now + emailCheckWindowMillis, count: 1 },
      },
    );
  });

  test('starts a new window over a record it cannot read', () => {
    assert.deepStrictEqual(nextEmailChecks({ count: 'x' }, now), {
      allowed: true,
      next: { windowStartMillis: now, count: 1 },
    });
  });

  test('starts a new window over one that begins in the future', () => {
    assert.deepStrictEqual(
      nextEmailChecks(
        { windowStartMillis: now + 1, count: emailCheckLimit },
        now,
      ),
      {
        allowed: true,
        next: { windowStartMillis: now, count: 1 },
      },
    );
  });
});

const fakeDeps = ({
  authorId,
  claims = true,
  email = 'author@example.com',
}: Readonly<{
  authorId: string | null | undefined;
  claims?: boolean;
  email?: string;
}>): VerifyEmailDeps & Readonly<{ calls: readonly string[] }> => {
  const mut_calls: string[] = [];

  return {
    calls: mut_calls,
    readAuthorId: (eventId) => {
      assert.strictEqual(eventId, 'e1');

      return Promise.resolve(authorId);
    },
    readEmail: (eventId) => {
      mut_calls.push(`email ${eventId}`);

      return Promise.resolve(email);
    },
    claimCheck: (eventId) => {
      mut_calls.push(`claim ${eventId}`);

      return Promise.resolve(claims);
    },
  };
};

/** What `promise` rejects with, or `undefined` once it resolves. */
const rejectionOf = async (promise: Promise<unknown>): Promise<unknown> =>
  promise.then(() => undefined).catch((error_: unknown) => error_);
