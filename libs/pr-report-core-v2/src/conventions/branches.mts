/**
 * The branch names and commit trailers the queue relies on
 * (`spec/conventions.md`, "Branch names").
 */

import { Num, Result } from 'ts-data-forge';

/**
 * The branch `changesets/action` opens the version pull request from, its only
 * stable handle: the title, body and number change with every release.
 */
export const versionBranchOf = (defaultBranch: string): string =>
  `changeset-release/${defaultBranch}` as const;

export const isVersionBranch = (
  headRef: string,
  defaultBranch: string,
): boolean => headRef === versionBranchOf(defaultBranch);

/**
 * A branch name the worker is willing to act on: put on a command line it is
 * quoted anyway, so this is a second guard, and it keeps a name starting with
 * `-` from being read as an option.
 */
export const isActionableBranch = (name: string): boolean =>
  ACTIONABLE_BRANCH.test(name) && !name.startsWith('-');

/** The branch a queue layer of pull request `number` is built on. */
export const queueLayerBranchOf = (number: number): string =>
  `${QUEUE_LAYER_PREFIX}${number}` as const;

/** The pull request a queue layer branch is for, or `undefined`. */
export const numberOfQueueLayerBranch = (branch: string): number | undefined =>
  branch.startsWith(QUEUE_LAYER_PREFIX)
    ? positiveIntegerOf(branch.slice(QUEUE_LAYER_PREFIX.length))
    : undefined;

/** The `Queue-Layer: <N> <head>` trailer of a layer's commit. */
export const queueLayerTrailer = ({ number, head }: QueueLayerOrigin): string =>
  `${QUEUE_LAYER_TRAILER}: ${number} ${head}` as const;

/** What the last `Queue-Layer:` line of a commit message says, if any. */
export const queueLayerOfMessage = (
  message: string,
): QueueLayerOrigin | undefined => {
  const groups = message
    .split(/\r?\n/u)
    .findLast((line) => line.startsWith(`${QUEUE_LAYER_TRAILER}: `))
    ?.match(QUEUE_LAYER_LINE)?.groups;

  const number = positiveIntegerOf(groups?.['number'] ?? '');

  const head = groups?.['head'];

  return number === undefined || head === undefined
    ? undefined
    : { number, head };
};

/** What a queue layer was built from: the pull request and its head. */
export type QueueLayerOrigin = Readonly<{ number: number; head: string }>;

const ACTIONABLE_BRANCH = /^[\w./+-]+$/u;

const QUEUE_LAYER_PREFIX = 'queue/pr-';

const QUEUE_LAYER_TRAILER = 'Queue-Layer';

const POSITIVE_INTEGER = /^[1-9]\d*$/u;

const QUEUE_LAYER_LINE = /^Queue-Layer: (?<number>\d+) (?<head>[0-9a-f]{40})$/u;

/** `digits` as a number when it is one written without leading zeros. */
const positiveIntegerOf = (digits: string): number | undefined => {
  if (!POSITIVE_INTEGER.test(digits)) {
    return undefined;
  }

  const parsed = Num.safeParseInt(digits);

  return Result.isOk(parsed) ? parsed.value : undefined;
};

if (import.meta.vitest !== undefined) {
  describe(isVersionBranch, () => {
    test('is the changesets branch of this default branch only', () => {
      assert.isTrue(isVersionBranch('changeset-release/main', 'main'));

      assert.isFalse(isVersionBranch('changeset-release/main', 'trunk'));
    });
  });

  describe(isActionableBranch, () => {
    test.each([
      ['claude/fix-1', true],
      ['release/v1.2+build', true],
      ['-rf', false],
      ['a b', false],
      ["it's", false],
      ['$(x)', false],
      ['', false],
    ] as const)('%s is %s', (name, expected) => {
      assert.strictEqual(isActionableBranch(name), expected);
    });
  });

  describe(queueLayerOfMessage, () => {
    test('reads back the trailer the layer’s commit carries', () => {
      const origin = { number: 12, head: 'a'.repeat(40) } as const;

      assert.deepStrictEqual(
        queueLayerOfMessage(
          `queue layer: pull request 12\n\n${queueLayerTrailer(origin)}\n`,
        ),
        origin,
      );
    });

    test('takes the last trailer of several', () => {
      assert.deepStrictEqual(
        queueLayerOfMessage(
          `Queue-Layer: 1 ${'a'.repeat(40)}\nQueue-Layer: 2 ${'b'.repeat(40)}`,
        ),
        { number: 2, head: 'b'.repeat(40) },
      );
    });

    test('reads nothing from a message without one, or with a short head', () => {
      assert.isUndefined(queueLayerOfMessage('fix: something'));

      assert.isUndefined(queueLayerOfMessage('Queue-Layer: 12 abc'));

      assert.isUndefined(
        queueLayerOfMessage(`Queue-Layer: 012 ${'a'.repeat(40)}`),
      );

      assert.isUndefined(
        queueLayerOfMessage(`Queue-Layer: 12 ${'a'.repeat(40)} more`),
      );
    });

    test('reads a CRLF message', () => {
      assert.deepStrictEqual(
        queueLayerOfMessage(
          `subject\r\n\r\nQueue-Layer: 12 ${'a'.repeat(40)}\r\n`,
        ),
        { number: 12, head: 'a'.repeat(40) },
      );
    });
  });

  describe(numberOfQueueLayerBranch, () => {
    test('is the pull request of a layer branch, and nothing for another', () => {
      assert.strictEqual(numberOfQueueLayerBranch(queueLayerBranchOf(12)), 12);

      assert.isUndefined(numberOfQueueLayerBranch('queue/pr-012'));

      assert.isUndefined(numberOfQueueLayerBranch('feature/12'));
    });
  });
}
