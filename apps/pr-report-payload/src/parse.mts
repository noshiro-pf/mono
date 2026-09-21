/**
 * The two payloads, written to a file and read back out of one.
 *
 * Both directions are here rather than at either end, so that there is one
 * definition of what the file contains and a test can round-trip it. What
 * the file *is* — which branch, which path — is `location.mts`.
 *
 * Reading is the half with work in it. The version is checked before the
 * schema, so that a file written by another age is reported as that rather
 * than as a field of the wrong type; and every failure is worded for the page
 * that will show it, because there is nobody else to read it.
 */

import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  PAYLOAD_VERSION,
  PrReportPayloadSchema,
  type PrReportPayload,
} from './payload.mjs';
import {
  RUN_LOG_VERSION,
  UnblockPrsLogSchema,
  type UnblockPrsLog,
} from './run-log.mjs';

/**
 * One line, with no trailing newline of its own — `git` adds nothing and the
 * file is never read by a human, so there is nothing to pretty-print for.
 * Indentation would roughly double a payload that is already 22 KB.
 */
export const serializePayload = (payload: PrReportPayload): string =>
  JSON.stringify(payload);

export const parsePayload = (text: string): Result<PrReportPayload, string> =>
  parseVersioned('report', PAYLOAD_VERSION, PrReportPayloadSchema, text);

export const serializeRunLog = (log: UnblockPrsLog): string =>
  JSON.stringify(log);

export const parseRunLog = (text: string): Result<UnblockPrsLog, string> =>
  parseVersioned('log', RUN_LOG_VERSION, UnblockPrsLogSchema, text);

/**
 * What a reader is told when the file is not what this version expects.
 *
 * The two sides are deployed together — the workflow runs from `main` and the
 * page is built from `main` — so a version mismatch is transient, and saying
 * which way round it is tells a reader whether to reload or to wait.
 */
const parseVersioned = <T,>(
  what: string,
  expected: number,
  schema: t.Type<T>,
  text: string,
): Result<T, string> => {
  const parsed = Json.parse(text);

  if (Result.isErr(parsed)) {
    return Result.err(`The ${what} is not JSON: ${parsed.value}`);
  }

  const version = versionOf(parsed.value);

  if (version !== expected) {
    return Result.err(
      version === undefined
        ? `The ${what} carries no version, so this page cannot tell what it is.`
        : `The ${what} is version ${version} and this page reads version ${expected}. One of the two is mid-deployment; try again shortly.`,
    );
  }

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(
        `The ${what} is not the shape this page expects:\n${t.validationErrorsToMessages(validated.value).join('\n')}`,
      )
    : Result.ok(validated.value);
};

/**
 * Read before the schema runs, so it is read off an unknown rather than off a
 * validated value.
 */
const versionOf = (value: unknown): number | undefined => {
  if (typeof value !== 'object' || value === null) return undefined;

  const version: unknown = Reflect.get(value, 'version');

  return typeof version === 'number' ? version : undefined;
};
