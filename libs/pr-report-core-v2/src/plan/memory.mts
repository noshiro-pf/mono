/**
 * The worker's memory (`spec/worker.md`, "Memory"; **Changed in v2**: one JSON
 * file per repository, so that a restart keeps it). Nothing it holds is a
 * permission: arming and releasing are decided from the snapshot alone. Losing
 * it repeats work, and every count starts again.
 */

import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  ATTEMPTED_KINDS,
  OBSERVED_KINDS,
  type Condition,
} from './conditions.mjs';

export type WorkerMemory = Readonly<{
  conditions: readonly Condition[];
  /**
   * Pull requests set aside `not-merging`, each at the head it was demoted at:
   * picked last until someone else pushes to it. The worker's own pushes carry
   * the head along.
   */
  demoted: readonly HeadOf[];
  /**
   * Set-asides decided but whose comment was not written yet: written again
   * next cycle, or the worker holds what the skill reads as the worker's.
   */
  unannounced: readonly UnannouncedSetAside[];
  inFlight: InFlight | undefined;
  /** The pull requests acted on last cycle, followed once they close. */
  actedOn: readonly number[];
  /** The last release, for "Yield". */
  release: ReleaseDecided | undefined;
  /** The last snapshot's {@link fingerprintOf}, for the intervals. */
  fingerprint: string | undefined;
  /** How many snapshots in a row the fingerprint has held. */
  idleCount: number;
  /** Per pull request and head, how many code-owner re-runs were asked. */
  codeOwnerReruns: readonly Readonly<HeadOf & { count: number }>[];
  /**
   * The first candidate its green layer let go ("Checking ahead"), at the head
   * the layer was built from, and the layer's tree: picked alone until it is in
   * flight, though its rebase moves its head off the layer's.
   */
  releasing: LayerReleasing | undefined;
}>;

export type LayerReleasing = HeadOf & Readonly<{ tree: string }>;

export type HeadOf = Readonly<{ number: number; head: string }>;

export type UnannouncedSetAside = HeadOf &
  Readonly<{
    reason: string;
    /** The tip of the base when it was set aside. */
    baseSha: string;
    /** The comment's prose after the record line. */
    prose: string;
  }>;

/** The pull request released and watched. */
export type InFlight = HeadOf &
  Readonly<{
    /** When `skip-ci` came off. */
    releasedEpochMs: number;
    /** Consecutive green snapshots. */
    greenCount: number;
    /** Whether Auto-fix has pushed during this watch: once per watch. */
    autoFixed: boolean;
  }>;

export type ReleaseDecided = Readonly<{
  number: number;
  decidedEpochMs: number;
  /** The release order it was decided in. */
  order: readonly number[];
  /** The pull requests labelled `skip-ci` then. */
  paused: readonly number[];
}>;

/** What a first run, or one whose file could not be read, starts from. */
export const EMPTY_MEMORY: WorkerMemory = {
  conditions: [],
  demoted: [],
  unannounced: [],
  inFlight: undefined,
  actedOn: [],
  release: undefined,
  fingerprint: undefined,
  idleCount: 0,
  codeOwnerReruns: [],
  releasing: undefined,
} as const;

/**
 * The memory `text` holds, or why it is none; a caller logs the reason and
 * starts from {@link EMPTY_MEMORY}.
 */
export const parseWorkerMemory = (
  text: string,
): Result<WorkerMemory, string> => {
  const parsed = Json.parse(text);

  if (Result.isErr(parsed)) {
    return Result.err(`does not parse: ${parsed.value}`);
  }

  const decoded = MemorySchema.validate(parsed.value);

  if (Result.isErr(decoded)) {
    return Result.err(t.validationErrorsToMessages(decoded.value).join('; '));
  }

  const memory = decoded.value;

  return Result.ok({
    conditions: memory.conditions,
    demoted: memory.demoted,
    unannounced: memory.unannounced,
    inFlight: memory.inFlight ?? undefined,
    actedOn: memory.actedOn,
    release: memory.release ?? undefined,
    fingerprint: memory.fingerprint ?? undefined,
    idleCount: memory.idleCount,
    codeOwnerReruns: memory.codeOwnerReruns,
    releasing: memory.releasing ?? undefined,
  });
};

/** `memory` as the file holds it: `undefined` written as `null`. */
export const serializeWorkerMemory = (memory: WorkerMemory): string =>
  `${JSON.stringify(
    {
      version: MEMORY_VERSION,
      ...memory,
      inFlight: memory.inFlight ?? null,
      release: memory.release ?? null,
      fingerprint: memory.fingerprint ?? null,
      releasing: memory.releasing ?? null,
    },
    undefined,
    2,
  )}\n` as const;

/** Bumped when a field changes meaning; another version starts empty. */
export const MEMORY_VERSION = 1;

const HeadOfFields = { number: t.number(), head: t.string() } as const;

const MemorySchema = t.record({
  version: t.literal(MEMORY_VERSION),
  conditions: t.array(
    t.record({
      ...HeadOfFields,
      kind: t.enumType([...OBSERVED_KINDS, ...ATTEMPTED_KINDS]),
      firstEpochMs: t.number(),
      count: t.number(),
      refired: t.boolean(),
    }),
  ),
  demoted: t.array(t.record(HeadOfFields)),
  unannounced: t.array(
    t.record({
      ...HeadOfFields,
      reason: t.string(),
      baseSha: t.string(),
      prose: t.string(),
    }),
  ),
  inFlight: t.union([
    t.record({
      ...HeadOfFields,
      releasedEpochMs: t.number(),
      greenCount: t.number(),
      autoFixed: t.boolean(),
    }),
    t.nullType,
  ]),
  actedOn: t.array(t.number()),
  release: t.union([
    t.record({
      number: t.number(),
      decidedEpochMs: t.number(),
      order: t.array(t.number()),
      paused: t.array(t.number()),
    }),
    t.nullType,
  ]),
  fingerprint: t.union([t.string(), t.nullType]),
  idleCount: t.number(),
  codeOwnerReruns: t.array(t.record({ ...HeadOfFields, count: t.number() })),
  releasing: t.union([
    t.record({ ...HeadOfFields, tree: t.string() }),
    t.nullType,
  ]),
});
