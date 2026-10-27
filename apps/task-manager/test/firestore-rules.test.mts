/**
 * `firestore.rules` against the Firestore emulator. Run by `pnpm run
 * test:rules`, which starts the emulator and sets `FIRESTORE_EMULATOR_HOST`;
 * `check:test` does not read this directory (README.md: ルールのテスト).
 *
 * Each case starts from the same data (`seed`): Bob's personal project, and
 * a project of Bob's that lists Alice as a member. Carol is a member of
 * neither.
 */
import {
  initializeTestEnvironment,
  type RulesTestContext,
} from '@firebase/rules-unit-testing';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';

const env = await initializeTestEnvironment({
  // The same id as `--project` in the `test:rules` script. `demo-` makes the
  // emulator refuse to reach any real project.
  projectId: 'demo-task-manager-app',
  firestore: {
    rules: await fs.readFile(
      path.resolve(import.meta.dirname, '../firestore.rules'),
      'utf8',
    ),
  },
});

const shared = 'shared-project';

const subcollections = ['tasks', 'milestones', 'groups'] as const;

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

const cases = (): readonly Case[] => {
  const alice = { uid: 'alice', provider: 'google.com' } as const;

  const carol = { uid: 'carol', provider: 'google.com' } as const;

  return [
    // One's own personal project, whose id is one's uid.
    {
      name: 'reads their own personal project before it exists',
      actor: alice,
      operation: (db) => db.doc('projects/alice').get(),
      expected: 'allowed',
    },
    {
      name: 'creates their own personal project',
      actor: alice,
      operation: (db) => db.doc('projects/alice').set(project('alice')),
      expected: 'allowed',
    },
    ...Arr.toPushed(subcollections, 'settings').flatMap((collection) => {
      const docPath = docIn('alice', collection);

      return [
        {
          name: `writes ${docPath} before the project exists`,
          actor: alice,
          operation: (db) => db.doc(docPath).set({ a: 1 }),
          expected: 'allowed',
        },
        {
          name: `reads projects/alice/${collection}`,
          actor: alice,
          operation: (db) =>
            db.collection(`projects/alice/${collection}`).get(),
          expected: 'allowed',
        },
        {
          name: `deletes ${docPath}`,
          actor: alice,
          operation: (db) => db.doc(docPath).delete(),
          expected: 'allowed',
        },
      ] as const satisfies readonly Case[];
    }),

    // A project one is a member of.
    {
      name: 'a member reads the shared project',
      actor: alice,
      operation: (db) => db.doc(`projects/${shared}`).get(),
      expected: 'allowed',
    },
    ...subcollections.flatMap(
      (collection) =>
        [
          {
            name: `a member reads and writes ${collection} of the shared project`,
            actor: alice,
            operation: async (db) => {
              await db.collection(`projects/${shared}/${collection}`).get();

              await db.doc(`projects/${shared}/${collection}/n2`).set({ a: 1 });
            },
            expected: 'allowed',
          },
        ] as const satisfies readonly Case[],
    ),
    {
      name: 'a member writes the shared project’s layout',
      actor: alice,
      operation: (db) =>
        db.doc(`projects/${shared}/settings/dagLayout`).set({ a: 1 }),
      expected: 'allowed',
    },

    // Someone else's project.
    ...(['bob', shared] as const).flatMap(
      (projectId) =>
        [
          {
            name: `a non-member reads projects/${projectId}`,
            actor: carol,
            operation: (db) => db.doc(`projects/${projectId}`).get(),
            expected: 'denied',
          },
        ] as const satisfies readonly Case[],
    ),
    ...(['bob', shared] as const).flatMap((projectId) =>
      Arr.toPushed(subcollections, 'settings').flatMap(
        (collection) =>
          [
            {
              name: `a non-member reads projects/${projectId}/${collection}`,
              actor: carol,
              operation: (db) =>
                db.collection(`projects/${projectId}/${collection}`).get(),
              expected: 'denied',
            },
            {
              name: `a non-member writes projects/${projectId}/${collection}`,
              actor: carol,
              operation: (db) =>
                db.doc(docIn(projectId, collection)).set({ a: 1 }),
              expected: 'denied',
            },
            {
              name: `a non-member deletes from projects/${projectId}/${collection}`,
              actor: carol,
              operation: (db) => db.doc(docIn(projectId, collection)).delete(),
              expected: 'denied',
            },
          ] as const satisfies readonly Case[],
      ),
    ),
    {
      name: 'reads a project that neither exists nor is their own',
      actor: alice,
      operation: (db) => db.doc('projects/nobody').get(),
      expected: 'denied',
    },

    // Creating, listing, updating and deleting projects.
    {
      name: 'creates a personal project under another uid',
      actor: alice,
      operation: (db) => db.doc('projects/carol').set(project('alice')),
      expected: 'denied',
    },
    {
      name: 'creates a project under an id that is not a uid',
      actor: alice,
      operation: (db) => db.doc('projects/p2').set(project('alice')),
      expected: 'denied',
    },
    {
      name: 'creates their own project owned by someone else',
      actor: alice,
      operation: (db) =>
        db.doc('projects/alice').set({ ...project('alice'), ownerUid: 'bob' }),
      expected: 'denied',
    },
    {
      name: 'creates their own project with another member',
      actor: alice,
      operation: (db) =>
        db
          .doc('projects/alice')
          .set({ ...project('alice'), memberUids: ['alice', 'bob'] }),
      expected: 'denied',
    },
    {
      name: 'creates their own project with an unknown field',
      actor: alice,
      operation: (db) =>
        db.doc('projects/alice').set({ ...project('alice'), x: 1 }),
      expected: 'denied',
    },
    {
      name: 'lists projects',
      actor: alice,
      operation: (db) => db.collection('projects').get(),
      expected: 'denied',
    },
    {
      name: 'updates their own project',
      actor: alice,
      operation: async (db) => {
        await db.doc('projects/alice').set(project('alice'));

        await db.doc('projects/alice').update({ name: 'renamed' });
      },
      expected: 'denied',
    },
    {
      name: 'deletes their own project',
      actor: alice,
      operation: async (db) => {
        await db.doc('projects/alice').set(project('alice'));

        await db.doc('projects/alice').delete();
      },
      expected: 'denied',
    },
    {
      name: 'a member updates the shared project',
      actor: alice,
      operation: (db) =>
        db.doc(`projects/${shared}`).update({ name: 'renamed' }),
      expected: 'denied',
    },

    // Anything outside `projects/{projectId}` and its four collections.
    {
      name: 'writes a top-level collection other than projects',
      actor: alice,
      operation: (db) => db.doc('users/alice').set({ a: 1 }),
      expected: 'denied',
    },
    {
      name: 'reads a top-level collection other than projects',
      actor: alice,
      operation: (db) => db.doc('users/alice').get(),
      expected: 'denied',
    },
    {
      name: 'writes another collection under their own project',
      actor: alice,
      operation: (db) => db.doc('projects/alice/other/x').set({ a: 1 }),
      expected: 'denied',
    },

    // A token from a provider other than Google, even for one's own project.
    ...(['password', 'custom'] as const).flatMap(
      (provider) =>
        [
          {
            name: `${provider}: reads their own personal project`,
            actor: { uid: 'alice', provider },
            operation: (db) => db.doc('projects/alice').get(),
            expected: 'denied',
          },
          {
            name: `${provider}: creates their own personal project`,
            actor: { uid: 'alice', provider },
            operation: (db) => db.doc('projects/alice').set(project('alice')),
            expected: 'denied',
          },
          {
            name: `${provider}: writes a task in their own personal project`,
            actor: { uid: 'alice', provider },
            operation: (db) => db.doc('projects/alice/tasks/n1').set({ a: 1 }),
            expected: 'denied',
          },
          {
            name: `${provider}: reads a project they are a member of`,
            actor: { uid: 'alice', provider },
            operation: (db) => db.collection(`projects/${shared}/tasks`).get(),
            expected: 'denied',
          },
        ] as const satisfies readonly Case[],
    ),

    // Signed out.
    {
      name: 'signed out: reads a project',
      actor: 'signed out',
      operation: (db) => db.doc('projects/bob').get(),
      expected: 'denied',
    },
    {
      name: 'signed out: lists projects',
      actor: 'signed out',
      operation: (db) => db.collection('projects').get(),
      expected: 'denied',
    },
    {
      name: 'signed out: reads tasks',
      actor: 'signed out',
      operation: (db) => db.collection('projects/bob/tasks').get(),
      expected: 'denied',
    },
    {
      name: 'signed out: writes a task',
      actor: 'signed out',
      operation: (db) => db.doc('projects/bob/tasks/n1').set({ a: 1 }),
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

    batch.set(db.doc('projects/bob'), project('bob'));

    batch.set(db.doc(`projects/${shared}`), {
      ...project('bob'),
      memberUids: ['bob', 'alice'],
    });

    for (const projectId of ['bob', shared]) {
      for (const collection of Arr.toPushed(subcollections, 'settings')) {
        batch.set(db.doc(docIn(projectId, collection)), { a: 1 });
      }
    }

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

/** The one document a case reads or writes in a project's collection. */
const docIn = (projectId: string, collection: string): string =>
  collection === 'settings'
    ? (`projects/${projectId}/settings/dagLayout` as const)
    : (`projects/${projectId}/${collection}/n1` as const);

/**
 * Whether the rules let the operation through. Any error other than a
 * refusal by the rules is rethrown, so that a broken case does not pass as
 * `denied`.
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

/** A personal project as the app creates it on first sign-in. */
const project = (ownerUid: string): ReadonlyRecord<string, unknown> =>
  ({
    name: 'Project',
    ownerUid,
    memberUids: [ownerUid],
    // The app writes a server timestamp; the rules do not read its type.
    createdAt: 0,
  }) as const;
