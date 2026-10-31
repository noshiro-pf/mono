/**
 * `firestore.rules` against the Firestore emulator. Run by `pnpm run
 * test:rules`, which starts the emulator and sets `FIRESTORE_EMULATOR_HOST`;
 * `check:test` does not read this directory (README.md: ルールのテスト).
 *
 * Each case starts from the same data (`seed`): one plan of Alice's and one of
 * Bob's.
 */
import {
  initializeTestEnvironment,
  type RulesTestContext,
} from '@firebase/rules-unit-testing';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { hasKey, isRecord } from 'ts-data-forge';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';

const env = await initializeTestEnvironment({
  // The same id as `--project` in the `test:rules` script. `demo-` makes the
  // emulator refuse to reach any real project.
  projectId: 'demo-life-plan-simulator',
  firestore: {
    rules: await fs.readFile(
      path.resolve(import.meta.dirname, '../firestore.rules'),
      'utf8',
    ),
  },
});

describe('firestore.rules', () => {
  test.each(cases())('$name', async ({ actor, operation, expected }) => {
    await seed();

    assert.strictEqual(await outcome(operation(firestoreFor(actor))), expected);
  });
});

type Firestore = ReturnType<RulesTestContext['firestore']>;

type Actor =
  | Readonly<{ uid: string; provider: 'google.com' | 'password' | 'custom' }>
  | 'signed out';

type Case = Readonly<{
  name: string;
  actor: Actor;
  operation: (db: DeepReadonly<Firestore>) => Promise<unknown>;
  expected: 'allowed' | 'denied';
}>;

/** A plan as the app writes it; the rules do not read what `input` holds. */
const plan = (): ReadonlyRecord<string, unknown> =>
  ({
    name: 'Plan',
    createdAt: 0,
    updatedAt: 0,
    input: { profile: { birth: '1990-04' } },
  }) as const;

const cases = (): readonly Case[] => {
  const alice = { uid: 'alice', provider: 'google.com' } as const;

  return [
    // One's own plans.
    {
      name: 'lists their own plans',
      actor: alice,
      operation: (db) => db.collection('users/alice/plans').get(),
      expected: 'allowed',
    },
    {
      name: 'reads their own plan',
      actor: alice,
      operation: (db) => db.doc('users/alice/plans/p1').get(),
      expected: 'allowed',
    },
    {
      name: 'creates a plan',
      actor: alice,
      operation: (db) => db.doc('users/alice/plans/p2').set(plan()),
      expected: 'allowed',
    },
    {
      name: 'replaces a plan',
      actor: alice,
      operation: (db) =>
        db.doc('users/alice/plans/p1').set({ ...plan(), name: 'renamed' }),
      expected: 'allowed',
    },
    {
      name: 'updates a field of a plan',
      actor: alice,
      operation: (db) =>
        db.doc('users/alice/plans/p1').update({ updatedAt: 1 }),
      expected: 'allowed',
    },
    {
      name: 'deletes a plan',
      actor: alice,
      operation: (db) => db.doc('users/alice/plans/p1').delete(),
      expected: 'allowed',
    },

    // The shape of a plan.
    {
      name: 'writes a plan with an unknown field',
      actor: alice,
      operation: (db) =>
        db.doc('users/alice/plans/p2').set({ ...plan(), x: 1 }),
      expected: 'denied',
    },
    {
      name: 'writes a plan whose name is not a string',
      actor: alice,
      operation: (db) =>
        db.doc('users/alice/plans/p2').set({ ...plan(), name: 1 }),
      expected: 'denied',
    },
    {
      name: 'writes a plan whose input is not a map',
      actor: alice,
      operation: (db) =>
        db.doc('users/alice/plans/p2').set({ ...plan(), input: 'x' }),
      expected: 'denied',
    },

    // Someone else's plans.
    {
      name: 'lists another user’s plans',
      actor: alice,
      operation: (db) => db.collection('users/bob/plans').get(),
      expected: 'denied',
    },
    {
      name: 'reads another user’s plan',
      actor: alice,
      operation: (db) => db.doc('users/bob/plans/p1').get(),
      expected: 'denied',
    },
    {
      name: 'writes a plan for another user',
      actor: alice,
      operation: (db) => db.doc('users/bob/plans/p2').set(plan()),
      expected: 'denied',
    },
    {
      name: 'deletes another user’s plan',
      actor: alice,
      operation: (db) => db.doc('users/bob/plans/p1').delete(),
      expected: 'denied',
    },

    // Anything outside `users/{uid}/plans`.
    {
      name: 'writes their own user document',
      actor: alice,
      operation: (db) => db.doc('users/alice').set({ a: 1 }),
      expected: 'denied',
    },
    {
      name: 'reads their own user document',
      actor: alice,
      operation: (db) => db.doc('users/alice').get(),
      expected: 'denied',
    },
    {
      name: 'lists the users',
      actor: alice,
      operation: (db) => db.collection('users').get(),
      expected: 'denied',
    },
    {
      name: 'writes another collection under their own user',
      actor: alice,
      operation: (db) => db.doc('users/alice/other/x').set({ a: 1 }),
      expected: 'denied',
    },
    {
      name: 'writes a top-level collection other than users',
      actor: alice,
      operation: (db) => db.doc('plans/p1').set(plan()),
      expected: 'denied',
    },

    // A token from a provider other than Google, even for one's own plans.
    ...(['password', 'custom'] as const).flatMap(
      (provider) =>
        [
          {
            name: `${provider}: lists their own plans`,
            actor: { uid: 'alice', provider },
            operation: (db) => db.collection('users/alice/plans').get(),
            expected: 'denied',
          },
          {
            name: `${provider}: creates a plan`,
            actor: { uid: 'alice', provider },
            operation: (db) => db.doc('users/alice/plans/p2').set(plan()),
            expected: 'denied',
          },
        ] as const satisfies readonly Case[],
    ),

    // Signed out.
    {
      name: 'signed out: lists plans',
      actor: 'signed out',
      operation: (db) => db.collection('users/alice/plans').get(),
      expected: 'denied',
    },
    {
      name: 'signed out: writes a plan',
      actor: 'signed out',
      operation: (db) => db.doc('users/alice/plans/p2').set(plan()),
      expected: 'denied',
    },
  ];
};

/** Empties the emulator and writes the data every case starts from. */
const seed = async (): Promise<void> => {
  await env.clearFirestore();

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    const batch = db.batch();

    batch.set(db.doc('users/alice/plans/p1'), plan());

    batch.set(db.doc('users/bob/plans/p1'), plan());

    await batch.commit();
  });
};

const firestoreFor = (actor: Actor): Firestore =>
  (actor === 'signed out'
    ? env.unauthenticatedContext()
    : env.authenticatedContext(actor.uid, {
        firebase: { sign_in_provider: actor.provider },
      })
  ).firestore();

/**
 * Whether the rules let the operation through. Any error other than a refusal
 * by the rules is rethrown, so that a broken case does not pass as `denied`.
 */
const outcome = async (
  operation: Promise<unknown>,
): Promise<'allowed' | 'denied'> => {
  try {
    await operation;

    return 'allowed';
  } catch (error) {
    if (
      isRecord(error) &&
      hasKey(error, 'code') &&
      error.code === 'permission-denied'
    ) {
      return 'denied';
    }

    throw error;
  }
};
