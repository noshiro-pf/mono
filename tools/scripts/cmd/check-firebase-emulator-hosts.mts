import * as path from 'node:path';
import { Arr, hasKey, isRecord, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { UnknownRecord } from 'ts-type-forge';
import {
  isUnderExperimental,
  listTrackedFiles,
  readRepositoryFile,
} from '../lib/repo-files.mjs';

/**
 * Fails when a tracked `firebase.json` declares an emulator `host` other than
 * `localhost`, `127.0.0.1` or `::1`, the loopback addresses every platform
 * binds.
 *
 * The READMEs of `event-schedule-app` and `task-manager` tell a developer who
 * wants to reach the emulators from a phone on the LAN to change each `host`
 * under `emulators` to `0.0.0.0` while they do. A commit of that edit fails
 * nothing else — `emulators:exec` works on `0.0.0.0` too — and after it every
 * developer's `pnpm run emulators` exposes the Auth, Firestore and Functions
 * emulators, which accept any credentials, to their network. A `host` left out
 * is `localhost`.
 *
 * It reads the working tree, so it also fails locally while that edit is in
 * place, which is the reminder to undo it before committing.
 */
export const checkFirebaseEmulatorHosts = async (): Promise<
  Result<number, string>
> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return tracked;
  }

  const read = await Promise.all(
    tracked.value.filter(isFirebaseConfig).map(async (file) => {
      const text = await readRepositoryFile(file);

      return Result.isErr(text) ? text : Result.ok({ file, text: text.value });
    }),
  );

  const unreadable = read.filter(Result.isErr).map(({ value }) => value);

  if (Arr.isNonEmpty(unreadable)) {
    return Result.err(unreadable.join('\n'));
  }

  const files = read.filter(Result.isOk).map(({ value }) => value);

  const violations = findExposedEmulatorHosts(files);

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} Firebase emulator host(s) in tracked firebase.json files are not localhost, 127.0.0.1 or ::1:`,
        '',
        ...violations.map((v) => `  ${v}`),
        '',
        'An emulator accepts any credentials, and once a host such as "0.0.0.0" is',
        "committed every developer's emulators listen on their network; other",
        'loopback addresses do not start on every platform. Use one of',
        `${Array.from(LOOPBACK_HOSTS, (host) => JSON.stringify(host)).join(', ')}, or no "host" at all. If you`,
        'changed it to reach the emulators from another device, undo the edit',
        'before committing; this check fails locally while it is in place.',
      ].join('\n'),
    );
  }

  return Result.ok(
    files.filter(({ text }) => {
      const emulators = emulatorsOf(text);

      return Result.isOk(emulators) && emulators.value !== undefined;
    }).length,
  );
};

/**
 * Whether `relativePath` is a `firebase.json` this check reads.
 *
 * Those under `docs/` (the slide decks' Hosting redirects) are left out with
 * those under `experimental/`: `code-check.yml`, where `check:root:*` runs,
 * skips a diff that touches only `docs/`, so the pull request that broke one
 * would pass and the next unrelated one would fail.
 */
export const isFirebaseConfig = (relativePath: string): boolean =>
  path.posix.basename(relativePath) === 'firebase.json' &&
  !relativePath.startsWith('docs/') &&
  !isUnderExperimental(relativePath);

/** A line for each emulator `host` outside {@link LOOPBACK_HOSTS}. */
export const findExposedEmulatorHosts = (
  files: readonly Readonly<{
    /** Relative to the repository root. */
    file: string;
    text: string;
  }>[],
): readonly string[] =>
  files.flatMap(({ file, text }) => {
    const emulators = emulatorsOf(text);

    if (Result.isErr(emulators)) {
      return [`${file}: not valid JSON.`];
    }

    if (emulators.value === undefined) {
      return [];
    }

    return Object.entries(emulators.value).flatMap(([name, emulator]) => {
      if (!isRecord(emulator) || !hasKey(emulator, 'host')) {
        return [];
      }

      const host = emulator.host;

      return typeof host === 'string' && LOOPBACK_HOSTS.has(host)
        ? []
        : [`${file}: emulators.${name}.host is ${JSON.stringify(host)}.`];
    });
  });

/**
 * The hosts that bind the loopback interface alone on every platform. Other
 * addresses in 127.0.0.0/8 are not configured on macOS, and firebase-tools
 * resolves the name, so a bracketed `[::1]` does not start.
 */
const LOOPBACK_HOSTS: ReadonlySet<string> = new Set<string>([
  'localhost',
  '127.0.0.1',
  '::1',
]);

/**
 * The `emulators` object of a `firebase.json`, `undefined` when it has none, or
 * an error when the text is not JSON.
 */
const emulatorsOf = (
  text: string,
): Result<UnknownRecord | undefined, unknown> =>
  Result.map(
    Result.fromThrowable((): unknown => JSON.parse(text)),
    (json) =>
      isRecord(json) && isRecord(json['emulators'])
        ? json['emulators']
        : undefined,
  );

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkFirebaseEmulatorHosts().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} firebase.json file(s) with emulators keep them on loopback.`,
  );
}
