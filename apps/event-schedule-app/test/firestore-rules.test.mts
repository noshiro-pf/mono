/**
 * `firestore.rules` against the Firestore emulator. Run by `pnpm run
 * check:test:rules`, which starts the emulator and sets
 * `FIRESTORE_EMULATOR_HOST`; `check:test` does not read this directory.
 *
 * Each case starts from the same data (`seed`): Bob's event `owned`, whose
 * `archivedBy` holds entries Alice and Bob left under old names and one of
 * Carol's; `duplicated`, whose `archivedBy` holds one of Alice's twice; an
 * anonymous event `anonymous`; and Bob's events `open` and `closed`, whose
 * answer deadlines are ahead and past. Each has an answer of Alice's, and `owned` an
 * anonymous answer too.
 */
import {
  initializeTestEnvironment,
  type RulesTestContext,
} from '@firebase/rules-unit-testing';
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { hasKey, isRecord } from 'ts-data-forge';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';

const env = await initializeTestEnvironment({
  // The same id as `--project` in the `check:test:rules` script. `demo-` makes
  // the emulator refuse to reach any real project.
  projectId: 'demo-event-schedule-app',
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

  // `unarchiveEventSchedule` removes each stored value with the caller's id,
  // one per write (#3490): the rules admit each, and leave the rest alone.
  test.each([
    {
      name: 'the author',
      uid: 'bob',
      remaining: [aliceOld1, aliceOld2, carol],
    },
    { name: 'another user', uid: 'alice', remaining: [bobOld, carol] },
  ] as const)(
    '$name removes every entry of theirs, one value per write, and no one else’s',
    async ({ uid, remaining }) => {
      await seed();

      const db = firestoreFor(uid);

      const own = archivedBy.filter((u) => u.id === uid);

      for (const entry of own) {
        // Sequential on purpose: each write is checked against the last.
        // eslint-disable-next-line no-await-in-loop
        await updateDoc(doc(db, 'events_v7/owned'), {
          archivedBy: arrayRemove(entry),
        });
      }

      const after = await getDoc(doc(db, 'events_v7/owned'));

      assert.deepStrictEqual(after.get('archivedBy'), remaining);
    },
  );
});

type Firestore = ReturnType<RulesTestContext['firestore']>;

/** A signed-in user's uid, or no one. */
type Actor = 'alice' | 'bob' | 'carol' | 'signed out';

type Case = Readonly<{
  name: string;
  actor: Actor;
  operation: (db: DeepReadonly<Firestore>) => Promise<unknown>;
  expected: 'allowed' | 'denied';
}>;

/** An `EventSchedule` as the app writes it, with `overrides` applied. */
const eventSchedule = (
  overrides: ReadonlyRecord<string, unknown>,
): ReadonlyRecord<string, unknown> =>
  ({
    title: 'Event',
    notes: '',
    datetimeSpecification: 'noStartEndSpecified',
    datetimeRangeList: [
      {
        ymd: { year: 2030, month: 1, date: 1 },
        timeRange: {
          start: { hours: 9, minutes: 0 },
          end: { hours: 10, minutes: 0 },
        },
      },
    ],
    answerDeadline: 'none',
    answerIcons: {
      good: { description: '', point: 10 },
      fair: { description: '', point: 6 },
      poor: { description: '', point: 0 },
    },
    notificationSettings: 'none',
    timezoneOffsetMinutes: -540,
    author: bob,
    archivedBy: [],
    ...overrides,
  }) as const;

/** An `Answer` as the app writes it. */
const answer = (
  user: Readonly<{ id: string | null; name: string }>,
): ReadonlyRecord<string, unknown> =>
  ({
    id: '',
    user,
    comment: '',
    selection: [],
    createdAt: 0,
    weight: 1,
    isRequiredParticipants: false,
  }) as const;

const cases = (): readonly Case[] =>
  [
    // `archivedBy`: one's own entry, added or removed alone.
    {
      name: 'a signed-in user adds their own entry to archivedBy',
      actor: 'alice',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), {
          archivedBy: arrayUnion(alice),
        }),
      expected: 'allowed',
    },
    {
      name: "a signed-in user adds another user's entry to archivedBy",
      actor: 'alice',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), {
          archivedBy: arrayUnion({ id: 'dave', name: 'Dave' }),
        }),
      expected: 'denied',
    },
    {
      name: 'a signed-out user adds an anonymous entry to archivedBy',
      actor: 'signed out',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), {
          archivedBy: arrayUnion({ id: null, name: 'Someone' }),
        }),
      expected: 'denied',
    },
    {
      name: 'the author removes an entry they left under an old name',
      actor: 'bob',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), {
          archivedBy: arrayRemove(bobOld),
        }),
      expected: 'allowed',
    },
    {
      name: 'another user removes an entry they left under an old name',
      actor: 'alice',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), {
          archivedBy: arrayRemove(aliceOld1),
        }),
      expected: 'allowed',
    },
    {
      name: 'a user removes an entry stored twice, both copies in one write',
      actor: 'alice',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/duplicated'), {
          archivedBy: arrayRemove(aliceOld1),
        }),
      expected: 'allowed',
    },
    {
      name: 'a user removes two of their entries in one write',
      actor: 'alice',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), {
          archivedBy: arrayRemove(aliceOld1, aliceOld2),
        }),
      expected: 'denied',
    },
    {
      name: 'an arrayRemove of a value not stored, which removes nothing',
      actor: 'alice',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), {
          archivedBy: arrayRemove(alice),
        }),
      expected: 'denied',
    },
    {
      name: "a user removes another user's entry",
      actor: 'alice',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), {
          archivedBy: arrayRemove(carol),
        }),
      expected: 'denied',
    },
    {
      name: 'a user adds their entry and changes the title in one write',
      actor: 'alice',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), {
          archivedBy: arrayUnion(alice),
          title: 'Renamed',
        }),
      expected: 'denied',
    },

    // An event is reached by its id alone.
    {
      name: 'a signed-out user gets an event by its id',
      actor: 'signed out',
      operation: (db) => getDoc(doc(db, 'events_v7/owned')),
      expected: 'allowed',
    },
    {
      name: 'a signed-out user lists the events',
      actor: 'signed out',
      operation: (db) => getDocs(collection(db, 'events_v7')),
      expected: 'denied',
    },
    {
      name: 'the author lists the events',
      actor: 'bob',
      operation: (db) => getDocs(collection(db, 'events_v7')),
      expected: 'denied',
    },

    // Creating an event.
    {
      name: 'a signed-in user creates an event as themselves',
      actor: 'alice',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/new'), eventSchedule({ author: alice })),
      expected: 'allowed',
    },
    {
      name: 'a signed-out user creates an anonymous event',
      actor: 'signed out',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/new'), eventSchedule({ author: anonymous })),
      expected: 'allowed',
    },
    {
      name: 'a signed-in user creates an event as another user',
      actor: 'alice',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/new'), eventSchedule({ author: bob })),
      expected: 'denied',
    },
    {
      name: 'an event is created with archivedBy already filled in',
      actor: 'alice',
      operation: (db) =>
        setDoc(
          doc(db, 'events_v7/new'),
          eventSchedule({ author: alice, archivedBy: [alice] }),
        ),
      expected: 'denied',
    },
    {
      name: 'an event is created with a field the app does not write',
      actor: 'alice',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/new'), {
          ...eventSchedule({ author: alice }),
          extra: 1,
        }),
      expected: 'denied',
    },

    // Editing and deleting an event.
    {
      name: 'the author edits their event',
      actor: 'bob',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), { title: 'Renamed' }),
      expected: 'allowed',
    },
    {
      name: "another user edits the author's event",
      actor: 'alice',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), { title: 'Renamed' }),
      expected: 'denied',
    },
    {
      name: 'a signed-out user edits a signed-in author’s event',
      actor: 'signed out',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), { title: 'Renamed' }),
      expected: 'denied',
    },
    {
      name: "the author's edit changes archivedBy",
      actor: 'bob',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), {
          title: 'Renamed',
          archivedBy: [],
        }),
      expected: 'denied',
    },
    {
      name: "the author's edit changes the author",
      actor: 'bob',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned'), { author: alice }),
      expected: 'denied',
    },
    {
      name: 'anyone edits an anonymous event',
      actor: 'signed out',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/anonymous'), { title: 'Renamed' }),
      expected: 'allowed',
    },
    {
      name: 'the author deletes their event',
      actor: 'bob',
      operation: (db) => deleteDoc(doc(db, 'events_v7/owned')),
      expected: 'denied',
    },

    // Answers, before and after the deadline.
    {
      name: 'a signed-out user reads the answers',
      actor: 'signed out',
      operation: (db) => getDocs(collection(db, 'events_v7/owned/answers')),
      expected: 'allowed',
    },
    {
      name: 'a signed-in user posts an answer as themselves',
      actor: 'carol',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/owned/answers/new'), answer(carol)),
      expected: 'allowed',
    },
    {
      name: 'a signed-out user posts an anonymous answer',
      actor: 'signed out',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/owned/answers/new'), answer(anonymous)),
      expected: 'allowed',
    },
    {
      name: 'a signed-in user posts an answer as another user',
      actor: 'carol',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/owned/answers/new'), answer(alice)),
      expected: 'denied',
    },
    {
      name: 'an answer is posted before a deadline that is set',
      actor: 'carol',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/open/answers/new'), answer(carol)),
      expected: 'allowed',
    },
    {
      name: 'an answer is posted after the deadline',
      actor: 'carol',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/closed/answers/new'), answer(carol)),
      expected: 'denied',
    },
    {
      name: 'the owner updates their answer',
      actor: 'alice',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned/answers/alice'), { comment: 'Hi' }),
      expected: 'allowed',
    },
    {
      name: "another user updates the owner's answer",
      actor: 'carol',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned/answers/alice'), { comment: 'Hi' }),
      expected: 'denied',
    },
    {
      name: 'anyone updates an anonymous answer',
      actor: 'carol',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/owned/answers/anonymous'), {
          comment: 'Hi',
        }),
      expected: 'allowed',
    },
    {
      name: 'the owner updates their answer after the deadline',
      actor: 'alice',
      operation: (db) =>
        updateDoc(doc(db, 'events_v7/closed/answers/alice'), { comment: 'Hi' }),
      expected: 'denied',
    },
    {
      name: 'the owner deletes their answer',
      actor: 'alice',
      operation: (db) => deleteDoc(doc(db, 'events_v7/owned/answers/alice')),
      expected: 'allowed',
    },
    {
      name: "another user deletes the owner's answer",
      actor: 'carol',
      operation: (db) => deleteDoc(doc(db, 'events_v7/owned/answers/alice')),
      expected: 'denied',
    },
    {
      name: 'the owner deletes their answer after the deadline',
      actor: 'alice',
      operation: (db) => deleteDoc(doc(db, 'events_v7/closed/answers/alice')),
      expected: 'denied',
    },

    // `internal/values`: the author's notification email.
    {
      name: 'the author reads internal/values',
      actor: 'bob',
      operation: (db) => getDoc(doc(db, 'events_v7/owned/internal/values')),
      expected: 'denied',
    },
    {
      name: 'the author writes internal/values',
      actor: 'bob',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/owned/internal/values'), {
          email: 'bob@example.com',
        }),
      expected: 'allowed',
    },
    {
      name: 'another user writes internal/values',
      actor: 'alice',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/owned/internal/values'), {
          email: 'alice@example.com',
        }),
      expected: 'denied',
    },
    {
      name: 'anyone writes internal/values of an anonymous event',
      actor: 'signed out',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/anonymous/internal/values'), {
          email: 'someone@example.com',
        }),
      expected: 'allowed',
    },
    {
      name: 'internal/values is written with a field besides the email',
      actor: 'bob',
      operation: (db) =>
        setDoc(doc(db, 'events_v7/owned/internal/values'), {
          email: 'bob@example.com',
          extra: 1,
        }),
      expected: 'denied',
    },
    {
      name: 'the author deletes internal/values',
      actor: 'bob',
      operation: (db) => deleteDoc(doc(db, 'events_v7/owned/internal/values')),
      expected: 'denied',
    },
  ] as const;

const alice = { id: 'alice', name: 'Alice' } as const;

const bob = { id: 'bob', name: 'Bob' } as const;

const carol = { id: 'carol', name: 'Carol' } as const;

const anonymous = { id: null, name: 'Someone' } as const;

/** Entries left under names their users no longer have. */
const aliceOld1 = { id: 'alice', name: 'Alice (1)' } as const;

const aliceOld2 = { id: 'alice', name: 'Alice (2)' } as const;

const bobOld = { id: 'bob', name: 'Bob (old)' } as const;

/** `owned`'s `archivedBy` as seeded. */
const archivedBy = [aliceOld1, aliceOld2, bobOld, carol] as const;

/** Empties the emulator and writes the data every case starts from. */
const seed = async (): Promise<void> => {
  await env.clearFirestore();

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    const batch = db.batch();

    batch.set(db.doc('events_v7/owned'), eventSchedule({ archivedBy }));

    batch.set(
      db.doc('events_v7/anonymous'),
      eventSchedule({ author: anonymous }),
    );

    batch.set(
      db.doc('events_v7/closed'),
      eventSchedule({
        answerDeadline: { year: 2000, month: 1, date: 1, hours: 0, minutes: 0 },
      }),
    );

    // Written by something other than `arrayUnion`, which never stores a value
    // twice.
    batch.set(
      db.doc('events_v7/duplicated'),
      eventSchedule({ archivedBy: [aliceOld1, aliceOld1, carol] }),
    );

    batch.set(
      db.doc('events_v7/open'),
      eventSchedule({
        answerDeadline: { year: 2999, month: 1, date: 1, hours: 0, minutes: 0 },
      }),
    );

    batch.set(db.doc('events_v7/owned/answers/alice'), answer(alice));

    batch.set(db.doc('events_v7/owned/answers/anonymous'), answer(anonymous));

    batch.set(db.doc('events_v7/closed/answers/alice'), answer(alice));

    batch.set(db.doc('events_v7/owned/internal/values'), {
      email: 'bob@example.com',
    });

    await batch.commit();
  });
};

const firestoreFor = (actor: Actor): Firestore =>
  (actor === 'signed out'
    ? env.unauthenticatedContext()
    : env.authenticatedContext(actor)
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
